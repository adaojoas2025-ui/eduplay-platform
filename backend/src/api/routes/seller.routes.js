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

// Revenue by product
router.get('/revenue-by-product', authenticate, async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // Get all products with their sales data
    const products = await prisma.products.findMany({
      where: { producerId: sellerId },
      select: {
        id: true,
        title: true,
        price: true,
        sales: true,
        orders: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            amount: true,
            producerAmount: true,
            platformFee: true,
            createdAt: true
          }
        }
      }
    });

    // Calculate revenue for each product
    const revenueByProduct = products.map(product => {
      const totalSales = product.orders.length;
      const totalAmount = product.orders.reduce((sum, order) => sum + (order.amount || 0), 0);
      const totalProducerAmount = product.orders.reduce((sum, order) => sum + (order.producerAmount || 0), 0);
      const totalPlatformFee = product.orders.reduce((sum, order) => sum + (order.platformFee || 0), 0);

      return {
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        totalSales,
        totalAmount,
        producerAmount: totalProducerAmount,
        platformFee: totalPlatformFee
      };
    });

    // Sort by total amount (highest first)
    revenueByProduct.sort((a, b) => b.totalAmount - a.totalAmount);

    res.json({
      success: true,
      data: revenueByProduct
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

// Seller detailed reports with date filtering
router.get('/reports', authenticate, async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const where = {
      product: {
        producerId: sellerId
      },
      status: 'COMPLETED'
    };

    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Get total count for pagination
    const totalCount = await prisma.orders.count({ where });

    // Get paginated orders
    const orders = await prisma.orders.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            category: true
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
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Calculate summary stats for the period
    const allOrdersInPeriod = await prisma.orders.findMany({
      where,
      select: {
        amount: true,
        producerAmount: true,
        platformFee: true,
        createdAt: true
      }
    });

    const summary = {
      totalSales: allOrdersInPeriod.length,
      totalAmount: allOrdersInPeriod.reduce((sum, o) => sum + (o.amount || 0), 0),
      totalProducerAmount: allOrdersInPeriod.reduce((sum, o) => sum + (o.producerAmount || 0), 0),
      totalPlatformFee: allOrdersInPeriod.reduce((sum, o) => sum + (o.platformFee || 0), 0)
    };

    // Group sales by day for chart data
    const salesByDay = {};
    allOrdersInPeriod.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[day]) {
        salesByDay[day] = { date: day, count: 0, amount: 0, producerAmount: 0 };
      }
      salesByDay[day].count++;
      salesByDay[day].amount += order.amount || 0;
      salesByDay[day].producerAmount += order.producerAmount || 0;
    });

    // Convert to array and sort by date
    const chartData = Object.values(salesByDay).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Get sales by product for the period
    const productSales = {};
    const ordersWithProduct = await prisma.orders.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    ordersWithProduct.forEach(order => {
      const productId = order.product?.id;
      if (productId) {
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productTitle: order.product.title,
            count: 0,
            amount: 0
          };
        }
        productSales[productId].count++;
        productSales[productId].amount += order.amount || 0;
      }
    });

    const salesByProduct = Object.values(productSales).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        orders,
        summary,
        chartData,
        salesByProduct,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
