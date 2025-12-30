const express = require('express');
const router = express.Router();
const comboController = require('../controllers/combo.controller');
const { authenticate, isAdmin, isProducer } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', comboController.getAll);
router.post('/check-cart', comboController.checkCartForCombos);

// Producer routes (PRODUCER and ADMIN can create combos)
// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/producer/my-combos', authenticate, isProducer, comboController.getMyCombosByProducer);
router.post('/', authenticate, isProducer, comboController.create);
router.put('/:id', authenticate, isProducer, comboController.update);
router.delete('/:id', authenticate, isProducer, comboController.delete);

// Parameterized routes must be last
router.get('/:id', comboController.getById);

module.exports = router;
