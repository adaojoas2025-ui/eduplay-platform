// Trial temporal: vencimento absoluto, registro persistente e emissão atômica.
function createCatmatTrial24Service({ prisma, uuid, generateLicenseKey, normalizeEmailForTrial, normalizeTrialFingerprint }) {
  let schemaReady = false;
  async function ensureSchema() {
    if (schemaReady) return;
    await prisma.$executeRawUnsafe('ALTER TABLE "IrpLicense" ADD COLUMN IF NOT EXISTS "trialMode" TEXT');
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "CatmatTrial24Claim" (
      "id" TEXT PRIMARY KEY, "deviceId" TEXT NOT NULL UNIQUE,
      "emailNormalized" TEXT UNIQUE, "clientFingerprint" TEXT UNIQUE,
      "licenseKey" TEXT NOT NULL, "startedAt" TIMESTAMP(3) NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL
    )`);
    schemaReady = true;
  }
  const resultFor = (license, now) => ({ valid: true, licenseKey: license.licenseKey,
    expiresAt: license.expiresAt,
    daysRemaining: Math.max(0, Math.ceil((new Date(license.expiresAt) - now) / 86400000)),
    quota: null, isTrial: license.trialMode === 'time24', trialType: license.trialMode || null,
    message: license.trialMode === 'time24'
      ? 'Teste grátis de 24 horas, sem limite de itens. O prazo não reinicia ao trocar de PC.'
      : 'Sua licença existente continua ativa.' });

  async function claim({ email, profileEmail, deviceId, extensionVersion, ip, clientFingerprint }) {
    if (!deviceId) return { valid: false, reason: 'missing_fields', message: 'Dispositivo é obrigatório.' };
    await ensureSchema();
    const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    const realEmail = validEmail(profileEmail) ? profileEmail : (validEmail(email) ? email : null);
    const account = realEmail ? normalizeEmailForTrial(realEmail) : null;
    const fingerprint = account ? null : normalizeTrialFingerprint(clientFingerprint);
    const payload = await prisma.$transaction(async tx => {
      const locks = ['device:' + deviceId, account && 'email:' + account, fingerprint && 'fingerprint:' + fingerprint].filter(Boolean).sort();
      for (const lock of locks) await tx.$queryRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))::text AS locked', 'trial24:CMT:' + lock);
      const [{ now }] = await tx.$queryRawUnsafe('SELECT NOW() AS now');
      const time = new Date(now);
      // Nunca substituir compra/cortesia ainda válida por um teste gratuito.
      const paid = await tx.$queryRawUnsafe(`SELECT * FROM "IrpLicense" WHERE "licenseKey" LIKE 'CMT-%' AND "activeDeviceId"=$1
        AND "status"='active' AND "expiresAt">$2 AND "trialItemsLimit" IS NULL
        AND "trialMode" IS DISTINCT FROM 'time24' ORDER BY "updatedAt" DESC LIMIT 1`, deviceId, time);
      if (paid[0]) return { result: resultFor(paid[0], time), created: false };
      const claims = await tx.$queryRawUnsafe(`SELECT * FROM "CatmatTrial24Claim"
        WHERE "deviceId"=$1 OR ($2::text IS NOT NULL AND "emailNormalized"=$2)
        OR ($3::text IS NOT NULL AND "clientFingerprint"=$3)
        ORDER BY CASE WHEN "deviceId"=$1 THEN 0 ELSE 1 END LIMIT 1`, deviceId, account, fingerprint);
      if (claims[0]) {
        const existing = claims[0];
        if (existing.deviceId !== deviceId) return { result: { valid: false, reason: 'trial_already_used',
          message: 'Esta conta já iniciou o teste de 24 horas. Aguarde a sincronização do Chrome ou adquira uma licença.' }, created: false };
        if (new Date(existing.expiresAt) <= time) return { result: { valid: false, reason: 'trial_expired',
          expiresAt: existing.expiresAt, message: 'Seu teste de 24 horas terminou. Adquira uma licença para continuar.' }, created: false };
        const rows = await tx.$queryRawUnsafe('SELECT * FROM "IrpLicense" WHERE "licenseKey"=$1', existing.licenseKey);
        const license = rows[0];
        if (!license || license.status !== 'active' || new Date(license.expiresAt) <= time)
          return { result: { valid: false, reason: 'trial_unavailable', message: 'Teste indisponível. Adquira uma licença ou entre em contato com o suporte.' }, created: false };
        return { result: resultFor(license, time), created: false };
      }
      const expiresAt = new Date(time.getTime() + 24 * 60 * 60 * 1000);
      const id = uuid(), key = generateLicenseKey('CMT');
      const licenseEmail = realEmail ? String(realEmail).trim().toLowerCase()
        : 'device-' + String(deviceId).replace(/[^A-Za-z0-9]/g, '').slice(0, 40) + '@sem-email.irpmaster.local';
      await tx.$executeRawUnsafe(`INSERT INTO "IrpLicense"
        ("id","licenseKey","email","status","expiresAt","activeDeviceId","extensionVersion","lastSeenAt","notes","trialMode","trialItemsLimit","createdAt","updatedAt")
        VALUES ($1,$2,$3,'active',$4,$5,$6,$7,'free trial - 24 hours - Caçador de CATMAT','time24',NULL,$7,$7)`,
        id, key, licenseEmail, expiresAt, deviceId, extensionVersion || null, time);
      await tx.$executeRawUnsafe(`INSERT INTO "CatmatTrial24Claim"
        ("id","deviceId","emailNormalized","clientFingerprint","licenseKey","startedAt","expiresAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7)`, uuid(), deviceId, account, fingerprint, key, time, expiresAt);
      await tx.$executeRawUnsafe('INSERT INTO "IrpLicenseEvent" ("id","licenseId","eventType","deviceId","extensionVersion","createdAt") VALUES ($1,$2,$3,$4,$5,$6)', uuid(), id, 'trial24_claimed', deviceId, extensionVersion || null, time);
      return { result: resultFor({ licenseKey: key, expiresAt, trialMode: 'time24' }, time), created: true };
    });
    return payload;
  }
  return { claim, ensureSchema };
}
module.exports = { createCatmatTrial24Service };
