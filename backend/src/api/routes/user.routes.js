/**
 * User Routes
 * Routes for user endpoints
 * @module routes/user
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { single } = require('../middlewares/upload.middleware');
const userValidator = require('../validators/user.validator');
const { USER_ROLES } = require('../../utils/constants');

// ============================================
// SPECIFIC ROUTES FIRST (before :id routes)
// ============================================

/**
 * @route   GET /api/v1/users
 * @desc    List users
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.listUsersSchema),
  userController.listUsers
);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, authorize(USER_ROLES.ADMIN), userController.getUserStats);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch(
  '/profile',
  authenticate,
  validate(userValidator.updateProfileSchema),
  userController.updateProfile
);

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post(
  '/avatar',
  authenticate,
  single('avatar'),
  validate(userValidator.uploadAvatarSchema),
  userController.uploadAvatar
);

/**
 * @route   POST /api/v1/users/upgrade-to-producer
 * @desc    Upgrade user to producer/seller
 * @access  Private (authenticated users)
 */
router.post(
  '/upgrade-to-producer',
  authenticate,
  validate(userValidator.upgradeToProducerSchema),
  userController.upgradeToProducer
);

/**
 * @route   PATCH /api/v1/users/pix-key
 * @desc    Update PIX key
 * @access  Private (Producer only)
 */
router.patch(
  '/pix-key',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(userValidator.updatePixKeySchema),
  userController.updatePixKey
);

/**
 * @route   PATCH /api/v1/users/producer-settings
 * @desc    Update producer settings (business and banking info)
 * @access  Private (Producer only)
 */
router.patch(
  '/producer-settings',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.updateProducerSettings
);

// ============================================
// Mercado Pago OAuth routes
// ============================================

/**
 * @route   GET /api/v1/users/mercadopago/auth-url
 * @desc    Get Mercado Pago authorization URL
 * @access  Private (Producer only)
 */
router.get(
  '/mercadopago/auth-url',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.getMercadoPagoAuthUrl
);

/**
 * @route   GET /api/v1/users/mercadopago/callback
 * @desc    Handle Mercado Pago OAuth callback
 * @access  Public (redirected from MP)
 */
router.get(
  '/mercadopago/callback',
  userController.handleMercadoPagoCallback
);

/**
 * @route   GET /api/v1/users/mercadopago/status
 * @desc    Get Mercado Pago account status
 * @access  Private (Producer only)
 */
router.get(
  '/mercadopago/status',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.getMercadoPagoStatus
);

/**
 * @route   POST /api/v1/users/mercadopago/unlink
 * @desc    Unlink Mercado Pago account
 * @access  Private (Producer only)
 */
router.post(
  '/mercadopago/unlink',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.unlinkMercadoPago
);

// ============================================
// PIX Routes
// ============================================

/**
 * @route   GET /api/v1/users/pix/config
 * @desc    Get PIX configuration
 * @access  Private (Producer only)
 */
router.get(
  '/pix/config',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.getPixConfig
);

/**
 * @route   POST /api/v1/users/pix/config
 * @desc    Save PIX key configuration
 * @access  Private (Producer only)
 */
router.post(
  '/pix/config',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.savePixConfig
);

/**
 * @route   DELETE /api/v1/users/pix/config
 * @desc    Remove PIX configuration
 * @access  Private (Producer only)
 */
router.delete(
  '/pix/config',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.removePixConfig
);

/**
 * @route   POST /api/v1/users/pix/enable
 * @desc    Enable automatic PIX payments
 * @access  Private (Producer only)
 */
router.post(
  '/pix/enable',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.enablePixAutoPayment
);

/**
 * @route   POST /api/v1/users/pix/disable
 * @desc    Disable automatic PIX payments
 * @access  Private (Producer only)
 */
router.post(
  '/pix/disable',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.disablePixAutoPayment
);

/**
 * @route   GET /api/v1/users/pix/transfers
 * @desc    Get PIX transfer history
 * @access  Private (Producer only)
 */
router.get(
  '/pix/transfers',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.getPixTransferHistory
);

/**
 * @route   GET /api/v1/users/pix/stats
 * @desc    Get PIX transfer statistics
 * @access  Private (Producer only)
 */
router.get(
  '/pix/stats',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.getPixTransferStats
);

/**
 * @route   GET /api/v1/users/pix/balance
 * @desc    Get available balance for withdrawal
 * @access  Private (Producer only)
 */
router.get(
  '/pix/balance',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.getAvailableBalance
);

/**
 * @route   POST /api/v1/users/pix/withdraw
 * @desc    Request withdrawal
 * @access  Private (Producer only)
 */
router.post(
  '/pix/withdraw',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.requestWithdrawal
);

/**
 * @route   DELETE /api/v1/users/pix/restore-balance
 * @desc    Restore balance by deleting PIX transfers (for testing)
 * @access  Private (Producer only)
 */
router.delete(
  '/pix/restore-balance',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  userController.restoreBalance
);

// ============================================
// PARAMETERIZED ROUTES LAST (with :id)
// These must come AFTER specific routes
// ============================================

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', validate(userValidator.getUserSchema), userController.getUserById);

/**
 * @route   GET /api/v1/users/:id/stats
 * @desc    Get producer statistics
 * @access  Private (Producer or Admin)
 */
router.get(
  '/:id/stats',
  authenticate,
  validate(userValidator.getUserSchema),
  userController.getProducerStats
);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.patch(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.updateUserSchema),
  userController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.deleteUserSchema),
  userController.deleteUser
);

/**
 * @route   POST /api/v1/users/:id/suspend
 * @desc    Suspend user
 * @access  Private (Admin)
 */
router.post(
  '/:id/suspend',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.suspendUserSchema),
  userController.suspendUser
);

/**
 * @route   POST /api/v1/users/:id/ban
 * @desc    Ban user
 * @access  Private (Admin)
 */
router.post(
  '/:id/ban',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.banUserSchema),
  userController.banUser
);

/**
 * @route   POST /api/v1/users/:id/unban
 * @desc    Unban user
 * @access  Private (Admin)
 */
router.post(
  '/:id/unban',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.getUserSchema),
  userController.unbanUser
);

module.exports = router;
