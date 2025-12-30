const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        producer: true
      }
    });

    console.log('\n📦 Produtos no banco de dados:\n');
    products.forEach(p => {
      console.log(`Produto: ${p.title}`);
      console.log(`  Status: ${p.status}`);
      console.log(`  Vendedor: ${p.producer.name} (${p.producer.email})`);
      console.log(`  Producer ID: ${p.producerId}\n`);
    });

    const admin = await prisma.user.findUnique({
      where: { email: 'ja.eduplay@gmail.com' }
    });

    console.log(`\nAdmin ID: ${admin.id}`);
    console.log(`Admin Email: ${admin.email}\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
  }
})();
