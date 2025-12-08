const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config/env');

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      throw ApiError.forbidden('Account suspended or banned');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token');
    }
    throw error;
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('Admin access required');
  }

  next();
});

const isProducer = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.role !== 'PRODUCER' && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('Producer access required');
  }

  next();
});

module.exports = {
  authenticate,
  protect: authenticate,  // Alias for convenience
  isAdmin,
  isProducer,
};
