/**
 * Product Routes
 * Routes for product endpoints
 * @module routes/product
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validator.middleware');
const { single, multiple } = require('../middlewares/upload.middleware');
const productValidator = require('../validators/product.validator');
const { USER_ROLES } = require('../../utils/constants');

/**
 * Public routes
 */

/**
 * @route   GET /api/v1/products
 * @desc    List products
 * @access  Public
 */
router.get('/', validate(productValidator.listProductsSchema), productController.listProducts);

/**
 * @route   GET /api/v1/products/popular
 * @desc    Get popular products
 * @access  Public
 */
router.get('/popular', productController.getPopularProducts);

/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/v1/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get(
  '/slug/:slug',
  validate(productValidator.getProductBySlugSchema),
  productController.getProductBySlug
);

/**
 * @route   GET /api/v1/products/producer/:producerId
 * @desc    Get producer's products
 * @access  Public
 */
router.get('/producer/:producerId', productController.getProducerProducts);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(productValidator.getProductSchema),
  productController.getProductById
);

/**
 * Producer routes
 */

/**
 * @route   POST /api/v1/products
 * @desc    Create product
 * @access  Private (Producer)
 */
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(productValidator.createProductSchema),
  productController.createProduct
);

/**
 * @route   PATCH /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Producer - owner or Admin)
 */
router.patch(
  '/:id',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(productValidator.updateProductSchema),
  productController.updateProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product (alias for PATCH)
 * @access  Private (Producer - owner or Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(productValidator.updateProductSchema),
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (Producer - owner or Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(productValidator.deleteProductSchema),
  productController.deleteProduct
);

/**
 * @route   POST /api/v1/products/:id/publish
 * @desc    Publish product
 * @access  Private (Producer - owner)
 */
router.post(
  '/:id/publish',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(productValidator.publishProductSchema),
  productController.publishProduct
);

/**
 * @route   POST /api/v1/products/:id/archive
 * @desc    Archive product
 * @access  Private (Producer - owner or Admin)
 */
router.post(
  '/:id/archive',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  validate(productValidator.archiveProductSchema),
  productController.archiveProduct
);

/**
 * @route   POST /api/v1/products/:id/thumbnail
 * @desc    Upload product thumbnail
 * @access  Private (Producer - owner)
 */
router.post(
  '/:id/thumbnail',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  single('thumbnail'),
  validate(productValidator.uploadThumbnailSchema),
  productController.uploadThumbnail
);

/**
 * @route   POST /api/v1/products/:id/video
 * @desc    Upload product video
 * @access  Private (Producer - owner)
 */
router.post(
  '/:id/video',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  single('video'),
  productController.uploadVideo
);

/**
 * @route   POST /api/v1/products/:id/files
 * @desc    Upload product files
 * @access  Private (Producer - owner)
 */
router.post(
  '/:id/files',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  multiple('files', 10),
  validate(productValidator.uploadFilesSchema),
  productController.uploadFiles
);

/**
 * @route   GET /api/v1/products/:id/stats
 * @desc    Get product statistics
 * @access  Private (Producer - owner or Admin)
 */
router.get(
  '/:id/stats',
  authenticate,
  authorize(USER_ROLES.PRODUCER, USER_ROLES.ADMIN),
  productController.getProductStats
);

module.exports = router;
