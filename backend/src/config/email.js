/**
 * Email Configuration
 * Email service using Brevo SMTP (primary), Resend or SendGrid (fallback)
 * @module config/email
 * @updated 2026-01-21T20:00:00Z
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');
logger.info('🔍 Checking environment variables...', {
  hasBrevoKey: !!process.env.BREVO_API_KEY,
  hasResendKey: !!process.env.RESEND_API_KEY,
  hasSendGridKey: !!process.env.SENDGRID_API_KEY,
  brevoKeyLength: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 0,
});

// Service flags
let useBrevo = false;
let useResend = false;
let useSendGrid = false;

// Service instances
let brevoTransporter = null;
let resend = null;
let sgMail = null;

// Try Brevo first (primary) - using SMTP with nodemailer
if (process.env.BREVO_API_KEY) {
  try {
    brevoTransporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.BREVO_SMTP_USER || 'a089a0001@smtp-brevo.com',
        pass: process.env.BREVO_API_KEY,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    useBrevo = true;
    logger.info('✅ Using Brevo SMTP for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize Brevo SMTP:', error.message);
  }
}

// Fallback to Resend
if (!useBrevo && process.env.RESEND_API_KEY) {
  try {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
    useResend = true;
    logger.info('✅ Using Resend for email service (fallback)');
  } catch (error) {
    logger.error('❌ Failed to initialize Resend:', error.message);
  }
}

// Fallback to SendGrid
if (!useBrevo && !useResend && process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service (fallback)');
  } catch (error) {
    logger.error('❌ Failed to initialize SendGrid:', error.message);
  }
}

if (!useBrevo && !useResend && !useSendGrid) {
  logger.warn('⚠️  No email service configured (BREVO_API_KEY, RESEND_API_KEY or SENDGRID_API_KEY not found)');
}

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    if (useBrevo && brevoTransporter) {
      await brevoTransporter.verify();
      logger.info('✅ Brevo SMTP connection verified');
      return true;
    }
    if (useResend || useSendGrid) {
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
    // Use Brevo SMTP if available (primary)
    if (useBrevo && brevoTransporter) {
      logger.info('📤 Sending email via Brevo SMTP...', { to, subject });

      const result = await brevoTransporter.sendMail({
        from: `"EDUPLAY" <${process.env.EMAIL_FROM_ADDRESS || 'ja.eduplay@gmail.com'}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || subject,
      });

      logger.info('✅ Email sent successfully via Brevo SMTP', {
        to,
        subject,
        messageId: result.messageId,
      });

      return result;
    }

    // Fallback to Resend
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
  if (useBrevo) return 'brevo';
  if (useResend) return 'resend';
  if (useSendGrid) return 'sendgrid';
  return 'none';
};

module.exports = {
  verifyConnection,
  sendEmail,
  getActiveService,
  usingBrevo: useBrevo,
  usingResend: useResend,
  usingSendGrid: useSendGrid,
};
