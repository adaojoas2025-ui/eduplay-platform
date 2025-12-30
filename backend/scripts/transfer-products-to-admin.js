const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔄 Transferindo produtos para o admin...\n');

    const admin = await prisma.user.findUnique({
      where: { email: 'ja.eduplay@gmail.com' }
    });

    if (!admin) {
      console.log('❌ Admin não encontrado!');
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Admin encontrado: ${admin.name} (${admin.email})`);
    console.log(`   Admin ID: ${admin.id}\n`);

    const updated = await prisma.product.updateMany({
      data: {
        producerId: admin.id
      }
    });

    console.log(`✅ ${updated.count} produtos transferidos para o admin\n`);

    const products = await prisma.product.findMany({
      where: { producerId: admin.id }
    });

    console.log('📦 Produtos do admin:');
    products.forEach(p => {
      console.log(`   - ${p.title} (${p.status})`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
  }
})();
