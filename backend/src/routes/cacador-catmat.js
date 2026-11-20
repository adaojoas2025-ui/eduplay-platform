const express = require('express');
const router = express.Router();
const { getCatmatLicensing, getPlans } = require('../services/catmat-license.service');
const { authenticate, isAdmin } = require('../api/middlewares/auth.middleware');
const licenses = require('../services/license.service');
const mercadopago = require('../config/mercadopago');
const config = require('../config/env');
const logger = require('../utils/logger');

const safe = fn => async (req, res) => {
  try { await fn(req, res); }
  catch (error) { logger.error('Catmat request failed', { path: req.path, error: error.message }); res.status(500).json({ valid: false, success: false, message: 'Não foi possível concluir. Tente novamente.' }); }
};
router.get('/plans', (req, res) => res.json({ success: true, data: getPlans() }));
for (const action of ['activate', 'validate', 'heartbeat', 'logout']) {
  router.post('/licenses/' + action, safe(async (req, res) => {
    const result = await getCatmatLicensing().operate(action, req.body, req.ip);
    res.status(result.valid || result.ok ? 200 : 403).json(result);
  }));
}
router.post('/licenses/sync', safe(async (req, res) => {
  const result = await getCatmatLicensing().sync(req.body, req.ip);
  res.status(result.valid ? 200 : 404).json(result);
}));
router.post('/licenses/trial', safe(async (req, res) => {
  const result = await getCatmatLicensing().startTrial(req.body, req.ip);
  res.status(result.valid ? 200 : 409).json(result);
}));
router.post('/checkout', safe(async (req, res) => {
  const { plan, email, name, deviceId } = req.body || {};
  const selected = ['monthly', 'annual'].includes(plan) ? getPlans()[plan] : null;
  if (!selected || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '')))
    return res.status(400).json({ success: false, message: 'Selecione um plano e informe um e-mail válido.' });
  const cleanId = String(deviceId || '').replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 180);
  const deviceQuery = cleanId ? '&deviceId=' + encodeURIComponent(cleanId) : '';
  const preference = await mercadopago.createPreference({
    items: [{ id: selected.id, title: selected.title, description: 'Licença do Caçador de CATMAT', quantity: 1, currency_id: 'BRL', unit_price: selected.price }],
    payer: { email: String(email).trim().toLowerCase(), name: String(name || 'Cliente Caçador de CATMAT').trim().slice(0, 120) },
    back_urls: Object.fromEntries(['success','failure','pending'].map(status => [status, config.frontend.url + '/cacador-catmat?status=' + status + deviceQuery])),
    auto_return: 'approved', notification_url: (process.env.CATMAT_BACKEND_URL || 'https://eduplay-platform.onrender.com') + '/api/v1/webhooks/mercadopago',
    external_reference: 'catmat_' + plan + '_' + Date.now(), statement_descriptor: 'CACADORCATMAT',
    metadata: { product_type: 'catmat_license', license_prefix: 'CMT', license_days: selected.days,
      license_price: selected.price, plan, plan_label: selected.label, buyer_email: String(email).trim().toLowerCase(), device_id: cleanId }
  });
  res.json({ success: true, data: { paymentUrl: preference.init_point, preferenceId: preference.id, plan: selected } });
}));
router.get('/admin/licenses', authenticate, isAdmin, safe(async (req, res) => res.json(await getCatmatLicensing().adminList(req.query))));
router.get('/admin/attempts', authenticate, isAdmin, safe(async (req, res) => res.json(await licenses.listLicenseAttempts({ ...req.query, prefix: 'CMT' }))));
router.post('/admin/licenses/:id/:action', authenticate, isAdmin, safe(async (req, res) => res.json(await getCatmatLicensing().adminAction(req.params.id, req.params.action, req.body?.days))));
module.exports = router;
