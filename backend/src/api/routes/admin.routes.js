/**
 * Admin Routes
 * Routes for admin endpoints
 * @module routes/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../utils/constants');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN));

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', adminController.getDashboardStats);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin)
 */
router.get('/stats', adminController.getPlatformStats);

/**
 * @route   GET /api/v1/admin/commissions
 * @desc    List all commissions
 * @access  Private (Admin)
 */
router.get('/commissions', adminController.listCommissions);

/**
 * @route   GET /api/v1/admin/commissions/stats
 * @desc    Get commission statistics
 * @access  Private (Admin)
 */
router.get('/commissions/stats', adminController.getCommissionStats);

/**
 * @route   POST /api/v1/admin/commissions/:id/pay
 * @desc    Mark commission as paid
 * @access  Private (Admin)
 */
router.post('/commissions/:id/pay', adminController.markCommissionAsPaid);

/**
 * @route   POST /api/v1/admin/commissions/:id/process
 * @desc    Mark commission as processing
 * @access  Private (Admin)
 */
router.post('/commissions/:id/process', adminController.markCommissionAsProcessing);

/**
 * @route   POST /api/v1/admin/commissions/:id/fail
 * @desc    Mark commission as failed
 * @access  Private (Admin)
 */
router.post('/commissions/:id/fail', adminController.markCommissionAsFailed);

/**
 * @route   POST /api/v1/admin/commissions/batch-update
 * @desc    Batch update commission status
 * @access  Private (Admin)
 */
router.post('/commissions/batch-update', adminController.batchUpdateCommissionStatus);

/**
 * @route   PATCH /api/v1/admin/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin)
 */
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
