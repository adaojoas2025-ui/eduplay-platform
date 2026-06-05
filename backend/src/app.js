/**
 * Express Application
 * Main application setup and configuration
 * @module app
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const logger = require('./utils/logger');
const routes = require('./api/routes');
const { errorHandler } = require('./api/middlewares/errorHandler.middleware');
const { generalLimiter } = require('./api/middlewares/rateLimiter.middleware');
const passport = require('./config/passport');

/**
 * Create Express application
 */
const app = express();

/**
 * Trust proxy - Required for Render and other reverse proxies
 */
app.set('trust proxy', 1);

/**
 * Security middleware
 */
app.use(helmet());

/**
 * CORS configuration
 */
const allowedOrigins = [
  config.urls.frontend,
  'https://educaplayja.com.br',
  'https://www.educaplayja.com.br',
  'https://eduplay-frontend.onrender.com',
  'https://eduplay.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      // Allow Chrome extension origins (IRP Master Automação)
      if (origin && origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }

      // Allow all Render.com and Vercel origins
      if (origin && (origin.includes('.onrender.com') || origin.includes('.vercel.app'))) {
        return callback(null, true);
      }

      if (config.env === 'development' || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * Request logging
 */
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Serve static files (uploads)
 */
app.use('/uploads', express.static('public/uploads'));

/**
 * Passport initialization
 */
app.use(passport.initialize());

/**
 * Rate limiting
 */
app.use(generalLimiter);

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${config.platform.name} API`,
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Email diagnostic endpoint (temporary)
 */
app.get('/api/v1/email-status', (req, res) => {
  const emailConfig = require('./config/email');
  res.status(200).json({
    success: true,
    emailService: emailConfig.getActiveService ? emailConfig.getActiveService() : 'unknown',
    hasBrevoKey: !!process.env.BREVO_API_KEY,
    brevoKeyPrefix: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 10) + '...' : null,
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasSendGridKey: !!process.env.SENDGRID_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/**
 * API routes (versioned)
 */
app.use('/api/v1', routes);

/**
 * Public privacy policy pages served by the API domain.
 * Some custom domains point to the backend service, so keep this route
 * available outside the SPA as well.
 */
app.get('/politica-de-privacidade-comprasnet-irp', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Politica de Privacidade - Comprasnet IRP Automacao</title>
  <style>
    body { margin: 0; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif; color: #172033; background: #f5f7fa; }
    main { max-width: 880px; margin: 0 auto; background: #fff; border: 1px solid #d9e2ec; border-radius: 8px; padding: 32px; line-height: 1.6; }
    h1 { margin: 0 0 8px; font-size: 28px; color: #0f3d2e; }
    h2 { margin: 28px 0 8px; font-size: 18px; color: #0f3d2e; }
    p { margin: 0 0 14px; }
    .muted { color: #52606d; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <h1>Politica de Privacidade</h1>
    <p class="muted">Comprasnet IRP Automacao</p>
    <p class="muted">Ultima atualizacao: 5 de junho de 2026</p>

    <h2>1. Finalidade</h2>
    <p>A extensao Comprasnet IRP Automacao foi criada para auxiliar usuarios autorizados em tarefas repetitivas relacionadas ao fluxo de Intencao de Registro de Precos entre SIASGnet e Catalogo Compras.gov.br.</p>
    <p>A ferramenta apoia consultas, organizacao de informacoes e preenchimento de campos durante a navegacao nos sistemas utilizados pelo usuario.</p>

    <h2>2. Dados utilizados</h2>
    <p>A extensao pode ler conteudos exibidos nas paginas acessadas pelo usuario, como textos, codigos, campos, descricoes, tabelas e demais informacoes necessarias para executar a automacao solicitada.</p>
    <p>A extensao tambem pode usar dados de licenca, como chave de ativacao, identificador local do dispositivo, status de validacao e data de expiracao.</p>

    <h2>3. Armazenamento local</h2>
    <p>A extensao pode armazenar localmente, no navegador do usuario, configuracoes, preferencias, dados de licenca, planos de automacao, progresso temporario e informacoes de falhas ou substituicoes necessarias para continuidade do fluxo.</p>

    <h2>4. Compartilhamento de dados</h2>
    <p>A extensao nao vende dados de usuarios, nao transfere dados para terceiros e nao utiliza dados para publicidade, avaliacao de credito, emprestimo ou qualquer finalidade nao relacionada ao seu proposito unico.</p>

    <h2>5. Dados sensiveis</h2>
    <p>A extensao nao foi projetada para coletar informacoes de saude, dados financeiros, comunicacoes pessoais, localizacao precisa ou dados pessoais sensiveis.</p>

    <h2>6. Backend de licenca</h2>
    <p>Para validar a licenca, a extensao pode se comunicar com o backend de licencas mantido pelo desenvolvedor. Essa comunicacao envolve apenas dados necessarios para ativacao, validacao, heartbeat e encerramento da licenca.</p>

    <h2>7. Responsabilidade do usuario</h2>
    <p>O usuario deve utilizar a extensao apenas em contas, sistemas e processos para os quais possua autorizacao, respeitando as normas aplicaveis aos processos de compras publicas.</p>

    <h2>8. Contato</h2>
    <p>Em caso de duvidas, suporte ou solicitacoes relacionadas a esta politica, entre em contato pelo email <a href="mailto:ja.eduplay@gmail.com">ja.eduplay@gmail.com</a>.</p>
  </main>
</body>
</html>`);
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

/**
 * Global error handler (must be last)
 */
app.use(errorHandler);

module.exports = app;
