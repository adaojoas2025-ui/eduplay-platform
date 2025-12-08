/**
 * Mercado Pago Configuration
 * Payment gateway integration
 * @module config/mercadopago
 */

const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * Initialize Mercado Pago client
 */
const mercadopagoClient = new MercadoPagoConfig({
  accessToken: config.mercadopago.accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'eduplay',
  },
});

/**
 * Preference API for checkout
 */
const preferenceAPI = new Preference(mercadopagoClient);

/**
 * Payment API for payment processing
 */
const paymentAPI = new Payment(mercadopagoClient);

/**
 * Create payment preference
 * @param {Object} data - Preference data
 * @returns {Promise<Object>} Preference response
 */
const createPreference = async (data) => {
  try {
    const preference = await preferenceAPI.create({ body: data });
    logger.info('Payment preference created', { preferenceId: preference.id });
    return preference;
  } catch (error) {
    logger.error('Error creating preference:', error);
    throw error;
  }
};

/**
 * Get payment information
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment data
 */
const getPayment = async (paymentId) => {
  try {
    const payment = await paymentAPI.get({ id: paymentId });
    return payment;
  } catch (error) {
    logger.error('Error getting payment:', error);
    throw error;
  }
};

module.exports = {
  mercadopagoClient,
  preferenceAPI,
  paymentAPI,
  createPreference,
  getPayment,
  publicKey: config.mercadopago.publicKey,
};
