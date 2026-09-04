/**
 * Testa a idempotencia e o incremento atomico de POST /trial/consume — o ponto de maior
 * risco de bug de receita da mudanca de trial por tempo pra trial por quantidade de itens
 * (um bug aqui deixaria um usuario de teste processar itens ilimitados de graca).
 *
 * A partir de 04/09/2026, o pool de itens do trial e SEPARADO por automacao (uasg_local /
 * detalhes / beneficios) — cada uma tem sua propria coluna de uso (trialItemsUsedUasg,
 * trialItemsUsedDetalhes, trialItemsUsedBeneficios), todas limitadas ao mesmo
 * "trialItemsLimit". `quota` deixou de ser um objeto plano ({itemsLimit,itemsUsed,...}) e
 * passou a ser {uasg_local:{...}, detalhes:{...}, beneficios:{...}}.
 *
 * Usa um "banco" falso em memoria que entende de verdade o indice unico de "runId" em
 * IrpTrialConsumption (rejeita insercao duplicada, igual o Postgres faria) e mantem o
 * estado de uso por fluxo entre chamadas, pra exercitar a logica real do service, nao so
 * uma sequencia de respostas roteirizadas. Mesmo padrao de mock (Module._load) ja usado
 * em tests/baixatudo-license-fix.test.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

function makeFakeDb(initialLicense) {
  const licenses = initialLicense ? { [initialLicense.licenseKey]: { ...initialLicense } } : {};
  const trialConsumptions = {};
  const trialClaims = {};

  const prisma = {
    async $executeRawUnsafe(sql, ...params) {
      if (sql.includes('INSERT INTO "IrpTrialConsumption"')) {
        const [, runId, licenseKey, itemsRequested, flow] = params;
        if (trialConsumptions[runId]) {
          const err = new Error('duplicate key value violates unique constraint "IrpTrialConsumption_runId_key"');
          err.code = 'P2002';
          throw err;
        }
        trialConsumptions[runId] = { runId, licenseKey, itemsRequested, itemsApplied: 0, flow };
        return 1;
      }
      if (sql.includes('UPDATE "IrpTrialConsumption" SET "itemsApplied"')) {
        const [itemsApplied, runId] = params;
        if (trialConsumptions[runId]) trialConsumptions[runId].itemsApplied = itemsApplied;
        return 1;
      }
      if (sql.includes('INSERT INTO "IrpLicense"')) {
        const [id, licenseKey, email, expiresAt, notes] = params;
        licenses[licenseKey] = {
          id, licenseKey, email, status: 'active', expiresAt, notes,
          activeDeviceId: null, lastSeenAt: null, extensionVersion: null,
          trialItemsLimit: null, trialItemsUsed: 0,
          trialItemsUsedUasg: 0, trialItemsUsedDetalhes: 0, trialItemsUsedBeneficios: 0,
        };
        return 1;
      }
      if (sql.includes('UPDATE "IrpLicense"') && sql.includes('"trialItemsLimit"=$3')) {
        const [deviceId, extensionVersion, trialItemsLimit, id] = params;
        const row = Object.values(licenses).find(l => l.id === id);
        if (row) {
          row.activeDeviceId = deviceId; row.extensionVersion = extensionVersion; row.trialItemsLimit = trialItemsLimit;
          row.trialItemsUsed = 0; row.trialItemsUsedUasg = 0; row.trialItemsUsedDetalhes = 0; row.trialItemsUsedBeneficios = 0;
        }
        return 1;
      }
      if (sql.includes('INSERT INTO "IrpTrialClaim"')) {
        const [, emailNormalized, deviceId, licenseKey] = params;
        const dupe = Object.values(trialClaims).some(c => c.emailNormalized === emailNormalized || c.deviceId === deviceId);
        if (dupe) {
          const err = new Error('duplicate key value violates unique constraint "IrpTrialClaim_emailNormalized_key"');
          throw err;
        }
        trialClaims[licenseKey] = { emailNormalized, deviceId, licenseKey };
        return 1;
      }
      // CREATE TABLE / ALTER TABLE / CREATE INDEX / INSERT INTO IrpLicenseEvent / etc.
      return 1;
    },
    async $queryRawUnsafe(sql, ...params) {
      if (sql.includes('SELECT * FROM "IrpLicense" WHERE "licenseKey"')) {
        // Copia rasa: um SELECT real devolve um snapshot independente, nao uma referencia
        // viva pro registro — mutar o "banco" depois nao pode alterar retroativamente um
        // valor ja lido antes (foi exatamente esse erro que o teste pegou no mock antigo).
        const licenseKey = params[0];
        const row = licenses[licenseKey];
        return row ? [{ ...row }] : [];
      }
      if (sql.includes('UPDATE "IrpLicense"') && sql.includes('RETURNING')) {
        // Pool separado por automacao: a coluna de verdade sendo incrementada vem
        // interpolada no SQL (ex: SET "trialItemsUsedDetalhes" = LEAST(...)) — extrai o
        // nome real em vez de assumir sempre a mesma coluna, pra exercitar o roteamento
        // por fluxo de verdade.
        const [delta, id] = params;
        const row = Object.values(licenses).find(l => l.id === id);
        if (!row) return [];
        const match = sql.match(/SET "(\w+)" = LEAST/);
        const column = match ? match[1] : 'trialItemsUsed';
        const novoUsado = Math.min(row.trialItemsLimit, (row[column] || 0) + delta);
        row[column] = novoUsado;
        return [{ ...row }];
      }
      if (sql.includes('SELECT * FROM "IrpTrialConsumption" WHERE "runId"')) {
        const runId = params[0];
        return trialConsumptions[runId] ? [trialConsumptions[runId]] : [];
      }
      if (sql.includes('SELECT * FROM "IrpTrialClaim"')) {
        return []; // sem uso previo, nos testes de claimTrialLicense
      }
      if (sql.includes('SELECT "value" FROM "IrpConfig"')) {
        return []; // usa fallback hardcoded nos testes
      }
      return [];
    },
  };
  return { prisma, licenses, trialConsumptions, trialClaims };
}

function loadServiceWithFakeDb(prisma) {
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === '../config/database') return { prisma };
    if (request === '../utils/logger') return { info() {}, warn() {}, error() {} };
    if (request === './email.service') return { sendIrpTrialEmail: async () => {} };
    return originalLoad.call(this, request, parent, isMain);
  };
  // Cada teste precisa de uma copia "fresca" do modulo (o service guarda
  // "licenseSchemaReady" em variavel de modulo) — limpa o cache do require.
  const servicePath = path.resolve(__dirname, '../src/services/license.service.js');
  delete require.cache[require.resolve(servicePath)];
  const licenseService = require(servicePath);
  Module._load = originalLoad;
  return licenseService;
}

function baseLicense(overrides = {}) {
  return {
    id: 'license-id-1',
    licenseKey: 'IRP-TEST-TEST-TEST-TEST',
    email: 'cliente@example.com',
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 86400000),
    activeDeviceId: 'device-1',
    trialItemsLimit: 15,
    trialItemsUsed: 0,
    trialItemsUsedUasg: 0,
    trialItemsUsedDetalhes: 0,
    trialItemsUsedBeneficios: 0,
    ...overrides,
  };
}

test('consumeTrialItems: um runId repetido nunca soma duas vezes', async () => {
  const { prisma, licenses } = makeFakeDb(baseLicense());
  const licenseService = loadServiceWithFakeDb(prisma);

  const first = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-abc', itemsCompleted: 5, flow: 'detalhes',
  });
  assert.equal(first.valid, true);
  assert.equal(first.alreadyConsumed, false);
  assert.equal(first.applied, 5);
  assert.equal(first.quota.detalhes.itemsUsed, 5);
  assert.equal(licenses['IRP-TEST-TEST-TEST-TEST'].trialItemsUsedDetalhes, 5);

  // Reenvio de rede: mesma execucao, mesmo runId.
  const second = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-abc', itemsCompleted: 5, flow: 'detalhes',
  });
  assert.equal(second.valid, true);
  assert.equal(second.alreadyConsumed, true);
  assert.equal(second.applied, 5); // devolve o que ja tinha sido aplicado, nao soma de novo
  assert.equal(second.quota.detalhes.itemsUsed, 5); // continua 5, NAO virou 10

  // Confirma no "banco": so uma vez.
  assert.equal(licenses['IRP-TEST-TEST-TEST-TEST'].trialItemsUsedDetalhes, 5);
});

test('consumeTrialItems: trava no limite mesmo se o cliente mandar itemsCompleted inflado', async () => {
  const { prisma, licenses } = makeFakeDb(baseLicense({ trialItemsUsedUasg: 10, trialItemsLimit: 15 }));
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-xyz', itemsCompleted: 999, flow: 'uasg_local',
  });
  assert.equal(result.valid, true);
  assert.equal(result.applied, 5); // so faltavam 5 pro limite de 15
  assert.equal(result.quota.uasg_local.itemsUsed, 15);
  assert.equal(result.quota.uasg_local.itemsRemaining, 0);
  assert.equal(licenses['IRP-TEST-TEST-TEST-TEST'].trialItemsUsedUasg, 15);
});

test('consumeTrialItems: pools de fluxos diferentes nao se misturam (Detalhes cheio nao afeta Beneficios)', async () => {
  const { prisma, licenses } = makeFakeDb(baseLicense({ trialItemsLimit: 11, trialItemsUsedDetalhes: 11 }));
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-beneficios-1', itemsCompleted: 4, flow: 'beneficios',
  });
  assert.equal(result.valid, true);
  assert.equal(result.applied, 4);
  assert.equal(result.quota.beneficios.itemsUsed, 4);
  assert.equal(result.quota.beneficios.itemsRemaining, 7);
  // Detalhes continua no limite, Beneficios e UASG intocados por essa chamada.
  assert.equal(result.quota.detalhes.itemsUsed, 11);
  assert.equal(result.quota.detalhes.itemsRemaining, 0);
  assert.equal(result.quota.uasg_local.itemsUsed, 0);
  assert.equal(licenses['IRP-TEST-TEST-TEST-TEST'].trialItemsUsedDetalhes, 11);
  assert.equal(licenses['IRP-TEST-TEST-TEST-TEST'].trialItemsUsedBeneficios, 4);
});

test('consumeTrialItems: flow invalido/desconhecido e rejeitado', async () => {
  const { prisma } = makeFakeDb(baseLicense());
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-flow-invalido', itemsCompleted: 1, flow: 'relatorio',
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'invalid_flow');
});

test('consumeTrialItems: licenca paga (trialItemsLimit=null) nunca e afetada', async () => {
  const { prisma, licenses } = makeFakeDb(baseLicense({ trialItemsLimit: null, trialItemsUsed: 0 }));
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-paid', itemsCompleted: 50, flow: 'beneficios',
  });
  assert.equal(result.valid, true);
  assert.equal(result.quota, null);
  assert.equal(result.applied, 0);
  assert.equal(licenses['IRP-TEST-TEST-TEST-TEST'].trialItemsUsedBeneficios, 0);
});

test('claimTrialLicense: sem linha em IrpConfig, usa o fallback de 11 itens (em cada automacao)', async () => {
  const { prisma, licenses } = makeFakeDb(null);
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.claimTrialLicense(
    'novo.cliente@example.com', 'device-novo', '1.0.14', '127.0.0.1', 'fingerprint-1234567890abcdef',
  );
  assert.equal(result.valid, true);
  assert.equal(result.quota.uasg_local.itemsLimit, 11);
  assert.equal(result.quota.detalhes.itemsLimit, 11);
  assert.equal(result.quota.beneficios.itemsLimit, 11);
  assert.equal(result.quota.uasg_local.itemsUsed, 0);
  assert.equal(result.quota.detalhes.itemsRemaining, 11);
  assert.match(result.licenseKey, /^IRP-/);

  const created = licenses[result.licenseKey];
  assert.equal(created.trialItemsLimit, 11);
  assert.equal(created.trialItemsUsedUasg, 0);
  assert.equal(created.trialItemsUsedDetalhes, 0);
  assert.equal(created.trialItemsUsedBeneficios, 0);
  assert.equal(created.activeDeviceId, 'device-novo');
});

test('claimTrialLicense: instalacao nova sem e-mail nenhum tambem libera o trial', async () => {
  const { prisma, licenses } = makeFakeDb(null);
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.claimTrialLicense(
    null, 'device-sem-email', '1.0.14', '127.0.0.1', 'fingerprint-abcdefabcdefabcdef',
  );
  assert.equal(result.valid, true);
  assert.equal(result.quota.beneficios.itemsLimit, 11);
  assert.doesNotMatch(result.message, /e-mail/);

  const created = licenses[result.licenseKey];
  assert.match(created.email, /@sem-email\.irpmaster\.local$/);
  assert.equal(created.activeDeviceId, 'device-sem-email');
});

test('claimTrialLicense: decisao explicita do dono do produto — repetir o mesmo dispositivo/e-mail/fingerprint NUNCA bloqueia, sempre concede um trial novo', async () => {
  const { prisma, licenses } = makeFakeDb(null);
  const licenseService = loadServiceWithFakeDb(prisma);

  const first = await licenseService.claimTrialLicense(null, 'device-repetido', '1.0.14', '127.0.0.1', 'fp-1111111111111111');
  assert.equal(first.valid, true);
  assert.equal(first.quota.uasg_local.itemsLimit, 11);

  const second = await licenseService.claimTrialLicense(null, 'device-repetido', '1.0.14', '127.0.0.1', 'fp-1111111111111111');
  assert.equal(second.valid, true);
  assert.equal(second.quota.uasg_local.itemsLimit, 11);
  assert.equal(second.quota.uasg_local.itemsUsed, 0);

  // Duas licencas distintas, cada uma com o proprio trial zerado — nao e a mesma
  // reaproveitada, e o segundo pedido nao herda o consumo do primeiro.
  assert.notEqual(first.licenseKey, second.licenseKey);
  assert.ok(licenses[first.licenseKey]);
  assert.ok(licenses[second.licenseKey]);
});

test('consumeTrialItems: dispositivo diferente do vinculado e rejeitado', async () => {
  const { prisma } = makeFakeDb(baseLicense());
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-outro', runId: 'run-x', itemsCompleted: 1, flow: 'detalhes',
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'device_changed');
});
