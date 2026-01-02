/**
 * Verify Resend API Status
 * Checks if the Resend API key is working correctly
 */

require('dotenv').config();
const { Resend } = require('resend');

async function verifyResendStatus() {
  try {
    console.log('🔍 Verificando status do Resend...\n');

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.log('❌ RESEND_API_KEY não encontrada!');
      return;
    }

    console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...');
    console.log('');

    const resend = new Resend(apiKey);

    // Tentar enviar email de teste
    console.log('📧 Tentando enviar email de teste via Resend...\n');

    const emailData = {
      from: 'EDUPLAY <ja.eduplay@gmail.com>',
      to: 'ja.eduplay@gmail.com',
      subject: `🧪 TESTE DIRETO RESEND - ${new Date().toLocaleString('pt-BR')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">🧪 Teste Direto do Resend</h1>
          <p>Este email foi enviado DIRETAMENTE via API do Resend.</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Timestamp:</strong> ${Date.now()}</p>
          <hr>
          <p style="color: #6B7280; font-size: 14px;">
            Se você recebeu este email, o Resend está funcionando! 🎉
          </p>
        </div>
      `,
    };

    console.log('Enviando de:', emailData.from);
    console.log('Para:', emailData.to);
    console.log('Assunto:', emailData.subject);
    console.log('');

    const response = await resend.emails.send(emailData);

    console.log('✅ RESPOSTA DO RESEND:');
    console.log('');
    console.log(JSON.stringify(response, null, 2));
    console.log('');

    if (response.id) {
      console.log('🎉 Email enviado com sucesso!');
      console.log('ID do Email:', response.id);
    } else if (response.error) {
      console.log('❌ ERRO do Resend:');
      console.log('');
      console.log(JSON.stringify(response.error, null, 2));
    }

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:');
    console.error('');
    console.error('Mensagem:', error.message);
    console.error('');

    if (error.response) {
      console.error('Resposta do servidor:');
      console.error(JSON.stringify(error.response, null, 2));
    }

    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }

    console.error('');
    console.error('Stack completo:');
    console.error(error);
  }
}

verifyResendStatus();
