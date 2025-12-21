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

  // Verificar se já foi aprovado
  if (order.status === ORDER_STATUS.APPROVED) {
    logger.warn('Tentativa de aprovar pedido já aprovado', { orderId });
    return ApiResponse.success(
      res,
      200,
      { order },
      'Pedido já foi aprovado anteriormente'
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

  // Atualizar pedido para APROVADO
  logger.info('Atualizando status do pedido para APPROVED', {
    orderId,
    statusAntes: order.status,
    novoStatus: ORDER_STATUS.APPROVED
  });

  const updatedOrderAfterPayment = await orderService.updateOrderStatus(orderId, ORDER_STATUS.APPROVED, paymentData);

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

  // Enviar email com acesso ao produto
  try {
    const product = await productRepository.findProductById(order.productId);
    await emailService.sendProductAccessEmail(order.buyer, product, order);
    logger.info('Email de acesso enviado com sucesso', {
      orderId,
      buyerEmail: order.buyer.email,
      productId: product.id
    });
  } catch (emailError) {
    logger.error('Falha ao enviar email de acesso', {
      error: emailError.message,
      orderId
    });
    // Não bloqueia o fluxo se email falhar
  }

  // Buscar pedido atualizado
  const updatedOrder = await orderService.getOrderById(orderId, req.user.id);

  return ApiResponse.success(
    res,
    200,
    { order: updatedOrder },
    'Pagamento simulado aprovado com sucesso! Verifique seu email para acessar o produto.'
  );
});

module.exports = {
  approveTestPayment,
};
