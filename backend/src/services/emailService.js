const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send purchase confirmation email with download links
 */
async function sendPurchaseEmail(buyer, product, files) {
  try {
    const fileLinks = files.map(file =>
      `<li><a href="${file.url}" target="_blank">${file.name}</a></li>`
    ).join('');

    const mailOptions = {
      from: `EDUPLAY <${process.env.EMAIL_USER}>`,
      to: buyer.email,
      subject: `Compra confirmada: ${product.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">Compra confirmada! 🎉</h1>

          <p>Olá <strong>${buyer.name}</strong>,</p>

          <p>Sua compra foi confirmada com sucesso!</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1f2937;">Detalhes da compra</h2>
            <p><strong>Produto:</strong> ${product.title}</p>
            <p><strong>Valor:</strong> R$ ${product.price.toFixed(2)}</p>
          </div>

          <h3>Downloads disponíveis:</h3>
          <ul>
            ${fileLinks}
          </ul>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Você também pode acessar seus downloads a qualquer momento em seu painel no EDUPLAY.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 12px;">
            Este é um email automático. Por favor, não responda.<br>
            EDUPLAY - Marketplace de Cursos Digitais
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Purchase email sent to:', buyer.email);
  } catch (error) {
    console.error('❌ Error sending purchase email:', error);
    throw error;
  }
}

/**
 * Send new sale notification to producer
 */
async function sendSaleNotification(producer, product, buyer, amount) {
  try {
    const mailOptions = {
      from: `EDUPLAY <${process.env.EMAIL_USER}>`,
      to: producer.email,
      subject: `Nova venda: ${product.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Nova venda realizada! 💰</h1>

          <p>Olá <strong>${producer.name}</strong>,</p>

          <p>Você realizou uma nova venda!</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1f2937;">Detalhes da venda</h2>
            <p><strong>Produto:</strong> ${product.title}</p>
            <p><strong>Comprador:</strong> ${buyer.name}</p>
            <p><strong>Valor total:</strong> R$ ${amount.toFixed(2)}</p>
            <p><strong>Sua comissão (90%):</strong> R$ ${(amount * 0.9).toFixed(2)}</p>
          </div>

          <p>Acesse seu painel para ver mais detalhes.</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 12px;">
            EDUPLAY - Marketplace de Cursos Digitais
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Sale notification sent to:', producer.email);
  } catch (error) {
    console.error('❌ Error sending sale notification:', error);
  }
}

/**
 * Send account approval email
 */
async function sendApprovalEmail(user) {
  try {
    const mailOptions = {
      from: `EDUPLAY <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Conta de produtor aprovada!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7C3AED;">Conta aprovada! 🎉</h1>

          <p>Olá <strong>${user.name}</strong>,</p>

          <p>Sua conta de produtor foi aprovada com sucesso!</p>

          <p>Agora você pode começar a vender seus produtos digitais no EDUPLAY.</p>

          <p><a href="${process.env.FRONTEND_URL}/producer/dashboard" style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Acessar meu painel</a></p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 12px;">
            EDUPLAY - Marketplace de Cursos Digitais
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent to:', user.email);
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
  }
}

module.exports = {
  sendPurchaseEmail,
  sendSaleNotification,
  sendApprovalEmail,
};
