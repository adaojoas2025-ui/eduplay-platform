/**
 * BaixaTudo Pro checkout routes.
 * Creates Mercado Pago preferences with metadata used by the webhook to
 * generate/renew BT licenses automatically after payment approval.
 */

const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');
const config = require('../config/env');
const logger = require('../utils/logger');
const licenseService = require('../services/license.service');

const PLANS = {
  monthly: {
    id: 'baixatudo-pro-monthly',
    title: 'BaixaTudo Pro Mensal',
    label: 'Mensal',
    price: 9.99,
    days: 30,
  },
  annual: {
    id: 'baixatudo-pro-annual',
    title: 'BaixaTudo Pro Anual',
    label: 'Anual',
    price: 39.90,
    days: 365,
  },
};

function isBaixaTudoLicenseKey(licenseKey) {
  return /^BT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(String(licenseKey || '').toUpperCase());
}

async function handleBaixaTudoLicense(req, res, action) {
  try {
    const { licenseKey, deviceId, extensionVersion } = req.body || {};
    if (!licenseKey || !deviceId) {
      return res.status(400).json({ valid: false, reason: 'missing_fields', message: 'licenseKey e deviceId sao obrigatorios.' });
    }
    if (!isBaixaTudoLicenseKey(licenseKey)) {
      return res.status(403).json({ valid: false, reason: 'wrong_product', message: 'Esta chave nao pertence ao BaixaTudo.' });
    }

    const result = action === 'activate'
      ? await licenseService.activateLicense(licenseKey, deviceId, extensionVersion)
      : await licenseService.validateLicense(licenseKey, deviceId, extensionVersion);

    return res.status(result.valid ? 200 : 403).json({ product: 'baixatudo', ...result });
  } catch (error) {
    logger.error('BaixaTudo license validation error', { error: error.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: 'Erro ao validar licenca do BaixaTudo.' });
  }
}

router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: {
      monthly: PLANS.monthly,
      annual: PLANS.annual,
    },
  });
});

router.post('/licenses/activate', (req, res) => handleBaixaTudoLicense(req, res, 'activate'));
router.post('/licenses/sync', async (req, res) => {
  try {
    const { deviceId, extensionVersion } = req.body || {};
    if (!deviceId) {
      return res.status(400).json({ valid: false, reason: 'missing_device', message: 'deviceId e obrigatorio.' });
    }
    const result = await licenseService.claimLicenseByDevice(deviceId, extensionVersion, { prefix: 'BT' });
    return res.status(result.valid ? 200 : 404).json({ product: 'baixatudo', ...result });
  } catch (error) {
    logger.error('BaixaTudo license sync error', { error: error.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: 'Erro ao sincronizar licenca do BaixaTudo.' });
  }
});
router.post('/licenses/validate', (req, res) => handleBaixaTudoLicense(req, res, 'validate'));
router.post('/license/activate', (req, res) => handleBaixaTudoLicense(req, res, 'activate'));
router.post('/license/validate', (req, res) => handleBaixaTudoLicense(req, res, 'validate'));

router.post('/checkout', async (req, res) => {
  try {
    const { plan = 'annual', email, name, deviceId } = req.body || {};
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: 'Plano invalido. Use monthly ou annual.',
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({
        success: false,
        message: 'Email valido e obrigatorio.',
      });
    }

    const buyerName = String(name || 'Cliente BaixaTudo').trim();
    const nameParts = buyerName.split(/\s+/);
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'BaixaTudo';
    const cleanDeviceId = String(deviceId || '').trim().replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 120);
    const deviceQuery = cleanDeviceId ? `&deviceId=${encodeURIComponent(cleanDeviceId)}` : '';
    const externalReference = `baixatudo_${plan}_${Date.now()}`;

    const preference = await mercadopago.createPreference({
      items: [
        {
          id: selectedPlan.id,
          title: selectedPlan.title,
          description: `Licenca ${selectedPlan.label} do BaixaTudo Pro`,
          category_id: 'services',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: selectedPlan.price,
        },
      ],
      payer: {
        email,
        name: buyerName,
        first_name: firstName,
        last_name: lastName,
      },
      back_urls: {
        success: `${config.frontend.url}/baixatudo?status=success${deviceQuery}`,
        failure: `${config.frontend.url}/baixatudo?status=failure${deviceQuery}`,
        pending: `${config.frontend.url}/baixatudo?status=pending${deviceQuery}`,
      },
      auto_return: 'approved',
      notification_url: `${config.backend.url}/api/v1/webhooks/mercadopago`,
      external_reference: externalReference,
      statement_descriptor: 'BAIXATUDO',
      metadata: {
        product_type: 'baixatudo_license',
        license_prefix: 'BT',
        license_days: selectedPlan.days,
        plan,
        plan_label: selectedPlan.label,
        buyer_email: String(email).trim().toLowerCase(),
        buyer_name: buyerName,
        device_id: cleanDeviceId,
      },
    });

    logger.info('BaixaTudo checkout preference created', {
      preferenceId: preference.id,
      plan,
      email,
    });

    return res.status(200).json({
      success: true,
      data: {
        preferenceId: preference.id,
        paymentUrl: preference.init_point,
        sandboxPaymentUrl: preference.sandbox_init_point,
        plan: selectedPlan,
      },
    });
  } catch (error) {
    logger.error('Error creating BaixaTudo checkout', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar checkout do BaixaTudo.',
    });
  }
});

module.exports = router;
