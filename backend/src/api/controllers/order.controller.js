/**
 * Order Controller
 * Handles HTTP requests for order operations
 * @module controllers/order
 */

const orderService = require('../../services/order.service');
const paymentService = require('../../services/payment.service');
const emailService = require('../../services/email.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Create order
 * @route POST /api/v1/orders
 * @access Private (Buyer)
 */
const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);

  // Create payment preference
  const paymentPreference = await paymentService.createPaymentPreference(order);

  return ApiResponse.success(
    res,
    201,
    {
      order,
      payment: paymentPreference,
      paymentUrl: paymentPreference?.initPoint,
    },
    'Order created successfully'
  );
});

/**
 * Get order by ID
 * @route GET /api/v1/orders/:id
 * @access Private (Buyer, Producer, Admin)
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id);

  return ApiResponse.success(res, 200, order, 'Order retrieved successfully');
});

/**
 * List orders
 * @route GET /api/v1/orders
 * @access Private
 */
const listOrders = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    status,
    productId,
    buyerId,
    producerId,
    paymentMethod,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    sortBy,
    order,
  } = req.query;

  const filters = {
    status,
    productId,
    buyerId,
    producerId,
    paymentMethod,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    startDate,
    endDate,
  };

  const pagination = { page: parseInt(page), limit: parseInt(limit) };
  const sorting = { sortBy, order };

  const result = await orderService.listOrders(req.user.id, filters, pagination, sorting);

  return ApiResponse.paginated(
    res,
    result.orders,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    'Orders retrieved successfully'
  );
});

/**
 * Cancel order
 * @route POST /api/v1/orders/:id/cancel
 * @access Private (Buyer or Admin)
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.cancelOrder(req.params.id, req.user.id, reason);

  return ApiResponse.success(res, 200, order, 'Order cancelled successfully');
});

/**
 * Refund order
 * @route POST /api/v1/orders/:id/refund
 * @access Private (Admin)
 */
const refundOrder = asyncHandler(async (req, res) => {
  const { reason, amount } = req.body;
  const order = await orderService.refundOrder(req.params.id, req.user.id, reason, amount);

  return ApiResponse.success(res, 200, order, 'Order refunded successfully');
});

/**
 * Get order statistics
 * @route GET /api/v1/orders/stats
 * @access Private (Producer or Admin)
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, producerId } = req.query;

  const filters = { startDate, endDate, producerId };

  const stats = await orderService.getOrderStats(req.user.id, filters);

  return ApiResponse.success(res, 200, stats, 'Order statistics retrieved successfully');
});

/**
 * Get user purchases
 * @route GET /api/v1/orders/purchases
 * @access Private (Buyer)
 */
const getUserPurchases = asyncHandler(async (req, res) => {
  const purchases = await orderService.getUserPurchases(req.user.id);

  return ApiResponse.success(res, 200, purchases, 'Purchases retrieved successfully');
});

/**
 * Verify payment status
 * @route GET /api/v1/orders/:id/payment/status
 * @access Private (Buyer, Producer, Admin)
 */
const verifyPaymentStatus = asyncHandler(async (req, res) => {
  // First verify user has access to this order
  await orderService.getOrderById(req.params.id, req.user.id);

  const paymentStatus = await paymentService.verifyPaymentStatus(req.params.id);

  return ApiResponse.success(res, 200, paymentStatus, 'Payment status retrieved successfully');
});

/**
 * Get order payment details
 * @route GET /api/v1/orders/:id/payment
 * @access Private (Buyer, Producer, Admin)
 */
const getOrderPaymentDetails = asyncHandler(async (req, res) => {
  const paymentDetails = await paymentService.getOrderPaymentDetails(req.params.id, req.user.id);

  return ApiResponse.success(res, 200, paymentDetails, 'Payment details retrieved successfully');
});

/**
 * Get recent orders (admin only)
 * @route GET /api/v1/orders/recent
 * @access Private (Admin)
 */
const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const orders = await orderService.getRecentOrders(req.user.id, limit);

  return ApiResponse.success(res, 200, orders, 'Recent orders retrieved successfully');
});

/**
 * Get orders by status count (admin only)
 * @route GET /api/v1/orders/status-count
 * @access Private (Admin)
 */
const getOrdersByStatusCount = asyncHandler(async (req, res) => {
  const counts = await orderService.getOrdersByStatusCount(req.user.id);

  return ApiResponse.success(res, 200, counts, 'Order status counts retrieved successfully');
});

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  cancelOrder,
  refundOrder,
  getOrderStats,
  getUserPurchases,
  verifyPaymentStatus,
  getOrderPaymentDetails,
  getRecentOrders,
  getOrdersByStatusCount,
};
