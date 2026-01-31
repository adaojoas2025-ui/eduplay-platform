/**
 * Commission Repository
 * Data access layer for commission operations
 * @module repositories/commission
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Create a new commission record
 * @param {Object} commissionData - Commission data
 * @returns {Promise<Object>} Created commission
 */
const createCommission = async (commissionData) => {
  try {
    const commission = await prisma.commissions.create({
      data: commissionData,
    });
    logger.info('Commission created', { commissionId: commission.id });
    return commission;
  } catch (error) {
    logger.error('Error creating commission:', error);
    throw error;
  }
};

/**
 * Find commission by ID
 * @param {string} commissionId - Commission ID
 * @returns {Promise<Object|null>} Commission or null
 */
const findCommissionById = async (commissionId) => {
  try {
    return await prisma.commissions.findUnique({
      where: { id: commissionId },
      include: {
        orders: {
          include: {
            product: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            pixKey: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error finding commission by ID:', error);
    throw error;
  }
};

/**
 * Find commission by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} Commission or null
 */
const findCommissionByOrderId = async (orderId) => {
  try {
    return await prisma.commissions.findUnique({
      where: { orderId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            pixKey: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error finding commission by order ID:', error);
    throw error;
  }
};

/**
 * Update commission by ID
 * @param {string} commissionId - Commission ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated commission
 */
const updateCommission = async (commissionId, updateData) => {
  try {
    const commission = await prisma.commissions.update({
      where: { id: commissionId },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    logger.info('Commission updated', { commissionId: commission.id });
    return commission;
  } catch (error) {
    logger.error('Error updating commission:', error);
    throw error;
  }
};

/**
 * List commissions with pagination and filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options (page, limit)
 * @param {Object} sorting - Sorting options (sortBy, order)
 * @returns {Promise<Object>} Commissions list with pagination metadata
 */
const listCommissions = async (filters = {}, pagination = {}, sorting = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = 'createdAt', order: sortOrder = 'desc' } = sorting;
    const skip = (page - 1) * limit;

    const where = {};

    // Apply filters
    if (filters.producerId) {
      where.producerId = filters.producerId;
    }

    if (filters.status) {
      where.status = filters.status;
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
    const [commissions, total, appOrders, totalAppOrders] = await Promise.all([
      prisma.commissions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orders: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
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
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.commissions.count({ where }),
      // Buscar também orders de apps (sem comissão)
      prisma.orders.findMany({
        where: {
          status: { in: ['APPROVED', 'COMPLETED'] },
          productId: null, // App sales
          ...(filters.startDate || filters.endDate ? {
            createdAt: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            }
          } : {}),
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.orders.count({
        where: {
          status: { in: ['APPROVED', 'COMPLETED'] },
          productId: null,
          ...(filters.startDate || filters.endDate ? {
            createdAt: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            }
          } : {}),
        },
      }),
    ]);

    // Transformar app orders em formato de comissão para o frontend
    const appCommissions = appOrders.map(appOrder => ({
      id: `app-${appOrder.id}`,
      orderId: appOrder.id,
      producerId: null,
      users: null,
      amount: appOrder.amount, // 100% vai para a plataforma
      status: 'PAID', // Apps são considerados como já pagos (receita da plataforma)
      createdAt: appOrder.createdAt,
      updatedAt: appOrder.updatedAt,
      orders: {
        ...appOrder,
        product: {
          id: appOrder.metadata?.appId || null,
          title: appOrder.metadata?.appTitle || 'App',
        },
      },
      isAppSale: true, // Flag para identificar vendas de apps
    }));

    // Mesclar comissões e vendas de apps
    const allItems = [...commissions, ...appCommissions].sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return {
      commissions: allItems,
      pagination: {
        page,
        limit,
        total: total + totalAppOrders,
        totalPages: Math.ceil((total + totalAppOrders) / limit),
      },
    };
  } catch (error) {
    logger.error('Error listing commissions:', error);
    throw error;
  }
};

/**
 * Get producer's total commissions
 * @param {string} producerId - Producer ID
 * @param {Object} filters - Filter options (status, startDate, endDate)
 * @returns {Promise<Object>} Commission totals
 */
const getProducerCommissions = async (producerId, filters = {}) => {
  try {
    const where = {
      producerId,
    };

    if (filters.status) {
      where.status = filters.status;
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

    const [totalCommissions, totalAmount, pendingAmount, paidAmount] = await Promise.all([
      prisma.commissions.count({ where }),
      prisma.commissions.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      prisma.commissions.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: {
          amount: true,
        },
      }),
      prisma.commissions.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalCommissions,
      totalAmount: totalAmount._sum.amount || 0,
      pendingAmount: pendingAmount._sum.amount || 0,
      paidAmount: paidAmount._sum.amount || 0,
    };
  } catch (error) {
    logger.error('Error getting producer commissions:', error);
    throw error;
  }
};

/**
 * Get pending commissions for producer
 * @param {string} producerId - Producer ID
 * @returns {Promise<Array>} Pending commissions
 */
const getPendingCommissions = async (producerId) => {
  try {
    return await prisma.commissions.findMany({
      where: {
        producerId,
        status: 'PENDING',
      },
      include: {
        orders: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  } catch (error) {
    logger.error('Error getting pending commissions:', error);
    throw error;
  }
};

/**
 * Mark commission as paid
 * @param {string} commissionId - Commission ID
 * @param {Object} paymentDetails - Payment details (transferId, paidAt)
 * @returns {Promise<Object>} Updated commission
 */
const markCommissionAsPaid = async (commissionId, paymentDetails = {}) => {
  try {
    return await updateCommission(commissionId, {
      status: 'PAID',
      paidAt: paymentDetails.paidAt || new Date(),
      transferId: paymentDetails.transferId || null,
    });
  } catch (error) {
    logger.error('Error marking commission as paid:', error);
    throw error;
  }
};

/**
 * Mark commission as processing
 * @param {string} commissionId - Commission ID
 * @returns {Promise<Object>} Updated commission
 */
const markCommissionAsProcessing = async (commissionId) => {
  try {
    return await updateCommission(commissionId, {
      status: 'PROCESSING',
      processingAt: new Date(),
    });
  } catch (error) {
    logger.error('Error marking commission as processing:', error);
    throw error;
  }
};

/**
 * Mark commission as failed
 * @param {string} commissionId - Commission ID
 * @param {string} reason - Failure reason
 * @returns {Promise<Object>} Updated commission
 */
const markCommissionAsFailed = async (commissionId, reason) => {
  try {
    return await updateCommission(commissionId, {
      status: 'FAILED',
      failureReason: reason,
      failedAt: new Date(),
    });
  } catch (error) {
    logger.error('Error marking commission as failed:', error);
    throw error;
  }
};

/**
 * Get commission statistics
 * @param {Object} filters - Filter options (startDate, endDate)
 * @returns {Promise<Object>} Commission statistics
 */
const getCommissionStats = async (filters = {}) => {
  try {
    const where = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Get monthly stats (current month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const [statusCounts, totalAmount, monthlyStats, totalSales] = await Promise.all([
      prisma.commissions.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.commissions.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.commissions.aggregate({
        where: {
          ...where,
          createdAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
      // Get total sales amount from orders
      prisma.commissions.findMany({
        where,
        include: {
          orders: {
            select: {
              amount: true,
            },
          },
        },
      }),
    ]);

    const stats = statusCounts.reduce(
      (acc, item) => {
        acc.byStatus[item.status] = {
          count: item._count.status,
          amount: item._sum.amount || 0,
        };
        return acc;
      },
      { byStatus: {} }
    );

    // Calculate total sales revenue from products (sum of all order amounts with commissions)
    const totalSalesRevenue = totalSales.reduce((sum, commission) => {
      return sum + (commission.orders?.amount || 0);
    }, 0);

    // Get app sales (orders without commissions - 100% goes to platform)
    const appSalesWhere = {
      status: { in: ['APPROVED', 'COMPLETED'] },
      productId: null, // App purchases don't have productId
    };

    if (filters.startDate || filters.endDate) {
      appSalesWhere.createdAt = {};
      if (filters.startDate) {
        appSalesWhere.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        appSalesWhere.createdAt.lte = new Date(filters.endDate);
      }
    }

    const appSales = await prisma.orders.aggregate({
      where: appSalesWhere,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalAppSalesRevenue = appSales._sum.amount || 0;
    const appSalesCount = appSales._count.id || 0;

    // Platform revenue is:
    // - 3% of product sales (totalSalesRevenue)
    // - 100% of app sales (totalAppSalesRevenue)
    const platformRevenue = (totalSalesRevenue * 0.03) + totalAppSalesRevenue;

    // Add aggregated totals
    stats.totalAmount = totalAmount._sum.amount || 0; // Total commission paid to producers (97%)
    stats.totalCount = totalAmount._count.id || 0;
    stats.pendingAmount = stats.byStatus.PENDING?.amount || 0;
    stats.pendingCount = stats.byStatus.PENDING?.count || 0;
    stats.paidAmount = stats.byStatus.PAID?.amount || 0;
    stats.paidCount = stats.byStatus.PAID?.count || 0;
    stats.monthlyAmount = monthlyStats._sum.amount || 0;
    stats.monthlyCount = monthlyStats._count.id || 0;

    // Platform statistics
    stats.totalSalesRevenue = totalSalesRevenue; // Total revenue from product sales
    stats.platformRevenue = platformRevenue; // 3% from products + 100% from apps
    stats.appSalesRevenue = totalAppSalesRevenue; // Revenue from app sales (100% platform)
    stats.appSalesCount = appSalesCount; // Number of app sales

    return stats;
  } catch (error) {
    logger.error('Error getting commission stats:', error);
    throw error;
  }
};

/**
 * Batch update commissions status
 * @param {Array<string>} commissionIds - Array of commission IDs
 * @param {string} status - New status
 * @returns {Promise<Object>} Update result
 */
const batchUpdateStatus = async (commissionIds, status) => {
  try {
    const result = await prisma.commissions.updateMany({
      where: {
        id: {
          in: commissionIds,
        },
      },
      data: {
        status,
      },
    });
    logger.info('Batch commission status updated', { count: result.count, status });
    return result;
  } catch (error) {
    logger.error('Error batch updating commission status:', error);
    throw error;
  }
};

module.exports = {
  createCommission,
  findCommissionById,
  findCommissionByOrderId,
  updateCommission,
  listCommissions,
  getProducerCommissions,
  getPendingCommissions,
  markCommissionAsPaid,
  markCommissionAsProcessing,
  markCommissionAsFailed,
  getCommissionStats,
  batchUpdateStatus,
};
