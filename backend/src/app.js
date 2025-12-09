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
app.use(
  cors({
    origin: config.env === 'development' ? true : config.urls.frontend,
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
