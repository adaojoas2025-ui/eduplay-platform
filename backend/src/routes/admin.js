const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  approveProducer,
  rejectProducer,
  suspendUser,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllOrders,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All admin routes require ADMIN role
router.use(authenticateToken);
router.use(authorizeRole('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboard);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveProducer);
router.put('/users/:id/reject', rejectProducer);
router.put('/users/:id/suspend', suspendUser);

// Products
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);

// Orders
router.get('/orders', getAllOrders);

module.exports = router;
