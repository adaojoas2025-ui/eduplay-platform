/**
 * VVC - Verificar, Validar, Confirmar SendGrid
 * Script completo para testar toda a integração do SendGrid
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

async function vvcSendGrid() {
  try {
    log.title('VVC - VERIFICAR, VALIDAR, CONFIRMAR SENDGRID');

    // ==========================================
    // 1. VERIFICAR Configuração
    // ==========================================
    log.title('ETAPA 1/3: VERIFICAR Configuração');

    const apiKey = process.env.SENDGRID_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    if (!apiKey) {
      log.error('SENDGRID_API_KEY não encontrada no .env!');
      log.info('Adicione ao .env: SENDGRID_API_KEY=sua-api-key-aqui');
      return;
    }

    log.success('SENDGRID_API_KEY encontrada');
    log.info(`Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log('');

    if (!emailFrom) {
      log.warning('EMAIL_FROM não encontrada, usando default');
    } else {
      log.success(`EMAIL_FROM: ${emailFrom}`);
    }

    const fromAddress = emailFrom || 'EDUPLAY <ja.eduplay@gmail.com>';
    log.info(`Remetente que será usado: ${fromAddress}`);
    console.log('');

    // ==========================================
    // 2. VALIDAR SendGrid API
    // ==========================================
    log.title('ETAPA 2/3: VALIDAR SendGrid API');

    sgMail.setApiKey(apiKey);
    log.success('SendGrid client inicializado');
    console.log('');

    log.info('Enviando email de teste...');
    console.log('');

    const timestamp = new Date().toLocaleString('pt-BR');
    const msg = {
      to: 'ja.eduplay@gmail.com',
      from: fromAddress,
      subject: `🧪 VVC SendGrid - ${timestamp}`,
      text: `Teste VVC do SendGrid - ${timestamp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🧪 VVC SendGrid</h1>
          </div>

          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d3748; margin-top: 0;">Teste de Validação Completo</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
              <h3 style="color: #48bb78; margin-top: 0;">✅ Verificado</h3>
              <p style="color: #4a5568; margin: 5px 0;">• API Key configurada corretamente</p>
              <p style="color: #4a5568; margin: 5px 0;">• SendGrid client inicializado</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4299e1;">
              <h3 style="color: #4299e1; margin-top: 0;">✅ Validado</h3>
              <p style="color: #4a5568; margin: 5px 0;">• Conexão com API SendGrid estabelecida</p>
              <p style="color: #4a5568; margin: 5px 0;">• Email enviado com sucesso</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9f7aea;">
              <h3 style="color: #9f7aea; margin-top: 0;">✅ Confirmado</h3>
              <p style="color: #4a5568; margin: 5px 0;">• Você recebeu este email!</p>
              <p style="color: #4a5568; margin: 5px 0;">• SendGrid está 100% funcional</p>
            </div>

            <div style="background: #edf2f7; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #718096; margin: 5px 0; font-size: 14px;"><strong>Data/Hora:</strong> ${timestamp}</p>
              <p style="color: #718096; margin: 5px 0; font-size: 14px;"><strong>Remetente:</strong> ${fromAddress}</p>
              <p style="color: #718096; margin: 5px 0; font-size: 14px;"><strong>Timestamp:</strong> ${Date.now()}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
              <p style="color: #48bb78; font-size: 18px; font-weight: bold; margin: 0;">
                🎉 SendGrid está funcionando perfeitamente!
              </p>
            </div>
          </div>
        </div>
      `,
    };

    log.info(`De: ${msg.from}`);
    log.info(`Para: ${msg.to}`);
    log.info(`Assunto: ${msg.subject}`);
    console.log('');

    const response = await sgMail.send(msg);

    // ==========================================
    // 3. CONFIRMAR Resultado
    // ==========================================
    log.title('ETAPA 3/3: CONFIRMAR Resultado');

    const statusCode = response[0].statusCode;
    const headers = response[0].headers;

    if (statusCode === 202) {
      log.success('Email aceito pelo SendGrid!');
      log.info(`Status Code: ${statusCode} (Accepted)`);
      console.log('');

      if (headers['x-message-id']) {
        log.success(`Message ID: ${headers['x-message-id']}`);
      }

      console.log('');
      log.title('🎉 VVC COMPLETO - TODOS OS TESTES PASSARAM!');

      console.log('📧 Próximos passos:');
      console.log('');
      console.log('   1. Verifique o email: ja.eduplay@gmail.com');
      console.log('   2. Se não chegou na caixa de entrada:');
      console.log('      • Confira a pasta de SPAM');
      console.log('      • Confira a pasta de Promoções (Gmail)');
      console.log('      • Aguarde 1-2 minutos');
      console.log('');
      console.log('   3. Se você recebeu o email VVC:');
      console.log('      ✅ SendGrid está 100% funcional!');
      console.log('      ✅ Pode fazer deploy no Render!');
      console.log('');

      log.title('📋 CHECKLIST PARA PRODUÇÃO');
      console.log('   [ ] Verificar sender ja.eduplay@gmail.com no SendGrid');
      console.log('       https://app.sendgrid.com/settings/sender_auth/senders');
      console.log('');
      console.log('   [ ] Adicionar SENDGRID_API_KEY no Render');
      console.log('       https://dashboard.render.com/web/srv-d5a5badactks73f4mcq0/env');
      console.log('');
      console.log('   [ ] Aguardar deploy (2-3 min)');
      console.log('');
      console.log('   [ ] Testar criação de produto em produção');
      console.log('');

    } else {
      log.warning(`Status code inesperado: ${statusCode}`);
      log.info('Headers completos:');
      console.log(JSON.stringify(headers, null, 2));
    }

  } catch (error) {
    console.log('');
    log.title('❌ ERRO NO VVC');

    log.error(`Mensagem: ${error.message}`);
    console.log('');

    if (error.response) {
      const { statusCode, body } = error.response;

      log.error(`Status Code: ${statusCode}`);
      console.log('');

      if (body && body.errors) {
        log.error('Detalhes do erro:');
        console.log('');
        body.errors.forEach((err, index) => {
          console.log(`   ${index + 1}. ${err.message}`);
          if (err.field) {
            console.log(`      Campo: ${err.field}`);
          }
          if (err.help) {
            console.log(`      Ajuda: ${err.help}`);
          }
        });
        console.log('');

        // Diagnosticar erros comuns
        const errorMsg = JSON.stringify(body.errors);

        if (errorMsg.includes('Sender Identity')) {
          log.title('🔧 SOLUÇÃO: Verificar Sender');
          console.log('O email remetente não está verificado no SendGrid.');
          console.log('');
          console.log('Passos para resolver:');
          console.log('');
          console.log('1. Acesse: https://app.sendgrid.com/settings/sender_auth/senders');
          console.log('2. Clique em "Create New Sender"');
          console.log('3. Preencha com: ja.eduplay@gmail.com');
          console.log('4. Verifique o email que o SendGrid enviar');
          console.log('5. Execute este script novamente');
          console.log('');
        }

        if (errorMsg.includes('API key is invalid')) {
          log.title('🔧 SOLUÇÃO: API Key Inválida');
          console.log('A SENDGRID_API_KEY está incorreta ou expirada.');
          console.log('');
          console.log('Passos para resolver:');
          console.log('');
          console.log('1. Acesse: https://app.sendgrid.com/settings/api_keys');
          console.log('2. Crie uma nova API Key');
          console.log('3. Copie a nova key');
          console.log('4. Atualize no .env: SENDGRID_API_KEY=nova-key-aqui');
          console.log('5. Execute este script novamente');
          console.log('');
        }
      }
    }

    console.log('');
    log.error('Stack completo:');
    console.error(error.stack);
  }
}

// Executar VVC
console.log('');
vvcSendGrid();
