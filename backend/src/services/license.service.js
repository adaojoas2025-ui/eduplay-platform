/**
 * IRP Master Automação — License Service
 * Uses raw SQL via prisma.$queryRaw to avoid Prisma client cache issues.
 * The server receives ONLY: licenseKey, deviceId, extensionVersion.
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const emailService = require('./email.service');

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let licenseSchemaReady = false;

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

function addDays(baseDate, days) {
  return new Date(baseDate.getTime() + Number(days) * 86400000);
}

async function ensureLicenseSchema() {
  if (licenseSchemaReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IrpLicense" (
      "id" TEXT PRIMARY KEY,
      "licenseKey" TEXT NOT NULL UNIQUE,
      "email" TEXT,
      "status" TEXT NOT NULL DEFAULT 'active',
      "expiresAt" TIMESTAMP(3),
      "activeDeviceId" TEXT,
      "lastSeenAt" TIMESTAMP(3),
      "extensionVersion" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const licenseColumns = [
    '"licenseKey" TEXT',
    '"email" TEXT',
    '"status" TEXT NOT NULL DEFAULT \'active\'',
    '"expiresAt" TIMESTAMP(3)',
    '"activeDeviceId" TEXT',
    '"lastSeenAt" TIMESTAMP(3)',
    '"extensionVersion" TEXT',
    '"notes" TEXT',
    '"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
    '"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
  ];

  for (const column of licenseColumns) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS ${column}`);
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IrpLicenseEvent" (
      "id" TEXT PRIMARY KEY,
      "licenseId" TEXT NOT NULL,
      "eventType" TEXT NOT NULL,
      "deviceId" TEXT,
      "extensionVersion" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const eventColumns = [
    '"licenseId" TEXT NOT NULL',
    '"eventType" TEXT NOT NULL',
    '"deviceId" TEXT',
    '"extensionVersion" TEXT',
    '"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
    '"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
  ];

  for (const column of eventColumns) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "IrpLicenseEvent" ADD COLUMN IF NOT EXISTS ${column}`);
  }

  // Registro de quem já usou o teste grátis de 1 dia (anti-abuso por e-mail + dispositivo)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IrpTrialClaim" (
      "id" TEXT PRIMARY KEY,
      "emailNormalized" TEXT NOT NULL,
      "deviceId" TEXT NOT NULL,
      "licenseKey" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "IrpTrialClaim_emailNormalized_key" ON "IrpTrialClaim"("emailNormalized")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "IrpTrialClaim_deviceId_key" ON "IrpTrialClaim"("deviceId")`
  );
  await prisma.$executeRawUnsafe(`ALTER TABLE "IrpTrialClaim" ADD COLUMN IF NOT EXISTS "ip" TEXT`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "IrpTrialClaim_ip_idx" ON "IrpTrialClaim"("ip")`
  );

  licenseSchemaReady = true;
}

// Normaliza e-mail para evitar burlar o teste grátis com variações (gmail.com ignora
// pontos e tudo após "+", outros provedores ignoram apenas o "+").
function normalizeEmailForTrial(email) {
  const clean = String(email || '').trim().toLowerCase();
  const at = clean.indexOf('@');
  if (at === -1) return clean;
  let local = clean.slice(0, at);
  let domain = clean.slice(at + 1);
  local = local.split('+')[0];
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  }
  return `${local}@${domain}`;
}

async function findByKey(licenseKey) {
  await ensureLicenseSchema();
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
  await ensureLicenseSchema();
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
  await ensureLicenseSchema();
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
    await ensureLicenseSchema();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "IrpLicenseEvent" ("id","licenseId","eventType","deviceId","extensionVersion","createdAt")
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      uuid(), licenseId, eventType, deviceId || null, extensionVersion || null
    );
  } catch (e) { /* non-critical */ }
}

async function createLicense(email, days, notes = '', options = {}) {
  await ensureLicenseSchema();
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
  const expiresAt = addDays(new Date(), days);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "IrpLicense" ("id","licenseKey","email","status","expiresAt","notes","createdAt","updatedAt")
     VALUES ($1,$2,$3,'active',$4,$5,NOW(),NOW())`,
    id, licenseKey, email, expiresAt, notes
  );
  await logEvent(id, 'created', null, null);
  logger.info('IRP license created', { licenseKey, email });
  return { id, licenseKey, email, status: 'active', expiresAt };
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

// Cria ou renova licença por email. options.deviceId vincula o dispositivo imediatamente.
async function renewLicense(email, days, options = {}) {
  await ensureLicenseSchema();
  const prefix = normalizePrefix(options.prefix || 'IRP');
  const notes = options.notes || 'new purchase';
  const deviceId = options.deviceId || null;

  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpLicense"
     WHERE "email"=$1 AND "licenseKey" LIKE $2 AND "status" IN ('active','expired')
     ORDER BY "createdAt" DESC LIMIT 1`,
    email,
    `${prefix}-%`
  );
  const existing = rows[0];

  if (existing) {
    const base = options.renewFromNow === true
      ? new Date()
      : (new Date(existing.expiresAt) > new Date() ? new Date(existing.expiresAt) : new Date());
    const newExpiry = addDays(base, days);

    if (deviceId) {
      await prisma.$executeRawUnsafe(
        `UPDATE "IrpLicense"
         SET "status"='active', "expiresAt"=$1, "activeDeviceId"=$2,
             "notes"=CASE WHEN COALESCE("notes",'')='' THEN $4 ELSE "notes"||E'\\n'||$4 END,
             "updatedAt"=NOW()
         WHERE "id"=$3`,
        newExpiry, deviceId, existing.id, notes
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "IrpLicense"
         SET "status"='active', "expiresAt"=$1,
             "notes"=CASE WHEN COALESCE("notes",'')='' THEN $3 ELSE "notes"||E'\\n'||$3 END,
             "updatedAt"=NOW()
         WHERE "id"=$2`,
        newExpiry, existing.id, notes
      );
    }
    await logEvent(existing.id, 'renewed', deviceId, null);
    logger.info('IRP license renewed', { licenseKey: existing.licenseKey, email });
    return { renewed: true, licenseKey: existing.licenseKey, expiresAt: newExpiry };
  }

  const newLicense = await createLicense(email, days, notes, { prefix });
  if (deviceId) {
    await prisma.$executeRawUnsafe(
      `UPDATE "IrpLicense" SET "activeDeviceId"=$1,"updatedAt"=NOW() WHERE "id"=$2`,
      deviceId, newLicense.id
    );
  }
  return { renewed: false, licenseKey: newLicense.licenseKey, expiresAt: newLicense.expiresAt };
}

// Processa pagamento com deduplicação por paymentId.
async function renewLicenseFromPayment(email, days, options = {}) {
  const paymentId = options.paymentId;
  if (!paymentId) throw new Error('paymentId is required for automatic license generation');

  const alreadyProcessed = await findByPaymentEvent(paymentId);
  if (alreadyProcessed) {
    logger.info('License payment already processed', { paymentId, licenseKey: alreadyProcessed.licenseKey });
    return { duplicate: true, renewed: false, licenseKey: alreadyProcessed.licenseKey, expiresAt: alreadyProcessed.expiresAt };
  }

  const result = await renewLicense(email, days, options);
  const license = await findByKey(result.licenseKey);
  if (license) {
    await logEvent(license.id, paymentEventType(paymentId), options.deviceId || null, options.extensionVersion || null);
  }
  return { duplicate: false, ...result };
}

// Ativa licença por deviceId procurando via evento de pagamento (usado pelo BaixaTudo sync).
async function claimLicenseByDevice(deviceId, extensionVersion, options = {}) {
  const prefix = normalizePrefix(options.prefix || 'BT');
  const license = await findLatestPaymentLicenseByDevice(deviceId, prefix);
  if (!license) {
    return { valid: false, reason: 'not_found', message: 'Pagamento aprovado ainda nao encontrado para este navegador.' };
  }
  const result = await activateLicense(license.licenseKey, deviceId, extensionVersion);
  return { ...result, licenseKey: license.licenseKey };
}

// Ativa licença IRP por deviceId procurando diretamente em activeDeviceId (usado pelo IRP sync).
async function syncLicenseByDeviceId(deviceId) {
  if (!deviceId) return { valid: false, message: 'deviceId não informado.' };
  await ensureLicenseSchema();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpLicense"
     WHERE "activeDeviceId"=$1 AND "status"='active' AND "expiresAt" > NOW()
     ORDER BY "updatedAt" DESC LIMIT 1`,
    deviceId
  );
  const license = rows[0];
  if (!license) return { valid: false, message: 'Pagamento aprovado ainda não encontrado. Tente novamente em instantes.' };
  const now = new Date();
  const daysRemaining = Math.ceil((new Date(license.expiresAt) - now) / 86400000);
  await logEvent(license.id, 'synced', deviceId, null);
  return { valid: true, licenseKey: license.licenseKey, expiresAt: license.expiresAt, daysRemaining, message: 'Licença sincronizada.' };
}

const TRIAL_IP_LIMIT = 2;
const TRIAL_IP_WINDOW_DAYS = 30;

// Gera licença de teste grátis (1 dia), uma única vez por e-mail (normalizado) e por dispositivo.
// `ip` é um sinal extra: limita quantos testes podem sair da mesma rede em 30 dias.
async function claimTrialLicense(email, deviceId, extensionVersion, ip) {
  await ensureLicenseSchema();
  if (!email || !deviceId) {
    return { valid: false, reason: 'missing_fields', message: 'E-mail e dispositivo são obrigatórios.' };
  }

  const emailNormalized = normalizeEmailForTrial(email);
  const existing = await prisma.$queryRawUnsafe(
    `SELECT * FROM "IrpTrialClaim" WHERE "emailNormalized"=$1 OR "deviceId"=$2 LIMIT 1`,
    emailNormalized, deviceId
  );
  if (existing[0]) {
    return { valid: false, reason: 'already_used', message: 'Você já utilizou seu teste grátis de 1 dia. Adquira uma licença para continuar usando.' };
  }

  if (ip) {
    const ipCount = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int as count FROM "IrpTrialClaim" WHERE "ip"=$1 AND "createdAt" > NOW() - INTERVAL '${TRIAL_IP_WINDOW_DAYS} days'`,
      ip
    );
    if (Number(ipCount[0].count) >= TRIAL_IP_LIMIT) {
      return { valid: false, reason: 'limit_reached', message: 'Limite de testes grátis atingido para esta rede. Adquira uma licença para continuar.' };
    }
  }

  const license = await createLicense(email, 1, 'free trial - 1 day', { prefix: 'IRP' });
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "activeDeviceId"=$1,"extensionVersion"=$2,"updatedAt"=NOW() WHERE "id"=$3`,
    deviceId, extensionVersion || null, license.id
  );
  await logEvent(license.id, 'trial_claimed', deviceId, extensionVersion);

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "IrpTrialClaim" ("id","emailNormalized","deviceId","licenseKey","ip","createdAt") VALUES ($1,$2,$3,$4,$5,NOW())`,
      uuid(), emailNormalized, deviceId, license.licenseKey, ip || null
    );
  } catch (e) {
    // Corrida entre duas requisições simultâneas — outro request já registrou o claim.
    return { valid: false, reason: 'already_used', message: 'Você já utilizou seu teste grátis de 1 dia. Adquira uma licença para continuar usando.' };
  }

  await emailService.sendIrpTrialEmail(email, license.licenseKey, license.expiresAt);
  logger.info('IRP trial license claimed', { email: emailNormalized, licenseKey: license.licenseKey });

  return {
    valid: true,
    licenseKey: license.licenseKey,
    expiresAt: license.expiresAt,
    daysRemaining: 1,
    message: 'Teste grátis de 1 dia ativado! A chave também foi enviada para o seu e-mail.',
  };
}

// ── Admin functions ─────────────────────────────────────────────────────────

async function listLicenses({ page = 1, limit = 50, status, email } = {}) {
  await ensureLicenseSchema();
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
  await ensureLicenseSchema();
  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "IrpLicense" WHERE "id" = $1 LIMIT 1`, id);
  return rows[0] || null;
}

async function getLicenseEvents(licenseId) {
  await ensureLicenseSchema();
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
  const newExpiry = addDays(base, days);
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "status"='active',"expiresAt"=$1,"updatedAt"=NOW() WHERE "id"=$2`,
    newExpiry, id
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
  heartbeat, logoutLicense,
  renewLicense, renewLicenseFromPayment, claimLicenseByDevice, syncLicenseByDeviceId,
  claimTrialLicense,
  listLicenses, getLicenseById, getLicenseEvents,
  blockLicense, unblockLicense, renewLicenseById, freeDevice,
};
