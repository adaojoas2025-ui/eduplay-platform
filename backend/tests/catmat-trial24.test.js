const test = require('node:test');
const assert = require('node:assert/strict');
const { createCatmatTrial24Service } = require('../src/services/catmat-trial24.service');

function setup() {
  let now = new Date('2026-11-18T12:00:00Z');
  let serial = 0, failClaim = false, writes = [], queue = Promise.resolve();
  const state = { licenses: [], claims: [] };
  const tx = {
    async $queryRawUnsafe(sql, ...args) {
      if (sql.includes('pg_advisory')) return [];
      if (sql === 'SELECT NOW() AS now') return [{ now }];
      if (sql.includes('FROM "CatmatTrial24Claim"')) return state.claims.filter(row => row.deviceId === args[0] || (args[1] && row.emailNormalized === args[1]) || (args[2] && row.clientFingerprint === args[2])).sort((a, b) => (a.deviceId === args[0] ? 0 : 1) - (b.deviceId === args[0] ? 0 : 1)).slice(0, 1);
      if (sql.includes('"activeDeviceId"=$1')) return state.licenses.filter(row => row.activeDeviceId === args[0] && row.status === 'active' && new Date(row.expiresAt) > args[1] && row.trialMode !== 'time24' && row.trialItemsLimit == null);
      if (sql.includes('FROM "IrpLicense" WHERE "licenseKey"')) return state.licenses.filter(row => row.licenseKey === args[0]);
      throw Error('Unexpected query: ' + sql);
    },
    async $executeRawUnsafe(sql, ...args) {
      writes.push(sql);
      if (sql.includes('INSERT INTO "IrpLicense"')) {
        const [id, licenseKey, email, expiresAt, activeDeviceId, extensionVersion, createdAt] = args;
        state.licenses.push({ id, licenseKey, email, expiresAt, activeDeviceId, extensionVersion, createdAt, status: 'active', trialMode: 'time24', trialItemsLimit: null });
      }
      if (sql.includes('INSERT INTO "CatmatTrial24Claim"')) {
        if (failClaim) throw Error('claim insert failed');
        const [id, deviceId, emailNormalized, clientFingerprint, licenseKey, startedAt, expiresAt] = args;
        if (state.claims.some(row => row.deviceId === deviceId || (emailNormalized && row.emailNormalized === emailNormalized) || (clientFingerprint && row.clientFingerprint === clientFingerprint))) throw Error('unique constraint');
        state.claims.push({ id, deviceId, emailNormalized, clientFingerprint, licenseKey, startedAt, expiresAt });
      }
      return 1;
    }
  };
  const prisma = {
    $executeRawUnsafe: async () => 1,
    $transaction: fn => {
      const work = queue.then(async () => {
        const before = structuredClone(state);
        try { return await fn(tx); }
        catch (e) { Object.assign(state, before); throw e; }
      });
      queue = work.catch(() => {}); return work;
    }
  };
  const service = createCatmatTrial24Service({ prisma, uuid: () => 'id-' + (++serial), generateLicenseKey: () => 'CMT-' + (++serial), normalizeEmailForTrial: e => e.trim().toLowerCase(), normalizeTrialFingerprint: f => f || null });
  return { service, state, writes, advance: ms => { now = new Date(now.getTime() + ms); }, fail: () => { failClaim = true; } };
}
const request = extra => ({ deviceId: 'same-sync-id', profileEmail: 'cliente@example.com', ...extra });

test('trial dura exatamente 24 horas do relógio do servidor e não tem cota', async () => {
  const x = setup();
  const { result } = await x.service.claim(request());
  assert.equal(result.valid, true); assert.equal(result.isTrial, true); assert.equal(result.quota, null);
  assert.equal(new Date(result.expiresAt).toISOString(), '2026-11-19T12:00:00.000Z');
  assert.equal(x.state.licenses[0].trialItemsLimit, null);
});

test('repetir pedido e trocar PC com mesmo ID recupera o prazo original', async () => {
  const x = setup(); const first = await x.service.claim(request());
  x.advance(12 * 3600000);
  const second = await x.service.claim(request({ clientFingerprint: 'other-computer' }));
  assert.equal(second.result.licenseKey, first.result.licenseKey);
  assert.equal(second.result.expiresAt, first.result.expiresAt);
  assert.equal(x.state.licenses.length, 1); assert.equal(second.created, false);
});

test('no instante de 24h bloqueia e novos cliques não reiniciam', async () => {
  const x = setup(); await x.service.claim(request()); x.advance(24 * 3600000);
  for (let i = 0; i < 3; i++) {
    const { result } = await x.service.claim(request());
    assert.equal(result.valid, false); assert.equal(result.reason, 'trial_expired');
  }
  assert.equal(x.state.licenses.length, 1);
});

test('mesmo e-mail em ID diferente não transfere chave nem libera outro prazo', async () => {
  const x = setup(); await x.service.claim(request());
  const { result } = await x.service.claim(request({ deviceId: 'different-id' }));
  assert.equal(result.valid, false); assert.equal(result.reason, 'trial_already_used');
  assert.equal(result.licenseKey, undefined); assert.equal(x.state.licenses.length, 1);
});

test('pedidos simultâneos emitem uma única licença', async () => {
  const x = setup(); const results = await Promise.all(Array.from({ length: 4 }, () => x.service.claim(request())));
  assert.equal(x.state.licenses.length, 1); assert.equal(x.state.claims.length, 1);
  assert.equal(new Set(results.map(row => row.result.licenseKey)).size, 1);
});

test('falha no registro de claim reverte licença criada na transação', async () => {
  const x = setup(); x.fail(); await assert.rejects(x.service.claim(request()), /claim insert failed/);
  assert.equal(x.state.licenses.length, 0); assert.equal(x.state.claims.length, 0);
});

test('licença paga ativa é preservada sem iniciar trial', async () => {
  const x = setup(); const expiresAt = new Date('2026-12-18T12:00:00Z');
  x.state.licenses.push({ licenseKey: 'CMT-PAID', status: 'active', activeDeviceId: 'same-sync-id', expiresAt, trialMode: null, trialItemsLimit: null });
  const { result } = await x.service.claim(request());
  assert.equal(result.licenseKey, 'CMT-PAID'); assert.equal(result.isTrial, false);
  assert.equal(result.expiresAt, expiresAt); assert.equal(x.state.claims.length, 0);
});

test('remover a licença não remove o direito de teste já consumido', async () => {
  const x = setup(); await x.service.claim(request()); x.state.licenses.length = 0;
  const { result } = await x.service.claim(request());
  assert.equal(result.valid, false); assert.equal(result.reason, 'trial_unavailable');
  assert.equal(x.state.licenses.length, 0);
});

test('sem e-mail continua com prazo único pelo identificador sincronizado', async () => {
  const x = setup(); const first = await x.service.claim(request({ profileEmail: null }));
  const second = await x.service.claim(request({ profileEmail: null }));
  assert.equal(first.result.licenseKey, second.result.licenseKey); assert.equal(x.state.claims.length, 1);
});
