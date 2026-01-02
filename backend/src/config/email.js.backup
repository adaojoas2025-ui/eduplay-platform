/**
 * Email Configuration
 * Email service using Resend (preferred), SendGrid, or Nodemailer (fallback)
 * @module config/email
 */

const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');

// Try to use Resend first (most reliable)
let useResend = false;
let resendClient = null;

if (process.env.RESEND_API_KEY) {
  logger.info('🔑 RESEND_API_KEY found, attempting to initialize Resend...');
  try {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    useResend = true;
    logger.info('✅ Using Resend for email service (PROFESSIONAL)');
  } catch (error) {
    logger.error('❌ Failed to initialize Resend:', error.message);
    logger.warn('⚠️  Resend not available, trying SendGrid');
  }
} else {
  logger.warn('⚠️  RESEND_API_KEY not found in environment variables');
}

// Try SendGrid if Resend not available
let useSendGrid = false;
let sgMail = null;

if (!useResend && process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service');
  } catch (error) {
    logger.warn('⚠️  SendGrid not available, falling back to SMTP');
  }
} else if (!useResend) {
  logger.info('ℹ️  No professional email service found, using SMTP');
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
    if (useResend) {
      logger.info('✅ Resend email service ready');
      return true;
    } else if (useSendGrid) {
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
    if (useResend && resendClient) {
      // Use Resend (PROFESSIONAL - Most reliable)
      const response = await resendClient.emails.send({
        from: config.email.from,
        to,
        subject,
        html,
      });

      logger.info('✅ Email sent successfully via Resend (PROFESSIONAL)', {
        to,
        subject,
        id: response.id,
      });

      return response;
    } else if (useSendGrid && sgMail) {
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
    const service = useResend ? 'Resend' : (useSendGrid ? 'SendGrid' : 'SMTP');
    logger.error('❌ Error sending email:', {
      service,
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
  usingResend: useResend,
  usingSendGrid: useSendGrid,
};
