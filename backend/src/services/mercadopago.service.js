/**
 * Mercado Pago OAuth Service
 * Handles producer account linking and split payments
 */

const axios = require('axios');
const { prisma } = require('../config/database');
const config = require('../config/env');
const logger = require('../utils/logger');

const MP_API_BASE = 'https://api.mercadopago.com';
const MP_AUTH_BASE = 'https://auth.mercadopago.com';

/**
 * Generate OAuth authorization URL for producer
 * @param {string} userId - Producer user ID
 * @returns {string} Authorization URL
 */
function getAuthorizationUrl(userId) {
  const params = new URLSearchParams({
    client_id: config.mercadopago.clientId,
    response_type: 'code',
    platform_id: 'mp',
    redirect_uri: config.mercadopago.redirectUri,
    state: userId, // We use state to identify the user after redirect
  });

  return `${MP_AUTH_BASE}/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Token response
 */
async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(`${MP_API_BASE}/oauth/token`, {
      client_id: config.mercadopago.clientId,
      client_secret: config.mercadopago.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.mercadopago.redirectUri,
    });

    return response.data;
  } catch (error) {
    logger.error('Error exchanging code for token:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for token');
  }
}

/**
 * Refresh expired access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New token response
 */
async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post(`${MP_API_BASE}/oauth/token`, {
      client_id: config.mercadopago.clientId,
      client_secret: config.mercadopago.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return response.data;
  } catch (error) {
    logger.error('Error refreshing token:', error.response?.data || error.message);
    throw new Error('Failed to refresh token');
  }
}

/**
 * Link Mercado Pago account to producer
 * @param {string} userId - User ID
 * @param {string} code - Authorization code
 * @returns {Promise<Object>} Updated user
 */
async function linkAccount(userId, code) {
  try {
    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(code);

    // Calculate token expiration date (usually 180 days)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Update user with MP credentials
    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        mercadopagoAccessToken: tokenData.access_token,
        mercadopagoRefreshToken: tokenData.refresh_token,
        mercadopagoUserId: String(tokenData.user_id),
        mercadopagoPublicKey: tokenData.public_key,
        mercadopagoAccountLinked: true,
        mercadopagoLinkedAt: new Date(),
        mercadopagoTokenExpiresAt: expiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mercadopagoAccountLinked: true,
        mercadopagoLinkedAt: true,
        mercadopagoUserId: true,
      },
    });

    logger.info(`MP account linked for user ${userId}`);
    return user;
  } catch (error) {
    logger.error('Error linking MP account:', error);
    throw error;
  }
}

/**
 * Unlink Mercado Pago account from producer
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
async function unlinkAccount(userId) {
  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      mercadopagoAccessToken: null,
      mercadopagoRefreshToken: null,
      mercadopagoUserId: null,
      mercadopagoPublicKey: null,
      mercadopagoAccountLinked: false,
      mercadopagoLinkedAt: null,
      mercadopagoTokenExpiresAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mercadopagoAccountLinked: true,
    },
  });

  logger.info(`MP account unlinked for user ${userId}`);
  return user;
}

/**
 * Get producer's MP account status
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Account status
 */
async function getAccountStatus(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      mercadopagoAccountLinked: true,
      mercadopagoLinkedAt: true,
      mercadopagoUserId: true,
      mercadopagoTokenExpiresAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const isTokenExpired = user.mercadopagoTokenExpiresAt && user.mercadopagoTokenExpiresAt < now;
  const daysUntilExpiration = user.mercadopagoTokenExpiresAt
    ? Math.ceil((user.mercadopagoTokenExpiresAt - now) / (1000 * 60 * 60 * 24))
    : null;

  return {
    isLinked: user.mercadopagoAccountLinked,
    linkedAt: user.mercadopagoLinkedAt,
    mercadopagoUserId: user.mercadopagoUserId,
    tokenExpiresAt: user.mercadopagoTokenExpiresAt,
    isTokenExpired,
    daysUntilExpiration,
    needsReauthorization: isTokenExpired || (daysUntilExpiration && daysUntilExpiration < 7),
  };
}

/**
 * Get producer's valid access token (refresh if needed)
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Access token or null
 */
async function getProducerAccessToken(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      mercadopagoAccessToken: true,
      mercadopagoRefreshToken: true,
      mercadopagoTokenExpiresAt: true,
      mercadopagoAccountLinked: true,
    },
  });

  if (!user || !user.mercadopagoAccountLinked) {
    return null;
  }

  // Check if token is expired or will expire soon (within 1 hour)
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  if (user.mercadopagoTokenExpiresAt && user.mercadopagoTokenExpiresAt < oneHourFromNow) {
    // Token expired or expiring soon, try to refresh
    if (user.mercadopagoRefreshToken) {
      try {
        const newTokenData = await refreshAccessToken(user.mercadopagoRefreshToken);

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + newTokenData.expires_in);

        await prisma.users.update({
          where: { id: userId },
          data: {
            mercadopagoAccessToken: newTokenData.access_token,
            mercadopagoRefreshToken: newTokenData.refresh_token,
            mercadopagoTokenExpiresAt: expiresAt,
          },
        });

        logger.info(`Token refreshed for user ${userId}`);
        return newTokenData.access_token;
      } catch (error) {
        logger.error('Failed to refresh token, needs reauthorization:', error);
        // Mark account as needing reauthorization
        await prisma.users.update({
          where: { id: userId },
          data: {
            mercadopagoAccountLinked: false,
          },
        });
        return null;
      }
    }
    return null;
  }

  return user.mercadopagoAccessToken;
}

/**
 * Create preference with split payment (marketplace model)
 * @param {Object} product - Product data
 * @param {Object} buyer - Buyer data
 * @param {Object} producer - Producer data with MP credentials
 * @returns {Promise<Object>} Preference response
 */
async function createSplitPaymentPreference(product, buyer, producer) {
  const { MercadoPagoConfig, Preference } = require('mercadopago');

  // Get producer's valid access token
  const producerAccessToken = await getProducerAccessToken(producer.id);

  if (!producerAccessToken) {
    // Fallback to regular payment if producer doesn't have MP linked
    logger.info(`Producer ${producer.id} doesn't have MP linked, using regular payment`);
    return null;
  }

  try {
    // Create client with producer's access token
    const producerClient = new MercadoPagoConfig({
      accessToken: producerAccessToken,
    });

    const preferenceAPI = new Preference(producerClient);

    // Calculate marketplace fee (3% for platform)
    const marketplaceFee = Math.round(product.price * 0.03 * 100) / 100;

    const preferenceData = {
      items: [
        {
          title: product.title,
          description: product.description?.substring(0, 256) || product.title,
          quantity: 1,
          unit_price: product.price,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: buyer.name,
        email: buyer.email,
      },
      back_urls: {
        success: `${config.urls.frontend}/payment/success`,
        failure: `${config.urls.frontend}/payment/failure`,
        pending: `${config.urls.frontend}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${config.urls.backend}/api/webhook`,
      marketplace_fee: marketplaceFee,
      metadata: {
        product_id: product.id,
        buyer_id: buyer.id,
        seller_id: producer.id,
        split_payment: true,
      },
    };

    const preference = await preferenceAPI.create({ body: preferenceData });

    logger.info(`Split payment preference created: ${preference.id}, marketplace_fee: ${marketplaceFee}`);

    return {
      ...preference,
      isSplitPayment: true,
      marketplaceFee,
      producerAmount: product.price - marketplaceFee,
    };
  } catch (error) {
    logger.error('Error creating split payment preference:', error);
    // Return null to fallback to regular payment
    return null;
  }
}

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  linkAccount,
  unlinkAccount,
  getAccountStatus,
  getProducerAccessToken,
  createSplitPaymentPreference,
};
