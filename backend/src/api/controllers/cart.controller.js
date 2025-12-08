const cartService = require('../../services/cart.service');
const asyncHandler = require('../../utils/asyncHandler');

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.id;
  const cartItem = await cartService.addToCart(userId, productId, quantity);
  res.status(201).json({ success: true, message: 'Product added to cart', data: cartItem });
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.getCart(userId);
  res.status(200).json({ success: true, data: cart });
});

const getCartCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const count = await cartService.getCartCount(userId);
  res.status(200).json({ success: true, data: { count } });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  await cartService.removeFromCart(userId, productId);
  res.status(200).json({ success: true, message: 'Product removed from cart' });
});

const updateQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;
  const cartItem = await cartService.updateQuantity(userId, productId, quantity);
  res.status(200).json({ success: true, message: 'Cart item updated', data: cartItem });
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await cartService.clearCart(userId);
  res.status(200).json({ success: true, message: 'Cart cleared' });
});

module.exports = {
  addToCart,
  getCart,
  getCartCount,
  removeFromCart,
  updateQuantity,
  clearCart,
};
