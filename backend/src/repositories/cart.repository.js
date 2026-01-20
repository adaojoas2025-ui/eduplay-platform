/**
 * Cart Repository
 * Data access layer for shopping cart operations
 * @module repositories/cart
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Add item to cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity
 * @param {number} price - Price at time of adding
 * @returns {Promise<Object>} Cart item
 */
const addItem = async (userId, productId, quantity, price) => {
  return await prisma.cart_items.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {
      quantity,
      price,
    },
    create: {
      id: require('crypto').randomUUID(),
      userId,
      productId,
      quantity,
      price,
    },
    include: {
      products: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          thumbnailUrl: true,
          category: true,
        },
      },
    },
  });
};

/**
 * Get user cart items
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Cart items
 */
const getUserCart = async (userId) => {
  return await prisma.cart_items.findMany({
    where: { userId },
    include: {
      products: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          thumbnailUrl: true,
          category: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Remove item from cart
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Deleted cart item
 */
const removeItem = async (userId, productId) => {
  return await prisma.cart_items.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
};

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart item
 */
const updateQuantity = async (userId, productId, quantity) => {
  return await prisma.cart_items.update({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    data: { quantity },
    include: {
      products: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          thumbnailUrl: true,
          category: true,
        },
      },
    },
  });
};

/**
 * Clear user cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Delete count
 */
const clearCart = async (userId) => {
  return await prisma.cart_items.deleteMany({
    where: { userId },
  });
};

/**
 * Get cart item count
 * @param {string} userId - User ID
 * @returns {Promise<number>} Item count
 */
const getCartCount = async (userId) => {
  return await prisma.cart_items.count({
    where: { userId },
  });
};

module.exports = {
  addItem,
  getUserCart,
  removeItem,
  updateQuantity,
  clearCart,
  getCartCount,
};
