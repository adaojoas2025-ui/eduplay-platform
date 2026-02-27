/**
 * Cloudinary Configuration
 * Cloud storage for media files
 * @module config/cloudinary
 */

const cloudinary = require('cloudinary').v2;
const config = require('./env');
const logger = require('../utils/logger');

/**
 * Configure Cloudinary - com fallback para valores diretos
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudName || 'dexlzykqm',
  api_key: config.cloudinary.apiKey || '761719984596219',
  api_secret: config.cloudinary.apiSecret || 'QkAyuumJD-_EslezBPd2UQVYKew',
  secure: true,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadFile = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'eduplay',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    };

    const result = await cloudinary.uploader.upload(filePath, {
      ...defaultOptions,
      ...options,
    });

    logger.info('File uploaded to Cloudinary', {
      publicId: result.public_id,
      url: result.secure_url,
    });

    return result;
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - File public ID
 * @param {Object} options - Delete options
 * @returns {Promise<Object>} Delete result
 */
const deleteFile = async (publicId, options = {}) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, options);
    logger.info('File deleted from Cloudinary', { publicId });
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Generate signed URL for private files
 * @param {string} publicId - File public ID
 * @param {Object} options - URL options
 * @returns {string} Signed URL
 */
const getSignedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    sign_url: true,
    ...options,
  });
};

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile,
  getSignedUrl,
};
