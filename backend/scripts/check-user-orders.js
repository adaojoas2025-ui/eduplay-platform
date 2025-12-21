const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userId = '12f3b05e-23ad-4044-868f-dd2268d6fdeb'; // lesim255@gmail.com

async function checkUserOrders() {
  try {
    console.log('\n=== Verificando pedidos do usuário ===\n');
    console.log('User ID:', userId);

    const orders = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: {
          in: ['APPROVED', 'COMPLETED']
        }
      },
      select: {
        id: true,
        status: true,
        amount: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\nTotal de pedidos APPROVED/COMPLETED: ${orders.length}\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.product.title}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Valor: R$ ${order.amount.toFixed(2)}`);
      console.log(`   Data: ${order.createdAt.toLocaleString('pt-BR')}`);
      console.log(`   Order ID: ${order.id.substring(0, 8)}...\n`);
    });

    // Testar a query exata que getUserPurchases usa
    console.log('=== Testando query getUserPurchases ===\n');

    const purchaseOrders = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: {
          in: ['APPROVED', 'COMPLETED']
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const products = purchaseOrders.map((order) => order.product);
    console.log(`Produtos retornados por getUserPurchases: ${products.length}\n`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserOrders();
