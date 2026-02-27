const { cloudinary } = require('../../config/cloudinary');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = 'Apks';

/**
 * Upload APK to Supabase Storage via REST API
 */
const uploadToSupabase = async (file) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase not configured');
  }

  const ext = path.extname(file.originalname) || '.apk';
  const fileName = `${crypto.randomUUID()}${ext}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${fileName}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': file.mimetype || 'application/vnd.android.package-archive',
    },
    body: file.buffer,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Supabase upload failed: ${response.status}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`;
  return { url: publicUrl, publicId: fileName };
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

    // APK/raw files → Supabase Storage (no size limit issues)
    if (type === 'apk' || type === 'file') {
      const result = await uploadToSupabase(req.file);
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
    console.error('Upload error:', error.message);
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
