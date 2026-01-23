/**
 * Script para limpar comissões e pedidos do banco de produção
 * Execute no Render Shell: node scripts/cleanup-production.js
 */

const { PrismaClient } = require('@prisma/client');

async function cleanupProduction() {
  const prisma = new PrismaClient();

  try {
    console.log('🧹 Iniciando limpeza do banco de produção...\n');

    // Verificar contagem atual
    const currentCommissions = await prisma.commissions.count();
    const currentOrders = await prisma.orders.count();

    console.log(`📊 Estado atual:`);
    console.log(`   - Comissões: ${currentCommissions}`);
    console.log(`   - Pedidos: ${currentOrders}\n`);

    // Deletar comissões primeiro (foreign key)
    const deletedCommissions = await prisma.commissions.deleteMany({});
    console.log(`✅ Comissões deletadas: ${deletedCommissions.count}`);

    // Deletar pedidos
    const deletedOrders = await prisma.orders.deleteMany({});
    console.log(`✅ Pedidos deletados: ${deletedOrders.count}`);

    console.log('\n🎉 Limpeza concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupProduction();
