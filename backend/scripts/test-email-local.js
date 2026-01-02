/**
 * Test Email Locally
 * Tests if Resend is working with the configured API key
 */

require('dotenv').config();
const { Resend } = require('resend');

async function testEmailLocal() {
  try {
    console.log('🔍 Verificando configuração local...\n');

    // Check if RESEND_API_KEY exists
    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY não encontrada no .env');
      console.log('⚠️  Adicione RESEND_API_KEY=rnd_KEeok6oD7nWFmLejFY1dtHgbISus no .env');
      return;
    }

    console.log('✅ RESEND_API_KEY encontrada');
    console.log('📧 Inicializando Resend...\n');

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailData = {
      from: 'EDUPLAY <ja.eduplay@gmail.com>',
      to: 'ja.eduplay@gmail.com',
      subject: '🧪 TESTE LOCAL - Resend funcionando!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">✅ Teste Local Bem-Sucedido!</h1>
          <p>Este email foi enviado do seu ambiente local usando Resend.</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Ambiente:</strong> Local Development</p>
          <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 14px;">
            Se você está vendo este email, significa que o Resend está configurado corretamente! 🎉
          </p>
        </div>
      `,
    };

    console.log('📤 Enviando email de teste...');
    console.log('   De:', emailData.from);
    console.log('   Para:', emailData.to);
    console.log('   Assunto:', emailData.subject);
    console.log('');

    const response = await resend.emails.send(emailData);

    console.log('✅ Email enviado com sucesso via Resend!\n');
    console.log('📋 Detalhes da resposta:');
    console.log('   ID:', response.id);
    console.log('');
    console.log('🎉 TESTE BEM-SUCEDIDO! Verifique o email ja.eduplay@gmail.com');

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    console.error('\n📋 Detalhes do erro:');
    console.error(error);
  }
}

testEmailLocal();
