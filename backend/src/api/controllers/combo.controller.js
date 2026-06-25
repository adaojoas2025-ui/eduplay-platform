const comboRepository = require('../../repositories/combo.repository');
const { prisma } = require('../../config/database');

class ComboController {
  // Create combo
  async create(req, res) {
    try {
      console.log('📦 Creating combo - User:', req.user);
      console.log('📦 Request body:', req.body);

      const { title, description, discountPrice, productIds } = req.body;
      const producerId = req.user.id;

      // Validate required fields
      if (!title || !description || !discountPrice || !productIds || productIds.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Título, descrição, preço com desconto e pelo menos 2 produtos são obrigatórios'
        });
      }

      // Verify all products exist and belong to the producer (unless ADMIN)
      const whereCondition = {
        id: { in: productIds }
      };

      // If not admin, only allow producer's own products
      if (req.user.role !== 'ADMIN') {
        whereCondition.producerId = producerId;
      }

      const products = await prisma.products.findMany({
        where: whereCondition
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: req.user.role === 'ADMIN'
            ? 'Um ou mais produtos não foram encontrados'
            : 'Você só pode criar combos com seus próprios produtos'
        });
      }

      // Calculate total regular price
      const totalRegularPrice = products.reduce((sum, p) => sum + p.price, 0);

      // Validate discount price
      if (discountPrice >= totalRegularPrice) {
        return res.status(400).json({
          success: false,
          message: 'O preço do combo deve ser menor que a soma dos produtos individuais'
        });
      }

      const combo = await comboRepository.create({
        title,
        description,
        discountPrice,
        productIds,
        producerId
      });

      res.status(201).json({
        success: true,
        message: 'Combo criado com sucesso',
        data: combo
      });
    } catch (error) {
      console.error('Error creating combo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar combo'
      });
    }
  }

  // Get all combos
  async getAll(req, res) {
    try {
      console.log('📦 Buscando combos...');
      const combos = await comboRepository.findAll();
      console.log('📦 Combos encontrados:', combos?.length || 0);

      // Se não houver combos, retorna array vazio
      if (!combos || combos.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get product details for each combo
      const combosWithDetails = await Promise.all(
        combos.map(async (combo) => {
          const comboProducts = combo.combo_products || [];
          const productIds = comboProducts.map(p => p.productId);

          if (productIds.length === 0) {
            return {
              ...combo,
              productDetails: [],
              totalRegularPrice: 0,
              savings: 0,
              discountPercentage: 0
            };
          }

          const products = await prisma.products.findMany({
            where: { id: { in: productIds } },
            select: {
              id: true,
              slug: true,
              title: true,
              price: true,
              thumbnailUrl: true
            }
          });

          const totalRegularPrice = products.reduce((sum, p) => sum + p.price, 0);

          return {
            ...combo,
            productDetails: products,
            totalRegularPrice,
            savings: totalRegularPrice - combo.discountPrice,
            discountPercentage: totalRegularPrice > 0 ? Math.round(((totalRegularPrice - combo.discountPrice) / totalRegularPrice) * 100) : 0
          };
        })
      );

      res.json({
        success: true,
        data: combosWithDetails
      });
    } catch (error) {
      console.error('❌ Error fetching combos:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar combos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get combo by ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const combo = await comboRepository.getComboWithProducts(id);

      if (!combo) {
        return res.status(404).json({
          success: false,
          message: 'Combo não encontrado'
        });
      }

      res.json({
        success: true,
        data: combo
      });
    } catch (error) {
      console.error('Error fetching combo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar combo'
      });
    }
  }

  // Check if cart items can form a combo
  async checkCartForCombos(req, res) {
    try {
      const { productIds } = req.body;

      if (!productIds || productIds.length < 2) {
        return res.json({
          success: true,
          data: {
            hasCombo: false,
            combos: []
          }
        });
      }

      const matchingCombos = await comboRepository.findByProductIds(productIds);

      if (matchingCombos.length === 0) {
        return res.json({
          success: true,
          data: {
            hasCombo: false,
            combos: []
          }
        });
      }

      // Get full details for matching combos
      const combosWithDetails = await Promise.all(
        matchingCombos.map(async (combo) => {
          return await comboRepository.getComboWithProducts(combo.id);
        })
      );

      res.json({
        success: true,
        data: {
          hasCombo: true,
          combos: combosWithDetails
        }
      });
    } catch (error) {
      console.error('Error checking cart for combos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar combos'
      });
    }
  }

  // Update combo
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, discountPrice, productIds, isActive } = req.body;
      const producerId = req.user.id;

      // Check if combo exists and belongs to producer (unless ADMIN)
      const existingCombo = await prisma.combos.findUnique({
        where: { id }
      });

      if (!existingCombo) {
        return res.status(404).json({
          success: false,
          message: 'Combo não encontrado'
        });
      }

      // If not admin, verify ownership
      if (req.user.role !== 'ADMIN' && existingCombo.producerId !== producerId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para editar este combo'
        });
      }

      // If productIds are provided, validate them
      if (productIds && productIds.length > 0) {
        const whereCondition = {
          id: { in: productIds }
        };

        // If not admin, only allow producer's own products
        if (req.user.role !== 'ADMIN') {
          whereCondition.producerId = producerId;
        }

        const products = await prisma.products.findMany({
          where: whereCondition
        });

        if (products.length !== productIds.length) {
          return res.status(400).json({
            success: false,
            message: req.user.role === 'ADMIN'
              ? 'Um ou mais produtos não foram encontrados'
              : 'Você só pode usar seus próprios produtos'
          });
        }

        // Validate discount price
        if (discountPrice) {
          const totalRegularPrice = products.reduce((sum, p) => sum + p.price, 0);
          if (discountPrice >= totalRegularPrice) {
            return res.status(400).json({
              success: false,
              message: 'O preço do combo deve ser menor que a soma dos produtos individuais'
            });
          }
        }
      }

      const combo = await comboRepository.update(id, {
        title,
        description,
        discountPrice,
        productIds,
        isActive
      });

      res.json({
        success: true,
        message: 'Combo atualizado com sucesso',
        data: combo
      });
    } catch (error) {
      console.error('Error updating combo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar combo'
      });
    }
  }

  // Delete combo
  async delete(req, res) {
    try {
      const { id } = req.params;
      const producerId = req.user.id;

      // Check if combo exists and belongs to producer (unless ADMIN)
      const existingCombo = await prisma.combos.findUnique({
        where: { id }
      });

      if (!existingCombo) {
        return res.status(404).json({
          success: false,
          message: 'Combo não encontrado'
        });
      }

      // If not admin, verify ownership
      if (req.user.role !== 'ADMIN' && existingCombo.producerId !== producerId) {
        return res.status(403).json({
          success: false,
          message: 'Você não tem permissão para deletar este combo'
        });
      }

      await comboRepository.delete(id);

      res.json({
        success: true,
        message: 'Combo desativado com sucesso'
      });
    } catch (error) {
      console.error('Error deleting combo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao desativar combo'
      });
    }
  }

  // Get combos by producer (for logged-in producer)
  async getMyCombosByProducer(req, res) {
    try {
      const producerId = req.user.id;

      const combos = await prisma.combos.findMany({
        where: {
          producerId,
          isActive: true
        },
        include: {
          combo_products: {
            select: {
              productId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get product details for each combo
      const combosWithDetails = await Promise.all(
        combos.map(async (combo) => {
          const productIds = combo.combo_products.map(p => p.productId);
          const products = await prisma.products.findMany({
            where: { id: { in: productIds } },
            select: {
              id: true,
              slug: true,
              title: true,
              price: true,
              thumbnailUrl: true
            }
          });

          const totalRegularPrice = products.reduce((sum, p) => sum + p.price, 0);

          return {
            ...combo,
            productDetails: products,
            totalRegularPrice,
            savings: totalRegularPrice - combo.discountPrice,
            discountPercentage: Math.round(((totalRegularPrice - combo.discountPrice) / totalRegularPrice) * 100)
          };
        })
      );

      res.json({
        success: true,
        data: combosWithDetails
      });
    } catch (error) {
      console.error('Error fetching producer combos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar combos'
      });
    }
  }
}

module.exports = new ComboController();
