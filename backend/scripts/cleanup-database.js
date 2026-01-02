/**
 * Cleanup Database
 * Remove todos os produtos e todos os usuários exceto o admin
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('🧹 LIMPEZA DO BANCO DE DADOS\n');
    console.log('═'.repeat(60));
    console.log('');

    // 1. Buscar admin
    console.log('1️⃣ Buscando administrador...');
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ Nenhum admin encontrado! Abortando limpeza.');
      return;
    }

    console.log(`✅ Admin encontrado: ${admin.name} (${admin.email})`);
    console.log('   Este usuário será PRESERVADO.');
    console.log('');

    // 2. Contar registros antes da limpeza
    console.log('2️⃣ Contando registros...');
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalReviews = await prisma.review.count();

    console.log(`   Usuários: ${totalUsers}`);
    console.log(`   Produtos: ${totalProducts}`);
    console.log(`   Pedidos: ${totalOrders}`);
    console.log(`   Avaliações: ${totalReviews}`);
    console.log('');

    // 3. Deletar avaliações
    console.log('3️⃣ Deletando avaliações...');
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`✅ ${deletedReviews.count} avaliações deletadas`);
    console.log('');

    // 4. Deletar pedidos
    console.log('4️⃣ Deletando pedidos...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`✅ ${deletedOrders.count} pedidos deletados`);
    console.log('');

    // 5. Deletar produtos
    console.log('5️⃣ Deletando produtos...');
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`✅ ${deletedProducts.count} produtos deletados`);
    console.log('');

    // 6. Deletar usuários (exceto admin)
    console.log('6️⃣ Deletando usuários (exceto admin)...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          not: admin.id
        }
      }
    });
    console.log(`✅ ${deletedUsers.count} usuários deletados`);
    console.log('');

    // 7. Verificar resultado final
    console.log('7️⃣ Verificando resultado...');
    const finalUsers = await prisma.user.count();
    const finalProducts = await prisma.product.count();
    const finalOrders = await prisma.order.count();
    const finalReviews = await prisma.review.count();

    console.log('');
    console.log('═'.repeat(60));
    console.log('🎉 LIMPEZA CONCLUÍDA!');
    console.log('═'.repeat(60));
    console.log('');
    console.log('📊 RESULTADO FINAL:');
    console.log('');
    console.log(`   Usuários restantes: ${finalUsers} (apenas admin)`);
    console.log(`   Produtos restantes: ${finalProducts}`);
    console.log(`   Pedidos restantes: ${finalOrders}`);
    console.log(`   Avaliações restantes: ${finalReviews}`);
    console.log('');
    console.log('✅ Banco de dados limpo com sucesso!');
    console.log('');
    console.log('Usuário admin preservado:');
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
    console.log('');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('');
    console.error('❌ ERRO NA LIMPEZA:');
    console.error('');
    console.error('Mensagem:', error.message);
    console.error('');
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar limpeza
cleanupDatabase();
