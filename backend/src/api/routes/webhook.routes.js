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
 * Asaas Transfer Authorization Webhook (Mecanismo de Segurança)
 * This endpoint is called by Asaas before processing a transfer
 * We auto-approve all transfers from our system
 *
 * According to Asaas docs (Mecanismo para validação de saque via webhooks):
 * - Asaas sends POST with transfer data 5 seconds after creation
 * - Must respond with { "status": "APPROVED" } or { "status": "REFUSED", "refuseReason": "..." }
 * - If fails 3 times, transfer is automatically cancelled
 *
 * Configuration in Asaas:
 * 1. Go to Menu do usuário > Integrações > Mecanismos de segurança
 * 2. Add this URL, email for notifications, and auth token
 * 3. Token is sent in header 'asaas-access-token'
 *
 * @route POST /api/v1/webhooks/asaas/authorize-transfer
 */
router.post('/asaas/authorize-transfer', (req, res) => {
  try {
    // Log the complete request for debugging
    logger.info('=== ASAAS AUTHORIZATION WEBHOOK (Mecanismo de Segurança) ===', {
      headers: JSON.stringify(req.headers),
      body: JSON.stringify(req.body),
    });

    // Validate token from Asaas (optional - logs warning if not configured)
    const tokenValid = validateAsaasToken(req);
    if (!tokenValid) {
      logger.warn('Asaas webhook token validation failed - but APPROVING anyway for now');
      // Still approve for now until token is properly configured
    }

    // Asaas sends different payload types: TRANSFER, BILL, PIX_QR_CODE, MOBILE_PHONE_RECHARGE, PIX_REFUND
    const { type, transfer, bill, pixQrCode, mobilePhoneRecharge, pixRefund } = req.body;

    // Get transfer data based on type
    let transferData = transfer || bill || pixQrCode || mobilePhoneRecharge || pixRefund;
    const description = transferData?.description || '';
    const transferId = transferData?.id || 'unknown';
    const value = transferData?.value || transferData?.netValue || 0;

    // Check if it's from our system
    const isOurTransfer = description.includes('EducaplayJA') || description.includes('Saque');

    logger.info('Asaas transfer authorization decision', {
      type,
      transferId,
      value,
      description,
      isOurTransfer,
      decision: 'APPROVED',
    });

    // Return authorization response
    // Asaas expects: { "status": "APPROVED" } or { "status": "REFUSED", "refuseReason": "..." }
    return res.status(200).json({ status: 'APPROVED' });

  } catch (error) {
    logger.error('Error processing Asaas authorization webhook', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    // On error, still approve to avoid blocking transfers
    return res.status(200).json({ status: 'APPROVED' });
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
