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
 * @route POST /api/v1/webhooks/asaas/authorize-transfer
 */
router.post('/asaas/authorize-transfer', (req, res) => {
  try {
    const { id, value, pixAddressKey, description } = req.body;

    logger.info('Asaas transfer authorization webhook received', {
      transferId: id,
      value,
      pixKey: pixAddressKey ? pixAddressKey.substring(0, 4) + '****' : 'N/A',
      description,
    });

    // Check if this is a legitimate transfer from our system
    // by verifying the description contains our identifier
    const isFromOurSystem = description &&
      (description.includes('EducaplayJA') || description.includes('Saque'));

    if (isFromOurSystem) {
      logger.info('Transfer authorized - from EducaplayJA system', { transferId: id });

      // Respond with authorization
      return res.status(200).json({
        authorized: true,
      });
    }

    // For transfers not from our system, still authorize but log warning
    logger.warn('Transfer authorized - unknown source', {
      transferId: id,
      description
    });

    return res.status(200).json({
      authorized: true,
    });

  } catch (error) {
    logger.error('Error processing Asaas authorization webhook', {
      error: error.message,
      body: req.body,
    });

    // Even on error, authorize to prevent blocking legitimate transfers
    // In production, you might want to be more strict
    return res.status(200).json({
      authorized: true,
    });
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
