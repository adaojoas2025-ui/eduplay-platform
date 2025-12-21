const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function fixOrders() {
  try {
    // Find broken orders
    const broken = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'approved',
        paidAt: { not: null }
      },
      select: {
        id: true,
        buyerId: true,
        buyer: { select: { email: true } }
      }
    });

    fs.writeFileSync('fix-log.txt', `Found ${broken.length} broken orders\n`);

    broken.forEach(o => {
      fs.appendFileSync('fix-log.txt', `${o.buyer.email}: ${o.id}\n`);
    });

    // Fix them
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

    fs.appendFileSync('fix-log.txt', `\nUpdated: ${result.count} orders\n`);

  } catch (error) {
    fs.writeFileSync('fix-log.txt', `ERROR: ${error.message}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrders();
