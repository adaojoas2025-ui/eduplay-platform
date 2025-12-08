/**
 * Async Handler utility
 * Wraps async route handlers to catch errors and pass to error middleware
 * @module utils/asyncHandler
 */

/**
 * Wrap an async function and catch any errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
