/**
 * Validation Middleware
 * Validates request data using Joi schemas
 * @module middlewares/validator
 */

const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

/**
 * Validate request data against Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const validationOptions = {
    abortEarly: false, // Return all errors
    allowUnknown: true, // Allow unknown keys
    stripUnknown: true, // Remove unknown keys
  };

  const dataToValidate = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const { error, value } = schema.validate(dataToValidate, validationOptions);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');

    logger.warn('Validation error:', { error: errorMessage, path: req.path });

    return next(ApiError.badRequest(errorMessage));
  }

  // Replace request data with validated data
  req.body = value.body || req.body;
  req.query = value.query || req.query;
  req.params = value.params || req.params;

  return next();
};

module.exports = { validate };
