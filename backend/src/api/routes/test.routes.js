/**
 * Test Routes
 * Rotas para simulação e testes
 */

const express = require('express');
const router = express.Router();
const testPaymentController = require('../controllers/test-payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Aprovar pagamento de teste
router.post('/approve-payment/:orderId', authenticate, testPaymentController.approveTestPayment);

module.exports = router;
