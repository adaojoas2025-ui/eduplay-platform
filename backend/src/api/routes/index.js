/**
 * Routes Index
 * Aggregates all routes with API versioning
 * @module routes/index
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const sellerRoutes = require('./seller.routes');
const gamificationRoutes = require('./gamification.routes');
const appRoutes = require('./app.routes');
const tempUpgradeRoutes = require('./temp-upgrade.routes'); // TEMPORARY - Remove after use
const testRoutes = require('./test.routes');

/**
 * Health check route
 * @route GET /api/v1/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/seller', sellerRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/apps', appRoutes);
router.use('/temp-upgrade', tempUpgradeRoutes); // TEMPORARY - Remove after use
router.use('/test', testRoutes);

/**
 * 404 handler for API routes
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

module.exports = router;
