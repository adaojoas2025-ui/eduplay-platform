const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Listando TODOS os produtos...\n');

    const products = await prisma.product.findMany({
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado');
      return;
    }

    console.log(`✅ ${products.length} produto(s) encontrado(s):\n`);

    for (const product of products) {
      console.log(`📦 ${product.title}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Preço: R$ ${product.price}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Produtor: ${product.producer.name} (${product.producer.email})`);
      console.log(`   Role: ${product.producer.role}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
