/**
 * Database Configuration
 * Prisma ORM client setup and connection management
 * @module config/database
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

/**
 * Prisma client instance with logging configuration
 */
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

/**
 * Log database queries in development
 */
prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
});

/**
 * Connect to database
 * @returns {Promise<void>}
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from database
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}

/**
 * Graceful shutdown
 */
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

module.exports = { prisma, connectDatabase, disconnectDatabase };
