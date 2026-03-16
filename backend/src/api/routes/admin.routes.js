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
/**
 * @route   DELETE /api/v1/admin/cleanup/all-orders
 * @desc    Remove ALL orders, commissions and pix_transfers
 * @access  Private (Admin)
 */
router.delete('/cleanup/everything', async (req, res, next) => {
  const { prisma } = require('../../config/database');
  try {
    await prisma.pix_transfers.deleteMany({});
    await prisma.commissions.deleteMany({});
    await prisma.orders.deleteMany({});
    const result = await prisma.users.deleteMany({ where: { role: { not: 'ADMIN' } } });
    return res.json({ success: true, message: `Limpeza completa: ${result.count} usuários e todos os pedidos removidos` });
  } catch (error) {
    next(error);
  }
});

router.delete('/cleanup/all-orders', async (req, res, next) => {
  const { prisma } = require('../../config/database');
  try {
    await prisma.pix_transfers.deleteMany({});
    await prisma.commissions.deleteMany({});
    const result = await prisma.orders.deleteMany({});
    return res.json({ success: true, message: `${result.count} pedidos removidos` });
  } catch (error) {
    next(error);
  }
});

router.get('/cleanup/non-admin-users', async (req, res, next) => {
  const { prisma } = require('../../config/database');
  try {
    const nonAdmins = await prisma.users.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, email: true, name: true, role: true },
    });
    return res.json({ success: true, data: nonAdmins });
  } catch (error) {
    console.error('[GET /cleanup/non-admin-users] Error:', error.message, error.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', async (req, res, next) => {
  const { prisma } = require('../../config/database');
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({ where: { id }, select: { id: true, email: true, role: true } });
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'Não é possível remover admin' });

    const userProducts = await prisma.products.findMany({ where: { producerId: id }, select: { id: true } });
    const productIds = userProducts.map(p => p.id);

    await prisma.pix_transfers.deleteMany({ where: { producerId: id } });
    await prisma.commissions.deleteMany({ where: { OR: [{ producerId: id }, { buyerId: id }] } });
    await prisma.orders.deleteMany({ where: { buyerId: id } });
    if (productIds.length > 0) {
      await prisma.orders.deleteMany({ where: { productId: { in: productIds } } });
      await prisma.products.deleteMany({ where: { producerId: id } });
    }
    await prisma.users.delete({ where: { id } });

    return res.json({ success: true, message: `Usuário ${user.email} removido` });
  } catch (error) {
    next(error);
  }
});

router.delete('/cleanup/non-admin-users', async (req, res, next) => {
  const { prisma } = require('../../config/database');
  try {
    // If specific userIds provided, only delete those; otherwise delete all non-admins
    const requestedIds = req.body?.userIds;

    let nonAdmins;
    if (requestedIds && requestedIds.length > 0) {
      nonAdmins = await prisma.users.findMany({
        where: { id: { in: requestedIds }, role: { not: 'ADMIN' } },
        select: { id: true, email: true, name: true, role: true },
      });
    } else {
      nonAdmins = await prisma.users.findMany({
        where: { role: { not: 'ADMIN' } },
        select: { id: true, email: true, name: true, role: true },
      });
    }

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
