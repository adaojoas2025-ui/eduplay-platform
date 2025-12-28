const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteProducts() {
  try {
    // Deletar todos os produtos
    const result = await prisma.product.deleteMany({});
    console.log(`✅ ${result.count} produto(s) deletado(s) com sucesso!`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao deletar produtos:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

deleteProducts();
