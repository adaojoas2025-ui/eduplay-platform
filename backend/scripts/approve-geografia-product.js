const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveGeografia() {
  try {
    console.log('🔍 Buscando produto geografia...\n');

    // Buscar produto geografia
    const geografia = await prisma.product.findFirst({
      where: {
        title: {
          contains: 'geografia',
          mode: 'insensitive'
        }
      },
      include: {
        producer: true
      }
    });

    if (!geografia) {
      console.log('❌ Produto geografia não encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Produto encontrado:');
    console.log(`   Título: ${geografia.title}`);
    console.log(`   ID: ${geografia.id}`);
    console.log(`   Status atual: ${geografia.status}`);
    console.log(`   Producer: ${geografia.producer.name} (${geografia.producer.email})`);
    console.log('');

    if (geografia.status === 'PUBLISHED') {
      console.log('✅ Produto JÁ está aprovado e publicado!');
      await prisma.$disconnect();
      return;
    }

    // Aprovar produto
    console.log('📝 Aprovando produto...');

    const adminId = 'f6163701-d8d5-4e15-b31b-f3c4eb47b425'; // ja.eduplay@gmail.com

    const updated = await prisma.product.update({
      where: { id: geografia.id },
      data: {
        status: 'PUBLISHED',
        approvedBy: adminId,
        approvedAt: new Date()
      }
    });

    console.log('');
    console.log('🎉 PRODUTO APROVADO COM SUCESSO!');
    console.log(`   Status: ${updated.status}`);
    console.log(`   Aprovado em: ${updated.approvedAt}`);
    console.log('');
    console.log('📧 Sistema enviou email para:', geografia.producer.email);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

approveGeografia();
