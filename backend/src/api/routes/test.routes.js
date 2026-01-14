/**
 * Test Routes
 * Rotas para simulação e testes
 */

const express = require('express');
const router = express.Router();
const testPaymentController = require('../controllers/test-payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const authService = require('../../services/auth.service');

// Aprovar pagamento de teste
router.post('/approve-payment/:orderId', authenticate, testPaymentController.approveTestPayment);

// DEBUG: Test user registration to see real error
router.post('/debug-register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
  }
});

module.exports = router;
