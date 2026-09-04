import { connectDB, clearDB, disconnectDB } from '../config/database';
import { logger } from '../utils/logger';

// Silence logger during tests
logger.silent = process.env.TEST_SILENT !== 'false';

/**
 * Before all tests - connect to test database
 */
beforeAll(async () => {
  await connectDB();
});

/**
 * After each test - clear database
 */
afterEach(async () => {
  await clearDB();
});

/**
 * After all tests - disconnect database
 */
afterAll(async () => {
  await disconnectDB();
});

// Extend Jest timeout for database operations
jest.setTimeout(10000);
