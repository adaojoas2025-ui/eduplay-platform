/**
 * Product Validators
 * Joi validation schemas for product endpoints
 * @module validators/product
 */

const Joi = require('joi');

/**
 * Create product validation schema
 */
const createProductSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().required().min(3).max(200).trim(),
    description: Joi.string().required().min(20).max(5000).trim(),
    price: Joi.number().required().min(0).max(999999.99).precision(2),
    category: Joi.string().required().trim(),
    thumbnailUrl: Joi.string().optional(),
    videoUrl: Joi.string().allow('').optional(),
    filesUrl: Joi.array().items(Joi.string()).optional(),
    features: Joi.array().items(Joi.string().trim()).optional(),
    requirements: Joi.string().max(1000).trim().optional(),
    targetAudience: Joi.string().max(500).trim().optional(),
    duration: Joi.string().max(100).trim().optional(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Iniciante', 'Intermediário', 'Avançado', 'Todos os níveis').default('Todos os níveis'),
    language: Joi.string().max(50).trim().default('Português'),
    certificateIncluded: Joi.boolean().default(false),
    hasSupport: Joi.boolean().default(false),
    supportDuration: Joi.number().integer().min(0).max(365).optional(),
    status: Joi.string().valid('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'ARCHIVED').optional(),
  }),
});

/**
 * Update product validation schema
 */
const updateProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(3).max(200).trim().optional(),
    description: Joi.string().min(20).max(5000).trim().optional(),
    price: Joi.number().min(0).max(999999.99).precision(2).optional(),
    category: Joi.string().trim().optional(),
    thumbnailUrl: Joi.string().optional(),
    videoUrl: Joi.string().allow('').optional(),
    filesUrl: Joi.array().items(Joi.string()).optional(),
    features: Joi.array().items(Joi.string().trim()).optional(),
    requirements: Joi.string().max(1000).trim().optional(),
    targetAudience: Joi.string().max(500).trim().optional(),
    duration: Joi.string().max(100).trim().optional(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Iniciante', 'Intermediário', 'Avançado', 'Todos os níveis').optional(),
    language: Joi.string().max(50).trim().optional(),
    certificateIncluded: Joi.boolean().optional(),
    hasSupport: Joi.boolean().optional(),
    supportDuration: Joi.number().integer().min(0).max(365).optional(),
    status: Joi.string().valid('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'ARCHIVED').optional(),
  }),
});

/**
 * Get product by ID validation schema
 */
const getProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Get product by slug validation schema
 */
const getProductBySlugSchema = Joi.object({
  params: Joi.object({
    slug: Joi.string().required().trim(),
  }),
});

/**
 * Delete product validation schema
 */
const deleteProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * List products validation schema
 */
const listProductsSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),
    search: Joi.string().trim().optional(),
    category: Joi.string().trim().optional(),
    producerId: Joi.string().uuid().optional(),
    status: Joi.string().valid('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'ARCHIVED').optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Iniciante', 'Intermediário', 'Avançado', 'Todos os níveis').optional(),
    sortBy: Joi.string()
      .valid('createdAt', 'title', 'price', 'views', 'sales')
      .default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
});

/**
 * Upload product thumbnail validation schema
 */
const uploadThumbnailSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Upload product files validation schema
 */
const uploadFilesSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Publish product validation schema
 */
const publishProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Archive product validation schema
 */
const archiveProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Increment product views validation schema
 */
const incrementViewsSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
});

/**
 * Add product review validation schema
 */
const addReviewSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(10).max(1000).trim().required(),
  }),
});

/**
 * List product reviews validation schema
 */
const listReviewsSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  getProductBySlugSchema,
  deleteProductSchema,
  listProductsSchema,
  uploadThumbnailSchema,
  uploadFilesSchema,
  publishProductSchema,
  archiveProductSchema,
  incrementViewsSchema,
  addReviewSchema,
  listReviewsSchema,
};
