const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log('\n=== Últimos 10 Pedidos ===\n');

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        status: true,
        buyerId: true,
        amount: true,
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
        },
        createdAt: true
      }
    });

    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.buyer.email} (${order.buyer.name})`);
      console.log(`   Produto: ${order.product.title}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Valor: R$ ${order.amount.toFixed(2)}`);
      console.log(`   Data: ${order.createdAt.toLocaleString('pt-BR')}`);
      console.log(`   Order ID: ${order.id.substring(0, 8)}...`);
      console.log(`   Buyer ID: ${order.buyerId.substring(0, 8)}...\n`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
