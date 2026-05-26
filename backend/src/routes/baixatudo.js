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

router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: {
      monthly: PLANS.monthly,
      annual: PLANS.annual,
    },
  });
});

router.post('/checkout', async (req, res) => {
  try {
    const { plan = 'annual', email, name } = req.body || {};
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
        success: `${config.frontend.url}/baixatudo?status=success`,
        failure: `${config.frontend.url}/baixatudo?status=failure`,
        pending: `${config.frontend.url}/baixatudo?status=pending`,
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
