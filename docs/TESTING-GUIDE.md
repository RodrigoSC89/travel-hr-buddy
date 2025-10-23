# Testing Guide - Nautilus One Travel HR Buddy

**Version**: 1.0  
**Last Updated**: 2025-01-24

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Best Practices](#best-practices)

---

## Overview

This guide covers testing strategies, patterns, and best practices for the Nautilus One Travel HR Buddy application.

### Testing Stack
- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Performance**: Lighthouse CI
- **Security**: Custom security tests + OWASP guidelines

### Current Coverage
- **Total Tests**: 44+
- **Coverage**: 68%
- **Target Coverage**: 80%

---

## Testing Strategy

### Testing Pyramid

```
       /\
      /E2E\     10% - Critical user flows
     /------\
    /  INT  \   30% - Component integration
   /--------\
  /   UNIT   \  60% - Business logic, utilities
 /------------\
```

### What to Test

✅ **DO Test:**
- Business logic and utilities
- Component behavior and interactions
- API integrations
- Error handling
- User workflows
- Performance critical paths

❌ **DON'T Test:**
- Third-party libraries
- Implementation details
- Styling (unless critical)
- Static content

---

## Unit Testing

### Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', async () => {
    // Test implementation
  });
});
```

### Testing Utilities

```typescript
// Use shared test utilities
import { renderWithProviders, createMockUser } from '@/tests/shared/test-utils';

const user = createMockUser({ role: 'admin' });
renderWithProviders(<Component />, { user });
```

### Mocking Best Practices

```typescript
// Mock modules
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] })
}));

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: true })
}));

// Mock timers
vi.useFakeTimers();
await vi.runAllTimersAsync();
vi.useRealTimers();
```

### Testing Async Code

```typescript
it('should fetch data on mount', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ data: ['item'] });
  
  render(<Component fetch={mockFetch} />);
  
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalled();
  });
  
  expect(screen.getByText('item')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('should handle errors gracefully', async () => {
  const mockFetch = vi.fn().mockRejectedValue(new Error('Failed'));
  
  render(<Component fetch={mockFetch} />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### Component Integration

```typescript
// Test component interactions
import { renderWithProviders } from '@/tests/shared/test-utils';

describe('Form Integration', () => {
  it('should submit form and show success message', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    
    renderWithProviders(<Form onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    });
    
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### API Integration

```typescript
import { createMockSupabaseClient } from '@/tests/shared/test-utils';

describe('Data Fetching', () => {
  it('should fetch and display data', async () => {
    const mockClient = createMockSupabaseClient();
    mockClient.from().select().mockResolvedValue({
      data: [{ id: 1, name: 'Test' }],
      error: null
    });
    
    renderWithProviders(<DataList />, { supabaseClient: mockClient });
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
```

### Authentication Integration

```typescript
describe('Auth Flow', () => {
  it('should redirect to login when unauthenticated', async () => {
    const { container } = renderWithProviders(<ProtectedRoute />, {
      initialRoute: '/dashboard',
      isAuthenticated: false
    });
    
    await waitFor(() => {
      expect(container).toHaveTextContent(/login/i);
    });
  });
});
```

---

## E2E Testing

### Setup (Playwright)

```typescript
// tests/ui/example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete user journey', async ({ page }) => {
    // Test implementation
  });
});
```

### Page Object Pattern

```typescript
// tests/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/dashboard');
  }
}
```

### Visual Testing

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### Accessibility Testing

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

---

## Performance Testing

### Load Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Performance', () => {
  it('should handle multiple concurrent users', async () => {
    const users = 100;
    const promises = Array.from({ length: users }, () => 
      fetch('/api/endpoint')
    );
    
    const start = performance.now();
    const results = await Promise.all(promises);
    const duration = performance.now() - start;
    
    expect(results.every(r => r.ok)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5s for 100 users
  });
});
```

### Memory Leak Testing

```typescript
it('should not leak memory', async () => {
  const { unmount } = render(<Component />);
  
  // Perform operations
  await waitFor(() => {
    // Assertions
  });
  
  unmount();
  
  // Verify cleanup
  expect(/* subscriptions cleaned up */).toBe(true);
});
```

### Render Performance

```typescript
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

it('should render within performance budget', () => {
  const { componentStats } = usePerformanceMonitoring('TestComponent');
  
  render(<TestComponent />);
  
  expect(componentStats.avgRenderTime).toBeLessThan(16); // 60fps
});
```

---

## Security Testing

### XSS Prevention

```typescript
describe('XSS Prevention', () => {
  it('should sanitize user input', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    render(<Component input={maliciousInput} />);
    
    const element = screen.getByTestId('output');
    expect(element.innerHTML).not.toContain('<script>');
  });
});
```

### Authentication Security

```typescript
describe('Auth Security', () => {
  it('should not expose sensitive data in tokens', () => {
    const token = generateToken({ userId: '123' });
    const decoded = decodeToken(token);
    
    expect(decoded).not.toHaveProperty('password');
    expect(decoded).not.toHaveProperty('secret');
  });

  it('should invalidate old tokens', async () => {
    const oldToken = 'expired-token';
    
    const response = await fetch('/api/protected', {
      headers: { Authorization: `Bearer ${oldToken}` }
    });
    
    expect(response.status).toBe(401);
  });
});
```

### CSRF Protection

```typescript
it('should require CSRF token', async () => {
  const response = await fetch('/api/action', {
    method: 'POST',
    body: JSON.stringify({ data: 'test' })
    // Missing CSRF token
  });
  
  expect(response.status).toBe(403);
});
```

---

## Best Practices

### 1. Test Organization

```
tests/
├── unit/              # Pure logic tests
├── integration/       # Component + API tests
├── ui/                # E2E tests
├── performance/       # Load/performance tests
├── security/          # Security tests
└── shared/            # Test utilities
    └── test-utils.tsx
```

### 2. Naming Conventions

```typescript
// ✅ Good
describe('UserProfile', () => {
  it('should display user name', () => {});
  it('should handle edit action', () => {});
});

// ❌ Bad
describe('test', () => {
  it('works', () => {});
});
```

### 3. AAA Pattern

```typescript
it('should add item to cart', () => {
  // Arrange
  const item = { id: 1, name: 'Product' };
  
  // Act
  addToCart(item);
  
  // Assert
  expect(getCartItems()).toContainEqual(item);
});
```

### 4. Avoid Test Interdependence

```typescript
// ✅ Good - Independent tests
describe('Counter', () => {
  it('should increment', () => {
    const counter = new Counter();
    counter.increment();
    expect(counter.value).toBe(1);
  });
  
  it('should decrement', () => {
    const counter = new Counter();
    counter.decrement();
    expect(counter.value).toBe(-1);
  });
});

// ❌ Bad - Tests depend on execution order
let sharedCounter;
it('test 1', () => { sharedCounter.increment(); });
it('test 2', () => { expect(sharedCounter.value).toBe(1); });
```

### 5. Mock External Dependencies

```typescript
// Mock at module level
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn()
}));

// Override in specific tests
import { fetchData } from '@/lib/api';

it('should handle success', () => {
  vi.mocked(fetchData).mockResolvedValue({ data: [] });
  // Test...
});
```

### 6. Clean Up After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  cleanup(); // React Testing Library
});
```

### 7. Use Data-Testid Sparingly

```typescript
// ✅ Prefer accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// ⚠️ Use data-testid for complex cases
screen.getByTestId('complex-widget');
```

### 8. Test Error Boundaries

```typescript
it('should catch errors', () => {
  const ThrowError = () => { throw new Error('Test'); };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
});
```

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Specific test file
npm test -- auth.test.ts
```

### CI/CD Integration

Tests run automatically on:
- Pull requests
- Merges to main
- Pre-deployment

### Coverage Thresholds

```javascript
// vitest.config.ts
coverage: {
  statements: 70,
  branches: 65,
  functions: 70,
  lines: 70
}
```

---

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Use `waitFor` instead of fixed timeouts
   - Mock time-dependent code
   - Ensure proper cleanup

2. **Slow Tests**
   - Mock heavy operations
   - Use `vi.useFakeTimers()`
   - Parallelize when possible

3. **Memory Leaks**
   - Clear subscriptions in cleanup
   - Unmount components properly
   - Reset mocks after each test

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2025-01-24  
**Maintainer**: Nautilus One Team
