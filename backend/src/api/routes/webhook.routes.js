/**
 * Webhook Routes
 * Handles external service webhooks
 * @module routes/webhook
 */

const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

/**
 * Asaas Transfer Authorization Webhook
 * This endpoint is called by Asaas before processing a transfer
 * We auto-approve all transfers from our system
 *
 * According to Asaas docs, the webhook receives transfer data and
 * should respond with HTTP 200 and { "authorized": true } or { "authorized": false }
 *
 * @route POST /api/v1/webhooks/asaas/authorize-transfer
 */
router.post('/asaas/authorize-transfer', (req, res) => {
  try {
    // Log the complete request for debugging
    logger.info('=== ASAAS AUTHORIZATION WEBHOOK ===', {
      headers: req.headers,
      body: JSON.stringify(req.body),
    });

    // Asaas sends the transfer data in the request body
    // We always authorize transfers from our system
    const transferData = req.body;

    logger.info('Asaas transfer authorization - APPROVING', {
      transferId: transferData?.id || transferData?.transfer?.id || 'unknown',
      value: transferData?.value || transferData?.transfer?.value,
      description: transferData?.description || transferData?.transfer?.description,
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

    // Even on error, try to authorize
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
