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

/**
 * @route   PATCH /api/v1/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * @route   GET /api/v1/admin/products
 * @desc    List all products (all statuses, all users)
 * @access  Private (Admin)
 */
router.get('/products', adminController.listAllProducts);

/**
 * @route   GET /api/v1/admin/products/pending
 * @desc    List products pending approval
 * @access  Private (Admin)
 */
router.get('/products/pending', adminController.listProductsPendingApproval);

/**
 * @route   POST /api/v1/admin/products/:id/approve
 * @desc    Approve product
 * @access  Private (Admin)
 */
router.post('/products/:id/approve', adminController.approveProduct);

/**
 * @route   POST /api/v1/admin/products/:id/reject
 * @desc    Reject product
 * @access  Private (Admin)
 */
router.post('/products/:id/reject', adminController.rejectProduct);

/**
 * @route   DELETE /api/v1/admin/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete('/products/:id', adminController.deleteProduct);

/**
 * @route   DELETE /api/v1/admin/cleanup/non-admin-users
 * @desc    Remove all non-admin users and their data
 * @access  Private (Admin)
 */
router.delete('/cleanup/non-admin-users', async (req, res, next) => {
  const { prisma } = require('../../config/database');
  try {
    // Find non-admin users
    const nonAdmins = await prisma.users.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, email: true, name: true, role: true },
    });

    if (nonAdmins.length === 0) {
      return res.json({ success: true, message: 'Nenhum usuário para remover', removed: 0 });
    }

    const nonAdminIds = nonAdmins.map(u => u.id);

    const nonAdminProducts = await prisma.products.findMany({
      where: { producerId: { in: nonAdminIds } },
      select: { id: true },
    });
    const nonAdminProductIds = nonAdminProducts.map(p => p.id);

    await prisma.pix_transfers.deleteMany({ where: { producerId: { in: nonAdminIds } } });
    await prisma.commissions.deleteMany({ where: { producerId: { in: nonAdminIds } } });
    await prisma.orders.deleteMany({ where: { buyerId: { in: nonAdminIds } } });
    if (nonAdminProductIds.length > 0) {
      await prisma.orders.deleteMany({ where: { productId: { in: nonAdminProductIds } } });
    }
    // Delete ALL remaining orders (admin's own test purchases)
    await prisma.pix_transfers.deleteMany({});
    await prisma.commissions.deleteMany({});
    await prisma.orders.deleteMany({});
    await prisma.users.deleteMany({ where: { id: { in: nonAdminIds } } });

    return res.json({
      success: true,
      message: `${nonAdmins.length} usuários e todos os pedidos removidos`,
      removed: nonAdmins.length,
      users: nonAdmins.map(u => ({ email: u.email, role: u.role })),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
