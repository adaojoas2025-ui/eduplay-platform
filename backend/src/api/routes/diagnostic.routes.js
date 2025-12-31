const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnostic.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Endpoints de diagnóstico (todos autenticados)
router.get('/recent-products', authenticate, diagnosticController.checkRecentProducts);
router.post('/test-email', authenticate, diagnosticController.testEmailToAddress);

module.exports = router;
