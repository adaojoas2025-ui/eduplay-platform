const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: '12f3b05e-23ad-4044-868f-dd2268d6fdeb'
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('\n=== SEUS PRODUTOS RECENTES ===\n');

    products.forEach((p, i) => {
      console.log(`${i+1}. ${p.title}`);
      console.log(`   Status: ${p.status} ${p.status === 'DRAFT' ? '❌ (não pode adicionar ao carrinho)' : '✅ (pode adicionar ao carrinho)'}`);
      console.log(`   ID: ${p.id.substring(0, 13)}...`);
      console.log(`   Criado: ${new Date(p.createdAt).toLocaleString('pt-BR')}\n`);
    });

    const draftCount = products.filter(p => p.status === 'DRAFT').length;
    const publishedCount = products.filter(p => p.status === 'PUBLISHED').length;

    console.log(`\nRESUMO:`);
    console.log(`- DRAFT (rascunho): ${draftCount} produtos`);
    console.log(`- PUBLISHED (publicado): ${publishedCount} produtos\n`);

    if (draftCount > 0) {
      console.log('⚠️  Produtos em DRAFT precisam ser publicados para serem vendidos!\n');
    }

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
