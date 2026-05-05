/**
 * Jest Setup File
 * Runs before all tests
 */

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "mysql://root:root@localhost:3306/matcha_shop";
process.env.NODE_ENV = "test";

// Extend test timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise
global.console.log = jest.fn();
global.console.info = jest.fn();
