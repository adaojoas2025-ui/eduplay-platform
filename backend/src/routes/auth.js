const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, me);

module.exports = router;
