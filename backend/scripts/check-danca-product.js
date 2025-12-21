const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDancaProduct() {
  try {
    console.log('\n=== VERIFICANDO PRODUTO "dança" ===\n');

    // Find the product
    const product = await prisma.product.findFirst({
      where: {
        title: {
          contains: 'dança',
          mode: 'insensitive'
        }
      },
      include: {
        producer: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (!product) {
      console.log('❌ Produto "dança" não encontrado!\n');
      return;
    }

    console.log('📦 Produto encontrado:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Título: ${product.title}`);
    console.log(`   Status: ${product.status}`);
    console.log(`   Preço: R$ ${product.price}`);
    console.log(`   Vendedor: ${product.producer.name} (${product.producer.email})`);
    console.log(`   Arquivo: ${product.fileUrl ? 'SIM' : 'NÃO'}`);
    console.log(`   Created: ${product.createdAt}\n`);

    // Find orders for this product
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: product.id
          }
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📋 Pedidos encontrados: ${orders.length}\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Pedido ID: ${order.id.substring(0, 13)}...`);
      console.log(`   Comprador: ${order.user.email}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Payment Status: ${order.paymentStatus}`);
      console.log(`   Pago em: ${order.paidAt || 'NÃO PAGO'}`);
      console.log(`   Total: R$ ${order.total}`);
      console.log(`   Created: ${order.createdAt}`);
      console.log(`   Items:`, order.items.map(i => i.product.title).join(', '));
      console.log('');
    });

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkDancaProduct();
