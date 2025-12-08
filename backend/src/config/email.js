/**
 * Email Configuration
 * Email service using Nodemailer
 * @module config/email
 */

const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

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
    await transporter.verify();
    logger.info('✅ Email service connected');
    return true;
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
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: info.messageId,
    });

    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
};
