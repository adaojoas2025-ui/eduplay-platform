/**
 * Webhook Routes
 * Handles external service webhooks
 * @module routes/webhook
 */

const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const config = require('../../config/env');

/**
 * Validate Asaas webhook token
 * Asaas sends token in header 'asaas-access-token'
 */
function validateAsaasToken(req) {
  const webhookToken = config.asaas.webhookToken;

  // If no token configured, skip validation (but log warning)
  if (!webhookToken) {
    logger.warn('ASAAS_WEBHOOK_TOKEN not configured - skipping token validation');
    return true;
  }

  const receivedToken = req.headers['asaas-access-token'];

  if (!receivedToken) {
    logger.warn('Asaas webhook received without token header');
    return false;
  }

  return receivedToken === webhookToken;
}

/**
 * Asaas Transfer Authorization Webhook
 * This endpoint is called by Asaas before processing a transfer
 * We auto-approve all transfers from our system
 *
 * According to Asaas docs, the webhook receives transfer data and
 * should respond with HTTP 200 and { "authorized": true } or { "authorized": false }
 *
 * For automatic transfers without SMS:
 * 1. Configure IP Whitelist in Asaas
 * 2. Disable "Evento critico em requisicoes de saque" for whitelisted IPs
 * 3. Configure this webhook URL in Asaas for external authorization
 * 4. Set ASAAS_WEBHOOK_TOKEN with the token configured in Asaas
 *
 * @route POST /api/v1/webhooks/asaas/authorize-transfer
 */
router.post('/asaas/authorize-transfer', (req, res) => {
  try {
    // Log the complete request for debugging
    logger.info('=== ASAAS AUTHORIZATION WEBHOOK ===', {
      headers: JSON.stringify(req.headers),
      body: JSON.stringify(req.body),
    });

    // Validate token from Asaas (optional - logs warning if not configured)
    const tokenValid = validateAsaasToken(req);
    if (!tokenValid) {
      logger.warn('Asaas webhook token validation failed - but APPROVING anyway for now');
      // Still approve for now until token is properly configured
    }

    // Asaas sends the transfer data in the request body
    const transferData = req.body;

    // Validate transfer data - check if it's from our system
    const description = transferData?.description || transferData?.transfer?.description || '';
    const isOurTransfer = description.includes('EducaplayJA') || description.includes('Saque');

    logger.info('Asaas transfer authorization', {
      transferId: transferData?.id || transferData?.transfer?.id || 'unknown',
      value: transferData?.value || transferData?.transfer?.value,
      description,
      isOurTransfer,
      decision: isOurTransfer ? 'APPROVED' : 'APPROVED (unknown source)',
    });

    // Return authorization response
    // Asaas expects: { "authorized": true } with HTTP 200
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({ authorized: true }));

  } catch (error) {
    logger.error('Error processing Asaas authorization webhook', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    // On error, still approve to avoid blocking transfers
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({ authorized: true }));
  }
});

/**
 * Asaas Transfer Status Webhook
 * Receives notifications about transfer status changes
 *
 * @route POST /api/v1/webhooks/asaas/transfer-status
 */
router.post('/asaas/transfer-status', async (req, res) => {
  try {
    const { event, transfer } = req.body;

    logger.info('Asaas transfer status webhook received', {
      event,
      transferId: transfer?.id,
      status: transfer?.status,
    });

    // Here you could update the transfer status in your database
    // For now, just acknowledge receipt

    return res.status(200).json({ received: true });

  } catch (error) {
    logger.error('Error processing Asaas status webhook', {
      error: error.message,
    });
    return res.status(200).json({ received: true });
  }
});

/**
 * Generic Asaas Webhook Handler
 * Catches all other Asaas events
 *
 * @route POST /api/v1/webhooks/asaas
 */
router.post('/asaas', (req, res) => {
  try {
    logger.info('Asaas webhook received', {
      event: req.body.event,
      body: JSON.stringify(req.body).substring(0, 500),
    });

    return res.status(200).json({ received: true });

  } catch (error) {
    logger.error('Error processing Asaas webhook', {
      error: error.message,
    });
    return res.status(200).json({ received: true });
  }
});

/**
 * Mercado Pago Webhook Handler (existing functionality)
 *
 * @route POST /api/v1/webhooks/mercadopago
 */
router.post('/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    logger.info('Mercado Pago webhook received', {
      type,
      dataId: data?.id,
    });

    // Handle different webhook types
    // This is a placeholder - implement actual handling as needed

    return res.status(200).json({ received: true });

  } catch (error) {
    logger.error('Error processing Mercado Pago webhook', {
      error: error.message,
    });
    return res.status(200).json({ received: true });
  }
});

module.exports = router;
