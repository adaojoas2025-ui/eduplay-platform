const express = require('express');
const router = express.Router();
const orderBumpController = require('../controllers/order-bump.controller');
const { authenticate, isAdmin, isProducer } = require('../middlewares/auth.middleware');

// Public routes (for checkout)
router.get('/suggestions', orderBumpController.getSuggestions);
router.post('/:id/track', orderBumpController.trackEvent);

// Producer routes (PRODUCER and ADMIN can manage order bumps)
// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/producer/my-bumps', authenticate, isProducer, orderBumpController.getMyBumps);
router.post('/', authenticate, isProducer, orderBumpController.create);
router.put('/:id', authenticate, isProducer, orderBumpController.update);
router.delete('/:id', authenticate, isProducer, orderBumpController.delete);

// Parameterized routes must be last
router.get('/:id', authenticate, isProducer, orderBumpController.getById);

module.exports = router;
