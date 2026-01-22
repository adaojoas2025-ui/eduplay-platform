/**
 * Script para limpar usuários (exceto ADMIN) e todos os produtos
 *
 * Uso: node scripts/cleanup-users-products.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Iniciando limpeza do banco de dados...\n');

  try {
    // 1. Primeiro, buscar admins para preservar
    const admins = await prisma.users.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true }
    });

    console.log(`👑 Administradores encontrados (serão preservados):`);
    admins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
    });
    console.log('');

    const adminIds = admins.map(a => a.id);

    // 2. Contar registros antes da limpeza
    const countBefore = {
      users: await prisma.users.count({ where: { role: { not: 'ADMIN' } } }),
      products: await prisma.products.count(),
      orders: await prisma.orders.count(),
      commissions: await prisma.commissions.count(),
      reviews: await prisma.reviews.count(),
      cartItems: await prisma.cart_items.count(),
      combos: await prisma.combos.count(),
      orderBumps: await prisma.order_bumps.count(),
      userGamification: await prisma.user_gamification.count(),
    };

    console.log('📊 Registros antes da limpeza:');
    console.log(`   - Usuários (não-admin): ${countBefore.users}`);
    console.log(`   - Produtos: ${countBefore.products}`);
    console.log(`   - Pedidos: ${countBefore.orders}`);
    console.log(`   - Comissões: ${countBefore.commissions}`);
    console.log(`   - Reviews: ${countBefore.reviews}`);
    console.log(`   - Itens de carrinho: ${countBefore.cartItems}`);
    console.log(`   - Combos: ${countBefore.combos}`);
    console.log(`   - Order Bumps: ${countBefore.orderBumps}`);
    console.log(`   - Gamificação: ${countBefore.userGamification}`);
    console.log('');

    // 3. Deletar em ordem para respeitar foreign keys
    console.log('🗑️  Deletando registros...\n');

    // 3.1 Deletar comissões
    const deletedCommissions = await prisma.commissions.deleteMany({});
    console.log(`   ✅ Comissões deletadas: ${deletedCommissions.count}`);

    // 3.2 Deletar pedidos
    const deletedOrders = await prisma.orders.deleteMany({});
    console.log(`   ✅ Pedidos deletados: ${deletedOrders.count}`);

    // 3.3 Deletar reviews
    const deletedReviews = await prisma.reviews.deleteMany({});
    console.log(`   ✅ Reviews deletadas: ${deletedReviews.count}`);

    // 3.4 Deletar itens de carrinho
    const deletedCartItems = await prisma.cart_items.deleteMany({});
    console.log(`   ✅ Itens de carrinho deletados: ${deletedCartItems.count}`);

    // 3.5 Deletar combo_products primeiro
    const deletedComboProducts = await prisma.combo_products.deleteMany({});
    console.log(`   ✅ Produtos de combos deletados: ${deletedComboProducts.count}`);

    // 3.6 Deletar combos
    const deletedCombos = await prisma.combos.deleteMany({});
    console.log(`   ✅ Combos deletados: ${deletedCombos.count}`);

    // 3.7 Deletar order_bumps
    const deletedOrderBumps = await prisma.order_bumps.deleteMany({});
    console.log(`   ✅ Order Bumps deletados: ${deletedOrderBumps.count}`);

    // 3.8 Deletar produtos
    const deletedProducts = await prisma.products.deleteMany({});
    console.log(`   ✅ Produtos deletados: ${deletedProducts.count}`);

    // 3.9 Deletar user_missions
    const deletedUserMissions = await prisma.user_missions.deleteMany({
      where: {
        user_gamification: {
          userId: { notIn: adminIds }
        }
      }
    });
    console.log(`   ✅ Missões de usuários deletadas: ${deletedUserMissions.count}`);

    // 3.10 Deletar user_badges
    const deletedUserBadges = await prisma.user_badges.deleteMany({
      where: {
        user_gamification: {
          userId: { notIn: adminIds }
        }
      }
    });
    console.log(`   ✅ Badges de usuários deletados: ${deletedUserBadges.count}`);

    // 3.11 Deletar points_history
    const deletedPointsHistory = await prisma.points_history.deleteMany({
      where: {
        user_gamification: {
          userId: { notIn: adminIds }
        }
      }
    });
    console.log(`   ✅ Histórico de pontos deletado: ${deletedPointsHistory.count}`);

    // 3.12 Deletar user_gamification (exceto admins)
    const deletedGamification = await prisma.user_gamification.deleteMany({
      where: {
        userId: { notIn: adminIds }
      }
    });
    console.log(`   ✅ Gamificação de usuários deletada: ${deletedGamification.count}`);

    // 3.13 Deletar usuários (exceto admins)
    const deletedUsers = await prisma.users.deleteMany({
      where: {
        role: { not: 'ADMIN' }
      }
    });
    console.log(`   ✅ Usuários deletados: ${deletedUsers.count}`);

    // 4. Contar registros após limpeza
    console.log('\n📊 Registros após a limpeza:');
    const countAfter = {
      users: await prisma.users.count(),
      products: await prisma.products.count(),
      orders: await prisma.orders.count(),
    };
    console.log(`   - Usuários totais: ${countAfter.users} (apenas admins)`);
    console.log(`   - Produtos: ${countAfter.products}`);
    console.log(`   - Pedidos: ${countAfter.orders}`);

    console.log('\n✅ Limpeza concluída com sucesso!');
    console.log('   Todos os usuários não-administradores e produtos foram removidos.');

  } catch (error) {
    console.error('\n❌ Erro durante a limpeza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
cleanup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
