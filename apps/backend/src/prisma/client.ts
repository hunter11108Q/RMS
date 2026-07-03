import { PrismaClient } from '@prisma/client';
import logger from '../services/logger';
import config from '../config/index';

const logOptions =
  config.env === 'development'
    ? { log: ['query' as const, 'error' as const, 'warn' as const] }
    : { log: ['error' as const] };

export const prisma = new PrismaClient(logOptions);

/**
 * Connect to PostgreSQL database and log state
 */
export async function connectDb(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully.', { context: 'PrismaClient' });
  } catch (error: any) {
    logger.error('Failed to establish database connection:', {
      error: error.message,
      context: 'PrismaClient',
    });
    throw error;
  }
}

/**
 * Close database connection during shutdown sequence
 */
export async function disconnectDb(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed cleanly.', { context: 'PrismaClient' });
  } catch (error: any) {
    logger.error('Error closing database connection:', {
      error: error.message,
      context: 'PrismaClient',
    });
  }
}

export default prisma;
