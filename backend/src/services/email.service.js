/**
 * Email Service
 * Business logic for email operations
 * @module services/email
 */

const emailConfig = require('../config/email');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Strip HTML tags to generate plain text version
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
const stripHtml = (html) => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Wrap email body content in a complete HTML document with footer
 * @param {string} bodyContent - Inner HTML content
 * @returns {string} Complete HTML document
 */
const wrapHtmlTemplate = (bodyContent) => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${config.platform.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 30px; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #333333;">
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5; font-family: Arial, sans-serif;">
                ${config.platform.name} - Plataforma de cursos digitais<br>
                Este e-mail foi enviado automaticamente, por favor nao responda diretamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send welcome email
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (user) => {
  try {
    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Bem-vindo ao ${config.platform.name}!</h1>
      <p>Ola ${user.name},</p>
      <p>Obrigado por se cadastrar no ${config.platform.name}. Estamos felizes em te-lo conosco!</p>
      <p>Agora voce pode:</p>
      <ul>
        <li>Explorar nossa biblioteca de cursos digitais</li>
        <li>Comprar cursos de produtores incriveis</li>
        ${user.role === 'PRODUCER' ? '<li>Criar e vender seus proprios cursos</li>' : ''}
      </ul>
      <p>
        <a href="${config.frontend.url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Comecar Agora
        </a>
      </p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: user.email,
      subject: `Bem-vindo ao ${config.platform.name}`,
      html,
      text: stripHtml(bodyContent),
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

    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Verifique seu email</h1>
      <p>Ola ${user.name},</p>
      <p>Por favor, clique no botao abaixo para verificar seu endereco de email:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verificar Email
        </a>
      </p>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>Este link expirara em 24 horas.</p>
      <p>Se voce nao solicitou esta verificacao, ignore este email.</p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: user.email,
      subject: 'Verifique seu email',
      html,
      text: stripHtml(bodyContent),
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
    const userName = user.name || 'Usuario';

    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Redefinir Senha</h1>
      <p>Ola ${userName},</p>
      <p>Voce solicitou a redefinicao de sua senha. Clique no botao abaixo para continuar:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Redefinir Senha
        </a>
      </p>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>Este link expirara em 1 hora.</p>
      <p>Se voce nao solicitou esta redefinicao, ignore este email e sua senha permanecera inalterada.</p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: user.email,
      subject: 'Redefinir sua senha',
      html,
      text: stripHtml(bodyContent),
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
    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Pedido Confirmado</h1>
      <p>Ola ${order.buyer.name},</p>
      <p>Seu pedido foi confirmado com sucesso!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Detalhes do Pedido</h2>
        <p><strong>Produto:</strong> ${order.product.title}</p>
        <p><strong>Valor:</strong> R$ ${order.amount.toFixed(2)}</p>
        <p><strong>Pedido #:</strong> ${order.id}</p>
      </div>
      <p>Voce ja pode acessar o conteudo do seu curso!</p>
      <p>
        <a href="${config.frontend.url}/my-courses" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Acessar Meus Cursos
        </a>
      </p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: order.buyer.email,
      subject: 'Pedido Confirmado',
      html,
      text: stripHtml(bodyContent),
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

    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Nova Venda Realizada</h1>
      <p>Ola ${producerName},</p>
      <p>Parabens! Voce realizou uma nova venda!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Detalhes da Venda</h2>
        <p><strong>Produto:</strong> ${order.product.title}</p>
        <p><strong>Valor Total:</strong> R$ ${order.amount.toFixed(2)}</p>
        <p><strong>Sua Comissao:</strong> R$ ${order.producerAmount.toFixed(2)}</p>
        <p><strong>Taxa da Plataforma:</strong> R$ ${order.platformFee.toFixed(2)}</p>
      </div>
      <p>
        <a href="${config.frontend.url}/producer/sales" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ver Minhas Vendas
        </a>
      </p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: producerEmail,
      subject: 'Nova Venda Realizada',
      html,
      text: stripHtml(bodyContent),
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
    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Comissao Paga</h1>
      <p>Ola ${commission.producer.name},</p>
      <p>Sua comissao foi paga com sucesso!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Detalhes do Pagamento</h2>
        <p><strong>Valor:</strong> R$ ${commission.amount.toFixed(2)}</p>
        <p><strong>Chave PIX:</strong> ${commission.producer.pixKey}</p>
        <p><strong>Data:</strong> ${new Date(commission.paidAt).toLocaleDateString('pt-BR')}</p>
      </div>
      <p>O valor foi transferido para sua chave PIX cadastrada.</p>
      <p>
        <a href="${config.frontend.url}/producer/commissions" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ver Minhas Comissoes
        </a>
      </p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: commission.producer.email,
      subject: 'Comissao Paga',
      html,
      text: stripHtml(bodyContent),
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
    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Nova Mensagem de Contato</h1>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Assunto:</strong> ${data.subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${data.message}</p>
      </div>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: config.platform.supportEmail,
      subject: `Contato: ${data.subject}`,
      html,
      text: stripHtml(bodyContent),
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
              Arquivo ${index + 1} - Download
            </a>
          </li>
        `).join('')
      : '<p>Este produto nao possui arquivos para download.</p>';

    const bodyContent = `
      <h1 style="color: #4CAF50; margin-top: 0;">Pagamento Aprovado</h1>
      <p>Ola ${buyer.name},</p>
      <p>Seu pagamento foi aprovado com sucesso! Voce ja pode acessar o produto:</p>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #333;">${product.title}</h2>
        <p><strong>Pedido:</strong> #${order.id}</p>
        <p><strong>Valor:</strong> R$ ${order.amount.toFixed(2)}</p>
      </div>

      <h3 style="color: #333;">Arquivos para Download:</h3>
      <ul style="list-style: none; padding: 0;">
        ${filesLinks}
      </ul>

      ${product.videoUrl ? `
        <h3 style="color: #333;">Video do Produto:</h3>
        <p>
          <a href="${product.videoUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Assistir Video
          </a>
        </p>
      ` : ''}

      <p style="margin-top: 30px;">
        <a href="${config.frontend.url}/my-courses" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Ver Meus Produtos
        </a>
      </p>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Voce pode acessar este produto a qualquer momento na secao "Meus Produtos" do site.
      </p>

      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: buyer.email,
      subject: `Seu produto esta disponivel: ${product.title}`,
      html,
      text: stripHtml(bodyContent),
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

    const bodyContent = `
      <h1 style="color: #333; margin-top: 0;">Novo Produto Aguardando Aprovacao</h1>
      <p>Um novo produto foi enviado para aprovacao na plataforma.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Detalhes do Produto</h2>
        <p><strong>Titulo:</strong> ${product.title}</p>
        <p><strong>Vendedor:</strong> ${producer.name} (${producer.email})</p>
        <p><strong>Preco:</strong> R$ ${product.price.toFixed(2)}</p>
        <p><strong>Data de Envio:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      <p>
        <a href="${config.frontend.url}/admin/products" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ver Produtos Pendentes
        </a>
      </p>
      <p>Atenciosamente,<br>Sistema ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: adminEmail,
      subject: `Novo Produto para Aprovacao: ${product.title}`,
      html,
      text: stripHtml(bodyContent),
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
    const bodyContent = `
      <h1 style="color: #4CAF50; margin-top: 0;">Produto Aprovado</h1>
      <p>Ola ${producer.name},</p>
      <p>Temos uma otima noticia! Seu produto foi aprovado e ja esta publicado na plataforma.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Detalhes do Produto</h2>
        <p><strong>Titulo:</strong> ${product.title}</p>
        <p><strong>Preco:</strong> R$ ${product.price.toFixed(2)}</p>
        <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">PUBLICADO</span></p>
      </div>
      <p>Seu produto agora esta disponivel para venda no marketplace!</p>
      <p>
        <a href="${config.frontend.url}/product/${product.id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Ver Produto
        </a>
      </p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: producer.email,
      subject: `Produto Aprovado: ${product.title}`,
      html,
      text: stripHtml(bodyContent),
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
    const bodyContent = `
      <h1 style="color: #f44336; margin-top: 0;">Produto Nao Aprovado</h1>
      <p>Ola ${producer.name},</p>
      <p>Infelizmente seu produto nao foi aprovado para publicacao na plataforma.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Detalhes do Produto</h2>
        <p><strong>Titulo:</strong> ${product.title}</p>
        <p><strong>Motivo da Rejeicao:</strong></p>
        <p style="background-color: #fff; padding: 10px; border-left: 4px solid #f44336;">${reason}</p>
      </div>
      <p>Voce pode editar seu produto e envia-lo novamente para aprovacao apos fazer as correcoes necessarias.</p>
      <p>
        <a href="${config.frontend.url}/seller/products/${product.id}/edit" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Editar Produto
        </a>
      </p>
      <p>Atenciosamente,<br>Equipe ${config.platform.name}</p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: producer.email,
      subject: `Produto Nao Aprovado: ${product.title}`,
      html,
      text: stripHtml(bodyContent),
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
    const bodyContent = `
      <h1 style="color: #7c3aed; margin-top: 0;">Novo Produto Aguardando Aprovacao</h1>
      <p>Ola ${data.adminName},</p>
      <p>Um novo produto foi criado e esta aguardando sua aprovacao no ${config.platform.name}.</p>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #7c3aed;">
        <p style="font-size: 18px; font-weight: bold; color: #7c3aed; margin-top: 0;">${data.productTitle}</p>
        <p style="color: #6b7280; font-size: 14px;">Criado por: ${data.producerName}</p>
        ${data.productDescription ? `<p style="color: #374151;">${data.productDescription.substring(0, 200)}${data.productDescription.length > 200 ? '...' : ''}</p>` : ''}
      </div>

      <p>Por favor, revise o produto e tome uma acao:</p>

      <p style="text-align: center;">
        <a href="${config.frontend.url}/admin/products" style="display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px;">
          Revisar Produto
        </a>
      </p>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>Dica:</strong> Verifique se o produto atende aos padroes de qualidade da plataforma antes de aprovar.
      </p>
    `;
    const html = wrapHtmlTemplate(bodyContent);

    await emailConfig.sendEmail({
      to: adminEmail,
      subject: `Novo Produto Aguardando Aprovacao: ${data.productTitle}`,
      html,
      text: stripHtml(bodyContent),
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
