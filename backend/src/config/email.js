/**
 * Email Configuration
 * Email service using Brevo (primary), Resend or SendGrid (fallback)
 * @module config/email
 * @updated 2026-01-21T19:05:00Z
 */

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
let brevoApiInstance = null;
let resend = null;
let sgMail = null;

// Try Brevo first (primary)
if (process.env.BREVO_API_KEY) {
  try {
    const SibApiV3Sdk = require('@getbrevo/brevo');
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    // Configure API key authorization
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    useBrevo = true;
    logger.info('✅ Using Brevo for email service');
  } catch (error) {
    logger.error('❌ Failed to initialize Brevo:', error.message);
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
    if (useBrevo || useResend || useSendGrid) {
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
    // Use Brevo if available (primary)
    if (useBrevo && brevoApiInstance) {
      logger.info('📤 Sending email via Brevo...', { to, subject });

      const SibApiV3Sdk = require('@getbrevo/brevo');
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.sender = {
        name: 'EDUPLAY',
        email: process.env.EMAIL_FROM_ADDRESS || 'ja.eduplay@gmail.com',
      };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text || subject;

      const result = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);

      logger.info('✅ Email sent successfully via Brevo', {
        to,
        subject,
        messageId: result?.body?.messageId || result?.messageId,
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
      code: error.code,
      stack: error.stack,
      to,
      subject,
    });
    throw error;
  }
};

module.exports = {
  verifyConnection,
  sendEmail,
  usingBrevo: useBrevo,
  usingResend: useResend,
  usingSendGrid: useSendGrid,
};
