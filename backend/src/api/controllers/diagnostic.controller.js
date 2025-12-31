/**
 * Diagnostic Controller
 * Endpoint para verificar logs e diagnósticos do sistema
 */

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const logger = require('../../utils/logger');
const userRepository = require('../../repositories/user.repository');
const productRepository = require('../../repositories/product.repository');
const { USER_ROLES } = require('../../utils/constants');

/**
 * Verifica últimos produtos criados e seus logs
 */
const checkRecentProducts = asyncHandler(async (req, res) => {
  try {
    // Buscar últimos 5 produtos criados
    const recentProducts = await productRepository.findAll({
      limit: 5,
      orderBy: { createdAt: 'desc' }
    });

    // Buscar todos os admins
    const admins = await userRepository.findUsersByRole(USER_ROLES.ADMIN);

    const diagnosticInfo = {
      recentProducts: recentProducts.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        createdAt: p.createdAt,
        producerId: p.producerId
      })),
      admins: admins.map(a => ({
        id: a.id,
        email: a.email,
        name: a.name
      })),
      emailConfig: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
        hasPassword: !!process.env.EMAIL_PASS
      },
      serverTime: new Date().toISOString()
    };

    logger.info('Diagnostic check performed', diagnosticInfo);

    return ApiResponse.success(res, 200, diagnosticInfo, 'Diagnóstico realizado com sucesso');
  } catch (error) {
    logger.error('Error in diagnostic check', {
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 500, `Erro no diagnóstico: ${error.message}`);
  }
});

/**
 * Testa envio de email para um email específico
 */
const testEmailToAddress = asyncHandler(async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return ApiResponse.error(res, 400, 'Email é obrigatório');
    }

    const emailService = require('../../services/email.service');

    logger.info('Testing email to specific address', { email, name });

    await emailService.sendProductPendingApprovalEmail(email, {
      adminName: name || 'Usuário',
      productTitle: 'TESTE DE DIAGNÓSTICO - Email',
      producerName: 'Sistema de Testes',
      productId: 'diagnostic-test',
      productDescription: 'Este é um email de teste de diagnóstico enviado em ' + new Date().toLocaleString('pt-BR')
    });

    logger.info('Test email sent successfully', { email });

    return ApiResponse.success(res, 200, { email, sentAt: new Date().toISOString() }, 'Email enviado com sucesso');
  } catch (error) {
    logger.error('Failed to send test email', {
      error: error.message,
      stack: error.stack
    });
    return ApiResponse.error(res, 500, `Erro ao enviar email: ${error.message}`);
  }
});

module.exports = {
  checkRecentProducts,
  testEmailToAddress
};
