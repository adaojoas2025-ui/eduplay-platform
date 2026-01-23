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
 * TEMPORARY: Full cleanup endpoint (remove after use!)
 * Uses raw SQL to delete all data except admin
 */
app.get('/api/v1/cleanup-check', (req, res) => {
  res.json({ version: 'v5-rawsql', timestamp: new Date().toISOString() });
});

app.delete('/api/v1/full-cleanup-temp-xyz789', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    console.log('🧹 FULL CLEANUP via RAW SQL...');

    // Get admin ID first
    const adminResult = await prisma.$queryRaw`SELECT id, email FROM users WHERE role = 'ADMIN' LIMIT 1`;

    if (!adminResult || adminResult.length === 0) {
      await prisma.$disconnect();
      return res.status(400).json({ error: 'Admin not found' });
    }

    const adminId = adminResult[0].id;
    const adminEmail = adminResult[0].email;
    console.log('👤 Admin:', adminEmail);

    // Delete in order via raw SQL
    const r1 = await prisma.$executeRaw`DELETE FROM commissions`;
    console.log('✅ Commissions deleted');

    const r2 = await prisma.$executeRaw`DELETE FROM orders`;
    console.log('✅ Orders deleted');

    const r3 = await prisma.$executeRaw`DELETE FROM reviews`;
    console.log('✅ Reviews deleted');

    const r4 = await prisma.$executeRaw`DELETE FROM cart_items`;
    console.log('✅ Cart items deleted');

    const r5 = await prisma.$executeRaw`DELETE FROM order_bumps`;
    console.log('✅ Order bumps deleted');

    const r6 = await prisma.$executeRaw`DELETE FROM products`;
    console.log('✅ Products deleted');

    const r7 = await prisma.$executeRaw`DELETE FROM users WHERE id != ${adminId}`;
    console.log('✅ Users deleted (except admin)');

    await prisma.$disconnect();

    res.json({
      success: true,
      message: 'Full cleanup completed via raw SQL!',
      adminPreserved: adminEmail
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

/**
 * API routes (versioned)
 */
app.use('/api/v1', routes);

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
