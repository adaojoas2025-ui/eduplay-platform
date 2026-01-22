/**
 * Script para limpar o banco de dados
 * Remove todos os produtos e usuários, exceto o administrador
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('\n🔄 LIMPANDO BANCO DE DADOS\n');

  try {
    // 1. Deletar itens do carrinho
    console.log('🗑️  Deletando itens do carrinho...');
    const deletedCartItems = await prisma.cartItem.deleteMany({});
    console.log(`   ✅ ${deletedCartItems.count} itens do carrinho deletados`);

    // 2. Deletar avaliações
    console.log('🗑️  Deletando avaliações...');
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`   ✅ ${deletedReviews.count} avaliações deletadas`);

    // 3. Deletar todas as comissões
    console.log('🗑️  Deletando comissões...');
    const deletedCommissions = await prisma.commissions.deleteMany({});
    console.log(`   ✅ ${deletedCommissions.count} comissões deletadas`);

    // 4. Deletar todos os pedidos
    console.log('🗑️  Deletando pedidos...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✅ ${deletedOrders.count} pedidos deletados`);

    // 5. Deletar todos os produtos
    console.log('🗑️  Deletando produtos...');
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`   ✅ ${deletedProducts.count} produtos deletados`);

    // 6. Deletar gamificação
    console.log('🗑️  Deletando dados de gamificação...');
    const deletedPointsHistory = await prisma.pointsHistory.deleteMany({});
    const deletedUserMissions = await prisma.userMission.deleteMany({});
    const deletedUserBadges = await prisma.userBadge.deleteMany({});
    const deletedUserGamification = await prisma.userGamification.deleteMany({});
    console.log(`   ✅ ${deletedPointsHistory.count} históricos de pontos deletados`);
    console.log(`   ✅ ${deletedUserMissions.count} missões de usuários deletadas`);
    console.log(`   ✅ ${deletedUserBadges.count} badges de usuários deletados`);
    console.log(`   ✅ ${deletedUserGamification.count} gamificações deletadas`);

    // 7. Deletar todos os usuários EXCETO o administrador
    console.log('🗑️  Deletando usuários (exceto admin)...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    });
    console.log(`   ✅ ${deletedUsers.count} usuários deletados`);

    // 8. Verificar se existe administrador
    console.log('\n🔍 Verificando administrador...');
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (admin) {
      console.log(`   ✅ Administrador encontrado: ${admin.email}`);
    } else {
      console.log('   ⚠️  Nenhum administrador encontrado!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ BANCO DE DADOS LIMPO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📊 Resumo:');
    console.log(`   • Itens do carrinho: ${deletedCartItems.count}`);
    console.log(`   • Avaliações: ${deletedReviews.count}`);
    console.log(`   • Comissões: ${deletedCommissions.count}`);
    console.log(`   • Pedidos: ${deletedOrders.count}`);
    console.log(`   • Produtos: ${deletedProducts.count}`);
    console.log(`   • Históricos de pontos: ${deletedPointsHistory.count}`);
    console.log(`   • Missões de usuários: ${deletedUserMissions.count}`);
    console.log(`   • Badges de usuários: ${deletedUserBadges.count}`);
    console.log(`   • Gamificações: ${deletedUserGamification.count}`);
    console.log(`   • Usuários (exceto admin): ${deletedUsers.count}`);
    console.log(`   • Admin preservado: ${admin ? admin.email : 'NENHUM'}`);
    console.log('\n💡 O banco está limpo e pronto para novos testes!\n');

  } catch (error) {
    console.error('\n❌ ERRO ao limpar banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
