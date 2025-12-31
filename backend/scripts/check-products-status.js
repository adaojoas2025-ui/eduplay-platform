const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        approvedBy: true,
        approvedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📋 PRODUTOS NO BANCO DE DADOS:\n');
    products.forEach(p => {
      console.log('Título:', p.title);
      console.log('Status:', p.status);
      console.log('ID:', p.id);
      console.log('Aprovado por:', p.approvedBy || 'N/A');
      console.log('Aprovado em:', p.approvedAt || 'N/A');
      console.log('---');
    });

    console.log('\nTotal:', products.length, 'produtos');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkProducts();
