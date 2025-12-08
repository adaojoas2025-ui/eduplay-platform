/**
 * Order Repository
 * Data access layer for order operations
 * @module repositories/order
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
const createOrder = async (orderData) => {
  try {
    const order = await prisma.order.create({
      data: orderData,
      include: {
        product: {
          include: {
            producer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    logger.info('Order created', { orderId: order.id });
    return order;
  } catch (error) {
    logger.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Find order by ID
 * @param {string} orderId - Order ID
 * @param {Object} options - Query options (include, select)
 * @returns {Promise<Object|null>} Order or null
 */
const findOrderById = async (orderId, options = {}) => {
  try {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            producer: {
              select: {
                id: true,
                name: true,
                email: true,
                pixKey: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ...options.include,
      },
      ...options,
    });
  } catch (error) {
    logger.error('Error finding order by ID:', error);
    throw error;
  }
};

/**
 * Find order by payment ID
 * @param {string} paymentId - Payment ID (from Mercado Pago)
 * @returns {Promise<Object|null>} Order or null
 */
const findOrderByPaymentId = async (paymentId) => {
  try {
    return await prisma.order.findUnique({
      where: { paymentId },
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error finding order by payment ID:', error);
    throw error;
  }
};

/**
 * Update order by ID
 * @param {string} orderId - Order ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated order
 */
const updateOrder = async (orderId, updateData) => {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    logger.info('Order updated', { orderId: order.id, status: order.status });
    return order;
  } catch (error) {
    logger.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<Object>} Updated order
 */
const updateOrderStatus = async (orderId, status, additionalData = {}) => {
  try {
    return await updateOrder(orderId, {
      status,
      ...additionalData,
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * List orders with pagination and filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options (page, limit)
 * @param {Object} sorting - Sorting options (sortBy, order)
 * @returns {Promise<Object>} Orders list with pagination metadata
 */
const listOrders = async (filters = {}, pagination = {}, sorting = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = 'createdAt', order = 'desc' } = sorting;
    const skip = (page - 1) * limit;

    const where = {};

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.buyerId) {
      where.buyerId = filters.buyerId;
    }

    if (filters.producerId) {
      where.product = {
        producerId: filters.producerId,
      };
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) {
        where.amount.gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        where.amount.lte = filters.maxAmount;
      }
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Execute query with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              producer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error listing orders:', error);
    throw error;
  }
};

/**
 * Get order statistics
 * @param {Object} filters - Filter options (startDate, endDate, producerId)
 * @returns {Promise<Object>} Order statistics
 */
const getOrderStats = async (filters = {}) => {
  try {
    const where = {
      status: 'COMPLETED',
    };

    if (filters.producerId) {
      where.product = {
        producerId: filters.producerId,
      };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [totalOrders, revenue, platformRevenue, producerRevenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      prisma.order.aggregate({
        where,
        _sum: {
          platformFee: true,
        },
      }),
      prisma.order.aggregate({
        where,
        _sum: {
          producerAmount: true,
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: revenue._sum.amount || 0,
      platformRevenue: platformRevenue._sum.platformFee || 0,
      producerRevenue: producerRevenue._sum.producerAmount || 0,
    };
  } catch (error) {
    logger.error('Error getting order stats:', error);
    throw error;
  }
};

/**
 * Get user's purchased products
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of purchased products
 */
const getUserPurchases = async (userId) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: 'COMPLETED',
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => order.product);
  } catch (error) {
    logger.error('Error getting user purchases:', error);
    throw error;
  }
};

/**
 * Check if user has purchased product
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>} True if user has purchased the product
 */
const hasUserPurchasedProduct = async (userId, productId) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        buyerId: userId,
        productId,
        status: 'COMPLETED',
      },
    });

    return !!order;
  } catch (error) {
    logger.error('Error checking user purchase:', error);
    throw error;
  }
};

/**
 * Get recent orders
 * @param {number} limit - Number of orders
 * @returns {Promise<Array>} Recent orders
 */
const getRecentOrders = async (limit = 10) => {
  try {
    return await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error getting recent orders:', error);
    throw error;
  }
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
const cancelOrder = async (orderId, reason) => {
  try {
    return await updateOrder(orderId, {
      status: 'CANCELLED',
      cancelReason: reason,
      cancelledAt: new Date(),
    });
  } catch (error) {
    logger.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Refund order
 * @param {string} orderId - Order ID
 * @param {string} reason - Refund reason
 * @param {number} amount - Refund amount (optional)
 * @returns {Promise<Object>} Updated order
 */
const refundOrder = async (orderId, reason, amount = null) => {
  try {
    return await updateOrder(orderId, {
      status: 'REFUNDED',
      refundReason: reason,
      refundAmount: amount,
      refundedAt: new Date(),
    });
  } catch (error) {
    logger.error('Error refunding order:', error);
    throw error;
  }
};

/**
 * Get orders by status count
 * @returns {Promise<Object>} Count by status
 */
const getOrdersByStatusCount = async () => {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});
  } catch (error) {
    logger.error('Error getting orders by status count:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  findOrderById,
  findOrderByPaymentId,
  updateOrder,
  updateOrderStatus,
  listOrders,
  getOrderStats,
  getUserPurchases,
  hasUserPurchasedProduct,
  getRecentOrders,
  cancelOrder,
  refundOrder,
  getOrdersByStatusCount,
};
