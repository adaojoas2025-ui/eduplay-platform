/**
 * Product Repository
 * Data access layer for product operations
 * @module repositories/product
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');
const slugify = require('slugify');

/**
 * Generate unique slug for product
 * @param {string} title - Product title
 * @returns {Promise<string>} Unique slug
 */
const generateUniqueSlug = async (title) => {
  try {
    let slug = slugify(title, { lower: true, strict: true });
    let count = 0;
    let uniqueSlug = slug;

    // Check if slug exists, append number if needed
    while (await prisma.products.findUnique({ where: { slug: uniqueSlug } })) {
      count++;
      uniqueSlug = `${slug}-${count}`;
    }

    return uniqueSlug;
  } catch (error) {
    logger.error('Error generating unique slug:', error);
    throw error;
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product
 */
const createProduct = async (productData) => {
  try {
    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = await generateUniqueSlug(productData.title);
    }

    const product = await prisma.products.create({
      data: productData,
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    logger.info('Product created', { productId: product.id });
    return product;
  } catch (error) {
    logger.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Find product by ID
 * @param {string} productId - Product ID
 * @param {Object} options - Query options (include, select)
 * @returns {Promise<Object|null>} Product or null
 */
const findProductById = async (productId, options = {}) => {
  try {
    return await prisma.products.findUnique({
      where: { id: productId },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        ...options.include,
      },
      ...options,
    });
  } catch (error) {
    logger.error('Error finding product by ID:', error);
    throw error;
  }
};

/**
 * Find product by slug
 * @param {string} slug - Product slug
 * @param {Object} options - Query options (include, select)
 * @returns {Promise<Object|null>} Product or null
 */
const findProductBySlug = async (slug, options = {}) => {
  try {
    return await prisma.products.findUnique({
      where: { slug },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        ...options.include,
      },
      ...options,
    });
  } catch (error) {
    logger.error('Error finding product by slug:', error);
    throw error;
  }
};

/**
 * Update product by ID
 * @param {string} productId - Product ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated product
 */
const updateProduct = async (productId, updateData) => {
  try {
    // Update slug if title changed
    if (updateData.title) {
      const currentProduct = await prisma.products.findUnique({
        where: { id: productId },
        select: { title: true },
      });

      if (currentProduct.title !== updateData.title) {
        updateData.slug = await generateUniqueSlug(updateData.title);
      }
    }

    const product = await prisma.products.update({
      where: { id: productId },
      data: updateData,
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    logger.info('Product updated', { productId: product.id });
    return product;
  } catch (error) {
    logger.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Deleted product
 */
const deleteProduct = async (productId) => {
  try {
    const product = await prisma.products.delete({
      where: { id: productId },
    });
    logger.info('Product deleted', { productId: product.id });
    return product;
  } catch (error) {
    logger.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * List products with pagination and filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options (page, limit)
 * @param {Object} sorting - Sorting options (sortBy, order)
 * @returns {Promise<Object>} Products list with pagination metadata
 */
const listProducts = async (filters = {}, pagination = {}, sorting = {}) => {
  try {
    const { page = 1, limit = 12 } = pagination;
    const { sortBy = 'createdAt', order = 'desc' } = sorting;
    const skip = (page - 1) * limit;

    const where = {};

    // Apply filters
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    if (filters.producerId) {
      where.producerId = filters.producerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.level) {
      where.level = filters.level;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          producer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.products.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error listing products:', error);
    throw error;
  }
};

/**
 * Increment product views
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Updated product
 */
const incrementViews = async (productId) => {
  try {
    return await prisma.products.update({
      where: { id: productId },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    logger.error('Error incrementing views:', error);
    throw error;
  }
};

/**
 * Increment product sales
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Updated product
 */
const incrementSales = async (productId) => {
  try {
    return await prisma.products.update({
      where: { id: productId },
      data: {
        sales: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    logger.error('Error incrementing sales:', error);
    throw error;
  }
};

/**
 * Update product status
 * @param {string} productId - Product ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated product
 */
const updateStatus = async (productId, status) => {
  try {
    return await updateProduct(productId, { status });
  } catch (error) {
    logger.error('Error updating product status:', error);
    throw error;
  }
};

/**
 * Get product statistics
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product statistics
 */
const getProductStats = async (productId) => {
  try {
    const [product, totalSales, totalRevenue, avgRating] = await Promise.all([
      prisma.products.findUnique({
        where: { id: productId },
        select: {
          views: true,
          sales: true,
        },
      }),
      prisma.orders.count({
        where: {
          productId,
          status: 'COMPLETED',
        },
      }),
      prisma.orders.aggregate({
        where: {
          productId,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.reviews.aggregate({
        where: { productId },
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      views: product?.views || 0,
      sales: totalSales,
      revenue: totalRevenue._sum.amount || 0,
      avgRating: avgRating._avg.rating || 0,
    };
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
    return await prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
      },
      take: limit,
      orderBy: {
        sales: 'desc',
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
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
    return await prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
        featured: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error getting featured products:', error);
    throw error;
  }
};

module.exports = {
  createProduct,
  findProductById,
  findProductBySlug,
  updateProduct,
  deleteProduct,
  listProducts,
  incrementViews,
  incrementSales,
  updateStatus,
  getProductStats,
  getPopularProducts,
  getFeaturedProducts,
  generateUniqueSlug,
};
