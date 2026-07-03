import { createServer } from 'http';
import app from './app';
import config from '../config/index';
import { connectDb, disconnectDb } from '../prisma/client';
import { wsServerManager } from '../websocket/manager';
import logger from '../services/logger';

const server = createServer(app);

async function bootstrap() {
  try {
    // 1. Hook database connection
    await connectDb();

    // 2. Hook WebSocket server manager
    wsServerManager.initialize(server);
    logger.info('WebSocket system initialized and bound to server.', { context: 'Bootstrap' });

    // 3. Listen on port
    server.listen(config.port, () => {
      logger.info(`RMS Backend running in [${config.env}] mode on port ${config.port}`, {
        context: 'Bootstrap',
      });
    });
  } catch (error: any) {
    logger.error('Startup bootstrap failed:', {
      error: error.message,
      stack: error.stack,
      context: 'Bootstrap',
    });
    process.exit(1);
  }
}

// Intercept uncaught/unhandled rejections
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception captured:', {
    error: error.message,
    stack: error.stack,
    context: 'ServerBound',
  });
  gracefulShutdown();
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection captured:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    context: 'ServerBound',
  });
  gracefulShutdown();
});

// Intercept termination shutdown signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Triggering shutdown sequence.', { context: 'ServerBound' });
  gracefulShutdown();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Triggering shutdown sequence.', { context: 'ServerBound' });
  gracefulShutdown();
});

let isShuttingDown = false;
async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('Graceful shutdown initiated...', { context: 'ServerBound' });

  // 1. Close HTTP Server
  server.close(async () => {
    logger.info('HTTP server closed.', { context: 'ServerBound' });

    // 2. Disconnect database client
    await disconnectDb();

    logger.info('Graceful shutdown complete. Exiting process.', { context: 'ServerBound' });
    process.exit(0);
  });

  // Force exit after 10 seconds if closing hangs
  setTimeout(() => {
    logger.warn('Forcefully exiting process after timeout.', { context: 'ServerBound' });
    process.exit(1);
  }, 10000);
}

bootstrap();
