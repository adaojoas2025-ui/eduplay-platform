const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🧹 Iniciando limpeza do banco de dados...\n');

    // 1. Deletar todos os downloads de apps
    const deletedAppDownloads = await prisma.appDownload.deleteMany();
    console.log(`✅ ${deletedAppDownloads.count} downloads de apps removidos`);

    // 2. Deletar todas as reviews de apps
    const deletedAppReviews = await prisma.appReview.deleteMany();
    console.log(`✅ ${deletedAppReviews.count} reviews de apps removidas`);

    // 3. Deletar todos os apps
    const deletedApps = await prisma.app.deleteMany();
    console.log(`✅ ${deletedApps.count} apps removidos`);

    // 4. Deletar todos os itens do carrinho
    const deletedCartItems = await prisma.cartItem.deleteMany();
    console.log(`✅ ${deletedCartItems.count} itens do carrinho removidos`);

    // 5. Deletar todas as reviews de produtos
    const deletedReviews = await prisma.review.deleteMany();
    console.log(`✅ ${deletedReviews.count} reviews de produtos removidas`);

    // 6. Deletar todas as comissões
    const deletedCommissions = await prisma.commissions.deleteMany();
    console.log(`✅ ${deletedCommissions.count} comissões removidas`);

    // 7. Deletar todos os pedidos
    const deletedOrders = await prisma.order.deleteMany();
    console.log(`✅ ${deletedOrders.count} pedidos removidos`);

    // 8. Deletar todos os produtos (cursos)
    const deletedProducts = await prisma.product.deleteMany();
    console.log(`✅ ${deletedProducts.count} produtos/cursos removidos`);

    // 9. Deletar dados de gamificação
    const deletedPointsHistory = await prisma.pointsHistory.deleteMany();
    console.log(`✅ ${deletedPointsHistory.count} históricos de pontos removidos`);

    const deletedUserMissions = await prisma.userMission.deleteMany();
    console.log(`✅ ${deletedUserMissions.count} missões de usuários removidas`);

    const deletedUserBadges = await prisma.userBadge.deleteMany();
    console.log(`✅ ${deletedUserBadges.count} badges de usuários removidos`);

    const deletedLeaderboards = await prisma.leaderboard.deleteMany();
    console.log(`✅ ${deletedLeaderboards.count} leaderboards removidos`);

    const deletedUserGamification = await prisma.userGamification.deleteMany();
    console.log(`✅ ${deletedUserGamification.count} dados de gamificação removidos`);

    // 10. Deletar badges e missões
    const deletedMissions = await prisma.mission.deleteMany();
    console.log(`✅ ${deletedMissions.count} missões removidas`);

    const deletedBadges = await prisma.badge.deleteMany();
    console.log(`✅ ${deletedBadges.count} badges removidos`);

    // 11. Deletar usuários que NÃO são ADMIN
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    });
    console.log(`✅ ${deletedUsers.count} usuários removidos (administradores mantidos)`);

    // Verificar quantos admins restam
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    console.log(`\n👤 ${adminCount} administrador(es) mantido(s) no sistema`);

    // Listar administradores
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('\n📋 Administradores mantidos:');
    admins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email}) - Role: ${admin.role}`);
    });

    console.log('\n✅ Limpeza concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Apps removidos: ${deletedApps.count}`);
    console.log(`   - Produtos/Cursos removidos: ${deletedProducts.count}`);
    console.log(`   - Usuários removidos: ${deletedUsers.count}`);
    console.log(`   - Administradores mantidos: ${adminCount}`);

  } catch (error) {
    console.error('\n❌ Erro durante a limpeza:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
