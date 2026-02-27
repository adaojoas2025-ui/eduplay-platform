const { cloudinary } = require('../../config/cloudinary');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

/**
 * Upload file to Cloudinary
 * POST /api/v1/upload
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const { type = 'image' } = req.body;
    const resourceType = (type === 'apk' || type === 'file') ? 'raw' : 'auto';

    // Convert buffer to base64 data URI — more reliable than upload_stream with pipe
    const b64 = req.file.buffer.toString('base64');
    const mimeType = type === 'apk' ? 'application/vnd.android.package-archive' : (req.file.mimetype || 'application/octet-stream');
    const dataURI = `data:${mimeType};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `eduplay/${type}s`,
      resource_type: resourceType,
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Upload error:', JSON.stringify(error));
    res.status(500).json({
      success: false,
      message: error.message || 'Upload failed',
      http_code: error.http_code,
    });
  }
};

module.exports = {
  upload,
  uploadFile,
};
