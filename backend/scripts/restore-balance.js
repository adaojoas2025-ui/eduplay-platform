/**
 * Script to restore balance by deleting failed PIX transfer records
 * Run with: node scripts/restore-balance.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreBalance() {
  try {
    // Find all PIX transfers for the producer
    const transfers = await prisma.pix_transfers.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        orders: {
          select: {
            id: true,
            producerAmount: true,
            product: { select: { title: true } }
          }
        }
      }
    });

    console.log('Recent PIX transfers:');
    transfers.forEach(t => {
      console.log(`- ID: ${t.id}`);
      console.log(`  Order: ${t.orderId}`);
      console.log(`  Amount: R$ ${t.amount}`);
      console.log(`  Status: ${t.status}`);
      console.log(`  Created: ${t.createdAt}`);
      console.log('');
    });

    // Delete the most recent transfer to restore balance
    if (transfers.length > 0) {
      const lastTransfer = transfers[0];
      console.log(`Deleting transfer ${lastTransfer.id} to restore balance...`);
      
      await prisma.pix_transfers.delete({
        where: { id: lastTransfer.id }
      });
      
      console.log('Transfer deleted! Balance restored.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreBalance();
