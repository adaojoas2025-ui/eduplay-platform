/**
 * Test Payment Controller
 * Sistema profissional de simulação de pagamento para testes
 * @module controllers/test-payment
 */

const orderService = require('../../services/order.service');
const productRepository = require('../../repositories/product.repository');
const emailService = require('../../services/email.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');
const { ORDER_STATUS } = require('../../utils/constants');

/**
 * Simula pagamento aprovado instantâneo
 * Útil para desenvolvimento e testes quando Mercado Pago não está disponível
 * @route POST /api/v1/test/approve-payment/:orderId
 * @access Private (Buyer)
 */
const approveTestPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  logger.info('Iniciando simulação de pagamento', { orderId, userId: req.user.id });

  // Buscar pedido
  const order = await orderService.getOrderById(orderId, req.user.id);

  if (!order) {
    logger.error('Pedido não encontrado para simulação', { orderId });
    return ApiResponse.error(res, 404, 'Pedido não encontrado');
  }

  // Verificar se já foi concluído
  if (order.status === ORDER_STATUS.COMPLETED) {
    logger.warn('Tentativa de aprovar pedido já concluído', { orderId });
    return ApiResponse.success(
      res,
      200,
      { order },
      'Pedido já foi concluído anteriormente'
    );
  }

  // Simular dados de pagamento aprovado
  const paymentData = {
    paymentStatus: 'approved',
    paymentDetails: {
      paymentId: `TEST-${Date.now()}`,
      status: 'approved',
      statusDetail: 'accredited',
      paymentType: 'test_payment',
      paymentMethod: 'test_simulator',
      transactionAmount: order.amount,
    },
    paidAt: new Date(),
  };

  // Atualizar pedido para COMPLETO (aprova e finaliza)
  logger.info('Atualizando status do pedido para COMPLETED', {
    orderId,
    statusAntes: order.status,
    novoStatus: ORDER_STATUS.COMPLETED
  });

  const updatedOrderAfterPayment = await orderService.updateOrderStatus(orderId, ORDER_STATUS.COMPLETED, paymentData);

  logger.info('Pedido atualizado com sucesso', {
    orderId,
    statusDepois: updatedOrderAfterPayment.status,
    paidAt: updatedOrderAfterPayment.paidAt
  });

  logger.info('Pagamento de teste aprovado', {
    orderId,
    amount: order.amount,
    buyerId: req.user.id,
    finalStatus: updatedOrderAfterPayment.status
  });

  // Enviar email com acesso ao produto (apenas se for compra de produto, não app)
  try {
    if (order.productId) {
      // Compra de produto
      const product = await productRepository.findProductById(order.productId);
      await emailService.sendProductAccessEmail(order.buyer, product, order);
      logger.info('Email de acesso ao produto enviado com sucesso', {
        orderId,
        buyerEmail: order.buyer.email,
        productId: product.id
      });
    } else if (order.metadata && order.metadata.type === 'APP_PURCHASE') {
      // Compra de app - não precisa enviar email, usuário já tem acesso
      logger.info('App purchase approved - user now has access', {
        orderId,
        buyerEmail: order.buyer.email,
        appId: order.metadata.appId,
        appTitle: order.metadata.appTitle
      });
    }
  } catch (emailError) {
    logger.error('Falha ao enviar email de acesso', {
      error: emailError.message,
      orderId
    });
    // Não bloqueia o fluxo se email falhar
  }

  // Buscar pedido atualizado
  const updatedOrder = await orderService.getOrderById(orderId, req.user.id);

  // Mensagem de resposta adequada ao tipo de compra
  const successMessage = order.metadata && order.metadata.type === 'APP_PURCHASE'
    ? 'Pagamento aprovado com sucesso! Agora você pode baixar a versão sem propaganda do app.'
    : 'Pagamento simulado aprovado com sucesso! Verifique seu email para acessar o produto.';

  return ApiResponse.success(
    res,
    200,
    { order: updatedOrder },
    successMessage
  );
});

module.exports = {
  approveTestPayment,
};
