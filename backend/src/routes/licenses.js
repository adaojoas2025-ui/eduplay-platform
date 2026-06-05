/**
 * IRP Master Automação — License Routes
 * Public routes — no JWT required (licenseKey + deviceId are the auth).
 */

const express = require('express');
const router = express.Router();
const { activate, validate, heartbeat, logout } = require('../controllers/licenseController');
const licenseService = require('../services/license.service');
const jwt = require('jsonwebtoken');

// Public license endpoints
router.post('/activate',  activate);
router.post('/validate',  validate);
router.post('/heartbeat', heartbeat);
router.post('/logout',    logout);

// POST /sync — ativa licença automaticamente pelo deviceId (após pagamento aprovado)
router.post('/sync', async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ valid: false, message: 'deviceId obrigatório.' });
  try {
    const result = await licenseService.syncLicenseByDeviceId(deviceId);
    return res.status(result.valid ? 200 : 404).json(result);
  } catch (e) {
    return res.status(500).json({ valid: false, message: e.message });
  }
});

// ── Admin middleware — aceita x-admin-secret OU Bearer JWT com role ADMIN ──
function adminOnly(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (secret === (process.env.ADMIN_SECRET || 'irpmaster2026admin')) return next();

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (decoded.role === 'ADMIN') return next();
    } catch (_) {}
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// POST /admin/create — cria ou renova licença por e-mail
router.post('/admin/create', adminOnly, async (req, res) => {
  const { email, days = 30, notes = '' } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const result = await licenseService.renewLicense(email, Number(days));
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /admin/list — lista licenças (paginado, filtro status/email)
router.get('/admin/list', adminOnly, async (req, res) => {
  const { page = 1, limit = 50, status, email } = req.query;
  try {
    const result = await licenseService.listLicenses({
      page: Number(page), limit: Number(limit), status, email,
    });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /admin/:id/events — histórico de eventos da licença
router.get('/admin/:id/events', adminOnly, async (req, res) => {
  try {
    const events = await licenseService.getLicenseEvents(req.params.id);
    return res.status(200).json({ events });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /admin/:id/block — bloqueia licença
router.patch('/admin/:id/block', adminOnly, async (req, res) => {
  try {
    const result = await licenseService.blockLicense(req.params.id);
    if (!result) return res.status(404).json({ error: 'License not found' });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /admin/:id/unblock — desbloqueia licença
router.patch('/admin/:id/unblock', adminOnly, async (req, res) => {
  try {
    const result = await licenseService.unblockLicense(req.params.id);
    if (!result) return res.status(404).json({ error: 'License not found' });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /admin/:id/renew — renova validade por N dias a partir de hoje (ou da expiração)
router.patch('/admin/:id/renew', adminOnly, async (req, res) => {
  const { days = 30 } = req.body;
  try {
    const result = await licenseService.renewLicenseById(req.params.id, Number(days));
    if (!result) return res.status(404).json({ error: 'License not found' });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /admin/:id/free-device — desvincula o dispositivo ativo
router.patch('/admin/:id/free-device', adminOnly, async (req, res) => {
  try {
    const result = await licenseService.freeDevice(req.params.id);
    if (!result) return res.status(404).json({ error: 'License not found' });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
