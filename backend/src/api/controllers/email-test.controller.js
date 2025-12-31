/**
 * Email Test Controller
 * Endpoint temporário para debug de emails
 */

const emailService = require('../../services/email.service');
const userRepository = require('../../repositories/user.repository');
const { USER_ROLES } = require('../../utils/constants');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Testa envio de email para admin
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

        await emailService.sendProductPendingApprovalEmail(admin.email, {
          adminName: admin.name,
          productTitle: 'PRODUTO DE TESTE - Email Debug',
          producerName: 'Sistema de Testes',
          productId: 'test-123',
          productDescription: 'Este é um email de teste para verificar se os emails estão funcionando.'
        });

        logger.info('TEST: Email sent successfully', {
          adminEmail: admin.email
        });

        results.push({
          email: admin.email,
          status: 'success',
          message: 'Email enviado com sucesso'
        });
      } catch (emailError) {
        logger.error('TEST: Failed to send email', {
          adminEmail: admin.email,
          error: emailError.message,
          stack: emailError.stack
        });

        results.push({
          email: admin.email,
          status: 'error',
          error: emailError.message
        });
      }
    }

    return ApiResponse.success(res, 200, {
      admins: admins.length,
      results
    }, 'Teste de email concluído');

  } catch (error) {
    logger.error('TEST: Error in email test', {
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 500, `Erro no teste: ${error.message}`);
  }
});

module.exports = {
  testEmailToAdmin
};
