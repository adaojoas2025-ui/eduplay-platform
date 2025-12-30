const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true
      }
    });

    console.log('\n📋 Lista de produtos:\n');
    products.forEach(p => {
      console.log(`  ✓ ${p.title}`);
      console.log(`    Slug: ${p.slug}`);
      console.log(`    Status: ${p.status}`);
      console.log('');
    });

    console.log(`Total: ${products.length} produtos\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

listProducts();
