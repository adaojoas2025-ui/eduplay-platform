/**
 * Email Configuration
 * Primary: Resend (HTTP API — works on Render free tier)
 * Fallback: SendGrid → Nodemailer (Gmail SMTP)
 * @module config/email
 */

const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');

let useResend = false;
let useSendGrid = false;
let useNodemailer = false;
let resendClient = null;
let sgMail = null;
let transporter = null;

// 1. Resend (primary — HTTP API, works on Render)
if (process.env.RESEND_API_KEY) {
  try {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    useResend = true;
    logger.info('✅ Using Resend for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize Resend:', error.message);
  }
}

// 2. SendGrid fallback
if (!useResend && process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    logger.info('✅ Using SendGrid for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize SendGrid:', error.message);
  }
}

// 3. Nodemailer Gmail SMTP fallback
if (!useResend && !useSendGrid && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE !== 'false',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
    useNodemailer = true;
    logger.info('✅ Using Nodemailer (Gmail SMTP) for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize Nodemailer:', error.message);
  }
}

if (!useResend && !useSendGrid && !useNodemailer) {
  logger.warn('⚠️  No email service configured');
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
 * Send email
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  // Resend requires a verified domain as FROM. On free tier, use onboarding@resend.dev
  // OR use a verified domain. For now, use resend.dev domain with display name.
  const fromEmail = useResend
    ? (process.env.RESEND_FROM || 'EducaplayJA <onboarding@resend.dev>')
    : (process.env.EMAIL_FROM || 'EducaplayJA <ja.eduplay@gmail.com>');

  // 1. Resend
  if (useResend && resendClient) {
    try {
      logger.info('📤 Sending email via Resend...', { to, subject });
      const result = await resendClient.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
        text: text || subject,
        ...(replyTo && { reply_to: replyTo }),
      });
      if (result.error) {
        throw new Error(result.error.message || JSON.stringify(result.error));
      }
      logger.info('✅ Email sent successfully via Resend', { to, subject, id: result.data?.id });
      return result;
    } catch (error) {
      logger.warn('⚠️ Resend failed, trying SendGrid...', { error: error.message });
    }
  }

  // 2. SendGrid
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
      logger.info('✅ Email sent successfully via SendGrid', { to, subject, statusCode: response.statusCode });
      return response;
    } catch (error) {
      logger.warn('⚠️ SendGrid failed, trying Nodemailer...', { error: error.message });
    }
  }

  // 3. Nodemailer
  if (useNodemailer && transporter) {
    try {
      logger.info('📤 Sending email via Nodemailer...', { to, subject });
      const result = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: text || subject,
        html,
        ...(replyTo && { replyTo }),
      });
      logger.info('✅ Email sent successfully via Nodemailer', { to, subject, messageId: result.messageId });
      return result;
    } catch (error) {
      logger.error('❌ Nodemailer failed:', { error: error.message, to, subject });
      throw error;
    }
  }

  throw new Error('No email service configured');
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
  usingBrevo: false,
  usingSendGrid: useSendGrid,
  usingNodemailer: useNodemailer,
};
