const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPurchases() {
  try {
    // ID do usuário adao18
    const userId = 'acc1e05a-ee55-4db9-8d31-a347f5ef6788';

    console.log('Buscando pedidos do usuário adao18...\n');

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Total de pedidos: ${orders.length}\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Pedido ID: ${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: R$ ${order.totalAmount}`);
      console.log(`   Data: ${order.createdAt}`);
      console.log(`   Produtos:`);

      order.items.forEach((item, i) => {
        console.log(`     ${i + 1}. ${item.product?.title || 'Produto deletado'}`);
        console.log(`        ID: ${item.productId}`);
        console.log(`        Slug: ${item.product?.slug || 'N/A'}`);
        console.log(`        Status Produto: ${item.product?.status || 'N/A'}`);
      });
      console.log('');
    });

    // Buscar produto geografia especificamente
    console.log('\n=== PRODUTO GEOGRAFIA ===\n');
    const geografiaProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { title: { contains: 'geografia', mode: 'insensitive' } },
          { slug: { contains: 'geografia' } }
        ]
      }
    });

    if (geografiaProduct) {
      console.log('Produto encontrado:');
      console.log(`  ID: ${geografiaProduct.id}`);
      console.log(`  Título: ${geografiaProduct.title}`);
      console.log(`  Slug: ${geografiaProduct.slug}`);
      console.log(`  Status: ${geografiaProduct.status}`);
    } else {
      console.log('Produto geografia não encontrado');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPurchases();
