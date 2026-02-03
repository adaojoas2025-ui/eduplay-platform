const crypto = require('crypto');
const { preference, payment } = require('../config/mercadopago');
const { prisma } = require('../config/database');
const { sendPurchaseEmail, sendSaleNotification } = require('./emailService');
const mercadopagoService = require('./mercadopago.service');
const logger = require('../utils/logger');

/**
 * Create Mercado Pago preference
 * Tries to use split payment if producer has linked MP account
 */
async function createPreference(product, buyer, additionalData = {}) {
  try {
    // Get producer data
    const producer = await prisma.users.findUnique({
      where: { id: product.producerId },
      select: {
        id: true,
        name: true,
        email: true,
        mercadopagoAccountLinked: true,
      },
    });

    // Try to create split payment preference if producer has MP linked
    if (producer && producer.mercadopagoAccountLinked) {
      const splitPreference = await mercadopagoService.createSplitPaymentPreference(
        product,
        buyer,
        producer
      );

      if (splitPreference) {
        logger.info(`Split payment preference created for product ${product.id}`);
        return splitPreference;
      }
    }

    // Fallback to regular payment (platform receives all, pays producer manually)
    logger.info(`Using regular payment for product ${product.id} (producer MP not linked)`);

    const preferenceData = {
      items: [
        {
          title: product.title,
          description: product.description,
          quantity: 1,
          unit_price: product.price,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: buyer.name,
        email: buyer.email,
        ...additionalData.payer,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhook`,
      metadata: {
        product_id: product.id,
        buyer_id: buyer.id,
        seller_id: product.producerId,
        split_payment: false,
      },
    };

    const result = await preference.create({ body: preferenceData });
    return {
      ...result,
      isSplitPayment: false,
    };
  } catch (error) {
    console.error('Create preference error:', error);
    throw error;
  }
}

/**
 * Process payment webhook
 */
async function processPaymentWebhook(paymentId) {
  try {
    // Get payment info from Mercado Pago
    const paymentInfo = await payment.get({ id: paymentId });

    if (!paymentInfo) {
      console.error('Payment not found:', paymentId);
      return;
    }

    console.log('Payment info:', JSON.stringify(paymentInfo, null, 2));

    const { status, metadata } = paymentInfo;

    // Find or create order
    let order = await prisma.orders.findUnique({
      where: { paymentId: String(paymentId) },
      include: {
        product: {
          include: {
            files: true,
            producer: true,
          },
        },
        buyer: true,
      },
    });

    // If order doesn't exist, create it
    if (!order && metadata) {
      const product = await prisma.products.findUnique({
        where: { id: metadata.product_id },
        include: { files: true, producer: true },
      });

      if (!product) {
        console.error('Product not found:', metadata.product_id);
        return;
      }

      const buyer = await prisma.users.findUnique({
        where: { id: metadata.buyer_id },
      });

      if (!buyer) {
        console.error('Buyer not found:', metadata.buyer_id);
        return;
      }

      const platformFee = product.price * 0.10; // 10% platform fee
      const producerAmount = product.price * 0.90; // 90% to producer

      order = await prisma.orders.create({
        data: {
          productId: product.id,
          buyerId: buyer.id,
          amount: product.price,
          platformFee,
          producerAmount,
          paymentId: String(paymentId),
          paymentStatus: status.toUpperCase(),
          status: status === 'approved' ? 'APPROVED' : 'PENDING',
        },
        include: {
          product: {
            include: {
              files: true,
              producer: true,
            },
          },
          buyer: true,
        },
      });
    } else if (order) {
      // Update existing order
      order = await prisma.orders.update({
        where: { id: order.id },
        data: {
          paymentStatus: status.toUpperCase(),
          status: status === 'approved' ? 'APPROVED' : order.status,
        },
        include: {
          product: {
            include: {
              files: true,
              producer: true,
            },
          },
          buyer: true,
        },
      });
    }

    // If payment approved, process commission and send emails
    if (status === 'approved' && order) {
      // Check if commission already exists
      const existingCommission = await prisma.commissions.findUnique({
        where: { orderId: order.id },
      });

      if (!existingCommission) {
        const platformFeeAmount = order.amount * 0.03; // 3% platform fee
        const producerCommission = order.amount - platformFeeAmount; // 97% to producer

        // Get producer ID from product
        const product = await prisma.products.findUnique({
          where: { id: order.productId },
          select: { producerId: true },
        });

        if (product) {
          // Create commission record
          await prisma.commissions.create({
            data: {
              id: crypto.randomUUID(),
              orderId: order.id,
              producerId: product.producerId,
              amount: platformFeeAmount,
              status: 'PENDING',
            },
          });

          console.log(`✅ Commission created: R$ ${platformFeeAmount.toFixed(2)} (3%) for order ${order.id}`);
        }
      }

      // Reload order with includes for emails
      const orderWithDetails = await prisma.orders.findUnique({
        where: { id: order.id },
        include: {
          product: {
            include: {
              producer: true,
            },
          },
          buyer: true,
        },
      });

      // Send emails
      if (orderWithDetails) {
        try {
          await sendPurchaseEmail(orderWithDetails.buyer, orderWithDetails.product, []);
          await sendSaleNotification(
            orderWithDetails.product.producer,
            orderWithDetails.product,
            orderWithDetails.buyer,
            orderWithDetails.amount
          );
        } catch (emailError) {
          console.error('Error sending emails:', emailError);
        }
      }

      console.log('✅ Payment processed successfully:', paymentId);
    }

    return order;
  } catch (error) {
    console.error('Process payment webhook error:', error);
    throw error;
  }
}

module.exports = {
  createPreference,
  processPaymentWebhook,
};
