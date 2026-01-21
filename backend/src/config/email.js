/**
 * Email Configuration
 * Email service using Resend or SendGrid
 * @module config/email
 */

const config = require('./env');
const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');

// Try Resend first (more reliable), then SendGrid as fallback
let useResend = false;
let useSendGrid = false;
let resend = null;
let sgMail = null;

// Try Resend first
if (process.env.RESEND_API_KEY) {
  try {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
    useResend = true;
    logger.info('✅ Using Resend for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize Resend:', error.message);
  }
}

// Fallback to SendGrid
if (!useResend && process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service (fallback)');
  } catch (error) {
    logger.error('❌ Failed to initialize SendGrid:', error.message);
  }
}

if (!useResend && !useSendGrid) {
  logger.warn('⚠️  No email service configured (RESEND_API_KEY or SENDGRID_API_KEY not found)');
}

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    if (useResend || useSendGrid) {
      logger.info('✅ Email service ready');
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
    // Use Resend if available
    if (useResend && resend) {
      logger.info('📤 Sending email via Resend...', { to, subject });

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'EDUPLAY <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
        text: text || subject,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info('✅ Email sent successfully via Resend', {
        to,
        subject,
        id: data?.id,
      });

      return data;
    }

    // Fallback to SendGrid
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
      code: error.code,
      to,
      subject,
    });
    throw error;
  }
};

module.exports = {
  verifyConnection,
  sendEmail,
  usingResend: useResend,
  usingSendGrid: useSendGrid,
};
