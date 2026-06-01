/**
 * IRP Master Automação — License Service
 * Uses raw SQL via prisma.$queryRaw to avoid Prisma client cache issues.
 * The server receives ONLY: licenseKey, deviceId, extensionVersion.
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function normalizePrefix(prefix = 'IRP') {
  const clean = String(prefix || 'IRP').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean || 'IRP';
}

function generateLicenseKey(prefix = 'IRP') {
  const licensePrefix = normalizePrefix(prefix);
  const seg = () => Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  return `${licensePrefix}-${seg()}-${seg()}-${seg()}-${seg()}`;
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function findByKey(licenseKey) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpLicense" WHERE "licenseKey" = $1 LIMIT 1`, licenseKey
  );
  return rows[0] || null;
}

function paymentEventType(paymentId) {
  return 'payment:' + String(paymentId || '').replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 80);
}

async function findByPaymentEvent(paymentId) {
  if (!paymentId) return null;
  const rows = await prisma.$queryRawUnsafe(
    `SELECT l.* FROM "IrpLicenseEvent" e
     INNER JOIN "IrpLicense" l ON l."id" = e."licenseId"
     WHERE e."eventType" = $1
     ORDER BY e."createdAt" DESC LIMIT 1`,
    paymentEventType(paymentId)
  );
  return rows[0] || null;
}

async function findLatestPaymentLicenseByDevice(deviceId, prefix = 'BT') {
  if (!deviceId) return null;
  const rows = await prisma.$queryRawUnsafe(
    `SELECT l.* FROM "IrpLicenseEvent" e
     INNER JOIN "IrpLicense" l ON l."id" = e."licenseId"
     WHERE e."deviceId" = $1
       AND e."eventType" LIKE 'payment:%'
       AND l."licenseKey" LIKE $2
     ORDER BY e."createdAt" DESC LIMIT 1`,
    deviceId,
    normalizePrefix(prefix) + '-%'
  );
  return rows[0] || null;
}

async function logEvent(licenseId, eventType, deviceId, extensionVersion) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "IrpLicenseEvent" ("id","licenseId","eventType","deviceId","extensionVersion","createdAt")
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      uuid(), licenseId, eventType, deviceId || null, extensionVersion || null
    );
  } catch (e) { /* non-critical */ }
}

async function createLicense(email, days, notes = '', options = {}) {
  const prefix = normalizePrefix(options.prefix || 'IRP');
  let licenseKey;
  let attempts = 0;
  do {
    licenseKey = generateLicenseKey(prefix);
    const existing = await findByKey(licenseKey);
    if (!existing) break;
    attempts++;
    if (attempts > 10) throw new Error('Could not generate unique key');
  } while (true);

  const id = uuid();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "IrpLicense" ("id","licenseKey","email","status","expiresAt","notes","createdAt","updatedAt")
     VALUES ($1,$2,$3,'active',NOW() + ($4 || ' days')::interval,$5,NOW(),NOW())`,
    id, licenseKey, email, String(days), notes
  );
  await logEvent(id, 'created', null, null);
  logger.info('IRP license created', { licenseKey, email });
  return { id, licenseKey, email, status: 'active', expiresAt: new Date(Date.now() + Number(days) * 86400000) };
}

async function activateLicense(licenseKey, deviceId, extensionVersion) {
  const license = await findByKey(licenseKey);
  if (!license) return { valid: false, reason: 'not_found', message: 'Chave de licença inválida.' };
  if (license.status === 'blocked') return { valid: false, reason: 'blocked', message: 'Licença bloqueada. Entre em contato com o suporte.' };
  if (license.status === 'cancelled') return { valid: false, reason: 'cancelled', message: 'Licença cancelada.' };

  const now = new Date();
  if (new Date(license.expiresAt) < now) {
    await prisma.$executeRawUnsafe(`UPDATE "IrpLicense" SET "status"='expired',"updatedAt"=NOW() WHERE "id"=$1`, license.id);
    return { valid: false, reason: 'expired', message: 'Licença vencida. Renove para continuar usando.' };
  }

  const deviceChanged = license.activeDeviceId && license.activeDeviceId !== deviceId;
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "activeDeviceId"=$1,"lastSeenAt"=NOW(),"extensionVersion"=$2,"updatedAt"=NOW() WHERE "id"=$3`,
    deviceId, extensionVersion || null, license.id
  );
  await logEvent(license.id, deviceChanged ? 'device_changed' : 'activated', deviceId, extensionVersion);

  const daysRemaining = Math.ceil((new Date(license.expiresAt) - now) / 86400000);
  return { valid: true, status: 'active', expiresAt: license.expiresAt, daysRemaining, message: 'Licença ativada com sucesso.' };
}

async function validateLicense(licenseKey, deviceId, extensionVersion) {
  const license = await findByKey(licenseKey);
  if (!license) return { valid: false, reason: 'not_found', message: 'Chave de licença inválida.' };
  if (license.status === 'blocked') return { valid: false, reason: 'blocked', message: 'Licença bloqueada. Entre em contato com o suporte.' };
  if (license.status === 'cancelled') return { valid: false, reason: 'cancelled', message: 'Licença cancelada.' };

  const now = new Date();
  if (new Date(license.expiresAt) < now) {
    await prisma.$executeRawUnsafe(`UPDATE "IrpLicense" SET "status"='expired',"updatedAt"=NOW() WHERE "id"=$1`, license.id);
    return { valid: false, reason: 'expired', message: 'Licença vencida. Renove para continuar usando.' };
  }

  if (license.activeDeviceId && license.activeDeviceId !== deviceId) {
    return { valid: false, reason: 'device_changed', message: 'Esta licença foi ativada em outro computador. Ative novamente neste computador.' };
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "lastSeenAt"=NOW(),"extensionVersion"=$1,"updatedAt"=NOW() WHERE "id"=$2`,
    extensionVersion || null, license.id
  );
  await logEvent(license.id, 'validated', deviceId, extensionVersion);

  const daysRemaining = Math.ceil((new Date(license.expiresAt) - now) / 86400000);
  return { valid: true, status: 'active', expiresAt: license.expiresAt, daysRemaining, message: 'Licença válida.' };
}

async function heartbeat(licenseKey, deviceId) {
  const license = await findByKey(licenseKey);
  if (!license) return { valid: false, reason: 'not_found' };
  if (license.status !== 'active') return { valid: false, reason: license.status };
  if (new Date(license.expiresAt) < new Date()) return { valid: false, reason: 'expired' };
  if (license.activeDeviceId && license.activeDeviceId !== deviceId) return { valid: false, reason: 'device_changed' };

  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "lastSeenAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1`, license.id
  );
  return { valid: true };
}

async function logoutLicense(licenseKey, deviceId) {
  const license = await findByKey(licenseKey);
  if (!license) return { ok: false };
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "activeDeviceId"=NULL,"updatedAt"=NOW() WHERE "id"=$1`, license.id
  );
  await logEvent(license.id, 'logout', deviceId, null);
  return { ok: true };
}

async function renewLicense(email, days, options = {}) {
  const prefix = normalizePrefix(options.prefix || 'IRP');
  const notes = options.notes || 'new purchase';
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpLicense"
     WHERE "email"=$1 AND "licenseKey" LIKE $2 AND "status" IN ('active','expired')
     ORDER BY "createdAt" DESC LIMIT 1`,
    email,
    `${prefix}-%`
  );
  const existing = rows[0];

  if (existing) {
    const base = new Date(existing.expiresAt) > new Date() ? new Date(existing.expiresAt) : new Date();
    const newExpiry = new Date(base.getTime() + days * 86400000);
    await prisma.$executeRawUnsafe(
      `UPDATE "IrpLicense"
       SET "status"='active',
           "expiresAt"=$1,
           "notes"=TRIM(COALESCE("notes", '') || E'\n' || $3),
           "updatedAt"=NOW()
       WHERE "id"=$2`,
      newExpiry.toISOString(), existing.id, notes
    );
    await logEvent(existing.id, 'renewed', null, null);
    logger.info('IRP license renewed', { licenseKey: existing.licenseKey, email });
    return { renewed: true, licenseKey: existing.licenseKey, expiresAt: newExpiry };
  }

  const newLicense = await createLicense(email, days, notes, { prefix });
  return { renewed: false, licenseKey: newLicense.licenseKey, expiresAt: newLicense.expiresAt };
}

async function renewLicenseFromPayment(email, days, options = {}) {
  const paymentId = options.paymentId;
  if (!paymentId) {
    throw new Error('paymentId is required for automatic license generation');
  }

  const alreadyProcessed = await findByPaymentEvent(paymentId);
  if (alreadyProcessed) {
    logger.info('License payment already processed', {
      paymentId,
      email: alreadyProcessed.email,
      licenseKey: alreadyProcessed.licenseKey,
    });
    return {
      duplicate: true,
      renewed: false,
      licenseKey: alreadyProcessed.licenseKey,
      expiresAt: alreadyProcessed.expiresAt,
    };
  }

  const result = await renewLicense(email, days, options);
  const license = await findByKey(result.licenseKey);
  if (license) {
    await logEvent(license.id, paymentEventType(paymentId), options.deviceId || null, options.extensionVersion || null);
  }
  return { duplicate: false, ...result };
}

async function claimLicenseByDevice(deviceId, extensionVersion, options = {}) {
  const prefix = normalizePrefix(options.prefix || 'BT');
  const license = await findLatestPaymentLicenseByDevice(deviceId, prefix);
  if (!license) {
    return { valid: false, reason: 'not_found', message: 'Pagamento aprovado ainda nao encontrado para este navegador.' };
  }
  const result = await activateLicense(license.licenseKey, deviceId, extensionVersion);
  return { ...result, licenseKey: license.licenseKey };
}

module.exports = { generateLicenseKey, createLicense, activateLicense, validateLicense, heartbeat, logoutLicense, renewLicense, renewLicenseFromPayment, claimLicenseByDevice };
