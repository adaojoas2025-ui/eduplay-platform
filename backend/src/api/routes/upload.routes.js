const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/upload.controller');
const { protect } = require('../middlewares/auth.middleware');

// POST /api/v1/upload - Upload file to Cloudinary
router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;
