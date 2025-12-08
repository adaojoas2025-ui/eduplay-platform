/**
 * Storage Service
 * Business logic for file storage operations using Cloudinary
 * @module services/storage
 */

const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload file to Cloudinary
 * @param {Object} file - File object from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadFile = async (file, options = {}) => {
  try {
    if (!file) {
      throw ApiError.badRequest('No file provided');
    }

    const result = await cloudinary.uploadFile(file.path, {
      folder: options.folder || 'eduplay',
      resource_type: options.resourceType || 'auto',
      ...options,
    });

    // Delete local file after upload
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      logger.warn('Failed to delete local file:', unlinkError);
    }

    logger.info('File uploaded to Cloudinary', {
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload avatar image
 * @param {Object} file - File object from multer
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result
 */
const uploadAvatar = async (file, userId) => {
  try {
    const result = await uploadFile(file, {
      folder: 'eduplay/avatars',
      transformation: {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
      },
      public_id: `avatar_${userId}`,
    });

    logger.info('Avatar uploaded', { userId, url: result.url });

    return result;
  } catch (error) {
    logger.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Upload product thumbnail
 * @param {Object} file - File object from multer
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Upload result
 */
const uploadThumbnail = async (file, productId) => {
  try {
    const result = await uploadFile(file, {
      folder: 'eduplay/thumbnails',
      transformation: {
        width: 800,
        height: 450,
        crop: 'fill',
      },
      public_id: `thumbnail_${productId}`,
    });

    logger.info('Thumbnail uploaded', { productId, url: result.url });

    return result;
  } catch (error) {
    logger.error('Error uploading thumbnail:', error);
    throw error;
  }
};

/**
 * Upload product video
 * @param {Object} file - File object from multer
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Upload result
 */
const uploadVideo = async (file, productId) => {
  try {
    const result = await uploadFile(file, {
      folder: 'eduplay/videos',
      resourceType: 'video',
      public_id: `video_${productId}_${Date.now()}`,
    });

    logger.info('Video uploaded', { productId, url: result.url });

    return result;
  } catch (error) {
    logger.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Upload product files (course materials)
 * @param {Array} files - Array of file objects from multer
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Upload results
 */
const uploadProductFiles = async (files, productId) => {
  try {
    if (!files || files.length === 0) {
      throw ApiError.badRequest('No files provided');
    }

    const uploadPromises = files.map((file, index) =>
      uploadFile(file, {
        folder: 'eduplay/materials',
        public_id: `material_${productId}_${index}_${Date.now()}`,
      })
    );

    const results = await Promise.all(uploadPromises);

    logger.info('Product files uploaded', { productId, count: results.length });

    return results;
  } catch (error) {
    logger.error('Error uploading product files:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Delete result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.deleteFile(publicId);

    logger.info('File deleted from Cloudinary', { publicId });

    return result;
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<string>} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Array>} Delete results
 */
const deleteMultipleFiles = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) => cloudinary.deleteFile(publicId));
    const results = await Promise.all(deletePromises);

    logger.info('Multiple files deleted from Cloudinary', { count: publicIds.length });

    return results;
  } catch (error) {
    logger.error('Error deleting multiple files:', error);
    throw error;
  }
};

/**
 * Get signed URL for private file access
 * @param {string} publicId - Cloudinary public ID
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {string} Signed URL
 */
const getSignedUrl = (publicId, expiresIn = 3600) => {
  try {
    const url = cloudinary.getSignedUrl(publicId, expiresIn);

    logger.info('Signed URL generated', { publicId, expiresIn });

    return url;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} Public ID
 */
const extractPublicId = (url) => {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    const parts = url.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after 'upload/v{version}/'
    const pathParts = parts.slice(uploadIndex + 2);
    const publicIdWithExtension = pathParts.join('/');

    // Remove file extension
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    logger.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} File info
 */
const getFileInfo = async (publicId) => {
  try {
    const info = await cloudinary.getResourceInfo(publicId);

    logger.info('File info retrieved', { publicId });

    return {
      publicId: info.public_id,
      format: info.format,
      resourceType: info.resource_type,
      size: info.bytes,
      width: info.width,
      height: info.height,
      url: info.secure_url,
      createdAt: info.created_at,
    };
  } catch (error) {
    logger.error('Error getting file info:', error);
    throw error;
  }
};

/**
 * Validate file type
 * @param {Object} file - File object from multer
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if valid
 */
const validateFileType = (file, allowedTypes) => {
  if (!file || !file.mimetype) {
    return false;
  }

  return allowedTypes.includes(file.mimetype);
};

/**
 * Validate file size
 * @param {Object} file - File object from multer
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} True if valid
 */
const validateFileSize = (file, maxSize) => {
  if (!file || !file.size) {
    return false;
  }

  return file.size <= maxSize;
};

module.exports = {
  uploadFile,
  uploadAvatar,
  uploadThumbnail,
  uploadVideo,
  uploadProductFiles,
  deleteFile,
  deleteMultipleFiles,
  getSignedUrl,
  extractPublicId,
  getFileInfo,
  validateFileType,
  validateFileSize,
};
