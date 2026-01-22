const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🧹 Iniciando limpeza do banco de dados...\n');

    // 1. Buscar administrador
    const admin = await prisma.user.findUnique({
      where: { email: 'ja.eduplay@gmail.com' }
    });

    if (!admin) {
      console.log('❌ Administrador não encontrado!');
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`✅ Administrador encontrado: ${admin.name} (${admin.email})`);
    console.log(`   Admin ID: ${admin.id}\n`);

    // 2. Contar dados antes de deletar
    const usersCount = await prisma.user.count({
      where: { id: { not: admin.id } }
    });
    const productsCount = await prisma.product.count();
    const ordersCount = await prisma.order.count();
    const commissionsCount = await prisma.commissions.count();

    console.log('📊 Dados que serão deletados:');
    console.log(`   👥 Usuários (exceto admin): ${usersCount}`);
    console.log(`   📦 Produtos: ${productsCount}`);
    console.log(`   🛒 Pedidos: ${ordersCount}`);
    console.log(`   💰 Comissões: ${commissionsCount}\n`);

    if (usersCount === 0 && productsCount === 0) {
      console.log('✅ Nada para deletar! Banco já está limpo.\n');
      await prisma.$disconnect();
      process.exit(0);
    }

    // 3. Deletar na ordem correta (respeitando foreign keys)
    console.log('🗑️  Deletando comissões...');
    const deletedCommissions = await prisma.commissions.deleteMany({});
    console.log(`   ✅ ${deletedCommissions.count} comissões deletadas\n`);

    console.log('🗑️  Deletando pedidos...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✅ ${deletedOrders.count} pedidos deletados\n`);

    console.log('🗑️  Deletando produtos...');
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`   ✅ ${deletedProducts.count} produtos deletados\n`);

    console.log('🗑️  Deletando usuários (exceto admin)...');
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { not: admin.id } }
    });
    console.log(`   ✅ ${deletedUsers.count} usuários deletados\n`);

    // 4. Verificar o que sobrou
    const remainingUsers = await prisma.user.count();
    const remainingProducts = await prisma.product.count();

    console.log('✅ Limpeza concluída!\n');
    console.log('📊 Dados restantes no banco:');
    console.log(`   👥 Usuários: ${remainingUsers} (apenas admin)`);
    console.log(`   📦 Produtos: ${remainingProducts}`);
    console.log(`   🛒 Pedidos: 0`);
    console.log(`   💰 Comissões: 0\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ Erro durante a limpeza:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
