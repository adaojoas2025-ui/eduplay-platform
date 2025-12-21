const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function publishAllProducts() {
  try {
    console.log('\n=== PUBLICANDO TODOS OS PRODUTOS EM DRAFT ===\n');

    // Encontrar todos os produtos em DRAFT
    const draftProducts = await prisma.product.findMany({
      where: {
        status: 'DRAFT'
      },
      select: {
        id: true,
        title: true,
        status: true,
        producer: {
          select: {
            email: true
          }
        }
      }
    });

    console.log(`Encontrados: ${draftProducts.length} produtos em DRAFT\n`);

    if (draftProducts.length === 0) {
      console.log('✅ Nenhum produto em DRAFT. Todos já estão publicados!\n');
      return;
    }

    // Mostrar os produtos que serão publicados
    draftProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   ID: ${product.id.substring(0, 13)}...`);
      console.log(`   Vendedor: ${product.producer.email}`);
      console.log(`   Status atual: ${product.status}\n`);
    });

    // Publicar todos de uma vez
    console.log('Publicando todos os produtos...\n');

    const result = await prisma.product.updateMany({
      where: {
        status: 'DRAFT'
      },
      data: {
        status: 'PUBLISHED'
      }
    });

    console.log(`✅ SUCESSO! ${result.count} produtos publicados!\n`);
    console.log('========================================');
    console.log('Agora todos os produtos podem ser comprados!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

publishAllProducts();
