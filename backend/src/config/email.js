/**
 * Email Configuration
 * Email service using SendGrid (API-based, works on Render)
 * Updated: 2026-01-01 - SendGrid API Key configured
 * @module config/email
 */

const config = require('./env');
const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');

// Use SendGrid (API-based, not SMTP - works on Render!)
let useSendGrid = false;
let sgMail = null;

if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service (API-based)');
  } catch (error) {
    logger.error('❌ Failed to initialize SendGrid:', error.message);
  }
} else {
  logger.warn('⚠️  SENDGRID_API_KEY not found');
}

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    if (useSendGrid) {
      logger.info('✅ SendGrid email service ready');
      return true;
    } else {
      logger.error('❌ No email service configured');
      return false;
    }
  } catch (error) {
    logger.error('❌ Email service connection failed:', error);
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
      logger.info('📤 Sending email via SendGrid...', {
        to,
        subject,
      });

      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'EDUPLAY <ja.eduplay@gmail.com>', // SendGrid verified sender
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
    } else {
      throw new Error('No email service configured');
    }
  } catch (error) {
    logger.error('❌ Error sending email via SendGrid:', {
      error: error.message,
      code: error.code,
      response: error.response?.body,
      to,
      subject,
    });
    throw error;
  }
};

module.exports = {
  verifyConnection,
  sendEmail,
  usingResend: false,
  usingSendGrid: useSendGrid,
};
