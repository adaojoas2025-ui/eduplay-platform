/**
 * Authentication Routes
 * Routes for authentication endpoints
 * @module routes/auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const authValidator = require('../validators/auth.validator');
const passport = require('../../config/passport');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(authValidator.registerSchema),
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validate(authValidator.loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validate(authValidator.refreshTokenSchema),
  authController.refreshToken
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validate(authValidator.changePasswordSchema),
  authController.changePassword
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidator.forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(authValidator.resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post(
  '/verify-email',
  validate(authValidator.verifyEmailSchema),
  authController.verifyEmail
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Redirect to Google OAuth consent screen
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5175/login?error=auth_failed',
  }),
  authController.googleCallback
);

module.exports = router;
