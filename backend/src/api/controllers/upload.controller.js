const { cloudinary } = require('../../config/cloudinary');
const { bucket } = require('../../config/firebase');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

/**
 * Upload APK to Firebase Storage
 */
const uploadToFirebase = async (file, type) => {
  if (!bucket) {
    throw new Error('Firebase Storage not configured');
  }

  const ext = path.extname(file.originalname) || '.apk';
  const uniqueName = `eduplay/${type}s/${crypto.randomUUID()}${ext}`;
  const fileRef = bucket.file(uniqueName);

  await fileRef.save(file.buffer, {
    metadata: { contentType: file.mimetype || 'application/vnd.android.package-archive' },
  });

  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${uniqueName}`;
  return { url, publicId: uniqueName };
};

/**
 * Upload file
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

    // APK/raw files → Firebase Storage (no size limit issues)
    if (type === 'apk' || type === 'file') {
      const result = await uploadToFirebase(req.file, type);
      return res.json({ success: true, data: result });
    }

    // Images → Cloudinary
    const b64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'application/octet-stream';
    const dataURI = `data:${mimeType};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `eduplay/${type}s`,
      resource_type: 'auto',
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Upload error:', error.message || JSON.stringify(error));
    res.status(500).json({
      success: false,
      message: error.message || 'Upload failed',
    });
  }
};

module.exports = {
  upload,
  uploadFile,
};
