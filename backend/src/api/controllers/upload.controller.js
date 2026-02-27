const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const resourceType = (type === 'apk' || type === 'file') ? 'raw' : type;

    // Upload to Cloudinary (images and raw/APK files via signed upload — 100MB limit)
    const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `eduplay/${type}s`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({
              success: false,
              message: 'Upload failed',
              error: error.message,
            });
          }

          res.json({
            success: true,
            data: {
              url: result.secure_url,
              publicId: result.public_id,
            },
          });
        }
      );

    // Pipe the file buffer to Cloudinary
    require('stream').Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadFile,
};
