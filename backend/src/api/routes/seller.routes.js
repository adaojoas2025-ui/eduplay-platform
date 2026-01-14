const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');
const orderRepository = require('../../repositories/order.repository');
const userRepository = require('../../repositories/user.repository');
const { prisma } = require('../../config/database');

// Seller stats
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const stats = await userRepository.getProducerStats(sellerId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Seller products
router.get('/products', authenticate, async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { status } = req.query;

    // Get all products from this seller
    const where = { producerId: sellerId };

    if (status) {
      where.status = status;
    }

    const products = await prisma.products.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        items: products,
        total: products.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Seller sales
router.get('/sales', authenticate, async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { limit = 10 } = req.query;

    // Get orders for products from this seller
    const orders = await prisma.orders.findMany({
      where: {
        product: {
          producerId: sellerId
        },
        status: 'COMPLETED'
      },
      include: {
        product: {
          select: {
            title: true,
            price: true
          }
        },
        buyer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        items: orders,
        total: orders.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
