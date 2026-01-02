/**
 * Test Real Product Creation Flow
 * Creates a real product in the local database and sends email
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const emailService = require('../src/services/email.service');
const logger = require('../src/utils/logger');

const prisma = new PrismaClient();

async function testRealProductCreation() {
  try {
    console.log('🧪 TESTE COMPLETO DE CRIAÇÃO DE PRODUTO\n');

    // 1. Find producer
    console.log('1️⃣ Buscando produtor...');
    const producer = await prisma.user.findUnique({
      where: { email: 'adao1980aguiar@gmail.com' }
    });

    if (!producer) {
      console.log('❌ Produtor não encontrado');
      return;
    }
    console.log(`✅ Produtor encontrado: ${producer.name} (${producer.email})\n`);

    // 2. Find admin
    console.log('2️⃣ Buscando administrador...');
    const admin = await prisma.user.findUnique({
      where: { email: 'ja.eduplay@gmail.com' }
    });

    if (!admin) {
      console.log('❌ Administrador não encontrado');
      return;
    }
    console.log(`✅ Admin encontrado: ${admin.name} (${admin.email})\n`);

    // 3. Create product
    console.log('3️⃣ Criando produto...');
    const productData = {
      title: `TESTE COMPLETO ${new Date().toLocaleTimeString('pt-BR')}`,
      slug: `teste-completo-${Date.now()}`,
      description: 'Este é um teste completo do fluxo de criação de produto e envio de email',
      price: 99.90,
      category: 'CURSO',
      status: 'PENDING_APPROVAL',
      producerId: producer.id,
      views: 0,
      sales: 0,
      level: 'Todos os níveis',
      language: 'Português',
      certificateIncluded: false,
      hasSupport: false,
      featured: false
    };

    const product = await prisma.product.create({
      data: productData
    });

    console.log(`✅ Produto criado: ${product.title}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Status: ${product.status}\n`);

    // 4. Send email to admin
    console.log('4️⃣ Enviando email para administrador...');
    console.log(`   De: EDUPLAY <ja.eduplay@gmail.com>`);
    console.log(`   Para: ${admin.email}`);
    console.log(`   Assunto: 🔔 Novo Produto Aguardando Aprovação: ${product.title}\n`);

    await emailService.sendProductPendingApprovalEmail(admin.email, {
      adminName: admin.name,
      productTitle: product.title,
      producerName: producer.name,
      productId: product.id,
      productDescription: product.description,
    });

    console.log('✅ Email enviado com sucesso!\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 TESTE COMPLETO BEM-SUCEDIDO!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📧 VERIFIQUE O EMAIL: ja.eduplay@gmail.com');
    console.log('');
    console.log('⚠️  Se não chegou na caixa de entrada, verifique:');
    console.log('   1. Pasta de SPAM / Lixo Eletrônico');
    console.log('   2. Pasta de Promoções (Gmail)');
    console.log('   3. Aguarde alguns segundos e atualize');
    console.log('');
    console.log('Detalhes do email:');
    console.log(`   Remetente: EDUPLAY <ja.eduplay@gmail.com>`);
    console.log(`   Destinatário: ${admin.email}`);
    console.log(`   Assunto: 🔔 Novo Produto Aguardando Aprovação: ${product.title}`);
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealProductCreation();
