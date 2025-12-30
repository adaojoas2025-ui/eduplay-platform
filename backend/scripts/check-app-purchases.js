const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Buscar compras do usuário adao1980
    const user = await prisma.user.findUnique({
      where: { email: 'adao1980aguiar@gmail.com' }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log(`\n✅ Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`User ID: ${user.id}`);

    // Buscar todas as compras COMPLETED desse usuário
    const orders = await prisma.order.findMany({
      where: {
        buyerId: user.id,
        status: 'COMPLETED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📦 Total de compras COMPLETED: ${orders.length}`);

    // Filtrar compras de app
    const appPurchases = orders.filter(order =>
      order.metadata &&
      typeof order.metadata === 'object' &&
      order.metadata.type === 'APP_PURCHASE'
    );

    console.log(`\n🎮 Compras de Apps: ${appPurchases.length}`);

    if (appPurchases.length > 0) {
      console.log('\n📱 Detalhes das compras de apps:\n');
      appPurchases.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order.id}`);
        console.log(`   App ID: ${order.metadata.appId}`);
        console.log(`   App Title: ${order.metadata.appTitle}`);
        console.log(`   App Slug: ${order.metadata.appSlug}`);
        console.log(`   Version: ${order.metadata.version}`);
        console.log(`   Amount: R$ ${order.amount}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Created: ${order.createdAt}`);
        console.log(`   Paid At: ${order.paidAt}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️ Nenhuma compra de app encontrada para este usuário!');
      console.log('\nTodas as compras:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order.id}`);
        console.log(`   Product ID: ${order.productId}`);
        console.log(`   Amount: R$ ${order.amount}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Metadata type: ${order.metadata?.type || 'N/A'}`);
        console.log('');
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
