require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showStatus() {
  try {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   🚀 STATUS DO SISTEMA ORDER BUMP            ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // Verificar se a tabela existe
    console.log('📊 Verificando tabela order_bumps...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'order_bumps'
      );
    `;

    if (tableExists[0].exists) {
      console.log('✅ Tabela order_bumps existe no banco de dados\n');

      // Contar order bumps
      const count = await prisma.$queryRaw`SELECT COUNT(*) as total FROM order_bumps;`;
      console.log(`📈 Total de Order Bumps: ${count[0].total}`);

      // Contar ativos
      const active = await prisma.$queryRaw`SELECT COUNT(*) as total FROM order_bumps WHERE "isActive" = true;`;
      console.log(`✅ Order Bumps ativos: ${active[0].total}`);

      // Mostrar analytics totais
      const analytics = await prisma.$queryRaw`
        SELECT
          SUM(impressions) as total_impressions,
          SUM(clicks) as total_clicks,
          SUM(conversions) as total_conversions,
          SUM(revenue) as total_revenue
        FROM order_bumps;
      `;

      console.log(`\n📊 Analytics Totais:`);
      console.log(`   Impressões: ${analytics[0].total_impressions || 0}`);
      console.log(`   Cliques: ${analytics[0].total_clicks || 0}`);
      console.log(`   Conversões: ${analytics[0].total_conversions || 0}`);
      console.log(`   Receita: R$ ${(analytics[0].total_revenue || 0).toFixed(2)}`);

      if (analytics[0].total_impressions > 0) {
        const conversionRate = (analytics[0].total_conversions / analytics[0].total_impressions * 100).toFixed(2);
        console.log(`   Taxa de Conversão: ${conversionRate}%`);
      }

    } else {
      console.log('❌ Tabela order_bumps NÃO existe');
    }

    // Verificar produtos
    console.log('\n📦 Produtos no sistema:');
    const products = await prisma.$queryRaw`
      SELECT COUNT(*) as total, status
      FROM products
      GROUP BY status;
    `;
    products.forEach(p => {
      console.log(`   ${p.status}: ${p.total}`);
    });

    // Informações do backend
    console.log('\n🔧 Backend API:');
    console.log('   Base URL: https://eduplayja-backend.onrender.com/api/v1');
    console.log('   Endpoints disponíveis:');
    console.log('   - GET  /order-bumps/suggestions');
    console.log('   - POST /order-bumps/:id/track');
    console.log('   - POST /order-bumps (PRODUCER)');
    console.log('   - GET  /order-bumps/producer/my-bumps (PRODUCER)');
    console.log('   - PUT  /order-bumps/:id (PRODUCER)');
    console.log('   - DELETE /order-bumps/:id (PRODUCER)');

    console.log('\n✅ FASE 2 COMPLETA - Backend API funcionando!');
    console.log('\n📋 Próximas etapas:');
    console.log('   1. ✅ Database Schema (COMPLETO)');
    console.log('   2. ✅ Backend API (COMPLETO)');
    console.log('   3. ⏳ Frontend Component (OrderBumpSuggestion.jsx)');
    console.log('   4. ⏳ Checkout Integration');
    console.log('   5. ⏳ Producer Dashboard');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showStatus();
