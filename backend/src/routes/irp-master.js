/**
 * IRP Master checkout and license routes.
 * Mirrors the BaixaTudo product flow with IRP license prefix.
 */

const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');
const config = require('../config/env');
const logger = require('../utils/logger');
const licenseService = require('../services/license.service');

function getPlans() {
  return {
    monthly: {
      id: 'irp-master-monthly',
      title: 'IRP Master Mensal',
      label: 'Mensal',
      price: parseFloat(process.env.IRP_PRICE_MONTHLY || '50.00'),
      days: parseInt(process.env.IRP_DAYS_MONTHLY || '30', 10),
    },
    annual: {
      id: 'irp-master-annual',
      title: 'IRP Master Anual',
      label: 'Anual',
      price: parseFloat(process.env.IRP_PRICE_ANNUAL || '239.90'),
      days: parseInt(process.env.IRP_DAYS_ANNUAL || '365', 10),
    },
  };
}

function isIrpLicenseKey(licenseKey) {
  return /^IRP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(String(licenseKey || '').toUpperCase());
}

async function handleIrpLicense(req, res, action) {
  try {
    const { licenseKey, deviceId, extensionVersion } = req.body || {};
    if (!licenseKey || !deviceId) {
      return res.status(400).json({ valid: false, reason: 'missing_fields', message: 'licenseKey e deviceId sao obrigatorios.' });
    }
    if (!isIrpLicenseKey(licenseKey)) {
      return res.status(403).json({ valid: false, reason: 'wrong_product', message: 'Esta chave nao pertence ao IRP Master.' });
    }

    let result;
    if (action === 'activate') {
      result = await licenseService.activateLicense(licenseKey, deviceId, extensionVersion);
    } else if (action === 'heartbeat') {
      result = await licenseService.heartbeat(licenseKey, deviceId);
    } else if (action === 'logout') {
      result = await licenseService.logoutLicense(licenseKey, deviceId);
    } else {
      result = await licenseService.validateLicense(licenseKey, deviceId, extensionVersion);
    }

    return res.status(result.valid || result.ok ? 200 : 403).json({ product: 'irp-master', ...result });
  } catch (error) {
    logger.error('IRP Master license error', { action, error: error.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: 'Erro ao validar licenca do IRP Master.' });
  }
}

router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: getPlans(),
  });
});

router.post('/licenses/activate', (req, res) => handleIrpLicense(req, res, 'activate'));
router.post('/licenses/validate', (req, res) => handleIrpLicense(req, res, 'validate'));
router.post('/licenses/heartbeat', (req, res) => handleIrpLicense(req, res, 'heartbeat'));
router.post('/licenses/logout', (req, res) => handleIrpLicense(req, res, 'logout'));

router.post('/licenses/sync', async (req, res) => {
  try {
    const { deviceId, extensionVersion } = req.body || {};
    if (!deviceId) {
      return res.status(400).json({ valid: false, reason: 'missing_device', message: 'deviceId e obrigatorio.' });
    }
    const result = await licenseService.claimLicenseByDevice(deviceId, extensionVersion, { prefix: 'IRP' });
    return res.status(result.valid ? 200 : 404).json({ product: 'irp-master', ...result });
  } catch (error) {
    logger.error('IRP Master license sync error', { error: error.message });
    return res.status(500).json({ valid: false, reason: 'server_error', message: 'Erro ao sincronizar licenca do IRP Master.' });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const { plan = 'annual', email, name, deviceId } = req.body || {};
    const selectedPlan = getPlans()[plan];

    if (!selectedPlan) {
      return res.status(400).json({ success: false, message: 'Plano invalido. Use monthly ou annual.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Email valido e obrigatorio.' });
    }

    const buyerName = String(name || 'Cliente IRP Master').trim();
    const nameParts = buyerName.split(/\s+/);
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'IRP Master';
    const cleanDeviceId = String(deviceId || '').trim().replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 120);
    const deviceQuery = cleanDeviceId ? `&deviceId=${encodeURIComponent(cleanDeviceId)}` : '';
    const externalReference = `irp_master_${plan}_${Date.now()}`;

    const preference = await mercadopago.createPreference({
      items: [
        {
          id: selectedPlan.id,
          title: selectedPlan.title,
          description: `Licenca ${selectedPlan.label} do IRP Master`,
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
        success: `${config.frontend.url}/irp-master?status=success${deviceQuery}`,
        failure: `${config.frontend.url}/irp-master?status=failure${deviceQuery}`,
        pending: `${config.frontend.url}/irp-master?status=pending${deviceQuery}`,
      },
      auto_return: 'approved',
      notification_url: `${config.backend.url}/api/v1/webhooks/mercadopago`,
      external_reference: externalReference,
      statement_descriptor: 'IRPMASTER',
      metadata: {
        product_type: 'irp_license',
        license_prefix: 'IRP',
        license_days: selectedPlan.days,
        plan,
        plan_label: selectedPlan.label,
        buyer_email: String(email).trim().toLowerCase(),
        buyer_name: buyerName,
        device_id: cleanDeviceId,
      },
    });

    logger.info('IRP Master checkout preference created', {
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
    logger.error('Error creating IRP Master checkout', { error: error.message });
    return res.status(500).json({ success: false, message: 'Erro ao criar checkout do IRP Master.' });
  }
});

module.exports = router;
