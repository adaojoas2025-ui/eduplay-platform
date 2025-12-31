const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveAllPending() {
  try {
    // Buscar ID do admin
    const admin = await prisma.user.findUnique({
      where: { email: 'ja.eduplay@gmail.com' },
      select: { id: true, name: true }
    });

    if (!admin) {
      console.log('❌ Admin não encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('👤 Admin:', admin.name);

    // Aprovar todos os produtos pendentes
    const pendingProducts = await prisma.product.findMany({
      where: { status: 'PENDING_APPROVAL' },
      select: { id: true, title: true }
    });

    console.log('\n📋 Produtos pendentes:', pendingProducts.length);

    for (const product of pendingProducts) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          status: 'PUBLISHED',
          approvedBy: admin.id,
          approvedAt: new Date()
        }
      });
      console.log('✅ Aprovado:', product.title);
    }

    console.log('\n🎉 Todos os produtos foram aprovados!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

approveAllPending();
