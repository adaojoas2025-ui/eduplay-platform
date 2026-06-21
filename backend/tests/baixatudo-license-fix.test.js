const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

const executed = [];
let queryResult = [];
const prisma = {
  $executeRawUnsafe: async (...args) => { executed.push(args); return 1; },
  $queryRawUnsafe: async () => queryResult,
};

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === '../config/database') return { prisma };
  if (request === '../utils/logger') return { info() {}, warn() {}, error() {} };
  if (request === './email.service') return {};
  return originalLoad.call(this, request, parent, isMain);
};

const servicePath = path.resolve(__dirname, '../src/services/license.service.js');
const licenseService = require(servicePath);
Module._load = originalLoad;

function activeLicense(deviceId = 'device-original') {
  return {
    id: 'license-id',
    licenseKey: 'BT-TEST-TEST-TEST-TEST',
    email: 'cliente@example.com',
    status: 'active',
    expiresAt: new Date(Date.now() + 86400000),
    activeDeviceId: deviceId,
  };
}

test('BaixaTudo rejects activation from a second device', async () => {
  executed.length = 0;
  queryResult = [activeLicense()];
  const result = await licenseService.activateLicense(
    'BT-TEST-TEST-TEST-TEST',
    'device-second',
    '2.1.76',
    { strictDeviceBinding: true },
  );
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'device_changed');
  assert.equal(executed.some(args => String(args[0]).includes('SET "activeDeviceId"')), false);
  assert.equal(executed.some(args => args.includes('device_rejected')), true);
});

test('BaixaTudo accepts the already bound device', async () => {
  executed.length = 0;
  queryResult = [activeLicense()];
  const result = await licenseService.activateLicense(
    'BT-TEST-TEST-TEST-TEST',
    'device-original',
    '2.1.76',
    { strictDeviceBinding: true },
  );
  assert.equal(result.valid, true);
  assert.equal(executed.some(args => String(args[0]).includes('SET "activeDeviceId"')), true);
});

test('a new one-day courtesy key expires 24 hours from creation', async () => {
  executed.length = 0;
  queryResult = [];
  const before = Date.now();
  const result = await licenseService.createLicense(
    'cortesia@example.com',
    1,
    'source:courtesy | product:baixatudo',
    { prefix: 'BT' },
  );
  const after = Date.now();
  const expires = new Date(result.expiresAt).getTime();
  assert.match(result.licenseKey, /^BT-/);
  assert.ok(expires >= before + 86400000);
  assert.ok(expires <= after + 86400000);
});

test('BaixaTudo courtesy route creates a fresh key while IRP keeps renewal', () => {
  const route = require('node:fs').readFileSync(
    path.resolve(__dirname, '../src/api/routes/admin-extension.routes.js'),
    'utf8',
  );
  assert.match(route, /extension\.id === 'baixatudo'[\s\S]*createLicense/);
  assert.match(route, /:\s*await licenseService\.renewLicense/);
});