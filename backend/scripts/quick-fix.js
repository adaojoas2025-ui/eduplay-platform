const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickFix() {
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

  console.log(`Atualizados: ${result.count} pedidos`);
  await prisma.$disconnect();
}

quickFix().catch(console.error);
