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
    // Frontend uses HashRouter, so URL must include /#/
    const resetUrl = `${config.frontend.url}/#/reset-password?token=${token}`;
    const userName = user.name || 'Usuário';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Redefinir Senha</h1>
        <p>Olá ${userName},</p>
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

/**
 * Send product access email with download links
 * @param {Object} buyer - Buyer user object
 * @param {Object} product - Product object
 * @param {Object} order - Order object
 * @returns {Promise<void>}
 */
const sendProductAccessEmail = async (buyer, product, order) => {
  try {
    const filesLinks = product.filesUrl && product.filesUrl.length > 0
      ? product.filesUrl.map((url, index) => `
          <li style="margin: 10px 0;">
            <a href="${url}" style="color: #2196F3; text-decoration: none;">
              📎 Arquivo ${index + 1} - Download
            </a>
          </li>
        `).join('')
      : '<p>Este produto não possui arquivos para download.</p>';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">✅ Pagamento Aprovado!</h1>
        <p>Olá ${buyer.name},</p>
        <p>Seu pagamento foi aprovado com sucesso! Você já pode acessar o produto:</p>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #333;">${product.title}</h2>
          <p><strong>Pedido:</strong> #${order.id}</p>
          <p><strong>Valor:</strong> R$ ${order.amount.toFixed(2)}</p>
        </div>

        <h3 style="color: #333;">📥 Arquivos para Download:</h3>
        <ul style="list-style: none; padding: 0;">
          ${filesLinks}
        </ul>

        ${product.videoUrl ? `
          <h3 style="color: #333;">🎥 Vídeo do Produto:</h3>
          <p>
            <a href="${product.videoUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Assistir Vídeo
            </a>
          </p>
        ` : ''}

        <p style="margin-top: 30px;">
          <a href="${config.frontend.url}/my-courses" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Ver Meus Produtos
          </a>
        </p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Você pode acessar este produto a qualquer momento na seção "Meus Produtos" do site.
        </p>

        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: buyer.email,
      subject: `✅ Seu produto está disponível: ${product.title}`,
      html,
    });

    logger.info('Product access email sent', {
      orderId: order.id,
      buyerEmail: buyer.email,
      productId: product.id,
    });
  } catch (error) {
    logger.error('Error sending product access email:', error);
    throw error;
  }
};

/**
 * Send product submitted email to admin
 * @param {Object} product - Product object
 * @param {Object} producer - Producer object
 * @returns {Promise<void>}
 */
const sendProductSubmittedEmail = async (product, producer) => {
  try {
    const adminEmail = 'ja.eduplay@gmail.com';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Novo Produto Aguardando Aprovação</h1>
        <p>Um novo produto foi enviado para aprovação na plataforma.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Detalhes do Produto</h2>
          <p><strong>Título:</strong> ${product.title}</p>
          <p><strong>Vendedor:</strong> ${producer.name} (${producer.email})</p>
          <p><strong>Preço:</strong> R$ ${product.price.toFixed(2)}</p>
          <p><strong>Data de Envio:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <p>
          <a href="${config.frontend.url}/admin/products" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ver Produtos Pendentes
          </a>
        </p>
        <p>Atenciosamente,<br>Sistema ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: adminEmail,
      subject: `Novo Produto para Aprovação: ${product.title}`,
      html,
    });

    logger.info('Product submitted email sent to admin', {
      productId: product.id,
      producerId: producer.id,
      adminEmail,
    });
  } catch (error) {
    logger.error('Error sending product submitted email:', error);
    // Don't throw - email errors shouldn't block product submission
  }
};

/**
 * Send product approved email to producer
 * @param {Object} product - Product object
 * @param {Object} producer - Producer object
 * @returns {Promise<void>}
 */
const sendProductApprovedEmail = async (product, producer) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Produto Aprovado!</h1>
        <p>Olá ${producer.name},</p>
        <p>Temos uma ótima notícia! Seu produto foi aprovado e já está publicado na plataforma.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Detalhes do Produto</h2>
          <p><strong>Título:</strong> ${product.title}</p>
          <p><strong>Preço:</strong> R$ ${product.price.toFixed(2)}</p>
          <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">PUBLICADO</span></p>
        </div>
        <p>Seu produto agora está disponível para venda no marketplace!</p>
        <p>
          <a href="${config.frontend.url}/product/${product.id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ver Produto
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: producer.email,
      subject: `Produto Aprovado: ${product.title}`,
      html,
    });

    logger.info('Product approved email sent', {
      productId: product.id,
      producerEmail: producer.email,
    });
  } catch (error) {
    logger.error('Error sending product approved email:', error);
    // Don't throw - email errors shouldn't block product approval
  }
};

/**
 * Send product rejected email to producer
 * @param {Object} product - Product object
 * @param {Object} producer - Producer object
 * @param {string} reason - Rejection reason
 * @returns {Promise<void>}
 */
const sendProductRejectedEmail = async (product, producer, reason) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f44336;">Produto Não Aprovado</h1>
        <p>Olá ${producer.name},</p>
        <p>Infelizmente seu produto não foi aprovado para publicação na plataforma.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Detalhes do Produto</h2>
          <p><strong>Título:</strong> ${product.title}</p>
          <p><strong>Motivo da Rejeição:</strong></p>
          <p style="background-color: #fff; padding: 10px; border-left: 4px solid #f44336;">${reason}</p>
        </div>
        <p>Você pode editar seu produto e enviá-lo novamente para aprovação após fazer as correções necessárias.</p>
        <p>
          <a href="${config.frontend.url}/seller/products/${product.id}/edit" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Editar Produto
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
      </div>
    `;

    await emailConfig.sendEmail({
      to: producer.email,
      subject: `Produto Não Aprovado: ${product.title}`,
      html,
    });

    logger.info('Product rejected email sent', {
      productId: product.id,
      producerEmail: producer.email,
    });
  } catch (error) {
    logger.error('Error sending product rejected email:', error);
    // Don't throw - email errors shouldn't block product rejection
  }
};

/**
 * Send email to admin when a product is pending approval
 * @param {string} adminEmail - Admin email
 * @param {Object} data - Email data
 */
const sendProductPendingApprovalEmail = async (adminEmail, data) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .product-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #7c3aed; }
          .product-title { font-size: 20px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; }
          .producer-name { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
          .description { color: #374151; line-height: 1.6; margin-top: 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .button:hover { background: #6d28d9; }
          .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Novo Produto Aguardando Aprovação</h1>
          </div>
          <div class="content">
            <p>Olá ${data.adminName},</p>

            <p>Um novo produto foi criado e está aguardando sua aprovação no EducaplayJA.</p>

            <div class="product-info">
              <div class="product-title">${data.productTitle}</div>
              <div class="producer-name">👤 Criado por: ${data.producerName}</div>
              ${data.productDescription ? `<div class="description">${data.productDescription.substring(0, 200)}${data.productDescription.length > 200 ? '...' : ''}</div>` : ''}
            </div>

            <p>Por favor, revise o produto e tome uma ação:</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/products" class="button">
                Revisar Produto
              </a>
            </div>

            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              💡 <strong>Dica:</strong> Verifique se o produto atende aos padrões de qualidade da plataforma antes de aprovar.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 EducaplayJA. Todos os direitos reservados.</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailConfig.sendEmail({
      to: adminEmail,
      subject: `🔔 Novo Produto Aguardando Aprovação: ${data.productTitle}`,
      html,
    });

    logger.info('Product pending approval email sent', {
      productId: data.productId,
      adminEmail: adminEmail,
    });
  } catch (error) {
    logger.error('Error sending product pending approval email:', error);
    // Don't throw - email errors shouldn't block product creation
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendProductAccessEmail,
  sendNewSaleNotification,
  sendCommissionPaidNotification,
  sendContactFormEmail,
  sendProductSubmittedEmail,
  sendProductApprovedEmail,
  sendProductRejectedEmail,
  sendProductPendingApprovalEmail,
};
