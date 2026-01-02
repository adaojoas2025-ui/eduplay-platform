/**
 * Test SendGrid Integration
 * Quick test to verify SendGrid is working
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
  try {
    console.log('🧪 TESTE DO SENDGRID\n');

    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      console.log('❌ SENDGRID_API_KEY não encontrada!');
      return;
    }

    console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...\n');

    sgMail.setApiKey(apiKey);

    console.log('📧 Enviando email de teste...\n');

    const msg = {
      to: 'ja.eduplay@gmail.com',
      from: 'EDUPLAY <noreply@sendgrid.net>',
      subject: `🧪 Teste SendGrid - ${new Date().toLocaleString('pt-BR')}`,
      text: 'Este é um email de teste do SendGrid',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">🧪 Teste do SendGrid</h1>
          <p>Este email foi enviado via <strong>SendGrid API</strong>.</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Timestamp:</strong> ${Date.now()}</p>
          <hr>
          <p style="color: #6B7280; font-size: 14px;">
            Se você recebeu este email, o SendGrid está funcionando! 🎉
          </p>
        </div>
      `,
    };

    console.log('De:', msg.from);
    console.log('Para:', msg.to);
    console.log('Assunto:', msg.subject);
    console.log('');

    const response = await sgMail.send(msg);

    console.log('✅ RESPOSTA DO SENDGRID:');
    console.log('');
    console.log('Status Code:', response[0].statusCode);
    console.log('Headers:', response[0].headers);
    console.log('');

    console.log('🎉 Email enviado com sucesso via SendGrid!');
    console.log('');
    console.log('📧 VERIFIQUE: ja.eduplay@gmail.com');

  } catch (error) {
    console.error('❌ ERRO:');
    console.error('');
    console.error('Mensagem:', error.message);
    console.error('');

    if (error.response) {
      console.error('Status Code:', error.response.statusCode);
      console.error('Body:', error.response.body);
    }

    console.error('');
    console.error('Stack:', error.stack);
  }
}

testSendGrid();
