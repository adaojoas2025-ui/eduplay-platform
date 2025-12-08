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
