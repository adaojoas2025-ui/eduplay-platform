/**
 * Email Configuration
 * Supports Resend (primary), SendGrid (secondary), Gmail SMTP (fallback)
 * @module config/email
 */

const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

logger.info('📧 Initializing email service...');

let useResend = false;
let useSendGrid = false;
let useNodemailer = false;
let resendClient = null;
let sgMail = null;
let transporter = null;

// 1. Resend (highest priority)
if (process.env.RESEND_API_KEY) {
  try {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    useResend = true;
    logger.info('✅ Resend configured');
  } catch (error) {
    logger.error('❌ Resend init failed:', error.message);
  }
}

// 2. SendGrid (second priority)
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ SendGrid configured');
  } catch (error) {
    logger.error('❌ SendGrid init failed:', error.message);
  }
}

// 3. Nodemailer Gmail SMTP (fallback — always initialized if vars are set)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
    logger.info('✅ Nodemailer (Gmail SMTP) configured');
  } catch (error) {
    logger.error('❌ Nodemailer init failed:', error.message);
  }
}

if (!useResend && !useSendGrid && !useNodemailer) {
  logger.warn('⚠️  No email service configured');
} else {
  const active = [
    useResend && 'Resend',
    useSendGrid && 'SendGrid',
    useNodemailer && 'Nodemailer',
  ].filter(Boolean);
  logger.info(`📧 Email providers available: ${active.join(' → ')}`);
}

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
    if (useResend) {
      logger.info('✅ Email service ready (Resend)');
      return true;
    }
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
 * Send email with automatic fallback: Resend → SendGrid → Nodemailer
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
  const resendFrom = process.env.RESEND_FROM || 'onboarding@resend.dev';

  // 1. Try Resend
  if (useResend && resendClient) {
    try {
      logger.info('📤 Sending email via Resend...', { to, subject });
      const result = await resendClient.emails.send({
        from: resendFrom,
        to,
        subject,
        html,
        text: text || subject,
        ...(replyTo && { replyTo }),
      });
      if (result.error) throw new Error(result.error.message);
      logger.info('✅ Email sent via Resend', { to, subject, id: result.data?.id });
      return result;
    } catch (error) {
      logger.warn('⚠️ Resend failed, trying SendGrid...', { error: error.message });
    }
  }

  // 2. Try SendGrid
  if (useSendGrid && sgMail) {
    try {
      logger.info('📤 Sending email via SendGrid...', { to, subject });
      const [response] = await sgMail.send({
        to,
        from: fromEmail,
        subject,
        text: text || subject,
        html,
        ...(replyTo && { replyTo }),
      });
      logger.info('✅ Email sent via SendGrid', { to, subject, statusCode: response.statusCode });
      return response;
    } catch (error) {
      logger.warn('⚠️ SendGrid failed, trying Nodemailer...', { error: error.message });
    }
  }

  // 3. Try Gmail SMTP
  if (useNodemailer && transporter) {
    logger.info('📤 Sending email via Nodemailer...', { to, subject });
    const result = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text: text || subject,
      html,
      ...(replyTo && { replyTo }),
    });
    logger.info('✅ Email sent via Nodemailer', { to, subject, messageId: result.messageId });
    return result;
  }

  throw new Error('No email service available — configure RESEND_API_KEY, SENDGRID_API_KEY, or EMAIL_USER/EMAIL_PASS');
};

/**
 * Get active email service name
 */
const getActiveService = () => {
  if (useResend) return 'resend';
  if (useSendGrid) return 'sendgrid';
  if (useNodemailer) return 'nodemailer';
  return 'none';
};

module.exports = {
  verifyConnection,
  sendEmail,
  getActiveService,
  usingResend: useResend,
  usingSendGrid: useSendGrid,
  usingNodemailer: useNodemailer,
};
