/**
 * Email Configuration
 * Email service using SendGrid (preferred) or Nodemailer (fallback)
 * @module config/email
 */

const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

// Try to use SendGrid if available
let useSendGrid = false;
let sgMail = null;

if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service');
  } catch (error) {
    logger.warn('⚠️  SendGrid not available, falling back to SMTP');
  }
} else {
  logger.info('ℹ️  SendGrid API Key not found, using SMTP');
}

/**
 * Create email transporter
 */
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    if (useSendGrid) {
      logger.info('✅ SendGrid email service ready');
      return true;
    } else {
      await transporter.verify();
      logger.info('✅ SMTP email service connected');
      return true;
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
      // Use SendGrid
      const msg = {
        to,
        from: config.email.from,
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
      // Fallback to SMTP
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
        text,
      };

      const info = await transporter.sendMail(mailOptions);

      logger.info('✅ Email sent successfully via SMTP', {
        to,
        subject,
        messageId: info.messageId,
      });

      return info;
    }
  } catch (error) {
    logger.error('❌ Error sending email:', {
      service: useSendGrid ? 'SendGrid' : 'SMTP',
      error: error.message,
      to,
      subject
    });
    throw error;
  }
};

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
  usingSendGrid: useSendGrid,
};
