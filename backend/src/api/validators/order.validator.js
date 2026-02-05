/**
 * Order Validators
 * Joi validation schemas for order endpoints
 * @module validators/order
 */

const Joi = require('joi');

/**
 * Create order validation schema
 */
const createOrderSchema = Joi.object({
  body: Joi.object({
    productId: Joi.string().uuid().required(),
    paymentMethod: Joi.string().valid('CREDIT_CARD', 'PIX', 'BOLETO', 'CARD', 'INSTANT_TEST', 'TEST').default('PIX'),
    paymentType: Joi.string().valid('pix', 'card').default('pix'),
  }),
});

/**
 * Get order by ID validation schema
 */
const getOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * List orders validation schema
 */
const listOrdersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string()
      .valid('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED')
      .optional(),
    productId: Joi.string().uuid().optional(),
    buyerId: Joi.string().uuid().optional(),
    producerId: Joi.string().uuid().optional(),
    paymentMethod: Joi.string().valid('CREDIT_CARD', 'PIX', 'BOLETO').optional(),
    minAmount: Joi.number().min(0).optional(),
    maxAmount: Joi.number().min(0).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    sortBy: Joi.string()
      .valid('createdAt', 'amount', 'status', 'paymentMethod')
      .default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
});

/**
 * Cancel order validation schema
 */
const cancelOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    reason: Joi.string().required().min(10).max(500).trim(),
  }),
});

/**
 * Refund order validation schema
 */
const refundOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    reason: Joi.string().required().min(10).max(500).trim(),
    amount: Joi.number().min(0).optional(),
  }),
});

/**
 * Update order status (admin) validation schema
 */
const updateOrderStatusSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED')
      .required(),
    notes: Joi.string().max(500).trim().optional(),
  }),
});

/**
 * Get order statistics validation schema
 */
const getOrderStatsSchema = Joi.object({
  query: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    producerId: Joi.string().uuid().optional(),
  }),
});

/**
 * Process payment callback validation schema
 */
const paymentCallbackSchema = Joi.object({
  body: Joi.object({
    action: Joi.string().required(),
    api_version: Joi.string().optional(),
    data: Joi.object({
      id: Joi.string().required(),
    }).unknown(true),
    date_created: Joi.string().optional(),
    id: Joi.number().optional(),
    live_mode: Joi.boolean().optional(),
    type: Joi.string().optional(),
    user_id: Joi.string().optional(),
  }).unknown(true),
});

/**
 * Verify payment status validation schema
 */
const verifyPaymentSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Download product files validation schema
 */
const downloadFilesSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Request invoice validation schema
 */
const requestInvoiceSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    cpf: Joi.string()
      .pattern(/^\d{11}$/)
      .optional()
      .messages({
        'string.pattern.base': 'CPF must contain exactly 11 digits',
      }),
    cnpj: Joi.string()
      .pattern(/^\d{14}$/)
      .optional()
      .messages({
        'string.pattern.base': 'CNPJ must contain exactly 14 digits',
      }),
    companyName: Joi.string().max(200).trim().optional(),
    address: Joi.object({
      street: Joi.string().required().trim(),
      number: Joi.string().required().trim(),
      complement: Joi.string().trim().optional(),
      neighborhood: Joi.string().required().trim(),
      city: Joi.string().required().trim(),
      state: Joi.string().required().length(2).uppercase(),
      zipCode: Joi.string()
        .required()
        .pattern(/^\d{8}$/)
        .messages({
          'string.pattern.base': 'ZIP code must contain exactly 8 digits',
        }),
    }).optional(),
  }),
});

module.exports = {
  createOrderSchema,
  getOrderSchema,
  listOrdersSchema,
  cancelOrderSchema,
  refundOrderSchema,
  updateOrderStatusSchema,
  getOrderStatsSchema,
  paymentCallbackSchema,
  verifyPaymentSchema,
  downloadFilesSchema,
  requestInvoiceSchema,
};
