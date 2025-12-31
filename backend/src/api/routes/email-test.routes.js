const express = require('express');
const router = express.Router();
const emailTestController = require('../controllers/email-test.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Endpoint de teste (autenticado)
router.get('/test-admin-email', authenticate, emailTestController.testEmailToAdmin);

module.exports = router;
