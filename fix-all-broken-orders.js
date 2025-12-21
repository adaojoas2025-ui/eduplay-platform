const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAllBrokenOrders() {
  console.log('\n========================================');
  console.log('  FIXING ALL BROKEN ORDERS');
  console.log('========================================\n');

  try {
    // Find all broken orders
    const brokenOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'approved',
        paidAt: { not: null }
      },
      include: {
        buyer: {
          select: {
            email: true,
            name: true
          }
        },
        product: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Encontrados: ${brokenOrders.length} pedidos quebrados\n`);

    if (brokenOrders.length === 0) {
      console.log('✅ Nenhum pedido quebrado encontrado!\n');
      return;
    }

    // Show all broken orders
    brokenOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.buyer.email} - ${order.product.title}`);
      console.log(`   Order ID: ${order.id.substring(0, 13)}...`);
      console.log(`   Status: ${order.status} (deveria ser APPROVED)`);
      console.log(`   Payment Status: ${order.paymentStatus}`);
      console.log(`   Paid At: ${order.paidAt.toLocaleString('pt-BR')}\n`);
    });

    // Update all broken orders
    console.log('Atualizando todos os pedidos para APPROVED...\n');

    const result = await prisma.order.updateMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'approved',
        paidAt: { not: null }
      },
      data: {
        status: 'APPROVED'
      }
    });

    console.log(`✅ SUCESSO! ${result.count} pedidos atualizados para APPROVED\n`);
    console.log('========================================');
    console.log('Os usuários agora verão seus produtos em "Meus Produtos"!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllBrokenOrders();
