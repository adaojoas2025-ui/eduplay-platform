/**
 * Standardized API Response class
 * Ensures consistent response format across the application
 * @module utils/ApiResponse
 */

class ApiResponse {
  /**
   * Create an API Response
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response data
   * @param {string} message - Response message
   */
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /**
   * Send successful response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response data
   * @param {string} message - Response message
   * @returns {Object}
   */
  static success(res, statusCode = 200, data = null, message = 'Success') {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  /**
   * Send created response (201)
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Response message
   * @returns {Object}
   */
  static created(res, data, message = 'Resource created successfully') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }

  /**
   * Send no content response (204)
   * @param {Object} res - Express response object
   * @returns {Object}
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} items - Array of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items count
   * @param {string} message - Response message
   * @returns {Object}
   */
  static paginated(res, items, page, limit, total, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const data = {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };

    return res.status(200).json(new ApiResponse(200, data, message));
  }
}

module.exports = ApiResponse;
