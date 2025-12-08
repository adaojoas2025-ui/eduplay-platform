/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 * @module controllers/admin
 */

const userService = require('../../services/user.service');
const productService = require('../../services/product.service');
const orderService = require('../../services/order.service');
const commissionService = require('../../services/commission.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get dashboard statistics
 * @route GET /api/v1/admin/dashboard
 * @access Private (Admin)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [userStats, orderStats, recentOrders, orderStatusCounts] = await Promise.all([
    userService.getUserStats(),
    orderService.getOrderStats(req.user.id),
    orderService.getRecentOrders(req.user.id, 10),
    orderService.getOrdersByStatusCount(req.user.id),
  ]);

  const stats = {
    users: userStats,
    orders: orderStats,
    recentOrders,
    orderStatusCounts,
  };

  return ApiResponse.success(res, 200, stats, 'Dashboard statistics retrieved successfully');
});

/**
 * Get commission statistics
 * @route GET /api/v1/admin/commissions/stats
 * @access Private (Admin)
 */
const getCommissionStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filters = { startDate, endDate };

  const stats = await commissionService.getCommissionStats(req.user.id, filters);

  return ApiResponse.success(res, 200, stats, 'Commission statistics retrieved successfully');
});

/**
 * List all commissions
 * @route GET /api/v1/admin/commissions
 * @access Private (Admin)
 */
const listCommissions = asyncHandler(async (req, res) => {
  const { page, limit, producerId, status, startDate, endDate, sortBy, order } = req.query;

  const filters = { producerId, status, startDate, endDate };
  const pagination = { page: parseInt(page), limit: parseInt(limit) };
  const sorting = { sortBy, order };

  const result = await commissionService.listCommissions(req.user.id, filters, pagination, sorting);

  return ApiResponse.paginated(
    res,
    result.commissions,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    'Commissions retrieved successfully'
  );
});

/**
 * Mark commission as paid
 * @route POST /api/v1/admin/commissions/:id/pay
 * @access Private (Admin)
 */
const markCommissionAsPaid = asyncHandler(async (req, res) => {
  const { transferId } = req.body;
  const paymentDetails = {
    transferId,
    paidAt: new Date(),
  };

  const commission = await commissionService.markCommissionAsPaid(
    req.params.id,
    req.user.id,
    paymentDetails
  );

  return ApiResponse.success(res, 200, commission, 'Commission marked as paid successfully');
});

/**
 * Mark commission as processing
 * @route POST /api/v1/admin/commissions/:id/process
 * @access Private (Admin)
 */
const markCommissionAsProcessing = asyncHandler(async (req, res) => {
  const commission = await commissionService.markCommissionAsProcessing(
    req.params.id,
    req.user.id
  );

  return ApiResponse.success(res, 200, commission, 'Commission marked as processing successfully');
});

/**
 * Mark commission as failed
 * @route POST /api/v1/admin/commissions/:id/fail
 * @access Private (Admin)
 */
const markCommissionAsFailed = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const commission = await commissionService.markCommissionAsFailed(
    req.params.id,
    req.user.id,
    reason
  );

  return ApiResponse.success(res, 200, commission, 'Commission marked as failed successfully');
});

/**
 * Batch update commission status
 * @route POST /api/v1/admin/commissions/batch-update
 * @access Private (Admin)
 */
const batchUpdateCommissionStatus = asyncHandler(async (req, res) => {
  const { commissionIds, status } = req.body;
  const result = await commissionService.batchUpdateStatus(commissionIds, status, req.user.id);

  return ApiResponse.success(
    res,
    200,
    result,
    `${result.count} commissions updated successfully`
  );
});

/**
 * Update order status
 * @route PATCH /api/v1/admin/orders/:id/status
 * @access Private (Admin)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status, { notes });

  return ApiResponse.success(res, 200, order, 'Order status updated successfully');
});

/**
 * Get platform statistics
 * @route GET /api/v1/admin/stats
 * @access Private (Admin)
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const [userStats, orderStats, commissionStats] = await Promise.all([
    userService.getUserStats(),
    orderService.getOrderStats(req.user.id, { startDate, endDate }),
    commissionService.getCommissionStats(req.user.id, { startDate, endDate }),
  ]);

  const stats = {
    users: userStats,
    orders: orderStats,
    commissions: commissionStats,
    period: { startDate, endDate },
  };

  return ApiResponse.success(res, 200, stats, 'Platform statistics retrieved successfully');
});

module.exports = {
  getDashboardStats,
  getCommissionStats,
  listCommissions,
  markCommissionAsPaid,
  markCommissionAsProcessing,
  markCommissionAsFailed,
  batchUpdateCommissionStatus,
  updateOrderStatus,
  getPlatformStats,
};
