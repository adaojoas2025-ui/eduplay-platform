/**
 * Testa a idempotencia e o incremento do trial por quantidade de itens — o ponto de maior
 * risco de bug de receita da extensao IRP Master.
 *
 * Historico do modelo (pra quem for mexer aqui de novo):
 *  1. Trial por TEMPO (24h ilimitadas) — substituido por nao deixar terminar o trabalho
 *     inteiro de graca numa unica sessao.
 *  2. Trial por QUANTIDADE DE ITENS, total COMPARTILHADO entre as 3 automacoes (UASG,
 *     Detalhes, Beneficios) — 11 itens no total, dividido entre as tres.
 *  3. Trial por QUANTIDADE DE ITENS, pool SEPARADO por automacao — 11 itens EM CADA uma
 *     das tres, independentes (esgotar Beneficios nao afeta UASG nem Detalhes).
 *  4. (04/09/2026 -> 06/09/2026) Trial por QUANTIDADE DE ITENS, pool SEPARADO POR
 *     LICITACAO — decisao explicita do dono do produto: cada combinacao (licenca, fluxo,
 *     licitacao) tem seu proprio contador de 11 itens. Processar 11 na licitacao A nao
 *     consome nada da licitacao B — o usuario pode abrir e trabalhar em quantas
 *     licitacoes diferentes quiser, sempre com 11 disponiveis em cada uma, em cada
 *     automacao. Mas a MESMA licitacao NUNCA reinicia o contador (cumulativo e
 *     permanente) — nao pode processar 1 a 11, rodar de novo, e ir de 12 a 22.
 *     `contractId` vem do numero identificador da licitacao/IRP na URL do portal do
 *     governo (ex: "550740" em ".../execucao/edit?id=550740").
 *
 * Usa um "banco" falso em memoria que entende de verdade o indice unico de "runId" em
 * IrpTrialConsumption (rejeita insercao duplicada, igual o Postgres faria) e o upsert por
 * (licenseKey, flow, contractId) em IrpTrialContractUsage, pra exercitar a logica real do
 * service, nao so uma sequencia de respostas roteirizadas. Mesmo padrao de mock
 * (Module._load) ja usado em tests/baixatudo-license-fix.test.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

function makeFakeDb(initialLicense) {
  const licenses = initialLicense ? { [initialLicense.licenseKey]: { ...initialLicense } } : {};
  const trialConsumptions = {};
  const trialClaims = {};
  const contractUsages = {}; // chave: `${licenseKey}|${flow}|${contractId}` -> { itemsUsed }

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
      if (sql.includes('INSERT INTO "IrpTrialContractUsage"')) {
        const [, licenseKey, flow, contractId, itemsUsed] = params;
        contractUsages[`${licenseKey}|${flow}|${contractId}`] = { itemsUsed };
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
        // viva pro registro.
        const licenseKey = params[0];
        const row = licenses[licenseKey];
        return row ? [{ ...row }] : [];
      }
      if (sql.includes('SELECT "itemsUsed" FROM "IrpTrialContractUsage"')) {
        const [licenseKey, flow, contractId] = params;
        const row = contractUsages[`${licenseKey}|${flow}|${contractId}`];
        return row ? [{ itemsUsed: row.itemsUsed }] : [];
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
  return { prisma, licenses, trialConsumptions, trialClaims, contractUsages };
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
    ...overrides,
  };
}

test('consumeTrialItems: um runId repetido nunca soma duas vezes (mesma licitacao)', async () => {
  const { prisma, contractUsages } = makeFakeDb(baseLicense());
  const licenseService = loadServiceWithFakeDb(prisma);

  const first = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-abc', itemsCompleted: 5, flow: 'detalhes', contractId: '550740',
  });
  assert.equal(first.valid, true);
  assert.equal(first.alreadyConsumed, false);
  assert.equal(first.applied, 5);
  assert.equal(first.quota.itemsUsed, 5);
  assert.equal(contractUsages['IRP-TEST-TEST-TEST-TEST|detalhes|550740'].itemsUsed, 5);

  // Reenvio de rede: mesma execucao, mesmo runId.
  const second = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-abc', itemsCompleted: 5, flow: 'detalhes', contractId: '550740',
  });
  assert.equal(second.valid, true);
  assert.equal(second.alreadyConsumed, true);
  assert.equal(second.applied, 5); // devolve o que ja tinha sido aplicado, nao soma de novo
  assert.equal(second.quota.itemsUsed, 5); // continua 5, NAO virou 10

  assert.equal(contractUsages['IRP-TEST-TEST-TEST-TEST|detalhes|550740'].itemsUsed, 5);
});

test('consumeTrialItems: trava no limite mesmo se o cliente mandar itemsCompleted inflado', async () => {
  const { prisma, contractUsages } = makeFakeDb(baseLicense({ trialItemsLimit: 15 }));
  const licenseService = loadServiceWithFakeDb(prisma);
  contractUsages['IRP-TEST-TEST-TEST-TEST|uasg_local|550740'] = { itemsUsed: 10 };

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-xyz', itemsCompleted: 999, flow: 'uasg_local', contractId: '550740',
  });
  assert.equal(result.valid, true);
  assert.equal(result.applied, 5); // so faltavam 5 pro limite de 15
  assert.equal(result.quota.itemsUsed, 15);
  assert.equal(result.quota.itemsRemaining, 0);
  assert.equal(contractUsages['IRP-TEST-TEST-TEST-TEST|uasg_local|550740'].itemsUsed, 15);
});

test('consumeTrialItems: licitacoes diferentes tem pools INDEPENDENTES (nao se misturam)', async () => {
  const { prisma, contractUsages } = makeFakeDb(baseLicense({ trialItemsLimit: 11 }));
  const licenseService = loadServiceWithFakeDb(prisma);

  // Esgota o limite na licitacao 550740.
  const a = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-lic-a', itemsCompleted: 11, flow: 'beneficios', contractId: '550740',
  });
  assert.equal(a.quota.itemsUsed, 11);
  assert.equal(a.quota.itemsRemaining, 0);

  // Mesma licenca, mesmo fluxo, LICITACAO DIFERENTE (999999) — comeca do zero, cheio de novo.
  const b = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-lic-b', itemsCompleted: 7, flow: 'beneficios', contractId: '999999',
  });
  assert.equal(b.valid, true);
  assert.equal(b.applied, 7);
  assert.equal(b.quota.itemsUsed, 7);
  assert.equal(b.quota.itemsRemaining, 4);

  // As duas licitacoes ficam registradas separadamente, sem vazamento entre elas.
  assert.equal(contractUsages['IRP-TEST-TEST-TEST-TEST|beneficios|550740'].itemsUsed, 11);
  assert.equal(contractUsages['IRP-TEST-TEST-TEST-TEST|beneficios|999999'].itemsUsed, 7);
});

test('consumeTrialItems: a MESMA licitacao nunca reinicia o contador (nao pode ir do 11 pro 22)', async () => {
  const { prisma, contractUsages } = makeFakeDb(baseLicense({ trialItemsLimit: 11 }));
  const licenseService = loadServiceWithFakeDb(prisma);

  const primeiraRodada = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-rodada-1', itemsCompleted: 11, flow: 'uasg_local', contractId: '550740',
  });
  assert.equal(primeiraRodada.quota.itemsUsed, 11);
  assert.equal(primeiraRodada.quota.itemsRemaining, 0);

  // Roda a automacao DE NOVO na MESMA licitacao (runId novo, execucao nova) — mesmo assim
  // nao pode voltar a processar mais nada, porque o contador dessa licitacao ja esta cheio.
  const segundaRodada = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-rodada-2', itemsCompleted: 11, flow: 'uasg_local', contractId: '550740',
  });
  assert.equal(segundaRodada.applied, 0); // ja estava no limite, nada novo aplicado
  assert.equal(segundaRodada.quota.itemsUsed, 11); // continua 11, NUNCA vira 22
  assert.equal(segundaRodada.quota.itemsRemaining, 0);
  assert.equal(contractUsages['IRP-TEST-TEST-TEST-TEST|uasg_local|550740'].itemsUsed, 11);
});

test('consumeTrialItems: flow invalido/desconhecido e rejeitado', async () => {
  const { prisma } = makeFakeDb(baseLicense());
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-flow-invalido', itemsCompleted: 1, flow: 'relatorio', contractId: '550740',
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'invalid_flow');
});

test('consumeTrialItems: sem contractId e rejeitado', async () => {
  const { prisma } = makeFakeDb(baseLicense());
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-sem-licitacao', itemsCompleted: 1, flow: 'detalhes',
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'missing_fields');
});

test('consumeTrialItems: licenca paga (trialItemsLimit=null) nunca e afetada', async () => {
  const { prisma, contractUsages } = makeFakeDb(baseLicense({ trialItemsLimit: null, trialItemsUsed: 0 }));
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.consumeTrialItems({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', runId: 'run-paid', itemsCompleted: 50, flow: 'beneficios', contractId: '550740',
  });
  assert.equal(result.valid, true);
  assert.equal(result.quota, null);
  assert.equal(result.applied, 0);
  assert.equal(contractUsages['IRP-TEST-TEST-TEST-TEST|beneficios|550740'], undefined);
});

test('getContractQuota: le sem incrementar nada, licitacao nova comeca zerada', async () => {
  const { prisma } = makeFakeDb(baseLicense({ trialItemsLimit: 11 }));
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.getContractQuota({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-1', flow: 'beneficios', contractId: '123456',
  });
  assert.equal(result.valid, true);
  assert.equal(result.quota.itemsLimit, 11);
  assert.equal(result.quota.itemsUsed, 0);
  assert.equal(result.quota.itemsRemaining, 11);
});

test('claimTrialLicense: sem linha em IrpConfig, usa o fallback de 11 itens', async () => {
  const { prisma, licenses } = makeFakeDb(null);
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.claimTrialLicense(
    'novo.cliente@example.com', 'device-novo', '1.0.14', '127.0.0.1', 'fingerprint-1234567890abcdef',
  );
  assert.equal(result.valid, true);
  assert.match(result.licenseKey, /^IRP-/);

  const created = licenses[result.licenseKey];
  assert.equal(created.trialItemsLimit, 11);
  assert.equal(created.activeDeviceId, 'device-novo');
});

test('claimTrialLicense: instalacao nova sem e-mail nenhum tambem libera o trial', async () => {
  const { prisma, licenses } = makeFakeDb(null);
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.claimTrialLicense(
    null, 'device-sem-email', '1.0.14', '127.0.0.1', 'fingerprint-abcdefabcdefabcdef',
  );
  assert.equal(result.valid, true);
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

  const second = await licenseService.claimTrialLicense(null, 'device-repetido', '1.0.14', '127.0.0.1', 'fp-1111111111111111');
  assert.equal(second.valid, true);

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
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-outro', runId: 'run-x', itemsCompleted: 1, flow: 'detalhes', contractId: '550740',
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'device_changed');
});

test('getContractQuota: dispositivo diferente do vinculado e rejeitado', async () => {
  const { prisma } = makeFakeDb(baseLicense());
  const licenseService = loadServiceWithFakeDb(prisma);

  const result = await licenseService.getContractQuota({
    licenseKey: 'IRP-TEST-TEST-TEST-TEST', deviceId: 'device-outro', flow: 'detalhes', contractId: '550740',
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'device_changed');
});
