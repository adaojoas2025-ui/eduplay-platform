const express = require('express');
const router = express.Router();
const emailTestController = require('../controllers/email-test.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Status dos provedores (público — sem autenticação, sem enviar email)
router.get('/status', emailTestController.getEmailStatus);

// Envio de email de teste para o admin (requer autenticação)
router.get('/test-admin-email', authenticate, emailTestController.testEmailToAdmin);

module.exports = router;
