const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configure Cloudinary - usando valores diretos (fallback hardcoded)
// IMPORTANTE: O secret tem 'l' minúsculo em 'Eslez', NÃO 'I' maiúsculo
const CLOUDINARY_CONFIG = {
  cloud_name: 'dexlzykqm',
  api_key: '761719984596219',
  api_secret: 'QkAyuumJD-_EslezBPd2UQVYKew',
};

console.log('🔧 Cloudinary config:', {
  cloud_name: CLOUDINARY_CONFIG.cloud_name,
  api_key: CLOUDINARY_CONFIG.api_key ? '***SET***' : '***NOT SET***',
  api_secret: CLOUDINARY_CONFIG.api_secret ? '***SET***' : '***NOT SET***',
});

cloudinary.config(CLOUDINARY_CONFIG);

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
      // For images, use Cloudinary with base64 upload (more reliable)
      console.log('📤 Starting Cloudinary upload...', {
        type,
        resourceType,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      try {
        // Convert buffer to base64 data URI
        const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(base64Data, {
          folder: `eduplay/${type}s`,
          resource_type: resourceType,
        });

        console.log('✅ Cloudinary upload success:', result.secure_url);
        res.json({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
          },
        });
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        console.error('❌ Error details:', JSON.stringify(uploadError, null, 2));
        return res.status(500).json({
          success: false,
          message: 'Upload failed',
          error: uploadError.message,
        });
      }
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
