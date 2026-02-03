/**
 * Mercado Pago Configuration
 * Payment gateway integration
 * @module config/mercadopago
 */

const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const axios = require('axios');
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

/**
 * Create PIX payout/disbursement
 * Transfers money from platform's MP account to external PIX key
 * @param {Object} data - Payout data
 * @param {number} data.amount - Amount to transfer
 * @param {string} data.pixKey - PIX key (email, cpf, phone, or random)
 * @param {string} data.pixKeyType - Type of PIX key (EMAIL, CPF, PHONE, RANDOM)
 * @param {string} data.description - Description of the transfer
 * @param {string} data.externalReference - External reference ID
 * @returns {Promise<Object>} Payout response
 */
const createPixPayout = async (data) => {
  try {
    const { amount, pixKey, pixKeyType, description, externalReference } = data;

    // Map PIX key type to Mercado Pago format
    const keyTypeMap = {
      'EMAIL': 'EMAIL',
      'CPF': 'CPF',
      'CNPJ': 'CNPJ',
      'PHONE': 'PHONE',
      'RANDOM': 'EVP' // Chave aleatoria
    };

    const mpKeyType = keyTypeMap[pixKeyType] || 'CPF';

    // Create disbursement via Mercado Pago API
    // Using the disbursements endpoint for PIX transfers
    const response = await axios.post(
      'https://api.mercadopago.com/v1/disbursements',
      {
        amount: Number(amount.toFixed(2)),
        external_reference: externalReference,
        description: description || 'Pagamento de vendas - EducaplayJA',
        payment_method_id: 'pix',
        payer_bank_transfer: {
          type: mpKeyType,
          number: pixKey
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.mercadopago.accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': externalReference
        }
      }
    );

    logger.info('PIX payout created', {
      disbursementId: response.data.id,
      amount,
      pixKey: pixKey.substring(0, 4) + '****',
      status: response.data.status
    });

    return response.data;
  } catch (error) {
    logger.error('Error creating PIX payout:', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });

    // If the disbursements API is not available, try the alternative payout endpoint
    if (error.response?.status === 404 || error.response?.status === 403) {
      logger.warn('Disbursements API not available, trying alternative payout method');
      return await createPixPayoutAlternative(data);
    }

    throw error;
  }
};

/**
 * Alternative PIX payout using bank_transfer endpoint
 * @param {Object} data - Payout data
 * @returns {Promise<Object>} Payout response
 */
const createPixPayoutAlternative = async (data) => {
  try {
    const { amount, pixKey, pixKeyType, description, externalReference } = data;

    // Try using the account/bank_transfer endpoint
    const response = await axios.post(
      'https://api.mercadopago.com/v1/account/bank_transfer',
      {
        amount: Number(amount.toFixed(2)),
        description: description || 'Pagamento de vendas - EducaplayJA',
        external_reference: externalReference,
        bank_transfer_type: 'pix',
        pix_key: pixKey,
        pix_key_type: pixKeyType
      },
      {
        headers: {
          'Authorization': `Bearer ${config.mercadopago.accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': externalReference + '-alt'
        }
      }
    );

    logger.info('Alternative PIX payout created', {
      id: response.data.id,
      amount,
      status: response.data.status
    });

    return response.data;
  } catch (error) {
    logger.error('Error with alternative PIX payout:', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Get account balance from Mercado Pago
 * @returns {Promise<Object>} Balance information
 */
const getAccountBalance = async () => {
  try {
    const response = await axios.get(
      'https://api.mercadopago.com/users/me/mercadopago_account/balance',
      {
        headers: {
          'Authorization': `Bearer ${config.mercadopago.accessToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    logger.error('Error getting account balance:', error);
    throw error;
  }
};

module.exports = {
  mercadopagoClient,
  preferenceAPI,
  paymentAPI,
  createPreference,
  getPayment,
  createPixPayout,
  getAccountBalance,
  publicKey: config.mercadopago.publicKey,
};
