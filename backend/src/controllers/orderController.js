const { prisma } = require('../config/database');
const { createPreference, processPaymentWebhook } = require('../services/paymentService');

/**
 * Create order and Mercado Pago preference
 */
async function createOrder(req, res) {
  try {
    const { productId, payerInfo } = req.body;

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        producer: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (!product.approved || product.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Produto não disponível para compra' });
    }

    // Check if user already purchased
    const existingPurchase = await prisma.order.findFirst({
      where: {
        productId,
        buyerId: req.user.id,
        paymentStatus: 'APPROVED',
      },
    });

    if (existingPurchase) {
      return res.status(400).json({ error: 'Você já comprou este produto' });
    }

    // Create Mercado Pago preference
    const preferenceData = await createPreference(product, req.user, {
      payer: payerInfo,
    });

    // Create order in database
    const platformFee = product.price * 0.10;

    const order = await prisma.order.create({
      data: {
        productId: product.id,
        buyerId: req.user.id,
        sellerId: product.producerId,
        amount: product.price,
        platformFee,
        paymentStatus: 'PENDING',
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      order,
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
}

/**
 * Webhook to receive Mercado Pago notifications
 */
async function webhook(req, res) {
  try {
    const { type, data } = req.body;

    console.log('Webhook received:', { type, data });

    // We only care about payment notifications
    if (type === 'payment') {
      const paymentId = data.id;

      // Process payment asynchronously
      processPaymentWebhook(paymentId).catch(error => {
        console.error('Webhook processing error:', error);
      });
    }

    // Always respond 200 to Mercado Pago
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true }); // Still return 200
  }
}

/**
 * Get user's purchases
 */
async function getMyPurchases(req, res) {
  try {
    const purchases = await prisma.order.findMany({
      where: {
        buyerId: req.user.id,
        paymentStatus: 'APPROVED',
      },
      include: {
        product: {
          include: {
            files: true,
            producer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Erro ao buscar compras' });
  }
}

/**
 * Get producer's sales
 */
async function getMySales(req, res) {
  try {
    const sales = await prisma.order.findMany({
      where: {
        sellerId: req.user.id,
        paymentStatus: 'APPROVED',
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        commission: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalCommission = sales.reduce((sum, sale) => sum + (sale.commission?.amount || 0), 0);

    res.json({
      sales,
      stats: {
        totalSales: sales.length,
        totalRevenue,
        totalCommission,
      },
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
}

/**
 * Get order by ID
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            files: true,
            producer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Check permissions
    if (
      order.buyerId !== req.user.id &&
      order.sellerId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ error: 'Sem permissão para ver este pedido' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
}

module.exports = {
  createOrder,
  webhook,
  getMyPurchases,
  getMySales,
  getOrderById,
};
