/**
 * One-time cleanup script: removes test orders and non-admin users
 * Runs automatically on deploy via start-with-migrate.js
 * Safe to run multiple times (idempotent)
 */

async function cleanupTestData() {
  console.log('\n>>> Cleaning up test data...');

  let prisma;
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();

    const pix = await prisma.pix_transfers.deleteMany({});
    console.log(`    - pix_transfers removed: ${pix.count}`);

    const commissions = await prisma.commissions.deleteMany({});
    console.log(`    - commissions removed: ${commissions.count}`);

    const orders = await prisma.orders.deleteMany({});
    console.log(`    - orders removed: ${orders.count}`);

    const users = await prisma.users.deleteMany({ where: { role: { not: 'ADMIN' } } });
    console.log(`    - non-admin users removed: ${users.count}`);

    // Remove specific admin test account
    await prisma.users.deleteMany({ where: { email: 'adao1980aguiar@gmail.com' } });
    console.log('    - adao1980aguiar@gmail.com removed');

    console.log('>>> Cleanup done!\n');
  } catch (err) {
    console.log(`>>> Cleanup failed (non-fatal): ${err.message}\n`);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

module.exports = { cleanupTestData };
