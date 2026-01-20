const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configure Cloudinary
console.log('🔧 Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***SET***' : '***NOT SET***',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***SET***' : '***NOT SET***',
});

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

    // For APK files (large files), save to server's public/uploads directory
    if (resourceType === 'raw') {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'apks');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, filename);

      // Save file to server
      fs.writeFileSync(filePath, req.file.buffer);

      // Generate public URL
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const publicUrl = `${baseUrl}/uploads/apks/${filename}`;

      return res.json({
        success: true,
        data: {
          url: publicUrl,
          publicId: filename,
        },
      });
    } else {
      // For images, continue using Cloudinary
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
    }
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
