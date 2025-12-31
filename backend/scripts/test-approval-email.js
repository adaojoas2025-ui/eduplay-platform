const { PrismaClient } = require('@prisma/client');
const emailService = require('../src/services/email.service');
const prisma = new PrismaClient();

async function testApprovalEmail() {
  try {
    console.log('🔍 Buscando produtor e produto para teste...');

    // Buscar produtor (adao1980aguiar@gmail.com)
    const producer = await prisma.user.findUnique({
      where: { email: 'adao1980aguiar@gmail.com' }
    });

    if (!producer) {
      console.log('❌ Produtor não encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Produtor encontrado:', producer.name, '-', producer.email);

    // Buscar um produto do produtor
    const product = await prisma.product.findFirst({
      where: { producerId: producer.id }
    });

    if (!product) {
      console.log('❌ Nenhum produto encontrado para este produtor');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Produto encontrado:', product.title);
    console.log('\n📧 Enviando email de aprovação...');

    // Enviar email de teste
    await emailService.sendProductApprovedEmail(product, producer);

    console.log('✅ Email de aprovação enviado com sucesso!');
    console.log('📬 Verifique a caixa de entrada de:', producer.email);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao testar email:', error.message);
    console.error('Stack:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testApprovalEmail();
