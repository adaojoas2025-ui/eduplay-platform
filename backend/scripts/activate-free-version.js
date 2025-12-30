const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const updated = await prisma.app.update({
      where: { slug: 'mercado' },
      data: {
        freeWithAdsActive: true
      }
    });

    console.log('✅ App atualizado com sucesso!');
    console.log(JSON.stringify({
      id: updated.id,
      title: updated.title,
      freeWithAdsActive: updated.freeWithAdsActive,
      paidNoAdsActive: updated.paidNoAdsActive
    }, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
