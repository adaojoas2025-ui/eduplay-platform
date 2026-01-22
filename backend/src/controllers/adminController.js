const { prisma } = require('../config/database');
const { sendApprovalEmail } = require('../services/emailService');
const emailService = require('../services/email.service');

/**
 * Get dashboard statistics
 */
async function getDashboard(req, res) {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingProducers,
      pendingProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.products.count({ where: { approved: true } }),
      prisma.orders.count({ where: { paymentStatus: 'APPROVED' } }),
      prisma.orders.aggregate({
        where: { paymentStatus: 'APPROVED' },
        _sum: { platformFee: true },
      }),
      prisma.users.count({
        where: { role: 'PRODUCER', status: 'PENDING' },
      }),
      prisma.products.count({
        where: { status: 'PENDING' },
      }),
      prisma.orders.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { title: true },
          },
          buyer: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.platformFee || 0,
        pendingProducers,
        pendingProducts,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
}

/**
 * Get all users
 */
async function getAllUsers(req, res) {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              purchases: true,
              sales: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.users.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}

/**
 * Approve producer
 */
async function approveProducer(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.role !== 'PRODUCER') {
      return res.status(400).json({ error: 'Usuário não é um produtor' });
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // Send approval email
    try {
      await sendApprovalEmail(updatedUser);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    res.json({
      message: 'Produtor aprovado com sucesso',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Approve producer error:', error);
    res.status(500).json({ error: 'Erro ao aprovar produtor' });
  }
}

/**
 * Reject producer
 */
async function rejectProducer(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    res.json({
      message: 'Produtor rejeitado',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Reject producer error:', error);
    res.status(500).json({ error: 'Erro ao rejeitar produtor' });
  }
}

/**
 * Suspend user
 */
async function suspendUser(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.users.update({
      where: { id },
      data: { status: 'SUSPENDED' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    res.json({
      message: 'Usuário suspenso',
      user,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Erro ao suspender usuário' });
  }
}

/**
 * Get pending products
 */
async function getPendingProducts(req, res) {
  try {
    const products = await prisma.products.findMany({
      where: { status: 'PENDING' },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ products });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos pendentes' });
  }
}

/**
 * Approve product
 */
async function approveProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.products.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approved: true,
        approvedAt: new Date(),
        approvedBy: req.user?.id,
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send approval email to producer
    if (product.producer?.email) {
      try {
        await emailService.sendProductApprovedEmail(product, product.producer);
        console.log('✅ Approval email sent to producer:', product.producer.email);
      } catch (emailError) {
        console.error('❌ Failed to send approval email:', emailError.message);
      }
    }

    res.json({
      message: 'Produto aprovado com sucesso',
      product,
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ error: 'Erro ao aprovar produto' });
  }
}

/**
 * Reject product
 */
async function rejectProduct(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const product = await prisma.products.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approved: false,
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      message: 'Produto rejeitado',
      product,
    });
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({ error: 'Erro ao rejeitar produto' });
  }
}

/**
 * Clean all commissions and orders (ADMIN ONLY)
 */
async function cleanCommissionsAndOrders(req, res) {
  try {
    console.log('🧹 Admin requested cleanup of commissions and orders...');

    // Delete commissions first (foreign key)
    const deletedCommissions = await prisma.commissions.deleteMany({});
    console.log(`✅ Commissions deleted: ${deletedCommissions.count}`);

    // Delete orders
    const deletedOrders = await prisma.orders.deleteMany({});
    console.log(`✅ Orders deleted: ${deletedOrders.count}`);

    res.json({
      success: true,
      message: 'Comissões e pedidos removidos com sucesso',
      deleted: {
        commissions: deletedCommissions.count,
        orders: deletedOrders.count,
      },
    });
  } catch (error) {
    console.error('Clean commissions error:', error);
    res.status(500).json({ error: 'Erro ao limpar comissões' });
  }
}

/**
 * Get all orders
 */
async function getAllOrders(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.paymentStatus = status;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
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
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orders.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
}

module.exports = {
  getDashboard,
  getAllUsers,
  approveProducer,
  rejectProducer,
  suspendUser,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllOrders,
  cleanCommissionsAndOrders,
};
