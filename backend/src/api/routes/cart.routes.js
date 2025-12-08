const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/count', protect, cartController.getCartCount);
router.get('/', protect, cartController.getCart);
router.post('/', protect, cartController.addToCart);
router.put('/:productId', protect, cartController.updateQuantity);
router.delete('/', protect, cartController.clearCart);
router.delete('/:productId', protect, cartController.removeFromCart);

module.exports = router;
