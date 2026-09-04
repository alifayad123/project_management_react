import 'dotenv/config';
import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { logger } from './utils/logger';
import { setupSocketIO } from './socket/setup';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
setupSocketIO(server);

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server started`, { port: PORT, env: process.env.NODE_ENV });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, shutting down gracefully`);

  server.close(async () => {
    try {
      await disconnectDB();
      logger.info('Server shut down successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

// Handle signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection', { error });
  process.exit(1);
});

// Start the server
startServer();

export default server;
