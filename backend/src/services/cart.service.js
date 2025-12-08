/**
 * Cart Service
 * Business logic for shopping cart operations
 * @module services/cart
 */

const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Add product to cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity (default: 1)
 * @returns {Promise<Object>} Cart item
 */
const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Validate product exists and is published
    const product = await productRepository.findProductById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (product.status !== 'PUBLISHED') {
      throw ApiError.badRequest('Product is not available for purchase');
    }

    // Add to cart
    const cartItem = await cartRepository.addItem(
      userId,
      productId,
      quantity,
      product.price
    );

    logger.info('Product added to cart', { userId, productId, quantity });

    return cartItem;
  } catch (error) {
    logger.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Get user's cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Cart with items and total
 */
const getCart = async (userId) => {
  try {
    const items = await cartRepository.getUserCart(userId);

    // Calculate total
    const total = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const count = items.length;

    return {
      items,
      total,
      count,
    };
  } catch (error) {
    logger.error('Error getting cart:', error);
    throw error;
  }
};

/**
 * Remove product from cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
const removeFromCart = async (userId, productId) => {
  try {
    await cartRepository.removeItem(userId, productId);
    logger.info('Product removed from cart', { userId, productId });
  } catch (error) {
    if (error.code === 'P2025') {
      throw ApiError.notFound('Cart item not found');
    }
    logger.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart item
 */
const updateQuantity = async (userId, productId, quantity) => {
  try {
    if (quantity < 1) {
      throw ApiError.badRequest('Quantity must be at least 1');
    }

    const cartItem = await cartRepository.updateQuantity(userId, productId, quantity);

    logger.info('Cart item quantity updated', { userId, productId, quantity });

    return cartItem;
  } catch (error) {
    if (error.code === 'P2025') {
      throw ApiError.notFound('Cart item not found');
    }
    logger.error('Error updating cart quantity:', error);
    throw error;
  }
};

/**
 * Clear user's cart
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const clearCart = async (userId) => {
  try {
    await cartRepository.clearCart(userId);
    logger.info('Cart cleared', { userId });
  } catch (error) {
    logger.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart item count
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of items
 */
const getCartCount = async (userId) => {
  try {
    return await cartRepository.getCartCount(userId);
  } catch (error) {
    logger.error('Error getting cart count:', error);
    throw error;
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartCount,
};
