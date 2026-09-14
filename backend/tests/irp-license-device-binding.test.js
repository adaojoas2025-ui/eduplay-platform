/**
 * Cobre o bug real encontrado em producao (11/09/2026): uma licenca paga do IRP Master
 * podia ser ativada em quantos dispositivos/contas Chrome diferentes quisesse, sempre com
 * sucesso, porque o controller de /activate nunca passava `strictDeviceBinding` (o parametro
 * que ja existia e ja protegia o BaixaTudo). Corrigido em license.service.js#activateLicense:
 * a licenca agora fica travada PERMANENTEMENTE no primeiro dispositivo que ativar — sem
 * liberacao automatica por inatividade, sem cooldown, sem transferencia via suporte. Decisao
 * explicita do dono do produto, depois de rejeitar as duas alternativas mais leves
 * (reclaim automatico apos 30 dias / cooldown entre trocas): "comprou so pode usar naquele
 * que cadastrou primeiro (...) depois disso tem que pagar novamente pra usar".
 *
 * Mesmo padrao de mock (Module._load) ja usado em tests/baixatudo-license-fix.test.js e
 * tests/irp-trial-item-quota.test.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

function makeFakeDb({ license } = {}) {
  const prisma = {
    async $executeRawUnsafe() { return 1; },
    async $queryRawUnsafe(sql) {
      if (sql.includes('FROM "IrpLicense"')) return license ? [license] : [];
      return [];
    },
  };
  return prisma;
}

function loadServiceWithDb(prisma) {
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === '../config/database') return { prisma };
    if (request === '../utils/logger') return { info() {}, warn() {}, error() {} };
    if (request === './email.service') return {};
    return originalLoad.call(this, request, parent, isMain);
  };
  const servicePath = path.resolve(__dirname, '../src/services/license.service.js');
  delete require.cache[require.resolve(servicePath)];
  const service = require(servicePath);
  Module._load = originalLoad;
  return service;
}

function activeLicense(overrides = {}) {
  return {
    id: 'license-id',
    licenseKey: 'IRP-TEST-TEST-TEST-TEST',
    email: 'cliente@example.com',
    status: 'active',
    expiresAt: new Date(Date.now() + 86400000),
    activeDeviceId: 'device-original',
    lastSeenAt: new Date(),
    ...overrides,
  };
}

test('IRP Master rejects a second device even right after activation', async () => {
  const licenseService = loadServiceWithDb(makeFakeDb({ license: activeLicense() }));
  const result = await licenseService.activateLicense('IRP-TEST-TEST-TEST-TEST', 'device-second', '1.0.18');
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'device_changed');
});

test('IRP Master rejects a second device even after a long time (no automatic reclaim)', async () => {
  const staleLastSeen = new Date(Date.now() - 400 * 86400000); // mais de um ano parado
  const licenseService = loadServiceWithDb(makeFakeDb({ license: activeLicense({ lastSeenAt: staleLastSeen }) }));
  const result = await licenseService.activateLicense('IRP-TEST-TEST-TEST-TEST', 'device-second', '1.0.18');
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'device_changed');
});

test('IRP Master keeps accepting the already-bound device', async () => {
  const licenseService = loadServiceWithDb(makeFakeDb({ license: activeLicense() }));
  const result = await licenseService.activateLicense('IRP-TEST-TEST-TEST-TEST', 'device-original', '1.0.18');
  assert.equal(result.valid, true);
});

test('a brand-new device binding (no activeDeviceId yet) is never blocked', async () => {
  const licenseService = loadServiceWithDb(makeFakeDb({ license: activeLicense({ activeDeviceId: null, lastSeenAt: null }) }));
  const result = await licenseService.activateLicense('IRP-TEST-TEST-TEST-TEST', 'device-first-ever', '1.0.18');
  assert.equal(result.valid, true);
});
