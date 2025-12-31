const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetProducts() {
  try {
    const result = await prisma.product.updateMany({
      where: {
        status: 'PUBLISHED',
        approvedBy: null
      },
      data: {
        status: 'PENDING_APPROVAL'
      }
    });

    console.log('✅ Produtos atualizados para PENDING_APPROVAL:', result.count);

    const products = await prisma.product.findMany({
      select: {
        title: true,
        status: true
      }
    });

    console.log('\n📋 Status atual dos produtos:');
    products.forEach(p => {
      console.log('-', p.title, ':', p.status);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetProducts();
