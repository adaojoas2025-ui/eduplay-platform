const { prisma } = require('../config/database');
const { uploadFile, deleteFile } = require('../config/cloudinary');
const fs = require('fs').promises;

/**
 * Get all approved products
 */
async function getAllProducts(req, res) {
  try {
    const { page = 1, limit = 12, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      status: 'APPROVED',
      approved: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          producer: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.products.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
}

/**
 * Get product by ID
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        files: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Only show files to buyers who purchased
    if (req.user) {
      const hasPurchased = await prisma.orders.findFirst({
        where: {
          productId: id,
          buyerId: req.user.id,
          paymentStatus: 'APPROVED',
        },
      });

      if (!hasPurchased && req.user.id !== product.producerId && req.user.role !== 'ADMIN') {
        product.files = [];
      }
    } else {
      product.files = [];
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
}

/**
 * Create new product (Producer only)
 */
async function createProduct(req, res) {
  try {
    const { title, description, price } = req.body;

    // Validate input
    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Create product
    const product = await prisma.products.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        producerId: req.user.id,
        status: 'DRAFT',
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

    res.status(201).json({
      message: 'Produto criado com sucesso',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
}

/**
 * Update product (Producer only - own products)
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { title, description, price, status } = req.body;

    // Check if product exists and belongs to user
    const existingProduct = await prisma.products.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (existingProduct.producerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para editar este produto' });
    }

    // Update product
    const product = await prisma.products.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(status && { status }),
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
          },
        },
        files: true,
      },
    });

    res.json({
      message: 'Produto atualizado com sucesso',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
}

/**
 * Delete product (Producer only - own products)
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to user
    const product = await prisma.products.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product.producerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para deletar este produto' });
    }

    // Delete files from Cloudinary
    for (const file of product.files) {
      try {
        const publicId = file.url.split('/').pop().split('.')[0];
        await deleteFile(publicId);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Delete product (cascade will delete files)
    await prisma.products.delete({
      where: { id },
    });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
}

/**
 * Upload product files
 */
async function uploadProductFiles(req, res) {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to user
    const product = await prisma.products.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product.producerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para adicionar arquivos' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const uploadedFiles = [];

    // Upload each file to Cloudinary
    for (const file of req.files) {
      try {
        const result = await uploadFile(file.path, 'eduplay/products');

        const productFile = await prisma.productFile.create({
          data: {
            productId: id,
            name: file.originalname,
            url: result.secure_url,
            size: file.size,
            type: file.mimetype,
          },
        });

        uploadedFiles.push(productFile);

        // Delete local file
        await fs.unlink(file.path);
      } catch (error) {
        console.error('File upload error:', error);
      }
    }

    res.status(201).json({
      message: 'Arquivos enviados com sucesso',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({ error: 'Erro ao enviar arquivos' });
  }
}

/**
 * Upload product thumbnail
 */
async function uploadThumbnail(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.products.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product.producerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Upload to Cloudinary
    const result = await uploadFile(req.file.path, 'eduplay/thumbnails');

    // Update product
    const updatedProduct = await prisma.products.update({
      where: { id },
      data: { thumbnail: result.secure_url },
    });

    // Delete local file
    await fs.unlink(req.file.path);

    res.json({
      message: 'Thumbnail atualizada com sucesso',
      thumbnail: result.secure_url,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    res.status(500).json({ error: 'Erro ao enviar thumbnail' });
  }
}

/**
 * Get producer's own products
 */
async function getMyProducts(req, res) {
  try {
    const products = await prisma.products.findMany({
      where: { producerId: req.user.id },
      include: {
        files: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductFiles,
  uploadThumbnail,
  getMyProducts,
};
