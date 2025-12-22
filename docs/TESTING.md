# Testing Guide

This document provides comprehensive information about the testing infrastructure for the Tracky application.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Test Configuration](#test-configuration)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## Overview

The testing infrastructure is built using industry-standard tools:

| Test Type | Framework | Location |
|-----------|-----------|----------|
| Unit Tests | Jest | `tests/unit/` |
| Integration Tests | Jest | `tests/integration/` |
| E2E Tests | Playwright | `tests/e2e/` |

## Test Types

### Unit Tests

Fast, isolated tests for core business logic:

- **Location**: `tests/unit/`
- **Naming**: `*.test.ts` or `*.test.tsx`
- **Focus**: Pure functions, calculations, validations
- **Examples**:
  - `calculations.test.ts` - Discipline score, budget calculations
  - `validations.test.ts` - Zod schema validation
  - `utils.test.ts` - Utility functions

### Integration Tests

Tests for API routes and service integrations:

- **Location**: `tests/integration/`
- **Naming**: `*.test.ts`
- **Focus**: API endpoints, database operations, external services
- **Examples**:
  - `api/generate-plan.test.ts` - Plan generation API
  - `api/coaching.test.ts` - Coaching tip API

### E2E Tests

End-to-end tests for critical user flows:

- **Location**: `tests/e2e/`
- **Naming**: `*.e2e.ts`
- **Focus**: Full user journeys, UI interactions
- **Examples**:
  - `onboarding.e2e.ts` - Complete onboarding flow
  - `auth.e2e.ts` - Authentication flows
  - `dashboard.e2e.ts` - Dashboard functionality

## Running Tests

### Quick Commands

```bash
# Run all unit tests
npm run test:unit

# Run all integration tests
npm run test:integration

# Run all E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch
```

### E2E Test Commands

```bash
# Run E2E tests headlessly
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Run only Chromium tests
npm run test:e2e:chromium

# View HTML report
npm run test:e2e:report
```

### First Time Setup

Before running E2E tests for the first time:

```bash
# Install Playwright browsers
npm run playwright:install
```

## Test Configuration

### Jest Configuration

Configuration file: `jest.config.ts`

Key settings:
- Test environment: `jsdom` for unit, `node` for integration
- Coverage thresholds: 70% for branches, functions, lines, statements
- Path aliases match `tsconfig.json`

### Playwright Configuration

Configuration file: `playwright.config.ts`

Key settings:
- Browsers: Chromium, Firefox, WebKit
- Retries: 2 on CI, 0 locally
- Screenshots: On failure only
- Video: On first retry (CI)

### Environment Variables

Create a `.env.test.local` file for test-specific configuration:

```bash
# Test Supabase instance
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key

# Test user for E2E tests
E2E_TEST_EMAIL=e2e-test@example.com
E2E_TEST_PASSWORD=TestPassword123!
```

## Writing Tests

### Test Structure (AAA Pattern)

All tests should follow the Arrange-Act-Assert pattern:

```typescript
it('should calculate correct discipline score', () => {
  // Arrange - Set up test data
  const input = {
    wokeUp6am: true,
    coldShower: true,
    noPhoneFirstHour: false,
    meditated: true,
    plannedTomorrow: true,
  };

  // Act - Execute the function
  const result = calculateDisciplineScore(input);

  // Assert - Verify the result
  expect(result).toBe(75);
});
```

### Naming Conventions

- Test files: `{feature}.test.ts` or `{feature}.e2e.ts`
- Describe blocks: Feature or component name
- Test cases: `should {expected behavior} when {condition}`

### Using Mocks

Import mocks from `tests/mocks/`:

```typescript
import { createMockSupabaseClient, createMockProfile } from '@/tests/mocks';

const mockClient = createMockSupabaseClient({
  user: { id: 'test-id', email: 'test@example.com' },
  profiles: [createMockProfile({ name: 'Test User' })],
});
```

### Using Fixtures

Import fixtures from `tests/fixtures/`:

```typescript
import { testOnboardingData, testDailyLogs } from '@/tests/fixtures';

const data = testOnboardingData.comprehensive;
```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:

1. **Every PR**: Lint, type check, unit tests, integration tests
2. **PRs to main**: + E2E tests
3. **Push to main**: + Production deploy + smoke tests

### Pipeline Stages

```
lint-and-type-check
        ↓
test-unit-integration
        ↓
      build
        ↓
     test-e2e ────────→ deploy-preview (PRs)
        ↓
  deploy-production ──→ smoke-tests
```

### Viewing Test Results

- **Jest**: Coverage reports in `coverage/` directory
- **Playwright**: HTML reports in `playwright-report/` directory
- **CI Artifacts**: Downloaded from GitHub Actions

## Coverage

### Thresholds

| Metric | Threshold |
|--------|-----------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Exclusions

Files excluded from coverage:
- `node_modules/`
- `.next/`
- `tests/`
- Type definition files (`*.d.ts`)

## Best Practices

### General

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Keep tests independent** - Each test should run in isolation
3. **Use descriptive names** - Test names should explain what's being tested
4. **One assertion per test** - When possible, keep tests focused

### Unit Tests

1. **Test edge cases** - Empty inputs, boundaries, null values
2. **Mock external dependencies** - Database, APIs, etc.
3. **Keep tests fast** - Under 100ms per test

### Integration Tests

1. **Test real API contracts** - Use actual request/response shapes
2. **Mock external services** - Third-party APIs, databases
3. **Test error scenarios** - 400s, 500s, timeouts

### E2E Tests

1. **Focus on critical paths** - User signup, onboarding, core features
2. **Use page objects** - Encapsulate page interactions
3. **Handle async operations** - Use proper waits, not arbitrary timeouts
4. **Test on multiple browsers** - Chromium, Firefox, WebKit

### Avoiding Flaky Tests

1. **Don't use `sleep()`** - Use proper waits for conditions
2. **Reset state between tests** - Clear cookies, databases
3. **Handle network variability** - Use retries for network operations
4. **Use unique test data** - Generate unique emails, IDs

## Troubleshooting

### Common Issues

**Tests timeout:**
```bash
# Increase timeout
jest --testTimeout=30000
```

**Playwright browser not found:**
```bash
# Reinstall browsers
npm run playwright:install
```

**Coverage too low:**
```bash
# Run with verbose coverage
npm run test:coverage -- --verbose
```

### Debug Mode

```bash
# Jest debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debug
npm run test:e2e:debug
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

