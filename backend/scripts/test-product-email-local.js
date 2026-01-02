/**
 * Test Product Email Flow Locally
 * Simulates the product creation and approval email flow
 */

require('dotenv').config();
const { sendEmail } = require('../src/config/email');
const logger = require('../src/utils/logger');

async function testProductEmailFlow() {
  try {
    console.log('🧪 Testando fluxo de email de produto localmente...\n');

    // Simulate product pending approval email
    const productData = {
      title: 'TESTE LOCAL - Produto Pendente',
      producer: {
        name: 'Adão João Aguiar',
        email: 'adao1980aguiar@gmail.com'
      }
    };

    const adminEmail = 'ja.eduplay@gmail.com';

    console.log('📧 Enviando email de produto pendente para admin...');
    console.log('   Admin:', adminEmail);
    console.log('   Produto:', productData.title);
    console.log('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">🔔 Novo Produto Aguardando Aprovação</h1>

        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${productData.title}</h2>
          <p><strong>Produtor:</strong> ${productData.producer.name}</p>
          <p><strong>Email:</strong> ${productData.producer.email}</p>
        </div>

        <p>Um novo produto foi criado e está aguardando sua aprovação.</p>

        <div style="margin: 30px 0;">
          <a href="https://eduplay-platform.vercel.app/admin/products"
             style="background-color: #4F46E5; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Produtos Pendentes
          </a>
        </div>

        <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">

        <p style="color: #6B7280; font-size: 14px;">
          📅 Data: ${new Date().toLocaleString('pt-BR')}<br>
          🏢 EDUPLAY Platform
        </p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `🔔 Novo Produto Aguardando Aprovação: ${productData.title}`,
      html: emailHtml,
      text: `Novo produto aguardando aprovação: ${productData.title} por ${productData.producer.name}`
    });

    console.log('✅ Email de produto pendente enviado com sucesso!\n');

    // Simulate product approval email
    console.log('📧 Enviando email de aprovação para produtor...');
    console.log('   Produtor:', productData.producer.email);
    console.log('');

    const approvalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">✅ Produto Aprovado!</h1>

        <p>Olá ${productData.producer.name},</p>

        <p>Seu produto foi <strong style="color: #10B981;">APROVADO</strong> e já está disponível na plataforma!</p>

        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${productData.title}</h2>
          <p><strong>Status:</strong> <span style="color: #10B981;">PUBLICADO</span></p>
        </div>

        <div style="margin: 30px 0;">
          <a href="https://eduplay-platform.vercel.app/seller/products"
             style="background-color: #10B981; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Meus Produtos
          </a>
        </div>

        <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">

        <p style="color: #6B7280; font-size: 14px;">
          Parabéns! Seu produto agora está disponível para venda! 🎉
        </p>
      </div>
    `;

    await sendEmail({
      to: productData.producer.email,
      subject: `Produto Aprovado: ${productData.title}`,
      html: approvalHtml,
      text: `Seu produto ${productData.title} foi aprovado!`
    });

    console.log('✅ Email de aprovação enviado com sucesso!\n');
    console.log('🎉 TESTE COMPLETO BEM-SUCEDIDO!');
    console.log('📬 Verifique as caixas de entrada:');
    console.log('   - ja.eduplay@gmail.com (notificação de produto pendente)');
    console.log('   - adao1980aguiar@gmail.com (notificação de aprovação)');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error(error);
  }
}

testProductEmailFlow();
