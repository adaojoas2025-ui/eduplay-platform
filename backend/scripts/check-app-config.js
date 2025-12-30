const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const app = await prisma.app.findFirst({
      where: { slug: 'mercado' }
    });

    console.log('App Configuration:');
    console.log(JSON.stringify({
      id: app.id,
      title: app.title,
      freeWithAdsActive: app.freeWithAdsActive,
      paidNoAdsActive: app.paidNoAdsActive,
      freeWithAdsUrl: app.freeWithAdsUrl,
      paidNoAdsUrl: app.paidNoAdsUrl,
      paidNoAdsPrice: app.paidNoAdsPrice
    }, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
