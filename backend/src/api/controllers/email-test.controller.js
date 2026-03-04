/**
 * Email Test Controller
 * Endpoint temporário para debug de emails
 */

const emailService = require('../../services/email.service');
const emailConfig = require('../../config/email');
const userRepository = require('../../repositories/user.repository');
const { USER_ROLES } = require('../../utils/constants');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Testa envio de email para admin COM ERROS DETALHADOS
 */
const testEmailToAdmin = asyncHandler(async (req, res) => {
  try {
    // Buscar todos os administradores
    const admins = await userRepository.findUsersByRole(USER_ROLES.ADMIN);

    logger.info('TEST: Found admins', {
      adminCount: admins.length,
      adminEmails: admins.map(a => a.email)
    });

    if (admins.length === 0) {
      return ApiResponse.error(res, 404, 'Nenhum administrador encontrado no banco de dados');
    }

    const results = [];

    // Tentar enviar para cada admin
    for (const admin of admins) {
      try {
        logger.info('TEST: Sending test email to admin', {
          adminEmail: admin.email,
          adminName: admin.name
        });

        // IMPORTANTE: NÃO capturar o erro aqui para ver o erro real
        const emailResult = await emailService.sendProductPendingApprovalEmail(admin.email, {
          adminName: admin.name,
          productTitle: 'PRODUTO DE TESTE - Email Debug',
          producerName: 'Sistema de Testes',
          productId: 'test-123',
          productDescription: 'Este é um email de teste para verificar se os emails estão funcionando.'
        });

        logger.info('TEST: Email sent successfully', {
          adminEmail: admin.email,
          result: emailResult
        });

        results.push({
          email: admin.email,
          status: 'success',
          message: 'Email enviado com sucesso',
          result: emailResult
        });
      } catch (emailError) {
        logger.error('TEST: Failed to send email', {
          adminEmail: admin.email,
          error: emailError.message,
          errorCode: emailError.code,
          errorName: emailError.name,
          stack: emailError.stack,
          fullError: JSON.stringify(emailError, null, 2)
        });

        results.push({
          email: admin.email,
          status: 'error',
          error: emailError.message,
          errorCode: emailError.code,
          errorName: emailError.name,
          errorDetails: emailError.toString()
        });
      }
    }

    return ApiResponse.success(res, 200, {
      admins: admins.length,
      results,
      emailConfig: {
        activeProvider: emailConfig.getActiveService(),
        useResend: !!process.env.RESEND_API_KEY,
        resendFrom: process.env.RESEND_FROM || 'não configurado',
        usingSendGrid: !!process.env.SENDGRID_API_KEY,
        smtpUser: process.env.EMAIL_USER || 'não configurado',
        hasSmtpPass: !!process.env.EMAIL_PASS,
        emailFrom: process.env.EMAIL_FROM || 'não configurado',
      }
    }, 'Teste de email concluído');

  } catch (error) {
    logger.error('TEST: Error in email test', {
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 500, `Erro no teste: ${error.message}`);
  }
});

/**
 * Status público dos provedores de email (sem autenticação, sem enviar email)
 */
const getEmailStatus = (_req, res) => {
  const active = emailConfig.getActiveService();
  return ApiResponse.success(res, 200, {
    activeProvider: active,
    isWorking: active !== 'none',
    providers: {
      resend: !!process.env.RESEND_API_KEY,
      sendgrid: !!process.env.SENDGRID_API_KEY,
      smtp: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    },
  }, active === 'none'
    ? 'Nenhum provedor de email configurado no Render'
    : `Email ativo via: ${active}`
  );
};

module.exports = {
  testEmailToAdmin,
  getEmailStatus,
};
