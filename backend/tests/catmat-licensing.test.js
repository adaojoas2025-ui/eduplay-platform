const test = require('node:test');
const assert = require('node:assert/strict');
const { getPlans, validKey, createCatmatLicensing } = require('../src/services/catmat-license.service');
const KEY = 'CMT-AAAA-BBBB-CCCC-DDDD';
function setup(options = {}) {
  const calls = [], mails = [], audits = [];
  const licenses = { ensureLicenseSchema: async () => {}, recordLicenseAttempt: async a => audits.push(a),
    activateLicense: async (...a) => { calls.push(['activate', ...a]); return { valid: true }; },
    validateLicense: async (...a) => { calls.push(['validate', ...a]); return { valid: true }; },
    renewLicenseFromPayment: async (...a) => { calls.push(['payment', ...a]); return { licenseKey: KEY, expiresAt: '2027-01-01', duplicate: options.duplicate }; },
    getLicenseById: async () => options.row,
    blockLicense: async id => { calls.push(['block', id]); return { ok: true }; } };
  const prisma = options.prisma || { $executeRawUnsafe: async () => 1, $queryRawUnsafe: async () => [] };
  const service = createCatmatLicensing({ prisma, licenses, sendEmail: async (...a) => mails.push(a), env: {} });
  return { service, calls, audits, mails };
}
test('planos CATMAT: R$ 9,99/30 dias e R$ 89,90/365 dias', () => {
  const p = getPlans({});
  assert.equal(p.monthly.price, 9.99); assert.equal(p.annual.price, 89.9);
  assert.equal(p.monthly.days, 30); assert.equal(p.annual.days, 365);
  assert.equal(getPlans({ CATMAT_PRICE_MONTHLY: '12.34' }).monthly.price, 12.34);
  assert.equal(getPlans({ CATMAT_PRICE_MONTHLY: '-1' }).monthly.price, 9.99);
});
test('chaves IRP e BT não ativam CATMAT e o histórico não recebe chave de outro produto', async () => {
  const x = setup();
  for (const key of ['IRP-AAAA-BBBB-CCCC-DDDD', 'BT-AAAA-BBBB-CCCC-DDDD']) {
    const r = await x.service.operate('activate', { licenseKey: key, deviceId: 'id' });
    assert.equal(r.reason, 'wrong_product');
  }
  assert.equal(x.calls.length, 0); assert.ok(x.audits.every(a => a.productPrefix === 'CMT' && !a.licenseKey));
  assert.ok(validKey(KEY));
});
test('ativação paga direta não cria teste grátis', async () => {
  const x = setup(); const r = await x.service.operate('activate', { licenseKey: KEY.toLowerCase(), deviceId: 'same-account', chromeProfileEmail: 'cliente@example.com' });
  assert.equal(r.valid, true); assert.equal(x.calls[0][0], 'activate'); assert.equal(x.calls[0][1], KEY);
  assert.equal(x.audits[0].chromeProfileEmail, 'cliente@example.com');
});
const payment = extra => ({ id: '123', status: 'approved', transaction_amount: 9.99, currency_id: 'BRL', metadata: { product_type: 'catmat_license', plan: 'monthly', buyer_email: 'cliente@example.com', device_id: 'same-account', license_price: 9.99 }, ...extra });
test('pagamento aprovado emite CMT, preserva o device e começa na aprovação', async () => {
  const x = setup(); await x.service.approvedPayment(payment());
  const call = x.calls[0]; assert.equal(call[0], 'payment'); assert.equal(call[2], 30);
  assert.equal(call[3].prefix, 'CMT'); assert.equal(call[3].deviceId, 'same-account'); assert.equal(call[3].renewFromNow, true);
  assert.equal(x.mails.length, 1);
});
test('webhook duplicado não envia outra chave', async () => {
  const x = setup({ duplicate: true }); await x.service.approvedPayment(payment()); assert.equal(x.mails.length, 0);
});
test('pagamento pendente ou de outro produto não libera CATMAT', async () => {
  const x = setup(); await x.service.approvedPayment(payment({ status: 'pending' }));
  await x.service.approvedPayment(payment({ metadata: { product_type: 'irp_license' } }));
  assert.equal(x.calls.length, 0);
});
test('valor, moeda e plano inválidos não emitem licença', async () => {
  const x = setup();
  await assert.rejects(x.service.approvedPayment(payment({ transaction_amount: 0.01 })), /inválido/);
  await assert.rejects(x.service.approvedPayment(payment({ currency_id: 'USD' })), /inválido/);
  await assert.rejects(x.service.approvedPayment(payment({ metadata: { product_type: 'catmat_license', plan: 'constructor' } })), /inválido/);
  assert.equal(x.calls.length, 0);
});
test('recuperação é restrita a CMT e não renova expiresAt', async () => {
  const expiresAt = new Date(Date.now() + 6 * 86400000).toISOString();
  const queries = [], writes = [];
  const x = setup({ prisma: { $executeRawUnsafe: async (sql, ...a) => { writes.push(sql); }, $queryRawUnsafe: async (sql, id) => {
    queries.push(sql); assert.match(sql, /LIKE 'CMT-%'/); assert.equal(id, 'same-account');
    return [{ id: '1', licenseKey: KEY, expiresAt, trialMode: null }];
  } } });
  const r = await x.service.sync({ deviceId: 'same-account' });
  assert.equal(r.licenseKey, KEY); assert.equal(r.expiresAt, expiresAt);
  assert.ok(writes.every(sql => !sql.includes('"expiresAt"=')));
});
test('ações administrativas rejeitam licença IRP', async () => {
  const x = setup({ row: { licenseKey: 'IRP-AAAA-BBBB-CCCC-DDDD' } });
  await assert.rejects(x.service.adminAction('other', 'block'), /não encontrada/); assert.equal(x.calls.length, 0);
});
test('cortesia cancela só as licenças CMT do mesmo e-mail e não soma prazo anterior', async () => {
  const state = [ { id: 'old-cmt', email: 'cliente@example.com', licenseKey: KEY, status: 'active' }, { id: 'irp', email: 'cliente@example.com', licenseKey: 'IRP-AAAA-BBBB-CCCC-DDDD', status: 'active' } ];
  const now = new Date('2026-11-20T12:00:00Z'); let created;
  const tx = { $queryRawUnsafe: async (sql, email) => {
    if (sql.includes('pg_advisory')) { assert.equal(email, 'courtesy:CMT:cliente@example.com'); return []; }
    if (sql === 'SELECT NOW() AS now') return [{ now }];
    assert.match(sql, /LIKE 'CMT-%'/);
    const rows = state.filter(r => r.email === email && r.licenseKey.startsWith('CMT-'));
    rows.forEach(r => { r.status = 'cancelled'; }); return rows;
  }, $executeRawUnsafe: async (sql, ...a) => { if (sql.includes('INSERT INTO "IrpLicense"')) created = a; return 1; } };
  const x = setup({ prisma: { $executeRawUnsafe: async () => 1, $transaction: fn => fn(tx) } });
  const r = await x.service.courtesy({ email: 'CLIENTE@example.com', days: 30, notes: 'source:courtesy' });
  assert.equal(r.revokedCount, 1); assert.ok(validKey(r.licenseKey));
  assert.equal(r.expiresAt.getTime(), now.getTime() + 30 * 86400000);
  assert.equal(state[0].status, 'cancelled'); assert.equal(state[1].status, 'active'); assert.ok(created);
});
