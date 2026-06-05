/**
 * IRP Master Automação — License Service
 * Uses raw SQL via prisma.$queryRaw to avoid Prisma client cache issues.
 * The server receives ONLY: licenseKey, deviceId, extensionVersion.
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

const LICENSE_PREFIX = 'IRP';
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateLicenseKey() {
  const seg = () => Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  return `${LICENSE_PREFIX}-${seg()}-${seg()}-${seg()}-${seg()}`;
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

async function logEvent(licenseId, eventType, deviceId, extensionVersion) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "IrpLicenseEvent" ("id","licenseId","eventType","deviceId","extensionVersion","createdAt")
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      uuid(), licenseId, eventType, deviceId || null, extensionVersion || null
    );
  } catch (e) { /* non-critical */ }
}

async function createLicense(email, days, notes = '') {
  let licenseKey;
  let attempts = 0;
  do {
    licenseKey = generateLicenseKey();
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
  return { id, licenseKey, email, status: 'active' };
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

async function renewLicense(email, days, deviceId) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpLicense" WHERE "email"=$1 AND "status" IN ('active','expired') ORDER BY "createdAt" DESC LIMIT 1`, email
  );
  const existing = rows[0];

  if (existing) {
    const base = new Date(existing.expiresAt) > new Date() ? new Date(existing.expiresAt) : new Date();
    const newExpiry = new Date(base.getTime() + days * 86400000);
    if (deviceId) {
      await prisma.$executeRawUnsafe(
        `UPDATE "IrpLicense" SET "status"='active',"expiresAt"=$1,"activeDeviceId"=$2,"updatedAt"=NOW() WHERE "id"=$3`,
        newExpiry.toISOString(), deviceId, existing.id
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "IrpLicense" SET "status"='active',"expiresAt"=$1,"updatedAt"=NOW() WHERE "id"=$2`,
        newExpiry.toISOString(), existing.id
      );
    }
    await logEvent(existing.id, 'renewed', deviceId || null, null);
    logger.info('IRP license renewed', { licenseKey: existing.licenseKey, email });
    return { renewed: true, licenseKey: existing.licenseKey, expiresAt: newExpiry };
  }

  const newLicense = await createLicense(email, days, 'new purchase');
  if (deviceId) {
    await prisma.$executeRawUnsafe(
      `UPDATE "IrpLicense" SET "activeDeviceId"=$1,"updatedAt"=NOW() WHERE "id"=$2`,
      deviceId, newLicense.id
    );
  }
  return { renewed: false, licenseKey: newLicense.licenseKey, expiresAt: null };
}

async function syncLicenseByDeviceId(deviceId) {
  if (!deviceId) return { valid: false, message: 'deviceId não informado.' };
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpLicense" WHERE "activeDeviceId"=$1 AND "status"='active' AND "expiresAt" > NOW() ORDER BY "updatedAt" DESC LIMIT 1`,
    deviceId
  );
  const license = rows[0];
  if (!license) return { valid: false, message: 'Pagamento aprovado ainda não encontrado. Tente novamente em instantes.' };
  const now = new Date();
  const daysRemaining = Math.ceil((new Date(license.expiresAt) - now) / 86400000);
  await logEvent(license.id, 'synced', deviceId, null);
  return { valid: true, licenseKey: license.licenseKey, expiresAt: license.expiresAt, daysRemaining, message: 'Licença sincronizada.' };
}

async function listLicenses({ page = 1, limit = 50, status, email } = {}) {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) { params.push(status); where += ` AND "status" = $${params.length}`; }
  if (email)  { params.push(`%${email}%`); where += ` AND "email" ILIKE $${params.length}`; }
  params.push(limit, offset);
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id,"licenseKey","email","status","expiresAt","activeDeviceId","lastSeenAt","extensionVersion","notes","createdAt","updatedAt"
     FROM "IrpLicense" WHERE 1=1${where} ORDER BY "createdAt" DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    ...params
  );
  const countParams = params.slice(0, params.length - 2);
  const total = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int as count FROM "IrpLicense" WHERE 1=1${where}`,
    ...countParams
  );
  return { licenses: rows, total: Number(total[0].count), page, limit };
}

async function getLicenseById(id) {
  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "IrpLicense" WHERE "id" = $1 LIMIT 1`, id);
  return rows[0] || null;
}

async function getLicenseEvents(licenseId) {
  return prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpLicenseEvent" WHERE "licenseId" = $1 ORDER BY "createdAt" DESC LIMIT 100`,
    licenseId
  );
}

async function blockLicense(id) {
  const lic = await getLicenseById(id);
  if (!lic) return null;
  await prisma.$executeRawUnsafe(`UPDATE "IrpLicense" SET "status"='blocked',"updatedAt"=NOW() WHERE "id"=$1`, id);
  await logEvent(id, 'blocked', null, null);
  return { ok: true };
}

async function unblockLicense(id) {
  const lic = await getLicenseById(id);
  if (!lic) return null;
  await prisma.$executeRawUnsafe(`UPDATE "IrpLicense" SET "status"='active',"updatedAt"=NOW() WHERE "id"=$1`, id);
  await logEvent(id, 'activated', null, null);
  return { ok: true };
}

async function renewLicenseById(id, days) {
  const lic = await getLicenseById(id);
  if (!lic) return null;
  const base = new Date(lic.expiresAt) > new Date() ? new Date(lic.expiresAt) : new Date();
  const newExpiry = new Date(base.getTime() + days * 86400000);
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "status"='active',"expiresAt"=$1,"updatedAt"=NOW() WHERE "id"=$2`,
    newExpiry.toISOString(), id
  );
  await logEvent(id, 'renewed', null, null);
  return { ok: true, expiresAt: newExpiry };
}

async function freeDevice(id) {
  const lic = await getLicenseById(id);
  if (!lic) return null;
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "activeDeviceId"=NULL,"updatedAt"=NOW() WHERE "id"=$1`, id
  );
  await logEvent(id, 'logout', null, null);
  return { ok: true };
}

module.exports = {
  generateLicenseKey, createLicense, activateLicense, validateLicense,
  heartbeat, logoutLicense, renewLicense, syncLicenseByDeviceId,
  listLicenses, getLicenseById, getLicenseEvents,
  blockLicense, unblockLicense, renewLicenseById, freeDevice,
};
