/**
 * Email Service
 * Business logic for email operations
 * @module services/email
 */

const emailConfig = require('../config/email');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Send welcome email
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (user) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bem-vindo ao ${config.platform.name}!</h1>
        <p>Olá ${user.name},</p>
        <p>Obrigado por se cadastrar no ${config.platform.name}. Estamos felizes em tê-lo conosco!</p>
        <p>Agora você pode:</p>
        <ul>
          <li>Explorar nossa biblioteca de cursos digitais</li>
          <li>Comprar cursos de produtores incríveis</li>
          ${user.role === 'PRODUCER' ? '<li>Criar e vender seus próprios cursos</li>' : ''}
        </ul>
        <p>
          <a href="${config.frontend.url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Começar Agora
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: user.email,
      subject: `Bem-vindo ao ${config.platform.name}!`,
      html,
    });

    logger.info('Welcome email sent', { userId: user.id, email: user.email });
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    // Don't throw - email errors shouldn't block user registration
  }
};

/**
 * Send email verification
 * @param {Object} user - User object
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${config.frontend.url}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verifique seu email</h1>
        <p>Olá ${user.name},</p>
        <p>Por favor, clique no botão abaixo para verificar seu endereço de email:</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar Email
          </a>
        </p>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>Este link expirará em 24 horas.</p>
        <p>Se você não solicitou esta verificação, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: user.email,
      subject: 'Verifique seu email',
      html,
    });

    logger.info('Verification email sent', { userId: user.id, email: user.email });
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (user, token) => {
  try {
    const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Redefinir Senha</h1>
        <p>Olá ${user.name},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para continuar:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Senha
          </a>
        </p>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>Este link expirará em 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada.</p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: user.email,
      subject: 'Redefinir sua senha',
      html,
    });

    logger.info('Password reset email sent', { userId: user.id, email: user.email });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @returns {Promise<void>}
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Pedido Confirmado!</h1>
        <p>Olá ${order.buyer.name},</p>
        <p>Seu pedido foi confirmado com sucesso!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Detalhes do Pedido</h2>
          <p><strong>Produto:</strong> ${order.product.title}</p>
          <p><strong>Valor:</strong> R$ ${order.amount.toFixed(2)}</p>
          <p><strong>Pedido #:</strong> ${order.id}</p>
        </div>
        <p>Você já pode acessar o conteúdo do seu curso!</p>
        <p>
          <a href="${config.frontend.url}/my-courses" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Acessar Meus Cursos
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: order.buyer.email,
      subject: 'Pedido Confirmado!',
      html,
    });

    logger.info('Order confirmation email sent', {
      orderId: order.id,
      email: order.buyer.email,
    });
  } catch (error) {
    logger.error('Error sending order confirmation email:', error);
    // Don't throw - email errors shouldn't block order processing
  }
};

/**
 * Send new sale notification to producer
 * @param {Object} order - Order object
 * @returns {Promise<void>}
 */
const sendNewSaleNotification = async (order) => {
  try {
    const producerEmail = order.product.producer.email;
    const producerName = order.product.producer.name;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Nova Venda Realizada!</h1>
        <p>Olá ${producerName},</p>
        <p>Parabéns! Você realizou uma nova venda!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Detalhes da Venda</h2>
          <p><strong>Produto:</strong> ${order.product.title}</p>
          <p><strong>Valor Total:</strong> R$ ${order.amount.toFixed(2)}</p>
          <p><strong>Sua Comissão:</strong> R$ ${order.producerAmount.toFixed(2)}</p>
          <p><strong>Taxa da Plataforma:</strong> R$ ${order.platformFee.toFixed(2)}</p>
        </div>
        <p>
          <a href="${config.frontend.url}/producer/sales" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ver Minhas Vendas
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: producerEmail,
      subject: 'Nova Venda Realizada!',
      html,
    });

    logger.info('New sale notification sent', {
      orderId: order.id,
      email: producerEmail,
    });
  } catch (error) {
    logger.error('Error sending new sale notification:', error);
    // Don't throw - email errors shouldn't block order processing
  }
};

/**
 * Send commission paid notification
 * @param {Object} commission - Commission object
 * @returns {Promise<void>}
 */
const sendCommissionPaidNotification = async (commission) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Comissão Paga!</h1>
        <p>Olá ${commission.producer.name},</p>
        <p>Sua comissão foi paga com sucesso!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Detalhes do Pagamento</h2>
          <p><strong>Valor:</strong> R$ ${commission.amount.toFixed(2)}</p>
          <p><strong>Chave PIX:</strong> ${commission.producer.pixKey}</p>
          <p><strong>Data:</strong> ${new Date(commission.paidAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <p>O valor foi transferido para sua chave PIX cadastrada.</p>
        <p>
          <a href="${config.frontend.url}/producer/commissions" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ver Minhas Comissões
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: commission.producer.email,
      subject: 'Comissão Paga!',
      html,
    });

    logger.info('Commission paid notification sent', {
      commissionId: commission.id,
      email: commission.producer.email,
    });
  } catch (error) {
    logger.error('Error sending commission paid notification:', error);
    // Don't throw - email errors shouldn't block commission processing
  }
};

/**
 * Send contact form email
 * @param {Object} data - Contact form data
 * @returns {Promise<void>}
 */
const sendContactFormEmail = async (data) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Nova Mensagem de Contato</h1>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Nome:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Assunto:</strong> ${data.subject}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${data.message}</p>
        </div>
      </div>
    `;

    await emailConfig.sendEmail({
      to: config.platform.supportEmail,
      subject: `Contato: ${data.subject}`,
      html,
      replyTo: data.email,
    });

    logger.info('Contact form email sent', { email: data.email });
  } catch (error) {
    logger.error('Error sending contact form email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendNewSaleNotification,
  sendCommissionPaidNotification,
  sendContactFormEmail,
};
