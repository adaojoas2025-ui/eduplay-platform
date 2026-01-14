/**
 * User Repository
 * Data access layer for user operations
 * @module repositories/user
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async (userData) => {
  try {
    const user = await prisma.users.create({
      data: userData,
    });
    logger.info('User created', { userId: user.id });
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options (include, select)
 * @returns {Promise<Object|null>} User or null
 */
const findUserById = async (userId, options = {}) => {
  try {
    return await prisma.users.findUnique({
      where: { id: userId },
      ...options,
    });
  } catch (error) {
    logger.error('Error finding user by ID:', error);
    throw error;
  }
};

/**
 * Find user by email
 * @param {string} email - User email
 * @param {Object} options - Query options (include, select)
 * @returns {Promise<Object|null>} User or null
 */
const findUserByEmail = async (email, options = {}) => {
  try {
    return await prisma.users.findUnique({
      where: { email },
      ...options,
    });
  } catch (error) {
    logger.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * Find user by CPF
 * @param {string} cpf - User CPF
 * @param {Object} options - Query options (include, select)
 * @returns {Promise<Object|null>} User or null
 */
const findUserByCpf = async (cpf, options = {}) => {
  try {
    return await prisma.users.findUnique({
      where: { cpf },
      ...options,
    });
  } catch (error) {
    logger.error('Error finding user by CPF:', error);
    throw error;
  }
};

/**
 * Update user by ID
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (userId, updateData) => {
  try {
    const user = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });
    logger.info('User updated', { userId: user.id });
    return user;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deleted user
 */
const deleteUser = async (userId) => {
  try {
    const user = await prisma.users.delete({
      where: { id: userId },
    });
    logger.info('User deleted', { userId: user.id });
    return user;
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * List users with pagination and filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options (page, limit)
 * @param {Object} sorting - Sorting options (sortBy, order)
 * @returns {Promise<Object>} Users list with pagination metadata
 */
const listUsers = async (filters = {}, pagination = {}, sorting = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = 'createdAt', order = 'desc' } = sorting;
    const skip = (page - 1) * limit;

    const where = {};

    // Apply filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Execute query with pagination
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      prisma.users.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error listing users:', error);
    throw error;
  }
};

/**
 * Count users by role
 * @param {string} role - User role
 * @returns {Promise<number>} User count
 */
const countUsersByRole = async (role) => {
  try {
    return await prisma.users.count({
      where: { role },
    });
  } catch (error) {
    logger.error('Error counting users by role:', error);
    throw error;
  }
};

/**
 * Count users by status
 * @param {string} status - User status
 * @returns {Promise<number>} User count
 */
const countUsersByStatus = async (status) => {
  try {
    return await prisma.users.count({
      where: { status },
    });
  } catch (error) {
    logger.error('Error counting users by status:', error);
    throw error;
  }
};

/**
 * Verify user email
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
const verifyUserEmail = async (userId) => {
  try {
    return await updateUser(userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  } catch (error) {
    logger.error('Error verifying user email:', error);
    throw error;
  }
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} hashedPassword - New hashed password
 * @returns {Promise<Object>} Updated user
 */
const updatePassword = async (userId, hashedPassword) => {
  try {
    return await updateUser(userId, {
      password: hashedPassword,
    });
  } catch (error) {
    logger.error('Error updating password:', error);
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
    return await updateUser(userId, {
      avatar: avatarUrl,
    });
  } catch (error) {
    logger.error('Error updating avatar:', error);
    throw error;
  }
};

/**
 * Update user PIX key
 * @param {string} userId - User ID
 * @param {string} pixKey - PIX key
 * @returns {Promise<Object>} Updated user
 */
const updatePixKey = async (userId, pixKey) => {
  try {
    return await updateUser(userId, {
      pixKey,
    });
  } catch (error) {
    logger.error('Error updating PIX key:', error);
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
    const [totalProducts, totalSales, totalRevenue, totalAmount, pendingCommissions, paidCommissions] = await Promise.all([
      prisma.products.count({
        where: { producerId },
      }),
      prisma.orders.count({
        where: {
          product: { producerId },
          status: 'COMPLETED',
        },
      }),
      prisma.orders.aggregate({
        where: {
          product: { producerId },
          status: 'COMPLETED',
        },
        _sum: {
          producerAmount: true,
        },
      }),
      prisma.orders.aggregate({
        where: {
          product: { producerId },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.commission.aggregate({
        where: {
          producerId,
          status: 'PENDING',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.commission.aggregate({
        where: {
          producerId,
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalProducts,
      totalSales,
      totalRevenue: totalRevenue._sum.producerAmount || 0,
      totalAmount: totalAmount._sum.amount || 0,
      pendingCommissions: pendingCommissions._sum.amount || 0,
      paidCommissions: paidCommissions._sum.amount || 0,
    };
  } catch (error) {
    logger.error('Error getting producer stats:', error);
    throw error;
  }
};

/**
 * Find users by role
 * @param {string} role - User role
 * @returns {Promise<Array>} List of users
 */
const findUsersByRole = async (role) => {
  try {
    return await prisma.users.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    logger.error('Error finding users by role:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
  findUserByCpf,
  findUsersByRole,
  updateUser,
  deleteUser,
  listUsers,
  countUsersByRole,
  countUsersByStatus,
  verifyUserEmail,
  updatePassword,
  updateAvatar,
  updatePixKey,
  getProducerStats,
};
