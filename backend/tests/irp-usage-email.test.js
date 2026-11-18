const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

function load(prisma) {
  const original = Module._load;
  Module._load = function(request, parent, main) {
    if (request === '../config/database') return { prisma };
    if (request === '../utils/logger') return { warn() {}, info() {}, error() {} };
    if (request === './email.service') return {};
    return original.call(this, request, parent, main);
  };
  const target = path.resolve(__dirname, '../src/services/license.service.js');
  try { delete require.cache[require.resolve(target)]; return require(target); }
  finally { Module._load = original; }
}

test('auditoria persiste o perfil normalizado sem substituir o e-mail titular', async () => {
  let insert;
  const service = load({ $executeRawUnsafe: async (sql, ...params) => { if (sql.includes('INSERT INTO "IrpLicenseAttempt"')) insert = { sql, params }; }, $queryRawUnsafe: async () => [] });
  await service.recordLicenseAttempt({ licenseKey: 'IRP-EXAMPLE', deviceId: 'sync-id', valid: true, chromeProfileEmail: ' Cliente@Example.COM ' });
  assert.match(insert.sql, /"chromeProfileEmail"/);
  assert.equal(insert.params[9], 'cliente@example.com');
  assert.ok(!insert.sql.includes('UPDATE "IrpLicense"'));
});

test('e-mail ausente ou inválido é registrado como null', async () => {
  const params = [];
  const service = load({ $executeRawUnsafe: async (sql, ...values) => { if (sql.includes('INSERT INTO "IrpLicenseAttempt"')) params.push(values); }, $queryRawUnsafe: async () => [] });
  await service.recordLicenseAttempt({ chromeProfileEmail: 'invalid' });
  await service.recordLicenseAttempt({});
  assert.deepEqual(params.map(row => row[9]), [null, null]);
});

test('listagem retorna titular, perfil e dias originais, com filtro parametrizado e paginação', async () => {
  const calls = [];
  const expiresAt = new Date(Date.now() + 5 * 86400000).toISOString();
  const service = load({ $executeRawUnsafe: async () => 1, $queryRawUnsafe: async (sql, ...params) => {
    calls.push({ sql, params });
    if (sql.startsWith('SELECT a.')) return [{ licenseEmail: 'titular@example.com', chromeProfileEmail: 'perfil@example.com', licenseExpiresAt: expiresAt }];
    if (sql.startsWith('SELECT COUNT(*)::int AS count')) return [{ count: 1 }];
    return [{ activeEmails24h: 1 }];
  } });
  const result = await service.listLicenseAttempts({ page: 2, limit: 30, prefix: 'IRP', email: "x' OR 1=1 --" });
  assert.equal(result.attempts[0].daysRemaining, 5);
  assert.equal(result.attempts[0].licenseExpiresAt, expiresAt);
  assert.equal(result.attempts[0].licenseEmail, 'titular@example.com');
  assert.equal(result.attempts[0].chromeProfileEmail, 'perfil@example.com');
  for (const call of calls) { assert.ok(!call.sql.includes("x' OR")); assert.ok(call.params.includes("%x' OR 1=1 --%")); }
  assert.deepEqual(calls[0].params.slice(-2), [30, 30]);
});

test('recuperar licença sincronizada não atualiza vencimento nem cria licença', async () => {
  const writes = [];
  const expiresAt = new Date(Date.now() + 8 * 86400000).toISOString();
  const service = load({ $executeRawUnsafe: async (sql) => { writes.push(sql); return 1; }, $queryRawUnsafe: async (sql, id) => {
    assert.equal(id, 'account-original');
    assert.match(sql, /"activeDeviceId"=\$1/);
    assert.match(sql, /"expiresAt" > NOW\(\)/);
    assert.match(sql, /CASE WHEN "trialItemsLimit" IS NULL/);
    return [{ id: 'license', licenseKey: 'IRP-EXAMPLE', expiresAt, status: 'active' }];
  } });
  const result = await service.syncLicenseByDeviceId('account-original');
  assert.equal(result.valid, true);
  assert.equal(result.expiresAt, expiresAt);
  assert.equal(result.daysRemaining, 8);
  assert.ok(!writes.some(sql => /(?:UPDATE|INSERT INTO) "IrpLicense"/.test(sql)));
});
