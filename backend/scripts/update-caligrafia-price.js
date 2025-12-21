const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Procurando produto caligrafia...\n');

  const product = await prisma.product.findFirst({
    where: {
      title: { contains: 'caligrafia', mode: 'insensitive' }
    },
    include: {
      producer: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!product) {
    console.log('❌ Produto não encontrado');
    return;
  }

  console.log('📦 PRODUTO ENCONTRADO:');
  console.log('   Título:', product.title);
  console.log('   Preço atual: R$', product.price);
  console.log('   Produtor:', product.producer.name, `(${product.producer.email})`);
  console.log('');

  // Atualizar preço para R$ 10,00
  const newPrice = 10.00;

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { price: newPrice }
  });

  console.log('✅ PREÇO ATUALIZADO!');
  console.log('   Novo preço: R$', updated.price);
  console.log('');
  console.log('💡 Agora tente comprar novamente com o novo preço.');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
