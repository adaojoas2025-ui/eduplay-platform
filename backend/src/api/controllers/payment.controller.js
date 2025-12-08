/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 * @module controllers/payment
 */

const paymentService = require('../../services/payment.service');
const orderService = require('../../services/order.service');
const emailService = require('../../services/email.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Process payment webhook from Mercado Pago
 * @route POST /api/v1/payments/webhook
 * @access Public (Mercado Pago servers)
 */
const processWebhook = asyncHandler(async (req, res) => {
  logger.info('Payment webhook received', { body: req.body });

  // Process webhook asynchronously
  paymentService
    .processPaymentWebhook(req.body)
    .then(async () => {
      logger.info('Payment webhook processed successfully');
    })
    .catch((error) => {
      logger.error('Error processing payment webhook:', error);
    });

  // Return 200 immediately to Mercado Pago
  return res.status(200).send('OK');
});

/**
 * Get payment methods
 * @route GET /api/v1/payments/methods
 * @access Public
 */
const getPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await paymentService.getPaymentMethods();

  return ApiResponse.success(res, 200, methods, 'Payment methods retrieved successfully');
});

/**
 * Create refund
 * @route POST /api/v1/payments/:orderId/refund
 * @access Private (Admin)
 */
const createRefund = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const refund = await paymentService.createRefund(req.params.orderId, amount);

  return ApiResponse.success(res, 200, refund, 'Refund created successfully');
});

/**
 * Verify payment status
 * @route GET /api/v1/payments/:orderId/status
 * @access Private
 */
const verifyPaymentStatus = asyncHandler(async (req, res) => {
  // Verify user has access to this order
  await orderService.getOrderById(req.params.orderId, req.user.id);

  const status = await paymentService.verifyPaymentStatus(req.params.orderId);

  return ApiResponse.success(res, 200, status, 'Payment status verified successfully');
});

module.exports = {
  processWebhook,
  getPaymentMethods,
  createRefund,
  verifyPaymentStatus,
};
