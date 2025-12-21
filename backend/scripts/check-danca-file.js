const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDancaFile() {
  try {
    const product = await prisma.product.findFirst({
      where: {
        title: {
          contains: 'dança',
          mode: 'insensitive'
        }
      }
    });

    if (!product) {
      console.log('❌ Produto "dança" não encontrado');
      return;
    }

    console.log('\n=== PRODUTO DANÇA ===\n');
    console.log('ID:', product.id);
    console.log('Título:', product.title);
    console.log('fileUrl:', product.fileUrl || 'VAZIO');
    console.log('filesUrl:', product.filesUrl || 'VAZIO');
    console.log('Status:', product.status);
    console.log('\n');

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDancaFile();
