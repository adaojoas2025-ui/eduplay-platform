const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('=== ÚLTIMAS 10 ORDENS ===\n');

  const orders = await prisma.orders.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      product: { select: { id: true, title: true, producerId: true } },
      buyer: { select: { id: true, name: true, email: true } }
    }
  });

  if (orders.length === 0) {
    console.log('Nenhuma ordem encontrada no banco!');
  }

  orders.forEach(o => {
    console.log('ID:', o.id);
    console.log('Status:', o.status);
    console.log('Data:', o.createdAt);
    console.log('Produto:', o.product?.title || 'N/A');
    console.log('ProducerId:', o.product?.producerId || 'N/A');
    console.log('Comprador:', o.buyer?.name || 'N/A', '-', o.buyer?.email || 'N/A');
    console.log('Valor: R$', o.amount);
    console.log('ProducerAmount:', o.producerAmount);
    console.log('PlatformFee:', o.platformFee);
    console.log('-------------------\n');
  });

  // Check by status
  console.log('\n=== CONTAGEM POR STATUS ===');
  const statusCounts = await prisma.orders.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  statusCounts.forEach(s => {
    console.log(s.status + ':', s._count.id);
  });

  await prisma.$disconnect();
}

check().catch(e => {
  console.error('Erro:', e);
  prisma.$disconnect();
});
