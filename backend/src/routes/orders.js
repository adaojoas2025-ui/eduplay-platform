const express = require('express');
const router = express.Router();
const {
  createOrder,
  webhook,
  getMyPurchases,
  getMySales,
  getOrderById,
} = require('../controllers/orderController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Webhook (public, no auth)
router.post('/webhook', webhook);

// Protected routes
router.post('/create', authenticateToken, createOrder);
router.get('/my-purchases', authenticateToken, getMyPurchases);
router.get('/my-sales', authenticateToken, authorizeRole('PRODUCER'), getMySales);
router.get('/:id', authenticateToken, getOrderById);

module.exports = router;
