# PATCH 408: Test Automation Suite Guide

## 📋 Overview

This guide explains how to add new tests to the Travel HR Buddy system using Vitest (unit tests) and Playwright (E2E tests).

## 🎯 Test Coverage Goal

**Minimum Coverage**: 30%  
**Current Coverage**: Run `npm run test:coverage` to check

## 🏗️ Test Structure

### Unit Tests (Vitest)

Located in: `tests/`

```
tests/
├── patch-408-dashboard.test.tsx          # Dashboard module tests
├── patch-408-voice-assistant.test.tsx    # Voice Assistant tests
├── patch-408-logs-center.test.tsx        # Logs Center tests
└── your-module.test.tsx                  # Your new tests
```

### E2E Tests (Playwright)

Located in: `e2e/` or `tests/`

```
e2e/
├── dashboard.spec.ts
├── voice-assistant.spec.ts
└── your-feature.spec.ts
```

## 📝 Writing Unit Tests

### 1. Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Your Module Name', () => {
  beforeEach(() => {
    // Setup code
    vi.clearAllMocks();
  });

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      const testData = { value: 123 };
      
      // Act
      const result = yourFunction(testData);
      
      // Assert
      expect(result).toBe(123);
    });
  });
});
```

### 2. Testing React Components

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YourComponent from '@/components/YourComponent';

describe('YourComponent', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('should render correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <YourComponent />
      </QueryClientProvider>
    );

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### 3. Mocking Supabase

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: [{ id: '1', name: 'Test' }],
        error: null
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}));
```

### 4. Testing Async Operations

```typescript
it('should load data asynchronously', async () => {
  const { container } = render(<YourComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  }, { timeout: 3000 });
});
```

### 5. Testing User Interactions

```typescript
import { fireEvent } from '@testing-library/react';

it('should handle button click', () => {
  render(<YourComponent />);
  
  const button = screen.getByRole('button', { name: 'Click Me' });
  fireEvent.click(button);
  
  expect(screen.getByText('Button Clicked')).toBeInTheDocument();
});
```

## 🎭 Writing E2E Tests (Playwright)

### 1. Basic E2E Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should navigate and interact', async ({ page }) => {
    await page.goto('/your-route');
    
    await expect(page.locator('h1')).toContainText('Expected Heading');
    
    await page.click('button[data-testid="action-button"]');
    
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### 2. Testing Forms

```typescript
test('should submit form successfully', async ({ page }) => {
  await page.goto('/form-page');
  
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password123');
  
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### 3. Testing Navigation

```typescript
test('should navigate between pages', async ({ page }) => {
  await page.goto('/');
  
  await page.click('a[href="/dashboard"]');
  await expect(page).toHaveURL(/.*dashboard/);
  
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## 🎨 Test Best Practices

### 1. Test Organization

```typescript
describe('Module Name', () => {
  describe('Component Rendering', () => {
    it('should render without crashing', () => {});
    it('should display correct title', () => {});
  });

  describe('Data Loading', () => {
    it('should fetch data on mount', () => {});
    it('should handle loading state', () => {});
    it('should handle errors', () => {});
  });

  describe('User Interactions', () => {
    it('should handle clicks', () => {});
    it('should validate input', () => {});
  });

  describe('Performance', () => {
    it('should render quickly', () => {});
    it('should handle large datasets', () => {});
  });
});
```

### 2. Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx` for unit tests
- E2E files: `*.spec.ts` for Playwright tests
- Test names: Clear, descriptive, use "should" statements

### 3. AAA Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange: Set up test data
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act: Execute the function
  const total = calculateTotal(items);
  
  // Assert: Verify the result
  expect(total).toBe(30);
});
```

### 4. Test Independence

Each test should be independent and not rely on other tests:

```typescript
beforeEach(() => {
  // Reset state before each test
  vi.clearAllMocks();
  cleanup();
});
```

## 📊 Running Tests

### Run All Unit Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```

### Run Specific Test File
```bash
npm run test -- your-test-file.test.ts
```

## 🔍 Debugging Tests

### 1. Using Vitest UI
```bash
npm run test:ui
```

### 2. Using Console Logs
```typescript
it('should debug', () => {
  const result = yourFunction();
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

### 3. Using Playwright Debug
```bash
npm run test:e2e:debug
```

## 📈 Coverage Reports

After running `npm run test:coverage`, check:
- `coverage/index.html` - Visual coverage report
- `coverage/lcov.info` - Coverage data for CI/CD

## 🚀 CI/CD Integration

Tests run automatically on:
- Every pull request
- Every push to main branch
- Scheduled daily runs

See `.github/workflows/run-tests.yml` for configuration.

## ✅ Checklist for New Tests

- [ ] Test file follows naming convention
- [ ] All imports are correct
- [ ] Setup and teardown are handled
- [ ] Tests are independent
- [ ] Tests are descriptive
- [ ] Edge cases are covered
- [ ] Error handling is tested
- [ ] Performance is considered
- [ ] Accessibility is tested (if UI)
- [ ] Tests pass locally
- [ ] Coverage increased or maintained

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Project Test Examples](/tests/)

## 🆘 Common Issues

### Issue: Tests timeout
**Solution**: Increase timeout in test or vitest.config.ts

### Issue: Mock not working
**Solution**: Ensure mock is defined before import

### Issue: Component not rendering
**Solution**: Check QueryClientProvider and context providers

### Issue: Async test fails
**Solution**: Use `waitFor` or increase timeout

---

**Last Updated**: 2025-10-28  
**Patch**: PATCH 408  
**Minimum Coverage Target**: 30%
