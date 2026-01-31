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
    // Extract buyerId and productId to transform to Prisma relation format
    const { buyerId, productId, ...restData } = orderData;
    const prismaData = {
      ...restData,
      buyer: {
        connect: { id: buyerId }
      }
    };
    // Only connect product if productId is provided (optional for app purchases)
    if (productId) {
      prismaData.product = {
        connect: { id: productId }
      };
    }
    const order = await prisma.orders.create({
      data: prismaData,
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
    return await prisma.orders.findUnique({
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
    return await prisma.orders.findUnique({
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
    logger.info('💾 [REPOSITORY] Atualizando pedido no banco', {
      orderId,
      updateData: JSON.stringify(updateData),
      updateDataKeys: Object.keys(updateData),
      statusValue: updateData.status,
      statusType: typeof updateData.status
    });

    // Converter OrderStatus enum para string se necessário
    const prismaUpdateData = {
      ...updateData,
      status: updateData.status ? String(updateData.status) : updateData.status
    };

    logger.info('🔄 [REPOSITORY] Dados para Prisma', {
      statusValue: prismaUpdateData.status,
      statusType: typeof prismaUpdateData.status
    });

    const order = await prisma.orders.update({
      where: { id: orderId },
      data: prismaUpdateData,
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

    logger.info('✅ [REPOSITORY] Pedido atualizado no banco', {
      orderId: order.id,
      status: order.status,
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      paymentStatus: order.paymentStatus
    });

    return order;
  } catch (error) {
    logger.error('❌ [REPOSITORY] Erro ao atualizar pedido:', error);
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
      prisma.orders.findMany({
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
      prisma.orders.count({ where }),
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
      status: { in: ['APPROVED', 'COMPLETED'] },
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
      prisma.orders.count({ where }),
      prisma.orders.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      prisma.orders.aggregate({
        where,
        _sum: {
          platformFee: true,
        },
      }),
      prisma.orders.aggregate({
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
    const orders = await prisma.orders.findMany({
      where: {
        buyerId: userId,
        status: {
          in: ['APPROVED', 'COMPLETED']
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform filesUrl array into files objects for frontend compatibility
    // Handle both product purchases and app purchases
    const transformedOrders = orders.map(order => {
      // Se é compra de produto (tem productId e product)
      if (order.product && order.product.filesUrl) {
        return {
          ...order,
          product: {
            ...order.product,
            files: order.product.filesUrl.map((url, index) => ({
              id: `${order.product.id}-file-${index}`,
              name: url.split('/').pop() || `Arquivo ${index + 1}`,
              url: url,
              size: 0
            }))
          }
        };
      }
      // Se é compra de app (não tem product, tem metadata com appId)
      return order;
    });

    return transformedOrders;
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
    const order = await prisma.orders.findFirst({
      where: {
        buyerId: userId,
        productId,
        status: { in: ['APPROVED', 'COMPLETED'] },
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
    return await prisma.orders.findMany({
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
    const statusCounts = await prisma.orders.groupBy({
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


