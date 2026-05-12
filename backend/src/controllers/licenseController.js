/**
 * IRP Master Automação — License Controller
 */

const licenseService = require('../services/license.service');
const logger = require('../utils/logger');

/**
 * POST /api/v1/licenses/activate
 * First activation — binds deviceId to the license.
 */
const activate = async (req, res) => {
  try {
    const { licenseKey, deviceId, extensionVersion } = req.body;
    if (!licenseKey || !deviceId) {
      return res.status(400).json({ valid: false, reason: 'missing_fields', message: 'licenseKey e deviceId são obrigatórios.' });
    }
    const result = await licenseService.activateLicense(licenseKey, deviceId, extensionVersion);
    return res.status(result.valid ? 200 : 403).json(result);
  } catch (err) {
    logger.error('License activate error', { error: err.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: 'Erro interno. Tente novamente.' });
  }
};

/**
 * POST /api/v1/licenses/validate
 * Called before every automation — validates key + device.
 */
const validate = async (req, res) => {
  try {
    const { licenseKey, deviceId, extensionVersion } = req.body;
    if (!licenseKey || !deviceId) {
      return res.status(400).json({ valid: false, reason: 'missing_fields', message: 'licenseKey e deviceId são obrigatórios.' });
    }
    const result = await licenseService.validateLicense(licenseKey, deviceId, extensionVersion);
    return res.status(result.valid ? 200 : 403).json(result);
  } catch (err) {
    logger.error('License validate error', { error: err.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: 'Erro interno. Tente novamente.' });
  }
};

/**
 * POST /api/v1/licenses/heartbeat
 * Called every hour during active use.
 */
const heartbeat = async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;
    if (!licenseKey || !deviceId) {
      return res.status(400).json({ valid: false });
    }
    const result = await licenseService.heartbeat(licenseKey, deviceId);
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
