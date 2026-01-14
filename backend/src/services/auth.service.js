/**
 * Authentication Service
 * Business logic for authentication operations
 * @module services/auth
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const { generateToken, verifyToken } = require('../config/jwt');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config/env');
const { USER_ROLES, USER_STATUS, TOKEN_TYPES } = require('../utils/constants');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User and tokens
 */
const register = async (userData) => {
  try {
    // Check if email already exists
    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) {
      throw ApiError.badRequest('Email already registered');
    }

    // Check if CPF already exists (for producers)
    if (userData.cpf) {
      const existingCpf = await userRepository.findUserByCpf(userData.cpf);
      if (existingCpf) {
        throw ApiError.badRequest('CPF already registered');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptRounds);

    // Create user
    const user = await userRepository.createUser({
      id: crypto.randomUUID(),
      ...userData,
      password: hashedPassword,
      status: USER_STATUS.ACTIVE,
      emailVerified: false,
    });

    // Generate tokens
    const accessToken = generateToken(user.id, TOKEN_TYPES.ACCESS);
    const refreshToken = generateToken(user.id, TOKEN_TYPES.REFRESH);

    // Remove password from response
    delete user.password;

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error('Error in register service:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and tokens
 */
const login = async (email, password) => {
  try {
    // Find user by email
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check user status
    if (user.status === USER_STATUS.SUSPENDED) {
      throw ApiError.forbidden('Account suspended');
    }

    if (user.status === USER_STATUS.BANNED) {
      throw ApiError.forbidden('Account banned');
    }

    if (user.status === USER_STATUS.INACTIVE) {
      throw ApiError.forbidden('Account inactive');
    }

    // Update last login
    await userRepository.updateUser(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const accessToken = generateToken(user.id, TOKEN_TYPES.ACCESS);
    const refreshToken = generateToken(user.id, TOKEN_TYPES.REFRESH);

    // Remove password from response
    delete user.password;

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error('Error in login service:', error);
    throw error;
  }
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken, TOKEN_TYPES.REFRESH);

    // Find user
    const user = await userRepository.findUserById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Check user status
    if (user.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account not active');
    }

    // Generate new tokens
    const newAccessToken = generateToken(user.id, TOKEN_TYPES.ACCESS);
    const newRefreshToken = generateToken(user.id, TOKEN_TYPES.REFRESH);

    logger.info('Tokens refreshed successfully', { userId: user.id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    logger.error('Error in refresh token service:', error);
    throw error;
  }
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Update password
    await userRepository.updatePassword(userId, hashedPassword);

    logger.info('Password changed successfully', { userId });
  } catch (error) {
    logger.error('Error in change password service:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<string>} Reset token
 */
const requestPasswordReset = async (email) => {
  try {
    // Find user
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      logger.warn('Password reset requested for non-existent email', { email });
      return null;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to user (expires in 1 hour)
    await userRepository.updateUser(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    logger.info('Password reset requested', { userId: user.id, email });

    return resetToken;
  } catch (error) {
    logger.error('Error in request password reset service:', error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const resetPassword = async (token, newPassword) => {
  try {
    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const users = await userRepository.listUsers(
      {
        resetPasswordToken: hashedToken,
      },
      { page: 1, limit: 1 }
    );

    const user = users.users[0];
    if (!user || user.resetPasswordExpires < new Date()) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Update password and clear reset token
    await userRepository.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    logger.info('Password reset successfully', { userId: user.id });
  } catch (error) {
    logger.error('Error in reset password service:', error);
    throw error;
  }
};

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const verifyEmail = async (token) => {
  try {
    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with token
    const users = await userRepository.listUsers(
      {
        emailVerificationToken: hashedToken,
      },
      { page: 1, limit: 1 }
    );

    const user = users.users[0];
    if (!user) {
      throw ApiError.badRequest('Invalid verification token');
    }

    // Verify email
    await userRepository.updateUser(user.id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
    });

    logger.info('Email verified successfully', { userId: user.id });
  } catch (error) {
    logger.error('Error in verify email service:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getProfile = async (userId) => {
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
        cpf: true,
        pixKey: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Error in get profile service:', error);
    throw error;
  }
};

/**
 * Generate access and refresh tokens for user
 * @param {Object} user - User object
 * @returns {Object} Tokens
 */
const generateTokens = (user) => {
  const accessToken = generateToken(user.id, TOKEN_TYPES.ACCESS);
  const refreshToken = generateToken(user.id, TOKEN_TYPES.REFRESH);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Update user last login timestamp
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const updateLastLogin = async (userId) => {
  try {
    await userRepository.updateUser(userId, {
      lastLoginAt: new Date(),
    });
    logger.info('Last login updated', { userId });
  } catch (error) {
    logger.error('Error updating last login:', error);
    throw error;
  }
};

/**
 * Upgrade user to producer role
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
const upgradeToProducer = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.role === USER_ROLES.PRODUCER) {
      throw ApiError.badRequest('User is already a producer');
    }

    if (user.role === USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Cannot change admin role');
    }

    const updatedUser = await userRepository.updateUser(userId, {
      role: USER_ROLES.PRODUCER,
    });

    delete updatedUser.password;

    logger.info('User upgraded to producer', { userId });

    return updatedUser;
  } catch (error) {
    logger.error('Error upgrading user to producer:', error);
    throw error;
  }
};

/**
 * Validate user password
 * @param {string} userId - User ID
 * @param {string} password - Password to validate
 * @returns {Promise<boolean>} True if password is valid
 */
const validatePassword = async (userId, password) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  } catch (error) {
    logger.error('Error validating password:', error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getProfile,
  generateTokens,
  updateLastLogin,
  upgradeToProducer,
  validatePassword,
};
