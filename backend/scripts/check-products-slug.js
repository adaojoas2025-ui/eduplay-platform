const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductsSlugs() {
  try {
    console.log('🔍 Verificando produtos sem slug...\n');

    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true
      }
    });

    console.log(`📊 Total de produtos: ${products.length}\n`);

    const productsWithoutSlug = products.filter(p => !p.slug);

    if (productsWithoutSlug.length > 0) {
      console.log(`⚠️  Produtos SEM slug (${productsWithoutSlug.length}):`);
      productsWithoutSlug.forEach(p => {
        console.log(`   - ID: ${p.id}`);
        console.log(`     Título: ${p.title}`);
        console.log(`     Status: ${p.status}`);
        console.log('');
      });

      console.log('\n📝 Gerando slugs para produtos sem slug...');

      for (const product of productsWithoutSlug) {
        const slug = product.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        await prisma.product.update({
          where: { id: product.id },
          data: { slug: slug + '-' + product.id.substring(0, 8) }
        });

        console.log(`   ✅ Slug gerado para "${product.title}": ${slug}`);
      }

      console.log('\n✅ Todos os slugs foram gerados!');
    } else {
      console.log('✅ Todos os produtos têm slug!');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkProductsSlugs();
