const { cloudinary } = require('../../config/cloudinary');
const { supabase } = require('../../config/supabase');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

/**
 * Upload APK to Supabase Storage
 */
const uploadToSupabase = async (file) => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const ext = path.extname(file.originalname) || '.apk';
  const fileName = `${crypto.randomUUID()}${ext}`;
  const bucket = 'Apks';

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype || 'application/vnd.android.package-archive',
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return { url: data.publicUrl, publicId: fileName };
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
