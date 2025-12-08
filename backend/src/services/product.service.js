/**
 * Product Service
 * Business logic for product operations
 * @module services/product
 */

const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { USER_ROLES, PRODUCT_STATUS } = require('../utils/constants');

/**
 * Create a new product
 * @param {string} producerId - Producer ID
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product
 */
const createProduct = async (producerId, productData) => {
  try {
    // Verify producer exists and is actually a producer
    const producer = await userRepository.findUserById(producerId);
    if (!producer) {
      throw ApiError.notFound('Producer not found');
    }

    if (producer.role !== USER_ROLES.PRODUCER) {
      throw ApiError.forbidden('Only producers can create products');
    }

    // Add producer ID and initial status
    const product = await productRepository.createProduct({
      ...productData,
      producerId,
      status: PRODUCT_STATUS.DRAFT,
      views: 0,
      sales: 0,
    });

    logger.info('Product created', { productId: product.id, producerId });

    return product;
  } catch (error) {
    logger.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @param {boolean} incrementViews - Whether to increment view count
 * @returns {Promise<Object>} Product
 */
const getProductById = async (productId, incrementViews = false) => {
  try {
    const product = await productRepository.findProductById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Increment views if requested
    if (incrementViews && product.status === PRODUCT_STATUS.PUBLISHED) {
      await productRepository.incrementViews(productId);
    }

    return product;
  } catch (error) {
    logger.error('Error getting product by ID:', error);
    throw error;
  }
};

/**
 * Get product by slug
 * @param {string} slug - Product slug
 * @param {boolean} incrementViews - Whether to increment view count
 * @returns {Promise<Object>} Product
 */
const getProductBySlug = async (slug, incrementViews = false) => {
  try {
    const product = await productRepository.findProductBySlug(slug);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Increment views if requested
    if (incrementViews && product.status === PRODUCT_STATUS.PUBLISHED) {
      await productRepository.incrementViews(product.id);
    }

    return product;
  } catch (error) {
    logger.error('Error getting product by slug:', error);
    throw error;
  }
};

/**
 * Update product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (must be owner or admin)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated product
 */
const updateProduct = async (productId, userId, updateData) => {
  try {
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check ownership
    const user = await userRepository.findUserById(userId);
    if (product.producerId !== userId && user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have permission to update this product');
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.producerId;
    delete updateData.views;
    delete updateData.sales;
    delete updateData.slug;

    const updatedProduct = await productRepository.updateProduct(productId, updateData);

    logger.info('Product updated', { productId, userId });

    return updatedProduct;
  } catch (error) {
    logger.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (must be owner or admin)
 * @returns {Promise<void>}
 */
const deleteProduct = async (productId, userId) => {
  try {
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check ownership
    const user = await userRepository.findUserById(userId);
    if (product.producerId !== userId && user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have permission to delete this product');
    }

    await productRepository.deleteProduct(productId);

    logger.info('Product deleted', { productId, userId });
  } catch (error) {
    logger.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * List products with filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @param {Object} sorting - Sorting options
 * @returns {Promise<Object>} Products list with pagination
 */
const listProducts = async (filters, pagination, sorting) => {
  try {
    const result = await productRepository.listProducts(filters, pagination, sorting);

    logger.info('Products listed', { count: result.products.length, total: result.pagination.total });

    return result;
  } catch (error) {
    logger.error('Error listing products:', error);
    throw error;
  }
};

/**
 * Publish product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (must be owner)
 * @returns {Promise<Object>} Updated product
 */
const publishProduct = async (productId, userId) => {
  try {
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check ownership
    if (product.producerId !== userId) {
      throw ApiError.forbidden('You do not have permission to publish this product');
    }

    // Validate required fields before publishing
    if (!product.title || !product.description || !product.price) {
      throw ApiError.badRequest('Product must have title, description, and price to be published');
    }

    if (!product.thumbnailUrl) {
      throw ApiError.badRequest('Product must have a thumbnail to be published');
    }

    const updatedProduct = await productRepository.updateStatus(productId, PRODUCT_STATUS.PUBLISHED);

    logger.info('Product published', { productId, userId });

    return updatedProduct;
  } catch (error) {
    logger.error('Error publishing product:', error);
    throw error;
  }
};

/**
 * Archive product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (must be owner or admin)
 * @returns {Promise<Object>} Updated product
 */
const archiveProduct = async (productId, userId) => {
  try {
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check ownership
    const user = await userRepository.findUserById(userId);
    if (product.producerId !== userId && user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have permission to archive this product');
    }

    const updatedProduct = await productRepository.updateStatus(productId, PRODUCT_STATUS.ARCHIVED);

    logger.info('Product archived', { productId, userId });

    return updatedProduct;
  } catch (error) {
    logger.error('Error archiving product:', error);
    throw error;
  }
};

/**
 * Get product statistics
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (must be owner or admin)
 * @returns {Promise<Object>} Product statistics
 */
const getProductStats = async (productId, userId) => {
  try {
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check ownership
    const user = await userRepository.findUserById(userId);
    if (product.producerId !== userId && user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('You do not have permission to view this product statistics');
    }

    const stats = await productRepository.getProductStats(productId);

    logger.info('Product stats retrieved', { productId, userId });

    return stats;
  } catch (error) {
    logger.error('Error getting product stats:', error);
    throw error;
  }
};

/**
 * Get popular products
 * @param {number} limit - Number of products
 * @returns {Promise<Array>} Popular products
 */
const getPopularProducts = async (limit = 10) => {
  try {
    const products = await productRepository.getPopularProducts(limit);

    logger.info('Popular products retrieved', { count: products.length });

    return products;
  } catch (error) {
    logger.error('Error getting popular products:', error);
    throw error;
  }
};

/**
 * Get featured products
 * @param {number} limit - Number of products
 * @returns {Promise<Array>} Featured products
 */
const getFeaturedProducts = async (limit = 10) => {
  try {
    const products = await productRepository.getFeaturedProducts(limit);

    logger.info('Featured products retrieved', { count: products.length });

    return products;
  } catch (error) {
    logger.error('Error getting featured products:', error);
    throw error;
  }
};

/**
 * Get producer's products
 * @param {string} producerId - Producer ID
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Producer's products
 */
const getProducerProducts = async (producerId, filters = {}, pagination = {}) => {
  try {
    const producer = await userRepository.findUserById(producerId);
    if (!producer) {
      throw ApiError.notFound('Producer not found');
    }

    if (producer.role !== USER_ROLES.PRODUCER) {
      throw ApiError.badRequest('User is not a producer');
    }

    const result = await productRepository.listProducts(
      { ...filters, producerId },
      pagination,
      { sortBy: 'createdAt', order: 'desc' }
    );

    logger.info('Producer products retrieved', { producerId, count: result.products.length });

    return result;
  } catch (error) {
    logger.error('Error getting producer products:', error);
    throw error;
  }
};

module.exports = {
  createProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  listProducts,
  publishProduct,
  archiveProduct,
  getProductStats,
  getPopularProducts,
  getFeaturedProducts,
  getProducerProducts,
};
