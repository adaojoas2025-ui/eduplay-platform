/**
 * Custom API Error class for standardized error handling
 * @module utils/ApiError
 */

class ApiError extends Error {
  /**
   * Create an API Error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} isOperational - Whether error is operational (expected)
   * @param {string} stack - Error stack trace
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Create a Bad Request error (400)
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static badRequest(message = 'Bad Request') {
    return new ApiError(400, message);
  }

  /**
   * Create an Unauthorized error (401)
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * Create a Forbidden error (403)
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * Create a Not Found error (404)
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  /**
   * Create a Conflict error (409)
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  /**
   * Create an Unprocessable Entity error (422)
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static unprocessableEntity(message = 'Unprocessable Entity') {
    return new ApiError(422, message);
  }

  /**
   * Create an Internal Server Error (500)
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, false);
  }
}

module.exports = ApiError;
