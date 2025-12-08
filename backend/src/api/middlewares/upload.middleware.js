/**
 * Upload Middleware
 * Handles file uploads using Multer
 * @module middlewares/upload
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Uploads directory created');
}

/**
 * Configure storage
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter for allowed types
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/mpeg',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn('File type not allowed:', { mimetype: file.mimetype });
    cb(ApiError.badRequest(`File type not allowed: ${file.mimetype}`), false);
  }
};

/**
 * Multer configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default
  },
});

/**
 * Handle multer errors
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest('File size too large'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(ApiError.badRequest('Too many files'));
    }
    return next(ApiError.badRequest(err.message));
  }

  if (err) {
    return next(err);
  }

  next();
};

module.exports = {
  upload,
  handleUploadError,
  single: (fieldName) => [upload.single(fieldName), handleUploadError],
  multiple: (fieldName, maxCount = 10) => [
    upload.array(fieldName, maxCount),
    handleUploadError,
  ],
  fields: (fields) => [upload.fields(fields), handleUploadError],
};
