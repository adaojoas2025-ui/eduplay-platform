const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'adao1980aguiar@gmail.com' }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log(`\n✅ Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`User ID: ${user.id}`);

    // Buscar todas as compras desse usuário
    const orders = await prisma.order.findMany({
      where: {
        buyerId: user.id
      }
    });

    console.log(`\n📦 Total de compras encontradas: ${orders.length}`);

    if (orders.length === 0) {
      console.log('\n✅ Nenhuma compra para deletar!');
      await prisma.$disconnect();
      process.exit(0);
    }

    // Mostrar detalhes das compras
    console.log('\n📋 Compras que serão deletadas:\n');
    orders.forEach((order, index) => {
      const isApp = order.metadata && order.metadata.type === 'APP_PURCHASE';
      console.log(`${index + 1}. Order ID: ${order.id}`);
      console.log(`   Type: ${isApp ? '🎮 APP' : '📦 PRODUCT'}`);
      console.log(`   Amount: R$ ${order.amount}`);
      console.log(`   Status: ${order.status}`);
      if (isApp) {
        console.log(`   App: ${order.metadata.appTitle}`);
      } else {
        console.log(`   Product ID: ${order.productId}`);
      }
      console.log('');
    });

    // Deletar todas as compras
    const deleteResult = await prisma.order.deleteMany({
      where: {
        buyerId: user.id
      }
    });

    console.log(`\n✅ ${deleteResult.count} compra(s) deletada(s) com sucesso!`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
