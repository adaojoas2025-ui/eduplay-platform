/**
 * Contact Routes
 * Routes for contact form submissions
 * @module routes/contact
 */

const express = require('express');
const router = express.Router();
const { createRateLimiter } = require('../middlewares/rateLimiter.middleware');
const { sendContactFormEmail } = require('../../services/email.service');
const logger = require('../../utils/logger');

// Rate limit: 5 contact form submissions per IP per hour
const contactLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Muitas mensagens enviadas. Tente novamente em 1 hora.',
});

/**
 * @route   POST /api/v1/contact
 * @desc    Send contact form email
 * @access  Public
 */
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos obrigatórios (nome, email, assunto e mensagem)',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
      });
    }

    // Send email
    await sendContactFormEmail({
      name,
      email,
      subject: category ? `[${category}] ${subject}` : subject,
      message,
    });

    logger.info('Contact form submitted', { email, subject, category });

    res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso! Responderemos em até 24 horas.',
    });
  } catch (error) {
    logger.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
    });
  }
});

module.exports = router;
