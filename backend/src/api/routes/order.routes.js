/**
 * Order Routes
 * Routes for order endpoints
 * @module routes/order
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validator.middleware');
const orderValidator = require('../validators/order.validator');
const { USER_ROLES } = require('../../utils/constants');

/**
 * @route   POST /api/v1/orders
 * @desc    Create order
 * @access  Private (Buyer)
 */
router.post(
  '/',
  authenticate,
  validate(orderValidator.createOrderSchema),
  orderController.createOrder
);

/**
 * @route   GET /api/v1/orders
 * @desc    List orders
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validate(orderValidator.listOrdersSchema),
  orderController.listOrders
);

/**
 * @route   GET /api/v1/orders/purchases
 * @desc    Get user purchases
 * @access  Private (Buyer)
 */
router.get('/purchases', authenticate, orderController.getUserPurchases);

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
 * @access  Private (Producer or Admin)
 */
router.get(
  '/stats',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(orderValidator.getOrderStatsSchema),
  orderController.getOrderStats
);

/**
 * @route   GET /api/v1/orders/recent
 * @desc    Get recent orders
 * @access  Private (Admin)
 */
router.get('/recent', authenticate, authorize(USER_ROLES.ADMIN), orderController.getRecentOrders);

/**
 * @route   GET /api/v1/orders/status-count
 * @desc    Get orders by status count
 * @access  Private (Admin)
 */
router.get(
  '/status-count',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  orderController.getOrdersByStatusCount
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private (Buyer, Producer, Admin)
 */
router.get(
  '/:id',
  authenticate,
  validate(orderValidator.getOrderSchema),
  orderController.getOrderById
);

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (Buyer or Admin)
 */
router.post(
  '/:id/cancel',
  authenticate,
  validate(orderValidator.cancelOrderSchema),
  orderController.cancelOrder
);

/**
 * @route   POST /api/v1/orders/:id/refund
 * @desc    Refund order
 * @access  Private (Admin)
 */
router.post(
  '/:id/refund',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(orderValidator.refundOrderSchema),
  orderController.refundOrder
);

/**
 * @route   GET /api/v1/orders/:id/payment/status
 * @desc    Verify payment status
 * @access  Private (Buyer, Producer, Admin)
 */
router.get(
  '/:id/payment/status',
  authenticate,
  validate(orderValidator.verifyPaymentSchema),
  orderController.verifyPaymentStatus
);

/**
 * @route   GET /api/v1/orders/:id/payment
 * @desc    Get order payment details
 * @access  Private (Buyer, Producer, Admin)
 */
router.get(
  '/:id/payment',
  authenticate,
  validate(orderValidator.getOrderSchema),
  orderController.getOrderPaymentDetails
);

module.exports = router;
