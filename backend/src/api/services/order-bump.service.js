const prisma = require('../../config/database');
const logger = require('../../utils/logger');

class OrderBumpService {
  async getSuggestions({ productIds, category, limit = 3 }) {
    try {
      const where = {
        isActive: true,
        // Excluir produtos já no carrinho
        productId: { notIn: productIds }
      };

      // Filtrar por trigger
      if (category) {
        where.OR = [
          { triggerType: 'ANY' },
          {
            triggerType: 'CATEGORY',
            triggerValues: { has: category }
          }
        ];
      }

      if (productIds.length > 0) {
        if (!where.OR) where.OR = [];
        where.OR.push({
          triggerType: 'PRODUCT',
          triggerValues: { hasSome: productIds }
        });
      }

      // Buscar bumps ordenados por prioridade e taxa de conversão
      const bumps = await prisma.order_bumps.findMany({
        where,
        include: {
          products: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              thumbnailUrl: true,
              category: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { conversions: 'desc' }
        ],
        take: limit
      });

      // Transformar para formato compatível com frontend
      return bumps.map(bump => ({
        ...bump,
        product: bump.products
      }));
    } catch (error) {
      logger.error('Error getting bump suggestions:', error);
      throw error;
    }
  }

  async trackEvent(bumpId, event) {
    try {
      const updateData = {};

      if (event === 'impression') {
        updateData.impressions = { increment: 1 };
      } else if (event === 'click') {
        updateData.clicks = { increment: 1 };
      } else if (event === 'conversion') {
        updateData.conversions = { increment: 1 };
      }

      await prisma.order_bumps.update({
        where: { id: bumpId },
        data: updateData
      });
    } catch (error) {
      logger.error('Error tracking bump event:', error);
      // Não lançar erro para não quebrar o fluxo
    }
  }

  async create(data) {
    try {
      const bump = await prisma.order_bumps.create({
        data: {
          id: require('crypto').randomUUID(),
          productId: data.productId,
          title: data.title,
          description: data.description,
          discountPercent: data.discountPercent || 0,
          triggerType: data.triggerType || 'CATEGORY',
          triggerValues: data.triggerValues || [],
          producerId: data.producerId,
          isActive: data.isActive !== undefined ? data.isActive : true,
          priority: data.priority || 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: { products: true }
      });

      return {
        ...bump,
        product: bump.products
      };
    } catch (error) {
      logger.error('Error creating order bump:', error);
      throw error;
    }
  }

  async findByProducer(producerId) {
    try {
      const bumps = await prisma.order_bumps.findMany({
        where: { producerId },
        include: {
          products: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return bumps.map(bump => ({
        ...bump,
        product: bump.products
      }));
    } catch (error) {
      logger.error('Error finding bumps by producer:', error);
      throw error;
    }
  }

  async findById(id, producerId) {
    try {
      const bump = await prisma.order_bumps.findFirst({
        where: { id, producerId },
        include: {
          products: true
        }
      });

      if (!bump) return null;

      return {
        ...bump,
        product: bump.products
      };
    } catch (error) {
      logger.error('Error finding bump by id:', error);
      throw error;
    }
  }

  async update(id, producerId, data) {
    try {
      // Verificar ownership
      const bump = await prisma.order_bumps.findFirst({
        where: { id, producerId }
      });

      if (!bump) {
        throw new Error('Order bump não encontrado ou sem permissão');
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
      if (data.triggerType !== undefined) updateData.triggerType = data.triggerType;
      if (data.triggerValues !== undefined) updateData.triggerValues = data.triggerValues;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.priority !== undefined) updateData.priority = data.priority;

      const updated = await prisma.order_bumps.update({
        where: { id },
        data: updateData,
        include: { products: true }
      });

      return {
        ...updated,
        product: updated.products
      };
    } catch (error) {
      logger.error('Error updating order bump:', error);
      throw error;
    }
  }

  async delete(id, producerId) {
    try {
      const bump = await prisma.order_bumps.findFirst({
        where: { id, producerId }
      });

      if (!bump) {
        throw new Error('Order bump não encontrado');
      }

      await prisma.order_bumps.delete({ where: { id } });
    } catch (error) {
      logger.error('Error deleting order bump:', error);
      throw error;
    }
  }
}

module.exports = new OrderBumpService();
