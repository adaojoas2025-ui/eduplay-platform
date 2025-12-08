/**
 * Commission Service
 * Business logic for commission operations
 * @module services/commission
 */

const commissionRepository = require('../repositories/commission.repository');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { USER_ROLES, COMMISSION_STATUS } = require('../utils/constants');

/**
 * Get commission by ID
 * @param {string} commissionId - Commission ID
 * @param {string} userId - User ID (must be producer or admin)
 * @returns {Promise<Object>} Commission
 */
const getCommissionById = async (commissionId, userId) => {
  try {
    const commission = await commissionRepository.findCommissionById(commissionId);
    if (!commission) {
      throw ApiError.notFound('Commission not found');
    }

    // Check permissions
    const user = await userRepository.findUserById(userId);
    const isOwner = commission.producerId === userId;
    const isAdmin = user.role === USER_ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this commission');
    }

    return commission;
  } catch (error) {
    logger.error('Error getting commission by ID:', error);
    throw error;
  }
};

/**
 * List commissions
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} Commissions list with pagination
 */
const listCommissions = async (userId, filters, pagination, sorting) => {
  try {
    const user = await userRepository.findUserById(userId);

    // Filter by user role
    if (user.role === USER_ROLES.PRODUCER) {
      filters.producerId = userId;
    } else if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only producers and admins can view commissions');
    }

    const result = await commissionRepository.listCommissions(filters, pagination, sorting);

    logger.info('Commissions listed', {
      userId,
      count: result.commissions.length,
      total: result.pagination.total,
    });

    return result;
  } catch (error) {
    logger.error('Error listing commissions:', error);
    throw error;
  }
};

/**
 * Get producer commissions summary
 * @param {string} userId - User ID (must be producer or admin)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Commission summary
 */
const getProducerCommissions = async (userId, filters = {}) => {
  try {
    const user = await userRepository.findUserById(userId);

    let producerId = userId;

    // If admin is requesting, they can specify producer ID
    if (user.role === USER_ROLES.ADMIN && filters.producerId) {
      producerId = filters.producerId;
    } else if (user.role !== USER_ROLES.PRODUCER) {
      throw ApiError.forbidden('Only producers can view commission summaries');
    }

    const summary = await commissionRepository.getProducerCommissions(producerId, filters);

    logger.info('Producer commissions retrieved', { producerId, userId });

    return summary;
  } catch (error) {
    logger.error('Error getting producer commissions:', error);
    throw error;
  }
};

/**
 * Get pending commissions for producer
 * @param {string} userId - User ID (must be producer)
 * @returns {Promise<Array>} Pending commissions
 */
const getPendingCommissions = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.PRODUCER) {
      throw ApiError.forbidden('Only producers can view pending commissions');
    }

    const commissions = await commissionRepository.getPendingCommissions(userId);

    logger.info('Pending commissions retrieved', { userId, count: commissions.length });

    return commissions;
  } catch (error) {
    logger.error('Error getting pending commissions:', error);
    throw error;
  }
};

/**
 * Mark commission as paid (admin only)
 * @param {string} commissionId - Commission ID
 * @param {string} userId - User ID (must be admin)
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} Updated commission
 */
const markCommissionAsPaid = async (commissionId, userId, paymentDetails = {}) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can mark commissions as paid');
    }

    const commission = await commissionRepository.findCommissionById(commissionId);
    if (!commission) {
      throw ApiError.notFound('Commission not found');
    }

    if (commission.status === COMMISSION_STATUS.PAID) {
      throw ApiError.badRequest('Commission is already paid');
    }

    const updatedCommission = await commissionRepository.markCommissionAsPaid(
      commissionId,
      paymentDetails
    );

    logger.info('Commission marked as paid', { commissionId, userId });

    return updatedCommission;
  } catch (error) {
    logger.error('Error marking commission as paid:', error);
    throw error;
  }
};

/**
 * Mark commission as processing (admin only)
 * @param {string} commissionId - Commission ID
 * @param {string} userId - User ID (must be admin)
 * @returns {Promise<Object>} Updated commission
 */
const markCommissionAsProcessing = async (commissionId, userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can mark commissions as processing');
    }

    const commission = await commissionRepository.findCommissionById(commissionId);
    if (!commission) {
      throw ApiError.notFound('Commission not found');
    }

    if (commission.status !== COMMISSION_STATUS.PENDING) {
      throw ApiError.badRequest('Only pending commissions can be marked as processing');
    }

    const updatedCommission = await commissionRepository.markCommissionAsProcessing(commissionId);

    logger.info('Commission marked as processing', { commissionId, userId });

    return updatedCommission;
  } catch (error) {
    logger.error('Error marking commission as processing:', error);
    throw error;
  }
};

/**
 * Mark commission as failed (admin only)
 * @param {string} commissionId - Commission ID
 * @param {string} userId - User ID (must be admin)
 * @param {string} reason - Failure reason
 * @returns {Promise<Object>} Updated commission
 */
const markCommissionAsFailed = async (commissionId, userId, reason) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can mark commissions as failed');
    }

    const commission = await commissionRepository.findCommissionById(commissionId);
    if (!commission) {
      throw ApiError.notFound('Commission not found');
    }

    const updatedCommission = await commissionRepository.markCommissionAsFailed(
      commissionId,
      reason
    );

    logger.info('Commission marked as failed', { commissionId, userId, reason });

    return updatedCommission;
  } catch (error) {
    logger.error('Error marking commission as failed:', error);
    throw error;
  }
};

/**
 * Get commission statistics (admin only)
 * @param {string} userId - User ID (must be admin)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Commission statistics
 */
const getCommissionStats = async (userId, filters = {}) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can view commission statistics');
    }

    const stats = await commissionRepository.getCommissionStats(filters);

    logger.info('Commission stats retrieved', { userId });

    return stats;
  } catch (error) {
    logger.error('Error getting commission stats:', error);
    throw error;
  }
};

/**
 * Batch update commissions status (admin only)
 * @param {Array<string>} commissionIds - Array of commission IDs
 * @param {string} status - New status
 * @param {string} userId - User ID (must be admin)
 * @returns {Promise<Object>} Update result
 */
const batchUpdateStatus = async (commissionIds, status, userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can batch update commission status');
    }

    if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
      throw ApiError.badRequest('Commission IDs must be a non-empty array');
    }

    const result = await commissionRepository.batchUpdateStatus(commissionIds, status);

    logger.info('Batch commission status updated', { userId, count: result.count, status });

    return result;
  } catch (error) {
    logger.error('Error batch updating commission status:', error);
    throw error;
  }
};

/**
 * Request commission withdrawal (producer only)
 * @param {string} userId - User ID (must be producer)
 * @returns {Promise<Object>} Withdrawal request result
 */
const requestWithdrawal = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.PRODUCER) {
      throw ApiError.forbidden('Only producers can request withdrawals');
    }

    // Check if producer has PIX key set
    if (!user.pixKey) {
      throw ApiError.badRequest('Please set your PIX key before requesting a withdrawal');
    }

    // Get pending commissions
    const pendingCommissions = await commissionRepository.getPendingCommissions(userId);

    if (pendingCommissions.length === 0) {
      throw ApiError.badRequest('You have no pending commissions to withdraw');
    }

    // Calculate total amount
    const totalAmount = pendingCommissions.reduce((sum, comm) => sum + comm.amount, 0);

    logger.info('Withdrawal requested', {
      userId,
      commissionsCount: pendingCommissions.length,
      totalAmount,
    });

    return {
      commissionsCount: pendingCommissions.length,
      totalAmount,
      pixKey: user.pixKey,
      commissions: pendingCommissions,
    };
  } catch (error) {
    logger.error('Error requesting withdrawal:', error);
    throw error;
  }
};

module.exports = {
  getCommissionById,
  listCommissions,
  getProducerCommissions,
  getPendingCommissions,
  markCommissionAsPaid,
  markCommissionAsProcessing,
  markCommissionAsFailed,
  getCommissionStats,
  batchUpdateStatus,
  requestWithdrawal,
};
