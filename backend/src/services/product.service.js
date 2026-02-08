/**
 * Product Service
 * Business logic for product operations
 * @module services/product
 */

const crypto = require('crypto');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
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

    if (producer.role !== USER_ROLES.PRODUCER && producer.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only producers can create products');
    }

    // Add producer ID and initial status - sempre PENDING_APPROVAL
    const product = await productRepository.createProduct({
      id: crypto.randomUUID(),
      ...productData,
      producerId,
      status: PRODUCT_STATUS.PENDING_APPROVAL,
      views: 0,
      sales: 0,
    });

    logger.info('Product created', { productId: product.id, producerId });

    // Buscar todos os administradores para enviar email
    const admins = await userRepository.findUsersByRole(USER_ROLES.ADMIN);

    logger.info('Sending pending approval emails to admins', {
      productId: product.id,
      adminCount: admins.length,
      adminEmails: admins.map(a => a.email)
    });

    // Enviar email para cada administrador
    for (const admin of admins) {
      try {
        logger.info('Sending email to admin', {
          productId: product.id,
          adminEmail: admin.email,
          productTitle: product.title
        });

        await emailService.sendProductPendingApprovalEmail(admin.email, {
          adminName: admin.name,
          productTitle: product.title,
          producerName: producer.name,
          productId: product.id,
          productDescription: product.description,
        });

        logger.info('Email sent successfully to admin', {
          productId: product.id,
          adminEmail: admin.email
        });
      } catch (emailError) {
        logger.error('FAILED to send email to admin', {
          productId: product.id,
          adminId: admin.id,
          adminEmail: admin.email,
          error: emailError.message,
          stack: emailError.stack
        });
      }
    }

    logger.info('Product created and pending approval - all emails processed', {
      productId: product.id,
      producerId,
      emailsSent: admins.length
    });

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

    // VALIDAÇÃO PROFISSIONAL: Se está publicando o produto, verificar se tem arquivos
    if (updateData.status === PRODUCT_STATUS.PUBLISHED) {
      const filesUrl = updateData.filesUrl !== undefined ? updateData.filesUrl : product.filesUrl;

      if (!filesUrl || filesUrl.length === 0) {
        throw ApiError.badRequest('Para publicar o produto, você precisa adicionar pelo menos 1 arquivo para os compradores baixarem. Produtos digitais precisam ter conteúdo disponível para download.');
      }

      // Validar campos obrigatórios para publicação
      const title = updateData.title !== undefined ? updateData.title : product.title;
      const description = updateData.description !== undefined ? updateData.description : product.description;
      const price = updateData.price !== undefined ? updateData.price : product.price;

      if (!title || !description || !price) {
        throw ApiError.badRequest('Product must have title, description, and price to be published');
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.producerId;

    // Apenas administrador pode mudar o status
    if (updateData.status && user.role !== USER_ROLES.ADMIN) {
      delete updateData.status;
    }
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
 * Publish product (submits for approval)
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

    // VALIDAÇÃO PROFISSIONAL: Produto precisa ter pelo menos 1 arquivo
    if (!product.filesUrl || product.filesUrl.length === 0) {
      throw ApiError.badRequest('Para publicar o produto, você precisa adicionar pelo menos 1 arquivo para os compradores baixarem. Produtos digitais precisam ter conteúdo disponível para download.');
    }

    // Validate required fields before publishing
    if (!product.title || !product.description || !product.price) {
      throw ApiError.badRequest('Product must have title, description, and price to be published');
    }

    // Change status to PENDING_APPROVAL instead of PUBLISHED
    const updatedProduct = await productRepository.updateStatus(productId, PRODUCT_STATUS.PENDING_APPROVAL);

    // Get producer data
    const producer = await userRepository.findUserById(userId);

    // Send email to admin
    await emailService.sendProductSubmittedEmail(updatedProduct, producer);

    logger.info('Product submitted for approval', { productId, userId });

    return updatedProduct;
  } catch (error) {
    logger.error('Error publishing product:', error);
    throw error;
  }
};

/**
 * Approve product
 * @param {string} productId - Product ID
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} Updated product
 */
const approveProduct = async (productId, adminId) => {
  try {
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check admin permission
    const admin = await userRepository.findUserById(adminId);
    if (admin.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can approve products');
    }

    // Check if product is pending approval
    if (product.status !== PRODUCT_STATUS.PENDING_APPROVAL) {
      throw ApiError.badRequest('Product is not pending approval');
    }

    // Update status to PUBLISHED with approval data
    const updatedProduct = await productRepository.updateProduct(productId, {
      status: PRODUCT_STATUS.PUBLISHED,
      approvedBy: adminId,
      approvedAt: new Date()
    });

    // Get producer data
    const producer = await userRepository.findUserById(product.producerId);

    // Send approval email to producer
    try {
      await emailService.sendProductApprovedEmail(updatedProduct, producer);
      logger.info('Approval email sent to producer', {
        productId,
        producerEmail: producer.email
      });
    } catch (emailError) {
      logger.error('Failed to send approval email to producer', {
        productId,
        producerEmail: producer.email,
        error: emailError.message
      });
      // Não bloqueia a aprovação se o email falhar
    }

    logger.info('Product approved', { productId, adminId });

    return updatedProduct;
  } catch (error) {
    logger.error('Error approving product:', error);
    throw error;
  }
};

/**
 * Reject product
 * @param {string} productId - Product ID
 * @param {string} adminId - Admin ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated product
 */
const rejectProduct = async (productId, adminId, reason) => {
  try {
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check admin permission
    const admin = await userRepository.findUserById(adminId);
    if (admin.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Only admins can reject products');
    }

    // Check if product can be rejected (PENDING_APPROVAL or PUBLISHED)
    if (product.status !== PRODUCT_STATUS.PENDING_APPROVAL && product.status !== PRODUCT_STATUS.PUBLISHED) {
      throw ApiError.badRequest('Only pending approval or published products can be rejected');
    }

    if (!reason) {
      throw ApiError.badRequest('Rejection reason is required');
    }

    // Update status to REJECTED
    const updatedProduct = await productRepository.updateStatus(productId, PRODUCT_STATUS.REJECTED);

    // Get producer data
    const producer = await userRepository.findUserById(product.producerId);

    // Send rejection email to producer
    await emailService.sendProductRejectedEmail(updatedProduct, producer, reason);

    logger.info('Product rejected', { productId, adminId, reason });

    return updatedProduct;
  } catch (error) {
    logger.error('Error rejecting product:', error);
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

    if (producer.role !== USER_ROLES.PRODUCER && producer.role !== USER_ROLES.ADMIN) {
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
  approveProduct,
  rejectProduct,
  archiveProduct,
  getProductStats,
  getPopularProducts,
  getFeaturedProducts,
  getProducerProducts,
};
