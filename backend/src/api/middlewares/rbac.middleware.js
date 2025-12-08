const ApiError = require('../../utils/ApiError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  };
};

const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const resourceOwnerId = req.resource?.[resourceField];

    if (!resourceOwnerId) {
      return next();
    }

    if (resourceOwnerId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Access denied to this resource');
    }

    next();
  };
};

module.exports = { authorize, checkOwnership };
