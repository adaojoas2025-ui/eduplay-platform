/**
 * Test Routes
 * Rotas para simulação e testes
 */

const express = require('express');
const router = express.Router();
const testPaymentController = require('../controllers/test-payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { prisma } = require('../../config/database');

// Aprovar pagamento de teste
router.post('/approve-payment/:orderId', authenticate, testPaymentController.approveTestPayment);

// TEMPORARY: Make user admin
router.post('/make-admin', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const user = await prisma.users.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    delete user.password;
    res.json({ success: true, message: 'User upgraded to ADMIN', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TEMPORARY: Publish product directly
router.post('/publish-product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await prisma.products.update({
      where: { id: productId },
      data: {
        status: 'PUBLISHED',
        approvedAt: new Date(),
        approvedBy: 'SYSTEM-TEST'
      },
    });
    res.json({ success: true, message: 'Product published', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
