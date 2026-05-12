/**
 * IRP Master Automação — License Routes
 * Public routes — no JWT required (licenseKey + deviceId are the auth).
 */

const express = require('express');
const router = express.Router();
const { activate, validate, heartbeat, logout } = require('../controllers/licenseController');
const licenseService = require('../services/license.service');

// Public license endpoints
router.post('/activate',  activate);
router.post('/validate',  validate);
router.post('/heartbeat', heartbeat);
router.post('/logout',    logout);

// Admin endpoint — protected by secret token
router.post('/admin/create', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== (process.env.ADMIN_SECRET || 'irpmaster2026admin')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { email, days = 30, notes = '' } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const result = await licenseService.renewLicense(email, Number(days));
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
