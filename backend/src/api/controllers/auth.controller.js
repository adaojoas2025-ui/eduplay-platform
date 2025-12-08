/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 * @module controllers/auth
 */

const authService = require('../../services/auth.service');
const emailService = require('../../services/email.service');
const gamificationService = require('../services/gamification.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  // Initialize gamification for new user (don't await - fire and forget)
  gamificationService.initializeUser(result.user.id).catch((err) => {
    logger.error('Failed to initialize gamification:', err);
  });

  // Send welcome email (don't await - fire and forget)
  emailService.sendWelcomeEmail(result.user).catch((err) => {
    logger.error('Failed to send welcome email:', err);
  });

  return ApiResponse.success(res, 201, result, 'User registered successfully');
});

/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  // Update streak (don't await - fire and forget)
  gamificationService.updateStreak(result.user.id).catch((err) => {
    logger.error('Failed to update streak:', err);
  });

  return ApiResponse.success(res, 200, result, 'Login successful');
});

/**
 * Refresh access token
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);

  return ApiResponse.success(res, 200, result, 'Token refreshed successfully');
});

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  return ApiResponse.success(res, 200, user, 'Profile retrieved successfully');
});

/**
 * Change password
 * @route POST /api/v1/auth/change-password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  return ApiResponse.success(res, 200, null, 'Password changed successfully');
});

/**
 * Request password reset
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const resetToken = await authService.requestPasswordReset(email);

  // Send reset email if user exists
  if (resetToken) {
    const user = { email }; // Minimal user data for email
    emailService.sendPasswordResetEmail(user, resetToken).catch((err) => {
      logger.error('Failed to send password reset email:', err);
    });
  }

  // Always return success to prevent email enumeration
  return ApiResponse.success(
    res,
    200,
    null,
    'If your email is registered, you will receive a password reset link'
  );
});

/**
 * Reset password with token
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);

  return ApiResponse.success(res, 200, null, 'Password reset successfully');
});

/**
 * Verify email with token
 * @route POST /api/v1/auth/verify-email
 * @access Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  await authService.verifyEmail(token);

  return ApiResponse.success(res, 200, null, 'Email verified successfully');
});

/**
 * Logout user (client-side token removal)
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // We just return a success message
  logger.info('User logged out', { userId: req.user.id });

  return ApiResponse.success(res, 200, null, 'Logout successful');
});

/**
 * Google OAuth callback
 * @route GET /api/v1/auth/google/callback
 * @access Public
 */
const googleCallback = asyncHandler(async (req, res) => {
  // User is already authenticated by passport middleware
  const user = req.user;

  logger.info('Google OAuth successful', { userId: user.id, email: user.email });

  // Generate JWT tokens
  const tokens = await authService.generateTokens(user);

  // Update last login
  await authService.updateLastLogin(user.id);

  // Redirect to frontend with token in URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
  const redirectUrl = `${frontendUrl}/auth/google/callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;

  res.redirect(redirectUrl);
});

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout,
  googleCallback,
};
