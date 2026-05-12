/**
 * IRP Master Automação — License Service
 * Handles license creation, validation and device binding.
 * The server receives ONLY: licenseKey, deviceId, extensionVersion.
 * It NEVER receives: spreadsheet data, CATMATs, IRP, UASG, CPF or SIASG screen data.
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

const LICENSE_PREFIX = 'IRP';
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion

/**
 * Generate a unique license key in format IRP-XXXX-XXXX-XXXX-XXXX
 */
function generateLicenseKey() {
  const segment = () =>
    Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  return `${LICENSE_PREFIX}-${segment()}-${segment()}-${segment()}-${segment()}`;
}

/**
 * Create a new license after payment confirmation.
 * @param {string} email - Buyer email (for key delivery only)
 * @param {number} days - License validity in days
 * @param {string} [notes] - Optional notes (product name, order ID, etc.)
 */
async function createLicense(email, days, notes = '') {
  let licenseKey;
  let attempts = 0;
  do {
    licenseKey = generateLicenseKey();
    attempts++;
    if (attempts > 10) throw new Error('Could not generate unique license key');
  } while (await prisma.irpLicense.findUnique({ where: { licenseKey } }));

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const license = await prisma.irpLicense.create({
    data: {
      licenseKey,
      email,
      status: 'active',
      expiresAt,
      notes,
      events: {
        create: { eventType: 'created' },
      },
    },
  });

  logger.info('IRP license created', { licenseKey, email, expiresAt });
  return license;
}

/**
 * Activate a license on a device (first use or device transfer).
 */
async function activateLicense(licenseKey, deviceId, extensionVersion) {
  const license = await prisma.irpLicense.findUnique({ where: { licenseKey } });

  if (!license) return { valid: false, reason: 'not_found', message: 'Chave de licença inválida.' };
  if (license.status === 'blocked') return { valid: false, reason: 'blocked', message: 'Licença bloqueada. Entre em contato com o suporte.' };
  if (license.status === 'cancelled') return { valid: false, reason: 'cancelled', message: 'Licença cancelada.' };

  const now = new Date();
  if (license.expiresAt < now) {
    await prisma.irpLicense.update({ where: { licenseKey }, data: { status: 'expired' } });
    return { valid: false, reason: 'expired', message: 'Licença vencida. Renove para continuar usando.' };
  }

  const deviceChanged = license.activeDeviceId && license.activeDeviceId !== deviceId;

  await prisma.irpLicense.update({
    where: { licenseKey },
    data: {
      activeDeviceId: deviceId,
      lastSeenAt: now,
      extensionVersion,
      events: {
        create: {
          eventType: deviceChanged ? 'device_changed' : 'activated',
          deviceId,
          extensionVersion,
        },
      },
    },
  });

  logger.info('IRP license activated', { licenseKey, deviceId, deviceChanged });

  return {
    valid: true,
    status: 'active',
    expiresAt: license.expiresAt,
    daysRemaining: Math.ceil((license.expiresAt - now) / (1000 * 60 * 60 * 24)),
    message: 'Licença ativada com sucesso.',
  };
}

/**
 * Validate a license on each use (called before every automation).
 */
async function validateLicense(licenseKey, deviceId, extensionVersion) {
  const license = await prisma.irpLicense.findUnique({ where: { licenseKey } });

  if (!license) return { valid: false, reason: 'not_found', message: 'Chave de licença inválida.' };
  if (license.status === 'blocked') return { valid: false, reason: 'blocked', message: 'Licença bloqueada. Entre em contato com o suporte.' };
  if (license.status === 'cancelled') return { valid: false, reason: 'cancelled', message: 'Licença cancelada.' };

  const now = new Date();
  if (license.expiresAt < now) {
    await prisma.irpLicense.update({ where: { licenseKey }, data: { status: 'expired' } });
    return { valid: false, reason: 'expired', message: 'Licença vencida. Renove para continuar usando.' };
  }

  if (license.activeDeviceId && license.activeDeviceId !== deviceId) {
    return { valid: false, reason: 'device_changed', message: 'Esta licença foi ativada em outro computador. Ative novamente neste computador.' };
  }

  await prisma.irpLicense.update({
    where: { licenseKey },
    data: {
      lastSeenAt: now,
      extensionVersion,
      events: {
        create: { eventType: 'validated', deviceId, extensionVersion },
      },
    },
  });

  return {
    valid: true,
    status: 'active',
    expiresAt: license.expiresAt,
    daysRemaining: Math.ceil((license.expiresAt - now) / (1000 * 60 * 60 * 24)),
    message: 'Licença válida.',
  };
}

/**
 * Heartbeat — called every hour during active use.
 */
async function heartbeat(licenseKey, deviceId) {
  const license = await prisma.irpLicense.findUnique({ where: { licenseKey } });

  if (!license) return { valid: false, reason: 'not_found' };
  if (license.status !== 'active') return { valid: false, reason: license.status };
  if (license.expiresAt < new Date()) return { valid: false, reason: 'expired' };
  if (license.activeDeviceId && license.activeDeviceId !== deviceId) return { valid: false, reason: 'device_changed' };

  await prisma.irpLicense.update({
    where: { licenseKey },
    data: { lastSeenAt: new Date() },
  });

  return { valid: true };
}

/**
 * Logout — unbind the current device.
 */
async function logoutLicense(licenseKey, deviceId) {
  const license = await prisma.irpLicense.findUnique({ where: { licenseKey } });
  if (!license) return { ok: false };

  await prisma.irpLicense.update({
    where: { licenseKey },
    data: {
      activeDeviceId: null,
      events: {
        create: { eventType: 'logout', deviceId },
      },
    },
  });

  return { ok: true };
}

/**
 * Renew a license by email (after new payment with same email).
 */
async function renewLicense(email, days) {
  const existing = await prisma.irpLicense.findFirst({
    where: { email, status: { in: ['active', 'expired'] } },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    const base = existing.expiresAt > new Date() ? existing.expiresAt : new Date();
    const newExpiry = new Date(base);
    newExpiry.setDate(newExpiry.getDate() + days);

    await prisma.irpLicense.update({
      where: { id: existing.id },
      data: {
        status: 'active',
        expiresAt: newExpiry,
        events: { create: { eventType: 'renewed' } },
      },
    });

    logger.info('IRP license renewed', { licenseKey: existing.licenseKey, email, newExpiry });
    return { renewed: true, licenseKey: existing.licenseKey, expiresAt: newExpiry };
  }

  // No existing license — create new one
  const newLicense = await createLicense(email, days, 'new purchase');
  return { renewed: false, licenseKey: newLicense.licenseKey, expiresAt: newLicense.expiresAt };
}

module.exports = {
  generateLicenseKey,
  createLicense,
  activateLicense,
  validateLicense,
  heartbeat,
  logoutLicense,
  renewLicense,
};
