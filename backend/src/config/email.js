/**
 * Email Configuration
 * Email service using SendGrid or Nodemailer (Gmail SMTP)
 * @module config/email
 */

const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

logger.info('📧 Initializing email service...');

let useSendGrid = false;
let useNodemailer = false;
let sgMail = null;
let transporter = null;

// Try SendGrid first
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize SendGrid:', error.message);
  }
}

// If no SendGrid, try Nodemailer with Gmail SMTP
if (!useSendGrid && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    useNodemailer = true;
    logger.info('✅ Using Nodemailer (Gmail SMTP) for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize Nodemailer:', error.message);
  }
}

if (!useSendGrid && !useNodemailer) {
  logger.warn('⚠️  No email service configured');
}

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    if (useSendGrid) {
      logger.info('✅ Email service ready (SendGrid)');
      return true;
    }
    if (useNodemailer && transporter) {
      await transporter.verify();
      logger.info('✅ Email service ready (Nodemailer)');
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
 * @param {string} options.replyTo - Reply-to email (optional)
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const fromEmail = process.env.EMAIL_FROM || 'EducaplayJA <ja.eduplay@gmail.com>';
  const supportEmail = process.env.PLATFORM_SUPPORT_EMAIL || 'adao.joas2025@gmail.com';

  try {
    // Try SendGrid first
    if (useSendGrid && sgMail) {
      logger.info('Sending email via SendGrid...', { to, subject });

      const msg = {
        to,
        from: fromEmail,
        subject,
        text: text || subject,
        html,
        ...(replyTo && { replyTo }),
        headers: {
          'List-Unsubscribe': `<mailto:${supportEmail}?subject=unsubscribe>`,
        },
      };

      const [response] = await sgMail.send(msg);

      logger.info('Email sent successfully via SendGrid', {
        to,
        subject,
        statusCode: response.statusCode,
      });

      return response;
    }

    // Try Nodemailer
    if (useNodemailer && transporter) {
      logger.info('Sending email via Nodemailer...', { to, subject });

      const mailOptions = {
        from: fromEmail,
        to,
        subject,
        text: text || subject,
        html,
        ...(replyTo && { replyTo }),
        headers: {
          'List-Unsubscribe': `<mailto:${supportEmail}?subject=unsubscribe>`,
        },
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info('Email sent successfully via Nodemailer', {
        to,
        subject,
        messageId: result.messageId,
      });

      return result;
    }

    throw new Error('No email service configured');
  } catch (error) {
    logger.error('Error sending email:', {
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
  if (useNodemailer) return 'nodemailer';
  return 'none';
};

module.exports = {
  verifyConnection,
  sendEmail,
  getActiveService,
  usingBrevo: false,
  usingResend: false,
  usingSendGrid: useSendGrid,
  usingNodemailer: useNodemailer,
};
