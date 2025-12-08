/**
 * User Service
 * Business logic for user operations
 * @module services/user
 */

const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { USER_ROLES, USER_STATUS } = require('../utils/constants');

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User
 */
const getUserById = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId, {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        bio: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateProfile = async (userId, updateData) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Remove fields that shouldn't be updated via this method
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData.status;
    delete updateData.emailVerified;

    const updatedUser = await userRepository.updateUser(userId, updateData);

    // Remove password from response
    delete updatedUser.password;

    logger.info('User profile updated', { userId });

    return updatedUser;
  } catch (error) {
    logger.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user avatar
 * @param {string} userId - User ID
 * @param {string} avatarUrl - Avatar URL
 * @returns {Promise<Object>} Updated user
 */
const updateAvatar = async (userId, avatarUrl) => {
  try {
    const user = await userRepository.updateAvatar(userId, avatarUrl);
    delete user.password;

    logger.info('User avatar updated', { userId });

    return user;
  } catch (error) {
    logger.error('Error updating user avatar:', error);
    throw error;
  }
};

/**
 * Update PIX key
 * @param {string} userId - User ID
 * @param {string} pixKey - PIX key
 * @returns {Promise<Object>} Updated user
 */
const updatePixKey = async (userId, pixKey) => {
  try {
    // Only producers can have PIX keys
    const user = await userRepository.findUserById(userId);
    if (user.role !== USER_ROLES.PRODUCER) {
      throw ApiError.forbidden('Only producers can set PIX keys');
    }

    const updatedUser = await userRepository.updatePixKey(userId, pixKey);
    delete updatedUser.password;

    logger.info('User PIX key updated', { userId });

    return updatedUser;
  } catch (error) {
    logger.error('Error updating PIX key:', error);
    throw error;
  }
};

/**
 * List users with filters (admin only)
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} Users list with pagination
 */
const listUsers = async (filters, pagination, sorting) => {
  try {
    const result = await userRepository.listUsers(filters, pagination, sorting);

    logger.info('Users listed', { count: result.users.length, total: result.pagination.total });

    return result;
  } catch (error) {
    logger.error('Error listing users:', error);
    throw error;
  }
};

/**
 * Update user (admin only)
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (userId, updateData) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Don't allow updating password through this method
    delete updateData.password;

    const updatedUser = await userRepository.updateUser(userId, updateData);
    delete updatedUser.password;

    logger.info('User updated by admin', { userId });

    return updatedUser;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check if user is admin (prevent deleting admins)
    if (user.role === USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Cannot delete admin users');
    }

    await userRepository.deleteUser(userId);

    logger.info('User deleted', { userId });
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Suspend user (admin only)
 * @param {string} userId - User ID
 * @param {string} reason - Suspension reason
 * @param {Date} until - Suspension end date (optional)
 * @returns {Promise<Object>} Updated user
 */
const suspendUser = async (userId, reason, until = null) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.role === USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Cannot suspend admin users');
    }

    const updatedUser = await userRepository.updateUser(userId, {
      status: USER_STATUS.SUSPENDED,
      suspensionReason: reason,
      suspendedUntil: until,
    });

    delete updatedUser.password;

    logger.info('User suspended', { userId, reason });

    return updatedUser;
  } catch (error) {
    logger.error('Error suspending user:', error);
    throw error;
  }
};

/**
 * Ban user (admin only)
 * @param {string} userId - User ID
 * @param {string} reason - Ban reason
 * @param {boolean} permanent - Permanent ban flag
 * @returns {Promise<Object>} Updated user
 */
const banUser = async (userId, reason, permanent = true) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.role === USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Cannot ban admin users');
    }

    const updatedUser = await userRepository.updateUser(userId, {
      status: USER_STATUS.BANNED,
      banReason: reason,
      bannedAt: new Date(),
      permanentBan: permanent,
    });

    delete updatedUser.password;

    logger.info('User banned', { userId, reason, permanent });

    return updatedUser;
  } catch (error) {
    logger.error('Error banning user:', error);
    throw error;
  }
};

/**
 * Unban user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
const unbanUser = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.status !== USER_STATUS.BANNED) {
      throw ApiError.badRequest('User is not banned');
    }

    const updatedUser = await userRepository.updateUser(userId, {
      status: USER_STATUS.ACTIVE,
      banReason: null,
      bannedAt: null,
      permanentBan: false,
    });

    delete updatedUser.password;

    logger.info('User unbanned', { userId });

    return updatedUser;
  } catch (error) {
    logger.error('Error unbanning user:', error);
    throw error;
  }
};

/**
 * Get producer statistics
 * @param {string} producerId - Producer ID
 * @returns {Promise<Object>} Producer statistics
 */
const getProducerStats = async (producerId) => {
  try {
    const user = await userRepository.findUserById(producerId);
    if (!user) {
      throw ApiError.notFound('Producer not found');
    }

    if (user.role !== USER_ROLES.PRODUCER) {
      throw ApiError.badRequest('User is not a producer');
    }

    const stats = await userRepository.getProducerStats(producerId);

    logger.info('Producer stats retrieved', { producerId });

    return stats;
  } catch (error) {
    logger.error('Error getting producer stats:', error);
    throw error;
  }
};

/**
 * Get user statistics (admin only)
 * @returns {Promise<Object>} User statistics
 */
const getUserStats = async () => {
  try {
    const [totalUsers, totalBuyers, totalProducers, totalAdmins, activeUsers, suspendedUsers] =
      await Promise.all([
        userRepository.listUsers({}, { page: 1, limit: 1 }).then((r) => r.pagination.total),
        userRepository.countUsersByRole(USER_ROLES.BUYER),
        userRepository.countUsersByRole(USER_ROLES.PRODUCER),
        userRepository.countUsersByRole(USER_ROLES.ADMIN),
        userRepository.countUsersByStatus(USER_STATUS.ACTIVE),
        userRepository.countUsersByStatus(USER_STATUS.SUSPENDED),
      ]);

    return {
      totalUsers,
      byRole: {
        buyers: totalBuyers,
        producers: totalProducers,
        admins: totalAdmins,
      },
      byStatus: {
        active: activeUsers,
        suspended: suspendedUsers,
      },
    };
  } catch (error) {
    logger.error('Error getting user stats:', error);
    throw error;
  }
};

module.exports = {
  getUserById,
  updateProfile,
  updateAvatar,
  updatePixKey,
  listUsers,
  updateUser,
  deleteUser,
  suspendUser,
  banUser,
  unbanUser,
  getProducerStats,
  getUserStats,
};
