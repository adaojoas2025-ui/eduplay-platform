/**
 * Payment Service
 * Business logic for payment operations
 * @module services/payment
 */

const mercadopago = require('../config/mercadopago');
const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const emailService = require('./email.service');
const pixTransferService = require('./pixTransfer.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config/env');
const { ORDER_STATUS } = require('../utils/constants');

/**
 * Create payment preference for order
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Payment preference
 */
const createPaymentPreference = async (order, amountOverride = null) => {
  try {
    const product = order.product;
    if (!product) {
      throw ApiError.notFound('Product not found for this order');
    }

    // Split name into first and last name
    const nameParts = (order.buyer.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'EducaplayJA';

    // Determine payment type from order metadata
    const paymentType = (order.metadata && order.metadata.paymentType) || 'pix';

    // Configure payment method restrictions
    let paymentMethodsConfig = {};
    if (paymentType === 'pix') {
      paymentMethodsConfig = {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'prepaid_card' },
          { id: 'ticket' },
        ],
      };
    } else if (paymentType === 'card') {
      paymentMethodsConfig = {
        excluded_payment_types: [
          { id: 'bank_transfer' },
          { id: 'ticket' },
        ],
        installments: 12,
      };
    }

    const preferenceData = {
      items: [
        {
          id: product.id,
          title: product.title.substring(0, 256),
          description: product.description ? product.description.substring(0, 256) : product.title.substring(0, 256),
          picture_url: product.thumbnailUrl || `${config.frontend.url}/logo.png`,
          category_id: 'others',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amountOverride ? Number(amountOverride) : Number(order.amount),
        },
      ],
      payer: {
        email: order.buyer.email,
        name: order.buyer.name,
        first_name: firstName,
        last_name: lastName,
      },
      payment_methods: paymentMethodsConfig,
      back_urls: {
        success: `${config.frontend.url}/#/order/${order.id}/success`,
        failure: `${config.frontend.url}/#/order/${order.id}/failure`,
        pending: `${config.frontend.url}/#/order/${order.id}/pending`,
      },
      auto_return: 'approved',
      notification_url: `${config.backend.url}/api/v1/payments/webhook`,
      external_reference: order.id,
      statement_descriptor: 'EDUCAPLAYJA',
      binary_mode: false,
    };

    const preference = await mercadopago.createPreference(preferenceData);

    // Update order with payment ID
    await orderRepository.updateOrder(order.id, {
      paymentId: preference.id,
    });

    logger.info('Payment preference created', {
      orderId: order.id,
      preferenceId: preference.id,
    });

    return {
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    };
  } catch (error) {
    logger.error('Error creating payment preference:', error);
    throw error;
  }
};

/**
 * Create direct PIX payment (transparent checkout — no redirect to Mercado Pago)
 * @param {Object} order - Order object with buyer and product included
 * @returns {Promise<Object>} PIX QR code data
 */
const createPixPayment = async (order, amountOverride = null) => {
  try {
    const product = order.product;
    if (!product) throw ApiError.notFound('Product not found for this order');

    const nameParts = (order.buyer.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'EducaplayJA';

    const payment = await mercadopago.createPayment({
      transaction_amount: Number(amountOverride || order.amount),
      description: product.title.substring(0, 256),
      payment_method_id: 'pix',
      payer: {
        email: order.buyer.email,
        first_name: firstName,
        last_name: lastName,
      },
      notification_url: `${config.backend.url}/api/v1/payments/webhook`,
      external_reference: order.id,
    });

    await orderRepository.updateOrder(order.id, { paymentId: String(payment.id) });

    logger.info('PIX payment created', { orderId: order.id, paymentId: payment.id });

    return {
      paymentId: payment.id,
      pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      pixExpiresAt: payment.date_of_expiration,
    };
  } catch (error) {
    logger.error('Error creating PIX payment:', error);
    throw error;
  }
};

/**
 * Create payment preference for app order
 * @param {Object} order - Order object (with buyer included)
 * @param {Object} app - App object
 * @returns {Promise<Object>} Payment preference
 */
const createAppPaymentPreference = async (order, app) => {
  try {
    const nameParts = (order.buyer.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'EducaplayJA';

    const preferenceData = {
      items: [
        {
          id: app.id,
          title: app.title.substring(0, 256),
          description: app.shortDescription
            ? app.shortDescription.substring(0, 256)
            : app.title.substring(0, 256),
          picture_url: app.iconUrl || `${config.frontend.url}/logo.png`,
          category_id: 'others',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(order.amount),
        },
      ],
      payer: {
        email: order.buyer.email,
        name: order.buyer.name,
        first_name: firstName,
        last_name: lastName,
      },
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' },
        ],
        installments: 12,
      },
      back_urls: {
        success: `${config.frontend.url}/#/apps/${app.slug}`,
        failure: `${config.frontend.url}/#/apps/${app.slug}`,
        pending: `${config.frontend.url}/#/apps/${app.slug}`,
      },
      auto_return: 'approved',
      notification_url: `${config.backend.url}/api/v1/payments/webhook`,
      external_reference: order.id,
      statement_descriptor: 'EDUCAPLAYJA',
      binary_mode: false,
    };

    const preference = await mercadopago.createPreference(preferenceData);

    await orderRepository.updateOrder(order.id, {
      paymentId: preference.id,
    });

    logger.info('App payment preference created', {
      orderId: order.id,
      appId: app.id,
      preferenceId: preference.id,
    });

    return {
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    };
  } catch (error) {
    logger.error('Error creating app payment preference:', error);
    throw error;
  }
};

/**
 * Process payment webhook notification
 * @param {Object} notification - Webhook notification data
 * @returns {Promise<void>}
 */
const processPaymentWebhook = async (notification) => {
  try {
    const { data, type } = notification;

    // Only process payment notifications
    if (type !== 'payment') {
      logger.debug('Ignoring non-payment notification', { type });
      return;
    }

    // Get payment details
    const payment = await mercadopago.getPayment(data.id);

    if (!payment || !payment.external_reference) {
      logger.warn('Payment without external reference', { paymentId: data.id });
      return;
    }

    // Find order
    const order = await orderRepository.findOrderById(payment.external_reference);
    if (!order) {
      logger.error('Order not found for payment', {
        paymentId: payment.id,
        orderId: payment.external_reference,
      });
      return;
    }

    // Update order based on payment status
    let orderStatus;
    const updateData = {
      paymentStatus: payment.status,
      paymentDetails: {
        paymentId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        paymentType: payment.payment_type_id,
        paymentMethod: payment.payment_method_id,
      },
    };

    switch (payment.status) {
      case 'approved':
        // ✅ CORREÇÃO: Marcar como COMPLETED para criar comissão automaticamente
        orderStatus = ORDER_STATUS.COMPLETED;
        updateData.paidAt = new Date(payment.date_approved);
        break;

      case 'pending':
      case 'in_process':
        orderStatus = ORDER_STATUS.PROCESSING;
        break;

      case 'rejected':
      case 'cancelled':
        orderStatus = ORDER_STATUS.CANCELLED;
        updateData.cancelReason = payment.status_detail || 'Payment rejected';
        break;

      case 'refunded':
      case 'charged_back':
        orderStatus = ORDER_STATUS.REFUNDED;
        updateData.refundedAt = new Date();
        break;

      default:
        logger.warn('Unknown payment status', { status: payment.status });
        return;
    }

    // Update order status
    const orderService = require('./order.service');
    await orderService.updateOrderStatus(order.id, orderStatus, updateData);

    // If payment approved, send product access email and process PIX transfer
    if (payment.status === 'approved') {
      // Send product access email (skip for app purchases)
      try {
        if (order.productId) {
          const product = await productRepository.findProductById(order.productId);
          await emailService.sendProductAccessEmail(order.buyer, product, order);
          logger.info('Product access email sent', { orderId: order.id, buyerEmail: order.buyer.email });
        } else {
          logger.info('App purchase approved via webhook — no product email', { orderId: order.id });
        }
      } catch (emailError) {
        logger.error('Failed to send product access email', { error: emailError, orderId: order.id });
        // Don't throw - order is still processed successfully
      }

      // Mark bump orders complete if they were part of this payment
      const bumpOrderIds = order.metadata?.bumpOrderIds;
      if (bumpOrderIds?.length > 0) {
        for (const bumpOrderId of bumpOrderIds) {
          try {
            await orderService.updateOrderStatus(bumpOrderId, ORDER_STATUS.COMPLETED, {
              paidAt: new Date(payment.date_approved),
              paymentStatus: 'approved',
              paymentDetails: {
                paymentId: payment.id,
                status: payment.status,
                statusDetail: payment.status_detail,
                paymentType: payment.payment_type_id,
                paymentMethod: payment.payment_method_id,
              },
            });
            const bumpOrder = await orderRepository.findOrderById(bumpOrderId);
            if (bumpOrder?.productId) {
              const bumpProduct = await productRepository.findProductById(bumpOrder.productId);
              await emailService.sendProductAccessEmail(bumpOrder.buyer, bumpProduct, bumpOrder);
            }
            logger.info('Bump order marked complete', { bumpOrderId, mainOrderId: order.id });
          } catch (bumpErr) {
            logger.error('Failed to mark bump order complete', { bumpOrderId, error: bumpErr.message });
          }
        }
      }

      // Note: PIX transfer is now done on-demand when producer requests withdrawal
      // The producer amount is tracked in the order and commissions table
    }

    logger.info('Payment webhook processed', {
      orderId: order.id,
      paymentId: payment.id,
      status: payment.status,
      orderStatus,
    });
  } catch (error) {
    logger.error('Error processing payment webhook:', error);
    throw error;
  }
};

/**
 * Verify payment status
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Payment status
 */
const verifyPaymentStatus = async (orderId) => {
  try {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (!order.paymentId) {
      throw ApiError.badRequest('Order does not have a payment');
    }

    // Get payment from Mercado Pago
    const payment = await mercadopago.getPayment(order.paymentId);

    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }

    logger.info('Payment status verified', {
      orderId,
      paymentId: order.paymentId,
      status: payment.status,
    });

    return {
      status: payment.status,
      statusDetail: payment.status_detail,
      paymentType: payment.payment_type_id,
      paymentMethod: payment.payment_method_id,
      transactionAmount: payment.transaction_amount,
      dateCreated: payment.date_created,
      dateApproved: payment.date_approved,
    };
  } catch (error) {
    logger.error('Error verifying payment status:', error);
    throw error;
  }
};

/**
 * Create refund for payment
 * @param {string} orderId - Order ID
 * @param {number} amount - Refund amount (optional)
 * @returns {Promise<Object>} Refund result
 */
const createRefund = async (orderId, amount = null) => {
  try {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (!order.paymentDetails || !order.paymentDetails.paymentId) {
      throw ApiError.badRequest('Order does not have a payment to refund');
    }

    const refundData = {};
    if (amount) {
      refundData.amount = amount;
    }

    const refund = await mercadopago.createRefund(order.paymentDetails.paymentId, refundData);

    logger.info('Refund created', {
      orderId,
      paymentId: order.paymentDetails.paymentId,
      refundId: refund.id,
      amount: refund.amount,
    });

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
      source: refund.source,
      dateCreated: refund.date_created,
    };
  } catch (error) {
    logger.error('Error creating refund:', error);
    throw error;
  }
};

/**
 * Get payment methods
 * @returns {Promise<Array>} Available payment methods
 */
const getPaymentMethods = async () => {
  try {
    const methods = await mercadopago.getPaymentMethods();

    logger.info('Payment methods retrieved', { count: methods.length });

    return methods;
  } catch (error) {
    logger.error('Error getting payment methods:', error);
    throw error;
  }
};

/**
 * Get order payment details
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (must be buyer, producer, or admin)
 * @returns {Promise<Object>} Payment details
 */
const getOrderPaymentDetails = async (orderId, userId) => {
  try {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Check permissions (reusing logic from order.service)
    const orderService = require('./order.service');
    await orderService.getOrderById(orderId, userId); // This will check permissions

    return {
      orderId: order.id,
      amount: order.amount,
      platformFee: order.platformFee,
      producerAmount: order.producerAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentDetails: order.paymentDetails,
      paidAt: order.paidAt,
      status: order.status,
    };
  } catch (error) {
    logger.error('Error getting order payment details:', error);
    throw error;
  }
};

module.exports = {
  createPaymentPreference,
  createPixPayment,
  createAppPaymentPreference,
  processPaymentWebhook,
  verifyPaymentStatus,
  createRefund,
  getPaymentMethods,
  getOrderPaymentDetails,
};

