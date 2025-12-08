const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductFiles,
  uploadThumbnail,
  getMyProducts,
} = require('../controllers/productController');
const { authenticateToken, authorizeRole, requireApproved } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Producer routes
router.post(
  '/',
  authenticateToken,
  authorizeRole('PRODUCER'),
  requireApproved,
  createProduct
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRole('PRODUCER', 'ADMIN'),
  updateProduct
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole('PRODUCER', 'ADMIN'),
  deleteProduct
);
router.post(
  '/:id/files',
  authenticateToken,
  authorizeRole('PRODUCER', 'ADMIN'),
  upload.array('files', 10),
  uploadProductFiles
);
router.post(
  '/:id/thumbnail',
  authenticateToken,
  authorizeRole('PRODUCER', 'ADMIN'),
  upload.single('thumbnail'),
  uploadThumbnail
);
router.get(
  '/my/products',
  authenticateToken,
  authorizeRole('PRODUCER'),
  getMyProducts
);

module.exports = router;
