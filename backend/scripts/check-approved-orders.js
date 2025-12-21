const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApprovedOrders() {
  try {
    console.log('\n========================================');
    console.log('Verificando pedidos APPROVED no banco de dados');
    console.log('========================================\n');

    // Buscar todos os pedidos com status APPROVED ou COMPLETED
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['APPROVED', 'COMPLETED']
        }
      },
      select: {
        id: true,
        status: true,
        buyerId: true,
        productId: true,
        amount: true,
        createdAt: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        product: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`Total de pedidos encontrados: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('❌ Nenhum pedido com status APPROVED ou COMPLETED encontrado!');
    } else {
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Pedido #${order.id.substring(0, 8)}...`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Comprador: ${order.buyer.name} (${order.buyer.email})`);
        console.log(`   Produto: ${order.product.title}`);
        console.log(`   Valor: R$ ${order.amount.toFixed(2)}`);
        console.log(`   Data: ${order.createdAt.toLocaleString('pt-BR')}`);
      });
    }

    console.log('\n========================================');
    console.log('Testando função getUserPurchases');
    console.log('========================================\n');

    // Se houver pedidos, testar com o primeiro comprador
    if (orders.length > 0) {
      const buyerId = orders[0].buyerId;
      console.log(`Buscando compras do usuário: ${orders[0].buyer.email}`);

      const userOrders = await prisma.order.findMany({
        where: {
          buyerId: buyerId,
          status: {
            in: ['APPROVED', 'COMPLETED']
          }
        },
        include: {
          product: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`\nTotal de produtos comprados por este usuário: ${userOrders.length}`);

      const products = userOrders.map(order => order.product);
      console.log('\nProdutos:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar pedidos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApprovedOrders();
