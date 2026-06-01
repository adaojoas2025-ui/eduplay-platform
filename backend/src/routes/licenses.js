/**
 * IRP Master Automação — License Routes
 * Public routes — no JWT required (licenseKey + deviceId are the auth).
 */

const express = require('express');
const router = express.Router();
const { activate, validate, heartbeat, logout } = require('../controllers/licenseController');
const licenseService = require('../services/license.service');
const { authenticate, isAdmin } = require('../api/middlewares/auth.middleware');

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
  const { email, days = 30, notes = '', prefix = 'IRP', product = '' } = req.body;
  if (product === 'baixatudo' || String(prefix).toUpperCase() === 'BT') {
    return res.status(403).json({ error: 'BaixaTudo licenses are generated automatically after Mercado Pago approval.' });
  }
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const licensePrefix = prefix;
    const result = await licenseService.renewLicense(email, Number(days), {
      prefix: licensePrefix,
      notes: notes || `manual admin create - ${product || licensePrefix}`,
    });
    return res.status(200).json({ ok: true, prefix: licensePrefix, ...result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Authenticated admin endpoint - use the logged-in EducaplayJA admin token.
router.post('/admin/create-auth', authenticate, isAdmin, async (req, res) => {
  const { email, days = 30, notes = '', prefix = 'IRP', product = '' } = req.body;
  if (product === 'baixatudo' || String(prefix).toUpperCase() === 'BT') {
    return res.status(403).json({ error: 'BaixaTudo licenses are generated automatically after Mercado Pago approval.' });
  }
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    const licensePrefix = prefix;
    const result = await licenseService.renewLicense(email, Number(days), {
      prefix: licensePrefix,
      notes: notes || `manual admin create by ${req.user.email} - ${product || licensePrefix}`,
    });

    return res.status(200).json({
      ok: true,
      prefix: licensePrefix,
      createdBy: req.user.email,
      ...result,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
