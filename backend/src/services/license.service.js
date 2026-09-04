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
    // Trial por quantidade de itens (em vez de so por tempo): NULL = licenca paga/cortesia,
    // sem limite de itens. Gravado como snapshot no momento da criacao do trial, entao
    // mudar o valor padrao depois nunca afeta trials ja concedidos.
    '"trialItemsLimit" INTEGER',
    '"trialItemsUsed" INTEGER NOT NULL DEFAULT 0',
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
  await prisma.$executeRawUnsafe(`ALTER TABLE "IrpTrialClaim" ADD COLUMN IF NOT EXISTS "clientFingerprint" TEXT`);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "IrpTrialClaim_clientFingerprint_key"
      ON "IrpTrialClaim"("clientFingerprint")
      WHERE "clientFingerprint" IS NOT NULL AND "clientFingerprint" <> ''`
  );


  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IrpLicenseAttempt" (
      "id" TEXT PRIMARY KEY,
      "action" TEXT NOT NULL,
      "licenseKey" TEXT,
      "deviceId" TEXT,
      "extensionVersion" TEXT,
      "ip" TEXT,
      "valid" BOOLEAN NOT NULL DEFAULT false,
      "reason" TEXT,
      "message" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const attemptColumns = [
    "\"action\" TEXT NOT NULL DEFAULT 'validate'",
    '"licenseKey" TEXT',
    '"deviceId" TEXT',
    '"extensionVersion" TEXT',
    '"ip" TEXT',
    '"valid" BOOLEAN NOT NULL DEFAULT false',
    '"reason" TEXT',
    '"message" TEXT',
    '"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
  ];

  for (const column of attemptColumns) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "IrpLicenseAttempt" ADD COLUMN IF NOT EXISTS ${column}`);
  }

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "IrpLicenseAttempt_createdAt_idx" ON "IrpLicenseAttempt"("createdAt" DESC)`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "IrpLicenseAttempt_valid_idx" ON "IrpLicenseAttempt"("valid")`
  );

  // Ledger de idempotencia do consumo de itens do trial: garante que uma mesma execucao
  // da automacao (identificada por "runId", gerado uma vez pela extensao) nunca e
  // contabilizada duas vezes, mesmo com reenvio de rede.
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IrpTrialConsumption" (
      "id" TEXT PRIMARY KEY,
      "runId" TEXT NOT NULL,
      "licenseKey" TEXT NOT NULL,
      "itemsRequested" INTEGER NOT NULL DEFAULT 0,
      "itemsApplied" INTEGER NOT NULL DEFAULT 0,
      "flow" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "IrpTrialConsumption_runId_key" ON "IrpTrialConsumption"("runId")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "IrpTrialConsumption_licenseKey_idx" ON "IrpTrialConsumption"("licenseKey")`
  );

  // Config pequena, chave/valor, pra ajustar limite de itens do trial e a rede de
  // seguranca de dias sem precisar publicar uma nova versao do backend.
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "IrpConfig" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  licenseSchemaReady = true;
}

const TRIAL_ITEMS_LIMIT_FALLBACK = 11;
const TRIAL_SAFETY_NET_DAYS_FALLBACK = 30;

// Le um valor numerico de configuracao tunavel em runtime (tabela IrpConfig), com
// fallback fixo caso a linha nao exista ou o banco ainda nao tenha a tabela.
async function getConfigNumber(key, fallback) {
  try {
    await ensureLicenseSchema();
    const rows = await prisma.$queryRawUnsafe(`SELECT "value" FROM "IrpConfig" WHERE "key"=$1 LIMIT 1`, key);
    const n = rows[0] ? Number(rows[0].value) : NaN;
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch (e) {
    return fallback;
  }
}

function quotaFromLicense(license) {
  if (!license || license.trialItemsLimit == null) return null;
  const limit = Number(license.trialItemsLimit);
  const used = Number(license.trialItemsUsed) || 0;
  return { itemsLimit: limit, itemsUsed: used, itemsRemaining: Math.max(0, limit - used) };
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

function normalizeTrialFingerprint(value) {
  const clean = String(value || '').trim();
  if (!clean || clean.length < 16) return null;
  return clean.replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 160) || null;
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

async function activateLicense(licenseKey, deviceId, extensionVersion, options = {}) {
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
  if (options.strictDeviceBinding === true && deviceChanged) {
    await logEvent(license.id, 'device_rejected', deviceId, extensionVersion);
    return {
      valid: false,
      reason: 'device_changed',
      message: 'Esta licenca ja esta vinculada a outro dispositivo.',
    };
  }
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense" SET "activeDeviceId"=$1,"lastSeenAt"=NOW(),"extensionVersion"=$2,"updatedAt"=NOW() WHERE "id"=$3`,
    deviceId, extensionVersion || null, license.id
  );
  await logEvent(license.id, deviceChanged ? 'device_changed' : 'activated', deviceId, extensionVersion);

  const daysRemaining = Math.ceil((new Date(license.expiresAt) - now) / 86400000);
  return { valid: true, status: 'active', expiresAt: license.expiresAt, daysRemaining, quota: quotaFromLicense(license), message: 'Licença ativada com sucesso.' };
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
  return { valid: true, status: 'active', expiresAt: license.expiresAt, daysRemaining, quota: quotaFromLicense(license), message: 'Licença válida.' };
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
  return { valid: true, quota: quotaFromLicense(license) };
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
  return { valid: true, licenseKey: license.licenseKey, expiresAt: license.expiresAt, daysRemaining, quota: quotaFromLicense(license), message: 'Licença sincronizada.' };
}

// Gera licenca de teste gratis limitada por QUANTIDADE DE ITENS (nao mais por tempo),
// uma unica vez por email, instalacao e fingerprint local. `ip` e apenas auditoria: nao
// bloqueia redes compartilhadas de orgaos ou empresas. `expiresAt` continua existindo
// como rede de seguranca (dias), mas quem realmente bloqueia o uso e trialItemsLimit/
// trialItemsUsed, verificado a cada validate/heartbeat via `quota` e consumido pela
// extensao via `consumeTrialItems`/POST /trial/consume.
async function claimTrialLicense(email, deviceId, extensionVersion, ip, clientFingerprint) {
  await ensureLicenseSchema();
  if (!deviceId) {
    return { valid: false, reason: 'missing_fields', message: 'Dispositivo é obrigatório.' };
  }

  // E-mail agora e opcional: instalacao nova sem e-mail nenhum tambem pode pegar o
  // trial (liberacao automatica, sem pedir nada na tela). Nesse caso a protecao
  // antiabuso fica so por conta de deviceId/clientFingerprint (mais fraca que com
  // e-mail real, decisao consciente do dono do produto). Usa um e-mail placeholder
  // derivado do proprio deviceId so pra preencher as colunas que ainda exigem um
  // valor (IrpLicense.email, IrpTrialClaim.emailNormalized) — nunca enviado, nunca
  // mostrado como se fosse um e-mail real de cliente.
  const temEmailReal = !!(email && String(email).trim());
  const emailEfetivo = temEmailReal
    ? String(email).trim()
    : 'device-' + String(deviceId).replace(/[^A-Za-z0-9]/g, '').slice(0, 40) + '@sem-email.irpmaster.local';

  const emailNormalized = normalizeEmailForTrial(emailEfetivo);
  const fingerprint = normalizeTrialFingerprint(clientFingerprint);
  // Decisao explicita do dono do produto (03/09/2026): "Testar grátis" NUNCA bloqueia
  // ninguem, nem repetindo o mesmo e-mail/dispositivo/fingerprint — sempre concede um
  // trial novo de `itemsLimit` itens. A tabela IrpTrialClaim continua sendo alimentada
  // (auditoria/analytics de quantas vezes cada dispositivo pediu trial), so que sem
  // mais bloquear nada com base nela. Ver LICENCAS.md pra reverter essa decisao se o
  // dono do produto mudar de ideia depois.
  const itemsLimit = await getConfigNumber('trial_items_limit_default', TRIAL_ITEMS_LIMIT_FALLBACK);
  const safetyNetDays = await getConfigNumber('trial_safety_net_days', TRIAL_SAFETY_NET_DAYS_FALLBACK);

  const license = await createLicense(emailEfetivo, safetyNetDays, 'free trial - item-limited' + (temEmailReal ? '' : ' (sem e-mail, liberacao automatica)'), { prefix: 'IRP' });
  await prisma.$executeRawUnsafe(
    `UPDATE "IrpLicense"
       SET "activeDeviceId"=$1,"extensionVersion"=$2,"lastSeenAt"=NOW(),
           "trialItemsLimit"=$3,"trialItemsUsed"=0,"updatedAt"=NOW()
     WHERE "id"=$4`,
    deviceId, extensionVersion || null, itemsLimit, license.id
  );
  await logEvent(license.id, 'trial_claimed', deviceId, extensionVersion);

  // So auditoria agora (nunca bloqueia) — IrpTrialClaim tem indices unicos em
  // emailNormalized/deviceId/clientFingerprint de quando essa tabela ainda bloqueava
  // repeticao; num pedido repetido do mesmo dispositivo/e-mail/fingerprint essa
  // insercao vai colidir com o registro anterior (esperado, nao e mais um erro) — so
  // deixa de registrar essa tentativa especifica no historico, sem afetar o trial que
  // ja foi concedido acima.
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "IrpTrialClaim" ("id","emailNormalized","deviceId","licenseKey","ip","clientFingerprint","createdAt") VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      uuid(), emailNormalized, deviceId, license.licenseKey, ip || null, fingerprint
    );
  } catch (e) { /* pedido repetido do mesmo dispositivo/e-mail/fingerprint — esperado */ }

  if (temEmailReal) {
    await emailService.sendIrpTrialEmail(emailEfetivo, license.licenseKey, license.expiresAt, itemsLimit);
  }
  logger.info('IRP trial license claimed', { email: emailNormalized, licenseKey: license.licenseKey, itemsLimit, temEmailReal });

  return {
    valid: true,
    licenseKey: license.licenseKey,
    expiresAt: license.expiresAt,
    daysRemaining: safetyNetDays,
    quota: { itemsLimit, itemsUsed: 0, itemsRemaining: itemsLimit },
    message: temEmailReal
      ? `Teste grátis ativado! Você pode processar até ${itemsLimit} itens. A chave também foi enviada para o seu e-mail.`
      : `Teste grátis ativado! Você pode processar até ${itemsLimit} itens.`,
  };
}

// Registra itens realmente processados com sucesso por uma execucao de automacao
// (identificada por runId, gerado uma vez pela extensao por execucao). Idempotente: um
// runId ja processado nunca soma de novo, mesmo em reenvio de rede ou corrida entre
// duas chamadas simultaneas com o mesmo runId (a unicidade de "runId" e a garantia
// atomica — o INSERT em IrpTrialConsumption acontece ANTES do UPDATE em IrpLicense, e so
// prossegue pro UPDATE quem realmente "ganhou" a insercao daquele runId).
async function consumeTrialItems({ licenseKey, deviceId, runId, itemsCompleted, flow }) {
  await ensureLicenseSchema();
  if (!licenseKey || !deviceId || !runId) {
    return { valid: false, reason: 'missing_fields', message: 'Dados incompletos para registrar uso do teste.' };
  }

  const license = await findByKey(licenseKey);
  if (!license) return { valid: false, reason: 'not_found', message: 'Chave de licença inválida.' };
  if (license.activeDeviceId && license.activeDeviceId !== deviceId) {
    return { valid: false, reason: 'device_changed', message: 'Esta licença foi ativada em outro dispositivo.' };
  }

  // Licenca paga/cortesia (sem limite de itens): nada a consumir, mas a extensao pode
  // chamar essa rota sem precisar saber antecipadamente se ainda esta em trial.
  if (license.trialItemsLimit == null) {
    return { valid: true, quota: null, applied: 0, alreadyConsumed: false };
  }

  const itemsRequested = Math.max(0, Math.trunc(Number(itemsCompleted) || 0));

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "IrpTrialConsumption" ("id","runId","licenseKey","itemsRequested","itemsApplied","flow","createdAt")
       VALUES ($1,$2,$3,$4,0,$5,NOW())`,
      uuid(), runId, licenseKey, itemsRequested, flow || null
    );
  } catch (e) {
    // runId ja existe (indice unico) — essa execucao ja foi contabilizada antes.
    const already = await prisma.$queryRawUnsafe(`SELECT * FROM "IrpTrialConsumption" WHERE "runId"=$1 LIMIT 1`, runId);
    const fresh = await findByKey(licenseKey);
    return {
      valid: true,
      quota: quotaFromLicense(fresh),
      applied: already[0] ? already[0].itemsApplied : 0,
      alreadyConsumed: true,
    };
  }

  // So chega aqui se o INSERT acima teve sucesso: esta e, garantidamente, a primeira vez
  // que esse runId e processado, mesmo sob corrida entre requisicoes simultaneas.
  const updated = await prisma.$queryRawUnsafe(
    `UPDATE "IrpLicense"
        SET "trialItemsUsed" = LEAST("trialItemsLimit", "trialItemsUsed" + $1), "updatedAt"=NOW()
      WHERE "id"=$2
      RETURNING "trialItemsUsed","trialItemsLimit"`,
    itemsRequested, license.id
  );
  const novoUsado = updated[0].trialItemsUsed;
  const limite = updated[0].trialItemsLimit;
  const aplicado = novoUsado - (license.trialItemsUsed || 0);

  await prisma.$executeRawUnsafe(
    `UPDATE "IrpTrialConsumption" SET "itemsApplied"=$1 WHERE "runId"=$2`, aplicado, runId
  );
  await logEvent(license.id, 'trial_items_consumed', deviceId, null);

  return {
    valid: true,
    quota: { itemsLimit: limite, itemsUsed: novoUsado, itemsRemaining: Math.max(0, limite - novoUsado) },
    applied: aplicado,
    alreadyConsumed: false,
  };
}

// ── Admin functions ─────────────────────────────────────────────────────────

async function listLicenses({ page = 1, limit = 50, status, email, prefix } = {}) {
  await ensureLicenseSchema();
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) { params.push(status); where += ` AND "status" = $${params.length}`; }
  if (email)  { params.push(`%${email}%`); where += ` AND "email" ILIKE $${params.length}`; }
  if (prefix) { params.push(`${normalizePrefix(prefix)}-%`); where += ` AND "licenseKey" LIKE $${params.length}`; }
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

// Apaga POR COMPLETO os registros de teste gratis de um e-mail: a licenca de trial
// (IrpLicense), o registro de "ja usou o teste" (IrpTrialClaim), e tudo que referencia
// essas licencas (IrpLicenseEvent, IrpTrialConsumption, IrpLicenseAttempt) — usado pelo
// botao "Apagar" da tela Admin > Licencas IRP pra limpar dados de teste antigos.
// Decisao explicita do dono do produto (04/09/2026): apagar de vez, nao so bloquear —
// bloquear (status='blocked') deixaria o registro visivel/consultavel; apagar remove
// completamente. So mexe em licencas de teste gratis (prefixo "IRP-"), nunca em licencas
// pagas/cortesia (prefixo "BT-" ou outro) mesmo que o e-mail bata, para nao apagar por
// engano uma compra real.
async function resetTrialClaim(email) {
  await ensureLicenseSchema();
  const emailNormalized = normalizeEmailForTrial(email);
  const licenses = await prisma.$queryRawUnsafe(
    `SELECT "id","licenseKey" FROM "IrpLicense" WHERE "email" ILIKE $1 AND "licenseKey" LIKE 'IRP-%'`,
    emailNormalized
  );
  for (const lic of licenses) {
    await prisma.$executeRawUnsafe(`DELETE FROM "IrpLicenseEvent" WHERE "licenseId"=$1`, lic.id);
    await prisma.$executeRawUnsafe(`DELETE FROM "IrpTrialConsumption" WHERE "licenseKey"=$1`, lic.licenseKey);
    await prisma.$executeRawUnsafe(`DELETE FROM "IrpLicenseAttempt" WHERE "licenseKey"=$1`, lic.licenseKey);
  }
  await prisma.$executeRawUnsafe(
    `DELETE FROM "IrpLicense" WHERE "email" ILIKE $1 AND "licenseKey" LIKE 'IRP-%'`,
    emailNormalized
  );
  const rows = await prisma.$queryRawUnsafe(
    `DELETE FROM "IrpTrialClaim" WHERE "emailNormalized"=$1 RETURNING "licenseKey"`,
    emailNormalized
  );
  return { removed: rows.length, emailNormalized, licensesRemoved: licenses.length, licenseKeys: licenses.map(l => l.licenseKey) };
}

async function listTrialClaims({ page = 1, limit = 50, state, email } = {}) {
  await ensureLicenseSchema();
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const offset = (safePage - 1) * safeLimit;
  const params = [];
  let where = '';

  if (email) {
    params.push(`%${String(email).trim()}%`);
    where += ` AND c."emailNormalized" ILIKE $${params.length}`;
  }
  if (state === 'active') {
    where += ` AND l."status" = 'active' AND l."expiresAt" >= NOW()`;
  } else if (state === 'expired') {
    where += ` AND (l."expiresAt" < NOW() OR l."status" <> 'active')`;
  }

  params.push(safeLimit, offset);
  const rows = await prisma.$queryRawUnsafe(
    `SELECT c."id", c."emailNormalized" AS "email", c."deviceId", c."licenseKey",
            c."clientFingerprint", c."createdAt",
            CASE
              WHEN l."status" = 'active' AND l."expiresAt" < NOW() THEN 'expired'
              ELSE COALESCE(l."status", 'missing')
            END AS "status",
            l."expiresAt", l."lastSeenAt", l."extensionVersion", l."notes",
            l."trialItemsUsed", l."trialItemsLimit"
       FROM "IrpTrialClaim" c
       LEFT JOIN "IrpLicense" l ON l."licenseKey" = c."licenseKey"
      WHERE 1=1${where}
      ORDER BY c."createdAt" DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    ...params
  );
  const countParams = params.slice(0, params.length - 2);
  const total = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS count
       FROM "IrpTrialClaim" c
       LEFT JOIN "IrpLicense" l ON l."licenseKey" = c."licenseKey"
      WHERE 1=1${where}`,
    ...countParams
  );

  return { trials: rows, total: Number(total[0].count), page: safePage, limit: safeLimit };
}

async function recordLicenseAttempt({ action, licenseKey, deviceId, extensionVersion, ip, valid, reason, message } = {}) {
  try {
    await ensureLicenseSchema();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "IrpLicenseAttempt" ("id","action","licenseKey","deviceId","extensionVersion","ip","valid","reason","message","createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      uuid(),
      String(action || 'validate').slice(0, 40),
      licenseKey ? String(licenseKey).slice(0, 80) : null,
      deviceId ? String(deviceId).slice(0, 180) : null,
      extensionVersion ? String(extensionVersion).slice(0, 40) : null,
      ip ? String(ip).slice(0, 80) : null,
      Boolean(valid),
      reason ? String(reason).slice(0, 80) : null,
      message ? String(message).slice(0, 300) : null
    );
  } catch (e) {
    logger.warn('Could not record IRP license attempt', { error: e.message });
  }
}

async function listLicenseAttempts({ page = 1, limit = 50, valid, action, prefix } = {}) {
  await ensureLicenseSchema();
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const offset = (safePage - 1) * safeLimit;
  const params = [];
  let where = '';

  if (valid === 'true' || valid === true) {
    where += ' AND "valid" = true';
  } else if (valid === 'false' || valid === false) {
    where += ' AND "valid" = false';
  }
  if (action) {
    params.push(String(action).trim());
    where += ` AND "action" = $${params.length}`;
  }
  if (prefix) {
    params.push(`${normalizePrefix(prefix)}-%`);
    where += ` AND "licenseKey" LIKE $${params.length}`;
  }

  params.push(safeLimit, offset);
  const attempts = await prisma.$queryRawUnsafe(
    `SELECT "id", "action", "licenseKey", "deviceId", "extensionVersion", "ip", "valid", "reason", "message", "createdAt"
       FROM "IrpLicenseAttempt"
      WHERE 1=1${where}
      ORDER BY "createdAt" DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    ...params
  );
  const countParams = params.slice(0, params.length - 2);
  const total = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS count FROM "IrpLicenseAttempt" WHERE 1=1${where}`,
    ...countParams
  );
  const summaryWhere = prefix ? ` WHERE "licenseKey" LIKE $1` : '';
  const summaryParams = prefix ? [`${normalizePrefix(prefix)}-%`] : [];
  const summary = await prisma.$queryRawUnsafe(
    `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE "valid" = true)::int AS allowed,
        COUNT(*) FILTER (WHERE "valid" = false)::int AS denied,
        COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '24 hours')::int AS last24h,
        COUNT(*) FILTER (WHERE "valid" = true AND "createdAt" >= NOW() - INTERVAL '24 hours')::int AS allowed24h,
        COUNT(*) FILTER (WHERE "valid" = false AND "createdAt" >= NOW() - INTERVAL '24 hours')::int AS denied24h,
        COUNT(DISTINCT "deviceId") FILTER (WHERE "valid" = true AND "createdAt" >= NOW() - INTERVAL '24 hours' AND "deviceId" IS NOT NULL)::int AS "activeDevices24h"
       FROM "IrpLicenseAttempt"${summaryWhere}`,
    ...summaryParams
  );

  return { attempts, total: Number(total[0].count), page: safePage, limit: safeLimit, summary: summary[0] || {} };
}

// Apaga TODO o historico de uso/tentativas (IrpLicenseAttempt) — botao "Limpar" da secao
// "Uso e tentativas recentes" na tela Admin > Licencas IRP. So um log de auditoria (nao
// afeta licencas ativas nem valida/invalida nada), mas cresce indefinidamente; usado pra
// zerar o log depois de uma rodada grande de testes.
async function clearLicenseAttempts() {
  await ensureLicenseSchema();
  const rows = await prisma.$queryRawUnsafe(`DELETE FROM "IrpLicenseAttempt" RETURNING "id"`);
  return { removed: rows.length };
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
  claimTrialLicense, consumeTrialItems, resetTrialClaim,
  listLicenses, listTrialClaims, getLicenseById, getLicenseEvents,
  recordLicenseAttempt, listLicenseAttempts, clearLicenseAttempts,
  blockLicense, unblockLicense, renewLicenseById, freeDevice,
};
