/**
 * Email Configuration
 * Email service using Resend API (works on Render)
 * Brevo SMTP is blocked on Render, so we use Resend as primary
 * @module config/email
 * @updated 2026-01-22T13:15:00Z
 */

const logger = require('../utils/logger');

logger.info('📧 Initializing email service...');
logger.info('🔍 Checking environment variables...', {
  hasBrevoKey: !!process.env.BREVO_API_KEY,
  hasResendKey: !!process.env.RESEND_API_KEY,
  hasSendGridKey: !!process.env.SENDGRID_API_KEY,
});

// Service flags
let useResend = false;
let useSendGrid = false;

// Service instances
let resend = null;
let sgMail = null;

// Try Resend first (primary) - HTTP API works on Render
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
    logger.info('✅ Using SendGrid for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize SendGrid:', error.message);
  }
}

if (!useResend && !useSendGrid) {
  logger.warn('⚠️  No email service configured (RESEND_API_KEY or SENDGRID_API_KEY not found)');
  logger.warn('⚠️  Note: Brevo SMTP is blocked on Render. Use Resend or SendGrid instead.');
}

/**
 * Verify email connection
 */
const verifyConnection = async () => {
  try {
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
 * Send email (async - does not block)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Fire and forget - don't await, just return immediately
  const sendPromise = sendEmailInternal({ to, subject, html, text });

  // Log any errors but don't throw
  sendPromise.catch(error => {
    logger.error('❌ Background email send failed:', {
      error: error.message,
      to,
      subject,
    });
  });

  // Return immediately without waiting
  return { queued: true, to, subject };
};

/**
 * Internal send email function
 */
const sendEmailInternal = async ({ to, subject, html, text }) => {
  try {
    // Use Resend if available (primary)
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

    logger.warn('⚠️  No email service available - email not sent', { to, subject });
    return { skipped: true, reason: 'No email service configured' };
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
  if (useResend) return 'resend';
  if (useSendGrid) return 'sendgrid';
  return 'none';
};

module.exports = {
  verifyConnection,
  sendEmail,
  getActiveService,
  usingBrevo: false,
  usingResend: useResend,
  usingSendGrid: useSendGrid,
};
