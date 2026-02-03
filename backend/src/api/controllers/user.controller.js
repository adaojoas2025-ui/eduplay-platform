/**
 * User Controller
 * Handles HTTP requests for user operations
 * @module controllers/user
 */

const userService = require('../../services/user.service');
const storageService = require('../../services/storage.service');
const mercadopagoService = require('../../services/mercadopago.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');
const config = require('../../config/env');

/**
 * Get user by ID
 * @route GET /api/v1/users/:id
 * @access Public
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  return ApiResponse.success(res, 200, user, 'User retrieved successfully');
});

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  return ApiResponse.success(res, 200, user, 'Profile updated successfully');
});

/**
 * Upload user avatar
 * @route POST /api/v1/users/avatar
 * @access Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const uploadResult = await storageService.uploadAvatar(req.file, req.user.id);
  const user = await userService.updateAvatar(req.user.id, uploadResult.url);

  return ApiResponse.success(res, 200, { user, upload: uploadResult }, 'Avatar updated successfully');
});

/**
 * Update PIX key
 * @route PATCH /api/v1/users/pix-key
 * @access Private (Producer only)
 */
const updatePixKey = asyncHandler(async (req, res) => {
  const { pixKey } = req.body;
  const user = await userService.updatePixKey(req.user.id, pixKey);

  return ApiResponse.success(res, 200, user, 'PIX key updated successfully');
});

/**
 * List users (admin only)
 * @route GET /api/v1/users
 * @access Private (Admin)
 */
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status, sortBy, order } = req.query;

  const filters = { search, role, status };
  const pagination = { page: parseInt(page), limit: parseInt(limit) };
  const sorting = { sortBy, order };

  const result = await userService.listUsers(filters, pagination, sorting);

  return ApiResponse.paginated(
    res,
    result.users,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    'Users retrieved successfully'
  );
});

/**
 * Update user (admin only)
 * @route PATCH /api/v1/users/:id
 * @access Private (Admin)
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  return ApiResponse.success(res, 200, user, 'User updated successfully');
});

/**
 * Delete user (admin only)
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  return ApiResponse.success(res, 200, null, 'User deleted successfully');
});

/**
 * Suspend user (admin only)
 * @route POST /api/v1/users/:id/suspend
 * @access Private (Admin)
 */
const suspendUser = asyncHandler(async (req, res) => {
  const { reason, until } = req.body;
  const user = await userService.suspendUser(req.params.id, reason, until);

  return ApiResponse.success(res, 200, user, 'User suspended successfully');
});

/**
 * Ban user (admin only)
 * @route POST /api/v1/users/:id/ban
 * @access Private (Admin)
 */
const banUser = asyncHandler(async (req, res) => {
  const { reason, permanent } = req.body;
  const user = await userService.banUser(req.params.id, reason, permanent);

  return ApiResponse.success(res, 200, user, 'User banned successfully');
});

/**
 * Unban user (admin only)
 * @route POST /api/v1/users/:id/unban
 * @access Private (Admin)
 */
const unbanUser = asyncHandler(async (req, res) => {
  const user = await userService.unbanUser(req.params.id);

  return ApiResponse.success(res, 200, user, 'User unbanned successfully');
});

/**
 * Get producer statistics
 * @route GET /api/v1/users/:id/stats
 * @access Private (Producer or Admin)
 */
const getProducerStats = asyncHandler(async (req, res) => {
  const stats = await userService.getProducerStats(req.params.id);

  return ApiResponse.success(res, 200, stats, 'Producer statistics retrieved successfully');
});

/**
 * Get user statistics (admin only)
 * @route GET /api/v1/users/stats
 * @access Private (Admin)
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();

  return ApiResponse.success(res, 200, stats, 'User statistics retrieved successfully');
});

/**
 * Upgrade user to producer/seller
 * @route POST /api/v1/users/upgrade-to-producer
 * @access Private (authenticated users only)
 */
const upgradeToProducer = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const upgradeData = req.body;

  const user = await userService.upgradeToProducer(userId, upgradeData);

  logger.info('User upgraded to producer', { userId, role: user.role });

  return ApiResponse.success(res, 200, user, 'Upgrade to producer successful');
});

/**
 * Update producer settings (business and banking info)
 * @route PATCH /api/v1/users/producer-settings
 * @access Private (Producer only)
 */
const updateProducerSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const settingsData = req.body;

  const user = await userService.updateProducerSettings(userId, settingsData);

  logger.info('Producer settings updated', { userId });

  return ApiResponse.success(res, 200, user, 'Producer settings updated successfully');
});

/**
 * Get Mercado Pago authorization URL
 * @route GET /api/v1/users/mercadopago/auth-url
 * @access Private (Producer only)
 */
const getMercadoPagoAuthUrl = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const authUrl = mercadopagoService.getAuthorizationUrl(userId);

  logger.info('MP auth URL generated', { userId });

  return ApiResponse.success(res, 200, { authUrl }, 'Authorization URL generated');
});

/**
 * Handle Mercado Pago OAuth callback
 * @route GET /api/v1/users/mercadopago/callback
 * @access Public (redirected from MP)
 */
const handleMercadoPagoCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    // Redirect to frontend with error
    return res.redirect(`${config.urls.frontend}/seller/settings?mp_error=missing_params`);
  }

  try {
    // state contains the userId
    await mercadopagoService.linkAccount(state, code);

    logger.info('MP account linked via callback', { userId: state });

    // Redirect to frontend with success
    return res.redirect(`${config.urls.frontend}/seller/settings?mp_linked=true`);
  } catch (error) {
    logger.error('MP callback error:', error);
    return res.redirect(`${config.urls.frontend}/seller/settings?mp_error=link_failed`);
  }
});

/**
 * Get Mercado Pago account status
 * @route GET /api/v1/users/mercadopago/status
 * @access Private (Producer only)
 */
const getMercadoPagoStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const status = await mercadopagoService.getAccountStatus(userId);

  return ApiResponse.success(res, 200, status, 'MP account status retrieved');
});

/**
 * Unlink Mercado Pago account
 * @route POST /api/v1/users/mercadopago/unlink
 * @access Private (Producer only)
 */
const unlinkMercadoPago = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await mercadopagoService.unlinkAccount(userId);

  logger.info('MP account unlinked', { userId });

  return ApiResponse.success(res, 200, null, 'Mercado Pago account unlinked');
});

module.exports = {
  getUserById,
  updateProfile,
  uploadAvatar,
  updatePixKey,
  listUsers,
  updateUser,
  deleteUser,
  suspendUser,
  banUser,
  unbanUser,
  getProducerStats,
  getUserStats,
  upgradeToProducer,
  updateProducerSettings,
  getMercadoPagoAuthUrl,
  handleMercadoPagoCallback,
  getMercadoPagoStatus,
  unlinkMercadoPago,
};
