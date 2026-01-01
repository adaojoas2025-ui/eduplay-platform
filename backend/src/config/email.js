/**
 * Email Configuration
 * Email service using SMTP Gmail
 * @module config/email
 */

const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');
logger.info('✅ Using SMTP Gmail for email service');

/**
 * Create email transporter with Render-compatible settings
 */
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  // Configurações adicionais para Render
  connectionTimeout: 60000, // 60 segundos
  greetingTimeout: 30000,   // 30 segundos
  socketTimeout: 60000,     // 60 segundos
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  },
  debug: process.env.NODE_ENV === 'production', // Debug em produção
  logger: process.env.NODE_ENV === 'production' // Logger em produção
});

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    await transporter.verify();
    logger.info('✅ SMTP email service connected', {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      user: config.email.user
    });
    return true;
  } catch (error) {
    logger.error('❌ Email service connection failed:', {
      error: error.message,
      code: error.code,
      command: error.command
    });
    return false;
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    logger.info('📤 Attempting to send email...', {
      to,
      subject,
      from: config.email.from
    });

    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('✅ Email sent successfully via SMTP Gmail', {
      to,
      subject,
      messageId: info.messageId,
      response: info.response
    });

    return info;
  } catch (error) {
    logger.error('❌ Error sending email via SMTP:', {
      error: error.message,
      code: error.code,
      command: error.command,
      to,
      subject,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
  usingResend: false,
  usingSendGrid: false,
};
