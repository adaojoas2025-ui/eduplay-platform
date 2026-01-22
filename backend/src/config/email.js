/**
 * Email Configuration
 * Email service using SendGrid
 * @module config/email
 */

const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');

let useSendGrid = false;
let sgMail = null;

// Use SendGrid
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize SendGrid:', error.message);
  }
} else {
  logger.warn('⚠️  No email service configured (SENDGRID_API_KEY not found)');
}

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    if (useSendGrid) {
      logger.info('✅ Email service ready');
      return true;
    }
    logger.error('❌ No email service configured');
    return false;
  } catch (error) {
    logger.error('❌ Email service connection failed:', error.message);
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
    if (useSendGrid && sgMail) {
      logger.info('📤 Sending email via SendGrid...', { to, subject });

      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'EDUPLAY <ja.eduplay@gmail.com>',
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
    }

    throw new Error('No email service configured');
  } catch (error) {
    logger.error('❌ Error sending email:', {
      error: error.message,
      to,
      subject,
    });
    throw error;
  }
};

/**
 * Get active email service name
 */
const getActiveService = () => {
  if (useSendGrid) return 'sendgrid';
  return 'none';
};

module.exports = {
  verifyConnection,
  sendEmail,
  getActiveService,
  usingBrevo: false,
  usingResend: false,
  usingSendGrid: useSendGrid,
};
