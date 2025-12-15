const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Buscando produto de caligrafia...');

    const product = await prisma.product.findFirst({
      where: {
        title: {
          contains: 'caligrafia',
          mode: 'insensitive'
        }
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!product) {
      console.log('❌ Produto não encontrado');
      return;
    }

    console.log('\n📦 PRODUTO:');
    console.log(`   Título: ${product.title}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Preço: R$ ${product.price}`);
    console.log(`   Status: ${product.status}`);

    console.log('\n👤 PRODUTOR:');
    console.log(`   Nome: ${product.producer.name}`);
    console.log(`   Email: ${product.producer.email}`);
    console.log(`   Role: ${product.producer.role}`);
    console.log(`   ID: ${product.producer.id}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
