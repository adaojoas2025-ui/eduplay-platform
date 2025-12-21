const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApprovedBuyers() {
  try {
    const approvedOrders = await prisma.order.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        buyerId: true,
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
      }
    });

    console.log('\n=== Pedidos APPROVED no banco ===\n');
    console.log(`Total: ${approvedOrders.length}\n`);

    approvedOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.buyer.name} (${order.buyer.email})`);
      console.log(`   Produto: ${order.product.title}`);
      console.log(`   Buyer ID: ${order.buyerId}\n`);
    });

    // Verificar qual usuário está logado agora
    const currentUser = await prisma.user.findUnique({
      where: { email: 'adao18aguiar@gmail.com' },
      select: { id: true, name: true, email: true }
    });

    if (currentUser) {
      console.log('=== Usuário Atual (adao18aguiar@gmail.com) ===');
      console.log('ID:', currentUser.id);
      console.log('Nome:', currentUser.name);
      console.log('Email:', currentUser.email);

      const userOrders = approvedOrders.filter(o => o.buyerId === currentUser.id);
      console.log(`\nPedidos deste usuário: ${userOrders.length}`);
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApprovedBuyers();
