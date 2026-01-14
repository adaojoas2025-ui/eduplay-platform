/**
 * Script to check database tables in production
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no banco de dados...\n');

    // Check if order_bumps table exists
    const orderBumps = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'order_bumps'
      );
    `;

    console.log('✅ Tabela order_bumps existe?', orderBumps[0].exists);

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('\n📋 Tabelas no banco de dados:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });

    // Count products
    const productCount = await prisma.products.count();
    console.log(`\n📦 Total de produtos: ${productCount}`);

    // Count order bumps
    if (orderBumps[0].exists) {
      const bumpCount = await prisma.order_bumps.count();
      console.log(`💡 Total de order bumps: ${bumpCount}`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
