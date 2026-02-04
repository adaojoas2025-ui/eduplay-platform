/**
 * Asaas Configuration
 * PIX payout integration
 * @module config/asaas
 */

const axios = require('axios');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * Asaas API client
 */
const asaasClient = axios.create({
  baseURL: config.asaas.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'access_token': config.asaas.apiKey,
  },
  timeout: 30000,
});

/**
 * Map PIX key types from our system to Asaas format
 */
const pixKeyTypeMap = {
  'PHONE': 'PHONE',
  'EMAIL': 'EMAIL',
  'CPF': 'CPF',
  'CNPJ': 'CNPJ',
  'RANDOM': 'EVP',
};

/**
 * Format PIX key for Asaas API
 * - Phone: remove formatting, keep only digits (11 digits with DDD)
 * - CPF: remove formatting, keep only digits
 * - CNPJ: remove formatting, keep only digits
 * @param {string} pixKey - PIX key
 * @param {string} pixKeyType - Type of PIX key
 * @returns {string} Formatted PIX key
 */
const formatPixKey = (pixKey, pixKeyType) => {
  if (!pixKey) return pixKey;

  switch (pixKeyType) {
    case 'PHONE':
      // Remove all non-digits, ensure 11 digits (DDD + number)
      const phone = pixKey.replace(/\D/g, '');
      // If has country code (55), remove it
      return phone.startsWith('55') && phone.length > 11
        ? phone.substring(2)
        : phone;
    case 'CPF':
    case 'CNPJ':
      // Remove all non-digits
      return pixKey.replace(/\D/g, '');
    default:
      return pixKey;
  }
};

/**
 * Create PIX transfer to external account
 * @param {Object} data - Transfer data
 * @param {number} data.amount - Amount to transfer
 * @param {string} data.pixKey - PIX key
 * @param {string} data.pixKeyType - Type of PIX key (PHONE, EMAIL, CPF, CNPJ, RANDOM)
 * @param {string} data.description - Description of the transfer
 * @param {string} data.externalReference - External reference ID
 * @returns {Promise<Object>} Transfer response
 */
const createPixTransfer = async (data) => {
  try {
    const { amount, pixKey, pixKeyType, description, externalReference } = data;

    const asaasKeyType = pixKeyTypeMap[pixKeyType] || 'CPF';
    const formattedPixKey = formatPixKey(pixKey, pixKeyType);

    const payload = {
      value: Number(amount.toFixed(2)),
      pixAddressKey: formattedPixKey,
      pixAddressKeyType: asaasKeyType,
      description: description || 'Saque EducaplayJA',
    };

    logger.info('Creating Asaas PIX transfer', {
      amount: payload.value,
      pixKeyType: asaasKeyType,
      pixKey: formattedPixKey.substring(0, 4) + '****',
    });

    const response = await asaasClient.post('/transfers', payload);

    logger.info('Asaas PIX transfer created', {
      transferId: response.data.id,
      status: response.data.status,
      amount: response.data.value,
    });

    return {
      success: true,
      id: response.data.id,
      status: response.data.status,
      value: response.data.value,
      dateCreated: response.data.dateCreated,
      raw: response.data,
    };
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage = errorData?.errors?.[0]?.description ||
                         errorData?.message ||
                         error.message;

    logger.error('Error creating Asaas PIX transfer:', {
      error: errorMessage,
      code: errorData?.errors?.[0]?.code,
      status: error.response?.status,
    });

    // Map common Asaas errors to user-friendly messages
    let userMessage = 'Erro ao processar transferência PIX';

    if (errorData?.errors) {
      const errorCode = errorData.errors[0]?.code;

      switch (errorCode) {
        case 'invalid_pixAddressKey':
          userMessage = 'Chave PIX inválida. Verifique se a chave está correta.';
          break;
        case 'insufficient_balance':
          userMessage = 'Saldo insuficiente na conta da plataforma para realizar o saque.';
          break;
        case 'transfer_limit_exceeded':
          userMessage = 'Limite diário de transferências excedido. Tente novamente amanhã.';
          break;
        case 'invalid_value':
          userMessage = 'Valor de saque inválido.';
          break;
        default:
          userMessage = errorMessage || userMessage;
      }
    }

    throw new Error(userMessage);
  }
};

/**
 * Get transfer status
 * @param {string} transferId - Asaas transfer ID
 * @returns {Promise<Object>} Transfer status
 */
const getTransferStatus = async (transferId) => {
  try {
    const response = await asaasClient.get(`/transfers/${transferId}`);

    return {
      id: response.data.id,
      status: response.data.status,
      value: response.data.value,
      dateCreated: response.data.dateCreated,
      transferDate: response.data.transferDate,
      raw: response.data,
    };
  } catch (error) {
    logger.error('Error getting Asaas transfer status:', {
      transferId,
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

/**
 * Get account balance
 * @returns {Promise<Object>} Balance information
 */
const getAccountBalance = async () => {
  try {
    const response = await asaasClient.get('/finance/balance');

    return {
      balance: response.data.balance,
      raw: response.data,
    };
  } catch (error) {
    logger.error('Error getting Asaas balance:', {
      error: error.response?.data || error.message,
    });
    throw error;
  }
};

/**
 * Check if Asaas is configured
 * @returns {boolean}
 */
const isConfigured = () => {
  return !!(config.asaas.apiKey && config.asaas.apiKey.length > 0);
};

module.exports = {
  createPixTransfer,
  getTransferStatus,
  getAccountBalance,
  isConfigured,
  formatPixKey,
  pixKeyTypeMap,
};
