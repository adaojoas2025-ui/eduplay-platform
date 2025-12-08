const rateLimit = require('express-rate-limit');
const config = require('../../config/env');

const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  };

  return rateLimit({ ...defaults, ...options });
};

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later',
});

const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

const generalLimiter = createRateLimiter();

module.exports = { authLimiter, strictLimiter, generalLimiter, createRateLimiter };
