/**
 * User Validators
 * Joi validation schemas for user endpoints
 * @module validators/user
 */

const Joi = require('joi');

/**
 * Update profile validation schema
 */
const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(100).trim().optional(),
    phone: Joi.string()
      .pattern(/^\d{10,11}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Phone must contain 10 or 11 digits',
      }),
    bio: Joi.string().max(500).trim().optional(),
    avatar: Joi.string().uri().optional(),
    pixKey: Joi.string().max(100).trim().optional(),
  }),
});

/**
 * Update user (admin) validation schema
 */
const updateUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(3).max(100).trim().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    role: Joi.string().valid('ADMIN', 'BUYER', 'PRODUCER').optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED').optional(),
    emailVerified: Joi.boolean().optional(),
    phone: Joi.string().pattern(/^\d{10,11}$/).optional(),
    bio: Joi.string().max(500).trim().optional(),
    avatar: Joi.string().uri().optional(),
    pixKey: Joi.string().max(100).trim().optional(),
  }),
});

/**
 * Get user by ID validation schema
 */
const getUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Delete user validation schema
 */
const deleteUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * List users validation schema
 */
const listUsersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().optional(),
    role: Joi.string().valid('ADMIN', 'BUYER', 'PRODUCER').optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED').optional(),
    sortBy: Joi.string()
      .valid('createdAt', 'name', 'email', 'role', 'status')
      .default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
});

/**
 * Upload avatar validation schema
 */
const uploadAvatarSchema = Joi.object({
  body: Joi.object({
    // File upload is handled by multer middleware
  }),
});

/**
 * Update PIX key validation schema
 */
const updatePixKeySchema = Joi.object({
  body: Joi.object({
    pixKey: Joi.string().required().max(100).trim(),
  }),
});

/**
 * Suspend user validation schema
 */
const suspendUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    reason: Joi.string().required().min(10).max(500).trim(),
    until: Joi.date().greater('now').optional(),
  }),
});

/**
 * Ban user validation schema
 */
const banUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    reason: Joi.string().required().min(10).max(500).trim(),
    permanent: Joi.boolean().default(true),
  }),
});

module.exports = {
  updateProfileSchema,
  updateUserSchema,
  getUserSchema,
  deleteUserSchema,
  listUsersSchema,
  uploadAvatarSchema,
  updatePixKeySchema,
  suspendUserSchema,
  banUserSchema,
};
