const { PrismaClient } = require('@prisma/client');
const emailService = require('../src/services/email.service');
const prisma = new PrismaClient();

async function testEmailNotification() {
  try {
    console.log('🔍 Buscando admin...');

    // Buscar admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ Nenhum admin encontrado no banco de dados.');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Admin encontrado:', admin.name, '-', admin.email);

    // Buscar um produto pendente ou criar dados de teste
    const pendingProduct = await prisma.product.findFirst({
      where: { status: 'PENDING_APPROVAL' },
      include: { producer: true }
    });

    console.log('\n📧 Enviando email de teste para o admin...');

    if (pendingProduct) {
      // Usar dados reais do produto
      await emailService.sendProductPendingApprovalEmail(admin.email, {
        adminName: admin.name,
        productTitle: pendingProduct.title,
        producerName: pendingProduct.producer.name,
        productId: pendingProduct.id,
        productDescription: pendingProduct.description,
      });
    } else {
      // Usar dados de teste
      await emailService.sendProductPendingApprovalEmail(admin.email, {
        adminName: admin.name,
        productTitle: 'Produto de Teste',
        producerName: 'Produtor Teste',
        productId: 'test-id',
        productDescription: 'Este é um email de teste para verificar se as notificações de aprovação estão funcionando.',
      });
    }

    console.log('✅ Email de teste enviado com sucesso!');
    console.log('📬 Verifique a caixa de entrada de:', admin.email);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao testar email:', error.message);
    console.error('Detalhes:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testEmailNotification();
