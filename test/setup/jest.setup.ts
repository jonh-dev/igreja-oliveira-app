import { config } from 'dotenv';

// Load environment variables before running tests
config();

// Global test timeout (30 seconds for database operations)
jest.setTimeout(30000);

// Global test setup
beforeAll(() => {
  // Verify required environment variables
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please ensure your .env file is properly configured.'
    );
  }

  console.log('🧪 Test environment initialized');
  console.log(`📡 Supabase URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL}`);
  console.log(`🔑 Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`🔓 Anon Key: ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
});

// Global test cleanup
afterAll(() => {
  console.log('🧹 Test environment cleanup completed');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Mock console methods for cleaner test output (optional)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Override console methods to filter out expected warnings/errors
console.error = (...args: any[]) => {
  // Filter out specific expected errors if needed
  const message = args.join(' ');
  if (message.includes('Warning:') || message.includes('Expected warning')) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args: any[]) => {
  // Filter out specific expected warnings if needed
  const message = args.join(' ');
  if (message.includes('Expected warning')) {
    return;
  }
  originalConsoleWarn(...args);
};

// Export test utilities for global use
export const testConfig = {
  timeout: 30000,
  retries: 2,
  verbose: process.env.NODE_ENV === 'test'
};