const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ComboRepository {
  // Create combo
  async create(data) {
    const { title, description, discountPrice, productIds, producerId } = data;

    return await prisma.combos.create({
      data: {
        title,
        description,
        discountPrice,
        producerId,
        combo_products: {
          create: productIds.map(productId => ({
            id: require('crypto').randomUUID(),
            productId
          }))
        }
      },
      include: {
        combo_products: true
      }
    });
  }

  // Get all combos
  async findAll() {
    return await prisma.combos.findMany({
      where: { isActive: true },
      include: {
        combo_products: {
          select: {
            productId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get combo by ID with full product details
  async findById(id) {
    return await prisma.combos.findUnique({
      where: { id },
      include: {
        combo_products: {
          select: {
            productId: true
          }
        }
      }
    });
  }

  // Get combo by product IDs (to detect if products in cart form a combo)
  async findByProductIds(productIds) {
    // Get all active combos
    const combos = await prisma.combos.findMany({
      where: { isActive: true },
      include: {
        combo_products: {
          select: {
            productId: true
          }
        }
      }
    });

    // Filter combos that match the product IDs
    return combos.filter(combo => {
      const comboProductIds = combo.combo_products.map(p => p.productId).sort();
      const sortedProductIds = [...productIds].sort();

      // Check if arrays are equal
      return comboProductIds.length === sortedProductIds.length &&
             comboProductIds.every((id, index) => id === sortedProductIds[index]);
    });
  }

  // Update combo
  async update(id, data) {
    const { title, description, discountPrice, productIds, isActive } = data;

    // If productIds are provided, update the combo products
    if (productIds) {
      // Delete existing combo products
      await prisma.combo_products.deleteMany({
        where: { comboId: id }
      });
    }

    return await prisma.combos.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(discountPrice !== undefined && { discountPrice }),
        ...(isActive !== undefined && { isActive }),
        ...(productIds && {
          combo_products: {
            create: productIds.map(productId => ({
              id: require('crypto').randomUUID(),
              productId
            }))
          }
        })
      },
      include: {
        combo_products: {
          select: {
            productId: true
          }
        }
      }
    });
  }

  // Delete combo (soft delete)
  async delete(id) {
    return await prisma.combos.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // Hard delete combo
  async hardDelete(id) {
    return await prisma.combos.delete({
      where: { id }
    });
  }

  // Get combo with product details
  async getComboWithProducts(comboId) {
    const combo = await prisma.combos.findUnique({
      where: { id: comboId },
      include: {
        combo_products: true
      }
    });

    if (!combo) return null;

    // Get full product details
    const productIds = combo.combo_products.map(p => p.productId);
    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds }
      }
    });

    return {
      ...combo,
      productDetails: products,
      totalRegularPrice: products.reduce((sum, p) => sum + p.price, 0),
      savings: products.reduce((sum, p) => sum + p.price, 0) - combo.discountPrice
    };
  }
}

module.exports = new ComboRepository();
