/**
 * Payment Routes
 * Routes for payment endpoints
 * @module routes/payment
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validator.middleware');
const orderValidator = require('../validators/order.validator');
const { USER_ROLES } = require('../../utils/constants');

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Process payment webhook from Mercado Pago
 * @access  Public (Mercado Pago servers)
 */
router.post(
  '/webhook',
  validate(orderValidator.paymentCallbackSchema),
  paymentController.processWebhook
);

/**
 * @route   GET /api/v1/payments/methods
 * @desc    Get payment methods
 * @access  Public
 */
router.get('/methods', paymentController.getPaymentMethods);

/**
 * @route   POST /api/v1/payments/create-preference
 * @desc    Cria preference Mercado Pago para compra direta de licença IRP Master
 * @access  Public
 */
router.post('/create-preference', async (req, res) => {
  try {
    const { title, price, metadata = {} } = req.body;
    if (!title || !price) return res.status(400).json({ error: 'title e price são obrigatórios' });

    const { createPreference } = require('../../config/mercadopago');
    const frontendUrl = process.env.FRONTEND_URL || 'https://educaplayja.com.br';

    const preference = await createPreference({
      items: [{ title, quantity: 1, unit_price: Number(price), currency_id: 'BRL' }],
      metadata,
      back_urls: {
        success: `${frontendUrl}/order-success`,
        failure: `${frontendUrl}/order-failure`,
        pending: `${frontendUrl}/order-pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'https://eduplay-platform.onrender.com'}/api/v1/webhooks/mercadopago`,
    });

    return res.json({ init_point: preference.init_point, id: preference.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * @route   POST /api/v1/payments/:orderId/refund
 * @desc    Create refund
 * @access  Private (Admin)
 */
router.post(
  '/:orderId/refund',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  paymentController.createRefund
);

/**
 * @route   GET /api/v1/payments/:orderId/status
 * @desc    Verify payment status
 * @access  Private
 */
router.get('/:orderId/status', authenticate, paymentController.verifyPaymentStatus);

module.exports = router;
