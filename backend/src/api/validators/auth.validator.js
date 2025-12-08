/**
 * Authentication Validators
 * Joi validation schemas for authentication endpoints
 * @module validators/auth
 */

const Joi = require('joi');

/**
 * Register validation schema
 */
const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required().min(3).max(100).trim(),
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string()
      .required()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    role: Joi.string().valid('BUYER', 'PRODUCER').default('BUYER'),
    cpf: Joi.string()
      .pattern(/^\d{11}$/)
      .when('role', {
        is: 'PRODUCER',
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        'string.pattern.base': 'CPF must contain exactly 11 digits',
      }),
    phone: Joi.string().pattern(/^\d{10,11}$/).optional().messages({
      'string.pattern.base': 'Phone must contain 10 or 11 digits',
    }),
  }),
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required(),
  }),
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().required().email().lowercase().trim(),
  }),
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .required()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
  }),
});

/**
 * Verify email validation schema
 */
const verifyEmailSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().required(),
  }),
});

/**
 * Change password validation schema
 */
const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .required()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .invalid(Joi.ref('currentPassword'))
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.invalid': 'New password must be different from current password',
      }),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
};
