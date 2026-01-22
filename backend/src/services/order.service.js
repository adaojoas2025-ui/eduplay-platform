/**
 * Order Service
 * Business logic for order operations
 * @module services/order
 */

const crypto = require('crypto');
const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const commissionRepository = require('../repositories/commission.repository');
const gamificationService = require('../api/services/gamification.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config/env');
const { USER_ROLES, ORDER_STATUS, COMMISSION_STATUS } = require('../utils/constants');

/**
 * Calculate order amounts
 * @param {number} productPrice - Product price
 * @returns {Object} Calculated amounts
 */
const calculateOrderAmounts = (productPrice) => {
  const amount = productPrice;
  const platformFeePercent = config.platform.feePercent;
  const platformFee = (amount * platformFeePercent) / 100;
  const producerAmount = amount - platformFee;

  return {
    amount,
    platformFee,
    producerAmount,
  };
};

/**
 * Create a new order
 * @param {string} buyerId - Buyer ID
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order with payment info
 */
const createOrder = async (buyerId, orderData) => {
  try {
    const { productId, paymentMethod } = orderData;

    // Verify buyer exists
    const buyer = await userRepository.findUserById(buyerId);
    if (!buyer) {
      throw ApiError.notFound('Buyer not found');
    }

    // Verify product exists and is published
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (product.status !== 'PUBLISHED') {
      throw ApiError.badRequest('Product is not available for purchase');
    }

    // Check if user already purchased this product
    const hasPurchased = await orderRepository.hasUserPurchasedProduct(buyerId, productId);
    if (hasPurchased) {
      throw ApiError.badRequest('You have already purchased this product');
    }

    // Calculate amounts
    const amounts = calculateOrderAmounts(product.price);

    // Create order
    const order = await orderRepository.createOrder({
      id: crypto.randomUUID(),
      buyerId,
      productId,
      amount: amounts.amount,
      platformFee: amounts.platformFee,
      producerAmount: amounts.producerAmount,
      paymentMethod,
      status: ORDER_STATUS.PENDING,
    });

    logger.info('Order created', { orderId: order.id, buyerId, productId });

    return order;
  } catch (error) {
    logger.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (must be buyer, producer, or admin)
 * @returns {Promise<Object>} Order
 */
const getOrderById = async (orderId, userId) => {
  try {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Check permissions
    const user = await userRepository.findUserById(userId);
    const isOwner = order.buyerId === userId;
    const isProducer = order.product ? order.product.producerId === userId : false;
    const isAdmin = user.role === USER_ROLES.ADMIN;

    if (!isOwner && !isProducer && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this order');
    }

    return order;
  } catch (error) {
    logger.error('Error getting order by ID:', error);
    throw error;
  }
};

/**
 * List orders with filters
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} Orders list with pagination
 */
const listOrders = async (userId, filters, pagination, sorting) => {
  try {
    const user = await userRepository.findUserById(userId);

    // Filter by user role
    if (user.role === USER_ROLES.BUYER) {
      filters.buyerId = userId;
    } else if (user.role === USER_ROLES.PRODUCER) {
      filters.producerId = userId;
    }
    // Admins can see all orders

    const result = await orderRepository.listOrders(filters, pagination, sorting);

    logger.info('Orders listed', { userId, count: result.orders.length, total: result.pagination.total });

    return result;
  } catch (error) {
    logger.error('Error listing orders:', error);
    throw error;
  }
};

/**
 * Update order status (internal use)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<Object>} Updated order
 */
const updateOrderStatus = async (orderId, status, additionalData = {}) => {
  try {
    const order = await orderRepository.updateOrderStatus(orderId, status, additionalData);

    // Handle order completion
    if (status === ORDER_STATUS.COMPLETED) {
      // Check if this is an app purchase (no commissions for apps)
      const isAppPurchase = order.metadata && order.metadata.type === 'APP_PURCHASE';

      if (isAppPurchase) {
        // App purchases: no commissions, 100% revenue to platform/admin
        logger.info('App purchase completed - no commission created', {
          orderId: order.id,
          appId: order.metadata.appId,
          amount: order.amount,
        });

        // Award gamification points only for buyer
        gamificationService.handlePurchase(order.buyerId, order.id, order.amount).catch((err) => {
          logger.error('Failed to handle purchase gamification:', err);
        });
      } else {
        // Product purchases: create commissions and increment sales
        await productRepository.incrementSales(order.productId);

        // Create commission for producer
        await commissionRepository.createCommission({
          id: crypto.randomUUID(),
          orderId: order.id,
          producerId: order.product.producerId,
          amount: order.producerAmount,
          status: COMMISSION_STATUS.PENDING,
        });

        // Award gamification points (don't await - fire and forget)
        gamificationService.handlePurchase(order.buyerId, order.id, order.amount).catch((err) => {
          logger.error('Failed to handle purchase gamification:', err);
        });

        gamificationService.handleSale(order.product.producerId, order.id, order.producerAmount).catch((err) => {
          logger.error('Failed to handle sale gamification:', err);
        });
      }
    }

    logger.info('Order status updated', { orderId, status });

    return order;
  } catch (error) {
    logger.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (must be buyer or admin)
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
const cancelOrder = async (orderId, userId, reason) => {
  try {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Check permissions
    const user = await userRepository.findUserById(userId);
    const isOwner = order.buyerId === userId;
    const isAdmin = user.role === USER_ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to cancel this order');
    }

    // Only pending or processing orders can be cancelled
    if (![ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING].includes(order.status)) {
      throw ApiError.badRequest('Order cannot be cancelled in current status');
    }

    const updatedOrder = await orderRepository.cancelOrder(orderId, reason);

    logger.info('Order cancelled', { orderId, userId, reason });

    return updatedOrder;
  } catch (error) {
    logger.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Refund order
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (must be admin)
 * @param {string} reason - Refund reason
 * @param {number} amount - Refund amount (optional, defaults to full amount)
 * @returns {Promise<Object>} Updated order
 */
const refundOrder = async (orderId, userId, reason, amount = null) => {
  try {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Only admins can refund
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can refund orders');
    }

    // Only completed orders can be refunded
    if (order.status !== ORDER_STATUS.COMPLETED) {
      throw ApiError.badRequest('Only completed orders can be refunded');
    }

    const refundAmount = amount || order.amount;

    const updatedOrder = await orderRepository.refundOrder(orderId, reason, refundAmount);

    logger.info('Order refunded', { orderId, userId, reason, amount: refundAmount });

    return updatedOrder;
  } catch (error) {
    logger.error('Error refunding order:', error);
    throw error;
  }
};

/**
 * Get order statistics
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Order statistics
 */
const getOrderStats = async (userId, filters = {}) => {
  try {
    const user = await userRepository.findUserById(userId);

    // Filter by user role
    if (user.role === USER_ROLES.PRODUCER) {
      filters.producerId = userId;
    } else if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only producers and admins can view order statistics');
    }

    const stats = await orderRepository.getOrderStats(filters);

    logger.info('Order stats retrieved', { userId });

    return stats;
  } catch (error) {
    logger.error('Error getting order stats:', error);
    throw error;
  }
};

/**
 * Get user purchases
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of purchased products
 */
const getUserPurchases = async (userId) => {
  try {
    const purchases = await orderRepository.getUserPurchases(userId);

    logger.info('User purchases retrieved', { userId, count: purchases.length });

    return purchases;
  } catch (error) {
    logger.error('Error getting user purchases:', error);
    throw error;
  }
};

/**
 * Check if user has access to product
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>} True if user has access
 */
const hasUserAccessToProduct = async (userId, productId) => {
  try {
    const hasPurchased = await orderRepository.hasUserPurchasedProduct(userId, productId);

    // Check if user is the producer
    const product = await productRepository.findProductById(productId);
    const isProducer = product && product.producerId === userId;

    return hasPurchased || isProducer;
  } catch (error) {
    logger.error('Error checking user access to product:', error);
    throw error;
  }
};

/**
 * Get recent orders (admin only)
 * @param {string} userId - User ID (must be admin)
 * @param {number} limit - Number of orders
 * @returns {Promise<Array>} Recent orders
 */
const getRecentOrders = async (userId, limit = 10) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can view recent orders');
    }

    const orders = await orderRepository.getRecentOrders(limit);

    logger.info('Recent orders retrieved', { userId, count: orders.length });

    return orders;
  } catch (error) {
    logger.error('Error getting recent orders:', error);
    throw error;
  }
};

/**
 * Get orders by status count (admin only)
 * @param {string} userId - User ID (must be admin)
 * @returns {Promise<Object>} Count by status
 */
const getOrdersByStatusCount = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can view order status counts');
    }

    const counts = await orderRepository.getOrdersByStatusCount();

    logger.info('Order status counts retrieved', { userId });

    return counts;
  } catch (error) {
    logger.error('Error getting orders by status count:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  cancelOrder,
  refundOrder,
  getOrderStats,
  getUserPurchases,
  hasUserAccessToProduct,
  getRecentOrders,
  getOrdersByStatusCount,
  calculateOrderAmounts,
};
