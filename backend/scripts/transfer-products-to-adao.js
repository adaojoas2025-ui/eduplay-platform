const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔄 Transferindo produtos para adao1980...\n');

    const adao = await prisma.user.findUnique({
      where: { email: 'adao1980aguiar@gmail.com' }
    });

    if (!adao) {
      console.log('❌ Usuário adao1980 não encontrado!');
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Usuário encontrado: ${adao.name} (${adao.email})`);
    console.log(`   User ID: ${adao.id}\n`);

    const updated = await prisma.product.updateMany({
      data: {
        producerId: adao.id
      }
    });

    console.log(`✅ ${updated.count} produtos transferidos para adao1980\n`);

    const products = await prisma.product.findMany({
      where: { producerId: adao.id }
    });

    console.log('📦 Produtos do adao1980:');
    products.forEach(p => {
      console.log(`   - ${p.title} (${p.status})`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
  }
})();
