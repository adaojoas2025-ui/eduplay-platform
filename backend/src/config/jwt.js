/**
 * JWT Configuration
 * Handles token generation and verification
 * @module config/jwt
 */

const jwt = require('jsonwebtoken');
const config = require('./env');
const { TOKEN_TYPES } = require('../utils/constants');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} type - Token type (ACCESS, REFRESH, etc.)
 * @returns {string} JWT token
 */
const generateToken = (userId, type = TOKEN_TYPES.ACCESS) => {
  const payload = { userId, type };

  const options = {
    expiresIn: type === TOKEN_TYPES.REFRESH
      ? config.jwt.refreshExpiresIn
      : config.jwt.expiresIn,
  };

  const secret = type === TOKEN_TYPES.REFRESH
    ? config.jwt.refreshSecret
    : config.jwt.secret;

  return jwt.sign(payload, secret, options);
};

/**
 * Generate auth tokens (access + refresh)
 * @param {string} userId - User ID
 * @returns {Object} Tokens object
 */
const generateAuthTokens = (userId) => {
  return {
    access: {
      token: generateToken(userId, TOKEN_TYPES.ACCESS),
      expires: config.jwt.expiresIn,
    },
    refresh: {
      token: generateToken(userId, TOKEN_TYPES.REFRESH),
      expires: config.jwt.refreshExpiresIn,
    },
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} type - Token type
 * @returns {Object} Decoded payload
 */
const verifyToken = (token, type = TOKEN_TYPES.ACCESS) => {
  const secret = type === TOKEN_TYPES.REFRESH
    ? config.jwt.refreshSecret
    : config.jwt.secret;

  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  generateAuthTokens,
  verifyToken,
};
