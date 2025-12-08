const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const { HTTP_STATUS } = require('../../utils/constants');

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Ensure statusCode is always valid
  if (!statusCode || typeof statusCode !== 'number') {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = { errorConverter, errorHandler };
