/**
 * Order Controller
 * Handles HTTP requests for order operations
 * @module controllers/order
 */

const orderService = require('../../services/order.service');
const paymentService = require('../../services/payment.service');
const emailService = require('../../services/email.service');
const authService = require('../../services/auth.service');
const gamificationService = require('../services/gamification.service');
const orderBumpService = require('../services/order-bump.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Create order
 * @route POST /api/v1/orders
 * @access Private (Buyer)
 */
const createOrder = asyncHandler(async (req, res) => {
  const paymentType = req.body.paymentType || 'pix';
  const installments = req.body.installments || 1;
  const { bumpProductIds = [], bumpIds = [], bumpTotal: bumpTotalFromClient = 0 } = req.body;

  logger.info('createOrder called', { paymentType, installments, bumpProductIds, bumpTotalFromClient });

  // Create bump orders first (so we have their IDs for main order metadata)
  const bumpOrders = [];
  for (const bumpProductId of bumpProductIds) {
    try {
      const bumpOrder = await orderService.createOrder(req.user.id, {
        productId: bumpProductId,
        paymentMethod: req.body.paymentMethod,
        paymentType,
        installments,
        bypassDuplicateCheck: true,
      });
      bumpOrders.push(bumpOrder);
    } catch (err) {
      logger.warn('Failed to create bump order', { bumpProductId, error: err.message, bumpTotalFromClient, userId: req.user?.id });
    }
  }

  const bumpOrderIds = bumpOrders.map(o => o.id);
  const order = await orderService.createOrder(req.user.id, {
    ...req.body,
    paymentType,
    installments,
    extraMetadata: bumpOrderIds.length > 0 ? { bumpOrderIds } : {},
  });

  // Use frontend-sent bumpTotal (which respects discounts) as primary; fall back to backend order amounts if frontend sent 0
  const backendBumpTotal = bumpOrders.reduce((sum, o) => sum + Number(o.amount), 0);
  const bumpTotal = bumpTotalFromClient > 0 ? bumpTotalFromClient : backendBumpTotal;
  const totalAmount = Math.round((Number(order.amount) + bumpTotal) * 100) / 100;

  logger.info('Creating payment', { orderId: order.id, orderAmount: order.amount, bumpTotal, bumpTotalFromClient, backendBumpTotal, totalAmount, bumpOrdersCount: bumpOrders.length, paymentType });

  if (paymentType === 'card') {
    const paymentPreference = await paymentService.createPaymentPreference(order, bumpTotal > 0 ? totalAmount : null);
    return ApiResponse.success(res, 201, {
      order,
      orderId: order.id,
      paymentType: 'card',
      paymentUrl: paymentPreference?.initPoint,
      mobilePaymentUrl: paymentPreference?.mobileInitPoint,
    }, 'Order created successfully');
  }

  // PIX: transparent checkout — QR code on site
  const pixData = await paymentService.createPixPayment(order, bumpTotal > 0 ? totalAmount : null);
  return ApiResponse.success(res, 201, {
    order,
    orderId: order.id,
    paymentType: 'pix',
    pixQrCode: pixData.pixQrCode,
    pixQrCodeBase64: pixData.pixQrCodeBase64,
    pixExpiresAt: pixData.pixExpiresAt,
    totalAmount: bumpTotal > 0 ? totalAmount : null,
  }, 'Order created successfully');
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

/**
 * Guest checkout — create order without prior authentication
 * @route POST /api/v1/orders/guest
 * @access Public
 */
const createGuestOrder = asyncHandler(async (req, res) => {
  const { productId, name, email, paymentMethod = 'PIX', paymentType = 'pix', installments = 1, bumpProductIds = [], bumpIds = [], bumpTotal: bumpTotalFromClient = 0 } = req.body;

  logger.info('createGuestOrder called', { productId, paymentType, bumpProductIds, bumpTotalFromClient });

  // 1. Find or create user account
  const { user, isNewUser, tempPassword, accessToken, refreshToken } =
    await authService.registerOrGet(name, email);

  // 2. Create bump orders first (so we have their IDs for main order metadata)
  const bumpOrders = [];
  for (const bumpProductId of bumpProductIds) {
    try {
      const bumpOrder = await orderService.createOrder(user.id, {
        productId: bumpProductId,
        paymentMethod,
        paymentType,
        installments,
        bypassDuplicateCheck: true,
      });
      bumpOrders.push(bumpOrder);
    } catch (err) {
      logger.warn('Failed to create bump order', { bumpProductId, error: err.message, bumpTotalFromClient, userId: user?.id });
    }
  }

  // 3. Create main order with bump order IDs in metadata
  const bumpOrderIds = bumpOrders.map(o => o.id);
  const order = await orderService.createOrder(user.id, {
    productId,
    paymentMethod,
    paymentType,
    installments,
    bypassDuplicateCheck: true,
    extraMetadata: bumpOrderIds.length > 0 ? { bumpOrderIds } : {},
  });

  // 4. Track bump conversions
  for (const bumpId of bumpIds) {
    orderBumpService.trackEvent(bumpId, 'conversion').catch(() => {});
  }

  // 5. Create payment for total amount (main + bumps)
  // Use frontend-sent bumpTotal (which respects discounts) as primary; fall back to backend order amounts if frontend sent 0
  const backendBumpTotal = bumpOrders.reduce((sum, o) => sum + Number(o.amount), 0);
  const bumpTotal = bumpTotalFromClient > 0 ? bumpTotalFromClient : backendBumpTotal;
  const totalAmount = Math.round((Number(order.amount) + bumpTotal) * 100) / 100;

  logger.info('Creating payment', { orderId: order.id, orderAmount: order.amount, bumpTotal, bumpTotalFromClient, backendBumpTotal, totalAmount, bumpOrdersCount: bumpOrders.length, paymentType });

  let paymentResult = {};
  if (paymentType === 'card') {
    const paymentPreference = await paymentService.createPaymentPreference(order, bumpTotal > 0 ? totalAmount : null);
    paymentResult = { paymentType: 'card', paymentUrl: paymentPreference?.initPoint, mobilePaymentUrl: paymentPreference?.mobileInitPoint };
  } else {
    const pixData = await paymentService.createPixPayment(order, bumpTotal > 0 ? totalAmount : null);
    paymentResult = {
      paymentType: 'pix',
      pixQrCode: pixData.pixQrCode,
      pixQrCodeBase64: pixData.pixQrCodeBase64,
      pixExpiresAt: pixData.pixExpiresAt,
      totalAmount: bumpTotal > 0 ? totalAmount : null,
    };
  }

  // 4. Send emails based on whether user is new or existing
  if (isNewUser) {
    gamificationService.initializeUser(user.id).catch((err) =>
      logger.error('Failed to initialize gamification for guest user', { error: err.message })
    );
    if (tempPassword) {
      emailService.sendGuestPurchaseCredentials(user, tempPassword).catch((err) =>
        logger.error('Failed to send guest credentials email', { error: err.message })
      );
    }
  } else {
    emailService.sendLoginReminderEmail(user).catch((err) =>
      logger.error('Failed to send login reminder email', { error: err.message })
    );
  }

  return ApiResponse.success(res, 201, {
    order,
    orderId: order.id,
    ...paymentResult,
    accessToken,
    refreshToken,
    isNewUser,
    user,
    tempPassword: isNewUser ? tempPassword : null,
  }, 'Order created successfully');
});

/**
 * Resend product access email to buyer
 * @route POST /api/v1/orders/:id/resend-email
 * @access Private (Admin)
 */
const resendProductEmail = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id);

  if (!order.productId) {
    return ApiResponse.error(res, 400, 'Este pedido não é uma compra de produto');
  }

  if (order.status !== 'COMPLETED') {
    return ApiResponse.error(res, 400, `Pedido não está concluído (status: ${order.status})`);
  }

  await emailService.sendProductAccessEmail(order.buyer, order.product, order);
  logger.info('Product access email resent by admin', { orderId: order.id, buyerEmail: order.buyer.email, adminId: req.user.id });

  return ApiResponse.success(res, 200, { orderId: order.id, sentTo: order.buyer.email }, 'Email reenviado com sucesso');
});

/**
 * Process card payment using Bricks token (mobile flow — no redirect)
 * @route POST /api/v1/orders/:id/process-card-payment
 * @access Public (guest users have token in localStorage after order creation)
 */
const processCardPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { formData } = req.body;

  if (!formData || !formData.token) {
    return ApiResponse.error(res, 400, 'Card token is required');
  }

  const result = await paymentService.processDirectCardPayment(id, formData);

  return ApiResponse.success(res, 200, {
    orderId: id,
    paymentId: result.paymentId,
    status: result.status,
    statusDetail: result.statusDetail,
    approved: result.status === 'approved',
    pending: result.status === 'in_process' || result.status === 'pending',
  }, 'Payment processed');
});

module.exports = {
  createOrder,
  createGuestOrder,
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
  resendProductEmail,
  processCardPayment,
};
