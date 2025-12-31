/**
 * Email Configuration with SendGrid
 * Alternative email service using SendGrid API
 * @module config/email-sendgrid
 */

const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

// Configurar SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  logger.info('✅ SendGrid configured');
} else {
  logger.warn('⚠️  SendGrid API Key not found - email will not work');
}

/**
 * Verify SendGrid connection
 */
const verifyConnection = async () => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      logger.error('❌ SendGrid API Key not configured');
      return false;
    }
    logger.info('✅ SendGrid service ready');
    return true;
  } catch (error) {
    logger.error('❌ SendGrid service connection failed:', error);
    return false;
  }
};

/**
 * Send email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API Key not configured');
    }

    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@eduplay.com',
      subject,
      text: text || subject,
      html,
    };

    const [response] = await sgMail.send(msg);

    logger.info('✅ Email sent successfully via SendGrid', {
      to,
      subject,
      statusCode: response.statusCode,
    });

    return response;
  } catch (error) {
    logger.error('❌ Error sending email via SendGrid:', {
      error: error.message,
      code: error.code,
      response: error.response?.body
    });
    throw error;
  }
};

module.exports = {
  verifyConnection,
  sendEmail,
};
