/**
 * Server Entry Point
 * Starts the Express server and handles connections
 * @module server
 */

// Load environment variables FIRST
require('dotenv').config();

// Sync Prisma schema to DB on every startup (ensures new columns exist)
const { execSync } = require('child_process');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
} catch (e) {
  console.warn('Prisma sync warning:', e.message);
}

const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const logger = require('./src/utils/logger');
const config = require('./src/config/env');

// Initialize email service on startup to verify configuration
logger.info('🔧 Loading email configuration module...');
require('./src/config/email');
logger.info('✅ Email configuration module loaded');

/**
 * Server instance
 */
let server;

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    server = app.listen(config.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  🚀 ${config.platform.name} API Server Running
║                                                                ║
║  📍 Environment: ${config.env.toUpperCase()}
║  🌐 URL: http://localhost:${config.port}
║  📚 API: http://localhost:${config.port}/api/v1
║  ✅ Health: http://localhost:${config.port}/api/v1/health
║                                                                ║
║  📊 Database: Connected                                        ║
║  🔒 Security: Enabled (Helmet, CORS, Rate Limiting)            ║
║  📝 Logging: ${config.log.level.toUpperCase()} level
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      // Close database connection
      const { disconnectDatabase } = require('./src/config/database');
      await disconnectDatabase();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Handle termination signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start the server
 */
startServer();

module.exports = app;
