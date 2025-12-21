const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateOrders() {
  try {
    // Get orders for lesim255@gmail.com
    const userId = '12f3b05e-23ad-4044-868f-dd2268d6fdeb';

    console.log('\nBuscando pedidos com status PENDING mas pagamento aprovado...\n');

    const orders = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: 'PENDING',
        paymentStatus: 'approved'
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paidAt: true,
        createdAt: true
      }
    });

    console.log(`Encontrados: ${orders.length} pedidos\n`);

    for (const order of orders) {
      console.log(`Order ID: ${order.id}`);
      console.log(`Status: ${order.status}`);
      console.log(`Payment Status: ${order.paymentStatus}`);
      console.log(`Paid At: ${order.paidAt}`);
      console.log(`Created At: ${order.createdAt}\n`);

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'APPROVED' }
      });

      console.log(`✅ Atualizado para: ${updated.status}\n`);
    }

    console.log(`\n✅ Total: ${orders.length} pedidos atualizados\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrders();
