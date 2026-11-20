const crypto = require('node:crypto');
const PREFIX = 'CMT';
const PRODUCT = 'cacador-catmat';
const validKey = key => /^CMT-(?:[A-Z0-9]{4}-){3}[A-Z0-9]{4}$/.test(String(key || '').toUpperCase());
const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
const positivePrice = (value, fallback) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(Number(value).toFixed(2)) : fallback;
function getPlans(env = process.env) {
  return {
    monthly: { id: 'cacador-catmat-monthly', title: 'Caçador de CATMAT Mensal', label: 'Mensal', price: positivePrice(env.CATMAT_PRICE_MONTHLY, 9.99), days: 30 },
    annual: { id: 'cacador-catmat-annual', title: 'Caçador de CATMAT Anual', label: 'Anual', price: positivePrice(env.CATMAT_PRICE_ANNUAL, 89.90), days: 365 }
  };
}

function createCatmatLicensing({ prisma, licenses, sendEmail, env = process.env }) {
  const { createCatmatTrial24Service } = require('./catmat-trial24.service');
  const uuid = () => crypto.randomUUID();
  const normalizeEmailForTrial = value => {
    const [local, domain] = String(value || '').trim().toLowerCase().split('@');
    return (domain === 'gmail.com' || domain === 'googlemail.com')
      ? local.split('+')[0].replace(/\./g, '') + '@gmail.com' : local + '@' + domain;
  };
  const trial = createCatmatTrial24Service({ prisma, uuid,
    generateLicenseKey: () => 'CMT-' + crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{4}/g).join('-'),
    normalizeEmailForTrial, normalizeTrialFingerprint: value => value ? String(value).slice(0, 180) : null });
  const ensure = async () => { await licenses.ensureLicenseSchema(); await trial.ensureSchema(); };
  const audit = (action, body, result, ip) => licenses.recordLicenseAttempt({ action,
    licenseKey: body.licenseKey || result.licenseKey, deviceId: body.deviceId,
    extensionVersion: body.extensionVersion, chromeProfileEmail: body.chromeProfileEmail,
    ip, productPrefix: 'CMT', valid: result.valid ?? result.ok, reason: result.reason, message: result.message });

  async function operate(action, body = {}, ip) {
    await ensure();
    const key = String(body.licenseKey || '').trim().toUpperCase();
    let result;
    if (!validKey(key)) result = { valid: false, reason: 'wrong_product', message: 'Use uma chave CMT do Caçador de CATMAT.' };
    else if (!body.deviceId) result = { valid: false, reason: 'missing_fields', message: 'Identificação da instalação obrigatória.' };
    else if (action === 'activate') result = await licenses.activateLicense(key, body.deviceId, body.extensionVersion);
    else if (action === 'heartbeat') result = await licenses.heartbeat(key, body.deviceId);
    else if (action === 'logout') {
      const allowed = await licenses.validateLicense(key, body.deviceId, body.extensionVersion);
      result = allowed.valid ? await licenses.logoutLicense(key, body.deviceId) : allowed;
    } else result = await licenses.validateLicense(key, body.deviceId, body.extensionVersion);
    // Uma chave de outro produto nunca é incluída no histórico CMT.
    await audit(action, { ...body, licenseKey: validKey(key) ? key : null }, result, ip);
    return { product: PRODUCT, ...result };
  }

  async function sync(body = {}, ip) {
    await ensure();
    if (!body.deviceId) return { valid: false, reason: 'missing_fields', message: 'Identificação da instalação obrigatória.' };
    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "IrpLicense"
      WHERE "licenseKey" LIKE 'CMT-%' AND "activeDeviceId"=$1 AND "status"='active' AND "expiresAt">NOW()
      ORDER BY CASE WHEN "trialMode"='time24' THEN 1 ELSE 0 END, "updatedAt" DESC LIMIT 1`, body.deviceId);
    const row = rows[0];
    if (row) await prisma.$executeRawUnsafe('UPDATE "IrpLicense" SET "lastSeenAt"=NOW() WHERE "id"=$1', row.id);
    const result = row ? { valid: true, licenseKey: row.licenseKey, expiresAt: row.expiresAt,
      isTrial: row.trialMode === 'time24', trialType: row.trialMode || null,
      daysRemaining: Math.ceil((new Date(row.expiresAt) - Date.now()) / 86400000), quota: null,
      message: 'Licença do Caçador recuperada com o vencimento original.' }
      : { valid: false, reason: 'not_found', message: 'Nenhuma licença ativa encontrada. Ative uma chave, compre ou inicie o teste de 24h.' };
    await audit('catmat_sync', body, result, ip);
    return result;
  }

  async function startTrial(body = {}, ip) {
    await ensure();
    const payload = await trial.claim({ email: body.email, profileEmail: body.chromeProfileEmail,
      deviceId: body.deviceId, extensionVersion: body.extensionVersion, ip, clientFingerprint: body.clientFingerprint });
    const result = payload.result || payload;
    await audit('catmat_trial', body, result, ip);
    if (payload.created && validEmail(body.email || body.chromeProfileEmail)) {
      try { await sendEmail(body.email || body.chromeProfileEmail, result.licenseKey, result.expiresAt, 'Teste grátis de 24 horas'); }
      catch { result.emailError = 'Teste criado; o envio do e-mail não foi concluído.'; }
    }
    return result;
  }

  async function courtesy({ email, days, notes = '' }) {
    await ensure();
    if (!validEmail(email) || !Number.isFinite(days) || days < 1 / 24 || days > 3650) throw Error('E-mail ou prazo inválido.');
    email = email.trim().toLowerCase();
    return prisma.$transaction(async tx => {
      await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))::text AS locked', 'courtesy:CMT:' + email);
      const [{ now }] = await tx.$queryRawUnsafe('SELECT NOW() AS now');
      const expiresAt = new Date(new Date(now).getTime() + days * 86400000);
      const previous = await tx.$queryRawUnsafe(`UPDATE "IrpLicense" SET "status"='cancelled',"updatedAt"=NOW()
        WHERE LOWER("email")=$1 AND "licenseKey" LIKE 'CMT-%' AND "status" IN ('active','expired') RETURNING "id"`, email);
      const licenseKey = 'CMT-' + crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{4}/g).join('-');
      const id = uuid();
      await tx.$executeRawUnsafe(`INSERT INTO "IrpLicense" ("id","licenseKey","email","status","expiresAt","notes","createdAt","updatedAt")
        VALUES ($1,$2,$3,'active',$4,$5,NOW(),NOW())`, id, licenseKey, email, expiresAt, notes);
      for (const row of previous) await tx.$executeRawUnsafe('INSERT INTO "IrpLicenseEvent" ("id","licenseId","eventType","createdAt") VALUES ($1,$2,\'cancelled\',NOW())', uuid(), row.id);
      await tx.$executeRawUnsafe('INSERT INTO "IrpLicenseEvent" ("id","licenseId","eventType","createdAt") VALUES ($1,$2,\'created\',NOW())', uuid(), id);
      return { id, licenseKey, email, expiresAt, status: 'active', revokedCount: previous.length };
    });
  }

  async function approvedPayment(payment) {
    const metadata = payment.metadata || {};
    if (metadata.product_type !== 'catmat_license' || payment.status !== 'approved') return { ignored: true };
    const plan = ['monthly', 'annual'].includes(metadata.plan) ? getPlans(env)[metadata.plan] : null;
    const email = metadata.buyer_email || payment.payer?.email;
    const expected = Number(metadata.license_price ?? plan?.price);
    if (!plan || !validEmail(email) || payment.currency_id !== 'BRL' || !Number.isFinite(expected) || expected <= 0 || Math.abs(Number(payment.transaction_amount) - expected) > 0.009)
      throw Error('Pagamento do Caçador com plano, moeda, valor ou e-mail inválido.');
    const result = await licenses.renewLicenseFromPayment(email.trim().toLowerCase(), plan.days, {
      paymentId: payment.id, prefix: PREFIX, deviceId: metadata.device_id || null,
      notes: 'Caçador de CATMAT - ' + metadata.plan + ' - MP ' + payment.id, renewFromNow: true });
    if (!result.duplicate) await sendEmail(email, result.licenseKey, result.expiresAt, plan.label);
    return result;
  }

  async function adminList(query = {}) {
    await ensure();
    const page = Math.max(1, Math.floor(Number(query.page) || 1));
    const limit = Math.min(100, Math.max(1, Math.floor(Number(query.limit) || 30)));
    const params = [];
    const derivedStatus = `CASE WHEN "status"='active' AND "expiresAt"<=NOW() THEN 'expired' ELSE "status" END`;
    let where = ` WHERE "licenseKey" LIKE 'CMT-%'`;
    if (['active','expired','blocked','cancelled'].includes(query.status)) { params.push(query.status); where += ' AND (' + derivedStatus + ')=$' + params.length; }
    if (query.email) { params.push('%' + String(query.email).trim().slice(0, 254) + '%'); where += ' AND "email" ILIKE $' + params.length; }
    const rows = await prisma.$queryRawUnsafe('SELECT "id","licenseKey","email",' + derivedStatus + ' AS "status","expiresAt","activeDeviceId","lastSeenAt","extensionVersion","notes","trialMode","createdAt" FROM "IrpLicense"' + where + ' ORDER BY "createdAt" DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2), ...params, limit, (page - 1) * limit);
    const count = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int AS count FROM "IrpLicense"' + where, ...params);
    return { licenses: rows, total: Number(count[0]?.count || 0), page, limit };
  }

  async function adminAction(id, action, days) {
    await ensure();
    const row = await licenses.getLicenseById(id);
    if (!row || !validKey(row.licenseKey)) throw Error('Licença do Caçador não encontrada.');
    if (action === 'block') return licenses.blockLicense(id);
    if (action === 'unblock') return licenses.unblockLicense(id);
    if (action === 'free-device') return licenses.freeDevice(id);
    if (action === 'renew' && Number.isFinite(Number(days)) && Number(days) >= 1 && Number(days) <= 3650)
      return licenses.renewLicenseById(id, Number(days));
    throw Error('Ação ou prazo inválido.');
  }
  return { operate, sync, startTrial, courtesy, approvedPayment, adminList, adminAction, ensure };
}

let singleton;
function getCatmatLicensing() {
  if (!singleton) singleton = createCatmatLicensing({ prisma: require('../config/database').prisma,
    licenses: require('./license.service'), sendEmail: require('./email.service').sendCatmatLicenseEmail });
  return singleton;
}
module.exports = { PREFIX, PRODUCT, validKey, getPlans, createCatmatLicensing, getCatmatLicensing };
