/**
 * Product Controller
 * Handles HTTP requests for product operations
 * @module controllers/product
 */

const productService = require('../../services/product.service');
const storageService = require('../../services/storage.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Create product
 * @route POST /api/v1/products
 * @access Private (Producer)
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user.id, req.body);

  return ApiResponse.success(res, 201, product, 'Product created successfully');
});

/**
 * Get product by ID
 * @route GET /api/v1/products/:id
 * @access Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const incrementViews = req.query.incrementViews === 'true';
  const product = await productService.getProductById(req.params.id, incrementViews);

  return ApiResponse.success(res, 200, product, 'Product retrieved successfully');
});

/**
 * Get product by slug
 * @route GET /api/v1/products/slug/:slug
 * @access Public
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const incrementViews = req.query.incrementViews === 'true';
  const product = await productService.getProductBySlug(req.params.slug, incrementViews);

  return ApiResponse.success(res, 200, product, 'Product retrieved successfully');
});

/**
 * Update product
 * @route PATCH /api/v1/products/:id
 * @access Private (Producer - owner or Admin)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.user.id, req.body);

  return ApiResponse.success(res, 200, product, 'Product updated successfully');
});

/**
 * Delete product
 * @route DELETE /api/v1/products/:id
 * @access Private (Producer - owner or Admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user.id);

  return ApiResponse.success(res, 200, null, 'Product deleted successfully');
});

/**
 * List products
 * @route GET /api/v1/products
 * @access Public
 */
const listProducts = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    category,
    producerId,
    status,
    minPrice,
    maxPrice,
    level,
    sortBy,
    order,
  } = req.query;

  const filters = {
    search,
    category,
    producerId,
    status,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    level,
  };

  const pagination = { page: parseInt(page), limit: parseInt(limit) };
  const sorting = { sortBy, order };

  const result = await productService.listProducts(filters, pagination, sorting);

  return ApiResponse.paginated(
    res,
    result.products,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    'Products retrieved successfully'
  );
});

/**
 * Publish product
 * @route POST /api/v1/products/:id/publish
 * @access Private (Producer - owner)
 */
const publishProduct = asyncHandler(async (req, res) => {
  const product = await productService.publishProduct(req.params.id, req.user.id);

  return ApiResponse.success(res, 200, product, 'Product published successfully');
});

/**
 * Archive product
 * @route POST /api/v1/products/:id/archive
 * @access Private (Producer - owner or Admin)
 */
const archiveProduct = asyncHandler(async (req, res) => {
  const product = await productService.archiveProduct(req.params.id, req.user.id);

  return ApiResponse.success(res, 200, product, 'Product archived successfully');
});

/**
 * Upload product thumbnail
 * @route POST /api/v1/products/:id/thumbnail
 * @access Private (Producer - owner)
 */
const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const uploadResult = await storageService.uploadThumbnail(req.file, req.params.id);
  const product = await productService.updateProduct(req.params.id, req.user.id, {
    thumbnailUrl: uploadResult.url,
  });

  return ApiResponse.success(
    res,
    200,
    { product, upload: uploadResult },
    'Thumbnail uploaded successfully'
  );
});

/**
 * Upload product video
 * @route POST /api/v1/products/:id/video
 * @access Private (Producer - owner)
 */
const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const uploadResult = await storageService.uploadVideo(req.file, req.params.id);
  const product = await productService.updateProduct(req.params.id, req.user.id, {
    videoUrl: uploadResult.url,
  });

  return ApiResponse.success(
    res,
    200,
    { product, upload: uploadResult },
    'Video uploaded successfully'
  );
});

/**
 * Upload product files
 * @route POST /api/v1/products/:id/files
 * @access Private (Producer - owner)
 */
const uploadFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No files uploaded');
  }

  const uploadResults = await storageService.uploadProductFiles(req.files, req.params.id);
  const fileUrls = uploadResults.map((result) => result.url);

  const product = await productService.updateProduct(req.params.id, req.user.id, {
    filesUrl: fileUrls,
  });

  return ApiResponse.success(
    res,
    200,
    { product, uploads: uploadResults },
    'Files uploaded successfully'
  );
});

/**
 * Get product statistics
 * @route GET /api/v1/products/:id/stats
 * @access Private (Producer - owner or Admin)
 */
const getProductStats = asyncHandler(async (req, res) => {
  const stats = await productService.getProductStats(req.params.id, req.user.id);

  return ApiResponse.success(res, 200, stats, 'Product statistics retrieved successfully');
});

/**
 * Get popular products
 * @route GET /api/v1/products/popular
 * @access Public
 */
const getPopularProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await productService.getPopularProducts(limit);

  return ApiResponse.success(res, 200, products, 'Popular products retrieved successfully');
});

/**
 * Get featured products
 * @route GET /api/v1/products/featured
 * @access Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await productService.getFeaturedProducts(limit);

  return ApiResponse.success(res, 200, products, 'Featured products retrieved successfully');
});

/**
 * Get producer's products
 * @route GET /api/v1/products/producer/:producerId
 * @access Public
 */
const getProducerProducts = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const filters = { status };
  const pagination = { page: parseInt(page), limit: parseInt(limit) };

  const result = await productService.getProducerProducts(
    req.params.producerId,
    filters,
    pagination
  );

  return ApiResponse.paginated(
    res,
    result.products,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    'Producer products retrieved successfully'
  );
});

module.exports = {
  createProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  listProducts,
  publishProduct,
  archiveProduct,
  uploadThumbnail,
  uploadVideo,
  uploadFiles,
  getProductStats,
  getPopularProducts,
  getFeaturedProducts,
  getProducerProducts,
};
