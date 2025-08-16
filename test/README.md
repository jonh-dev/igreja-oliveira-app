# Test Directory Structure

This directory contains all test files for the Igreja Oliveira App, organized according to Next.js and TypeScript best practices.

## Directory Structure

```
test/
├── __tests__/
│   ├── auth/                    # Authentication-related tests
│   │   ├── user-registration.test.ts
│   │   └── phone-registration.test.ts
│   └── integration/             # Integration tests
│       └── auth-flow.test.ts
├── setup/
│   └── jest.setup.ts           # Jest global setup and configuration
├── utils/
│   └── test-helpers.ts         # Common test utilities and helpers
└── README.md                   # This file
```

## Test Categories

### Unit Tests (`__tests__/auth/`)
- **user-registration.test.ts**: Tests user registration with phone and address data
- **phone-registration.test.ts**: Tests phone registration functionality

### Integration Tests (`__tests__/integration/`)
- **auth-flow.test.ts**: Tests complete authentication flows and error handling

## Test Utilities

### Setup (`setup/`)
- **jest.setup.ts**: Global Jest configuration, environment variable validation, and error handling

### Helpers (`utils/`)
- **test-helpers.ts**: Common functions for test data generation, Supabase client setup, and cleanup operations

## Key Features

### Automatic Cleanup
All tests that create users automatically delete them in the `afterEach` hook to maintain a clean database state.

### Environment Configuration
Tests use environment variables for Supabase configuration:
- `EXPO_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Test Data Generation
Utility functions generate unique test data to prevent conflicts:
- `generateTestEmail()`: Creates unique email addresses
- `generateTestPhone()`: Creates unique phone numbers
- `generateTestAddress()`: Creates random address data

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test user-registration.test.ts

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch
```

## Best Practices

1. **Isolation**: Each test is independent and cleans up after itself
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **Proper Setup/Teardown**: Use `beforeAll`, `beforeEach`, `afterEach`, and `afterAll` appropriately
4. **Error Handling**: Tests include proper error handling and validation
5. **Type Safety**: All tests are written in TypeScript with proper typing
6. **Realistic Data**: Tests use realistic test data that mimics production scenarios

## Adding New Tests

When adding new tests:

1. Place them in the appropriate category directory
2. Use the `.test.ts` extension
3. Import utilities from `@test/utils/test-helpers`
4. Include proper cleanup in `afterEach` hooks
5. Follow the existing naming conventions
6. Add comprehensive test coverage for both success and error cases