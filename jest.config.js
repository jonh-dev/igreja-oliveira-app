const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  // Test file patterns
  testMatch: [
    "<rootDir>/test/**/__tests__/**/*.test.ts",
    "<rootDir>/test/**/*.test.ts"
  ],
  // Setup files
  setupFilesAfterEnv: [
    "<rootDir>/test/setup/jest.setup.ts"
  ],
  // Module paths
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/test/$1"
  },
  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/index.ts"
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html"],
  // Test timeout
  testTimeout: 30000,
  // Verbose output
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Restore mocks after each test
  restoreMocks: true
};