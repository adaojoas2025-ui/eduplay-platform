/**
 * IRP Master Automacao - License Controller
 */

const licenseService = require('../services/license.service');
const logger = require('../utils/logger');

async function recordAttemptSafe(payload) {
  await licenseService.recordLicenseAttempt(payload);
}

/**
 * POST /api/v1/licenses/activate
 * First activation - binds deviceId to the license.
 */
const activate = async (req, res) => {
  const { licenseKey, deviceId, extensionVersion } = req.body;
  try {
    if (!licenseKey || !deviceId) {
      const result = { valid: false, reason: 'missing_fields', message: 'licenseKey e deviceId sao obrigatorios.' };
      await recordAttemptSafe({ action: 'activate', licenseKey, deviceId, extensionVersion, ip: req.ip, ...result });
      return res.status(400).json(result);
    }
    const result = await licenseService.activateLicense(licenseKey, deviceId, extensionVersion);
    await recordAttemptSafe({ action: 'activate', licenseKey, deviceId, extensionVersion, ip: req.ip, ...result });
    return res.status(result.valid ? 200 : 403).json(result);
  } catch (err) {
    logger.error('License activate error', { error: err.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: err.message });
  }
};

/**
 * POST /api/v1/licenses/validate
 * Called before every automation - validates key + device.
 */
const validate = async (req, res) => {
  const { licenseKey, deviceId, extensionVersion } = req.body;
  try {
    if (!licenseKey || !deviceId) {
      const result = { valid: false, reason: 'missing_fields', message: 'licenseKey e deviceId sao obrigatorios.' };
      await recordAttemptSafe({ action: 'validate', licenseKey, deviceId, extensionVersion, ip: req.ip, ...result });
      return res.status(400).json(result);
    }
    const result = await licenseService.validateLicense(licenseKey, deviceId, extensionVersion);
    await recordAttemptSafe({ action: 'validate', licenseKey, deviceId, extensionVersion, ip: req.ip, ...result });
    return res.status(result.valid ? 200 : 403).json(result);
  } catch (err) {
    logger.error('License validate error', { error: err.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: err.message });
  }
};

/**
 * POST /api/v1/licenses/heartbeat
 * Called every hour during active use.
 */
const heartbeat = async (req, res) => {
  const { licenseKey, deviceId } = req.body;
  try {
    if (!licenseKey || !deviceId) {
      const result = { valid: false, reason: 'missing_fields' };
      await recordAttemptSafe({ action: 'heartbeat', licenseKey, deviceId, ip: req.ip, ...result });
      return res.status(400).json(result);
    }
    const result = await licenseService.heartbeat(licenseKey, deviceId);
    await recordAttemptSafe({ action: 'heartbeat', licenseKey, deviceId, ip: req.ip, ...result });
    return res.status(200).json(result);
  } catch (err) {
    logger.error('License heartbeat error', { error: err.message });
    return res.status(500).json({ valid: false });
  }
};

/**
 * POST /api/v1/licenses/logout
 * Unbinds the current device.
 */
const logout = async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;
    if (!licenseKey || !deviceId) {
      return res.status(400).json({ ok: false });
    }
    const result = await licenseService.logoutLicense(licenseKey, deviceId);
    return res.status(200).json(result);
  } catch (err) {
    logger.error('License logout error', { error: err.message });
    return res.status(500).json({ ok: false });
  }
};

module.exports = { activate, validate, heartbeat, logout };
