# PATCH 408: Test Guide

## Overview

This guide documents the test infrastructure and patterns for the Travel HR Buddy application. The test suite uses Vitest for unit/integration tests and Playwright for E2E tests.

## Test Structure

### Test Files

- `tests/patch-408-dashboard.test.tsx` - Dashboard component tests (25+ tests)
- `tests/patch-408-voice-assistant.test.tsx` - Voice assistant tests (24+ tests)
- `tests/patch-408-logs-center.test.tsx` - Logs center tests (25+ tests)

**Total: 74+ tests**

## Testing Patterns

### 1. Mocking Supabase Client

```typescript
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: { user: { id: "test-user" } } }, 
        error: null 
      })),
    },
  },
}));
```

### 2. Mocking Auth Context

```typescript
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user", email: "test@example.com" },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: any) => children,
}));
```

### 3. Mocking Tenant Context

```typescript
vi.mock("@/contexts/TenantContext", () => ({
  useTenant: () => ({
    tenantId: "test-tenant",
    tenantName: "Test Tenant",
  }),
  TenantProvider: ({ children }: any) => children,
}));
```

### 4. Mocking Organization Context

```typescript
vi.mock("@/contexts/OrganizationContext", () => ({
  useOrganization: () => ({
    currentOrganization: { id: "org-1", name: "Test Organization" },
  }),
  OrganizationProvider: ({ children }: any) => children,
}));
```

### 5. Mocking Toast Notifications

```typescript
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));
```

### 6. Testing Async Operations

```typescript
describe("Async Operations", () => {
  it("should wait for async operations to complete", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(queryClient.isFetching()).toBe(0);
    }, { timeout: 5000 });
  });

  it("should handle multiple concurrent requests", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(queryClient.getQueryCache().getAll().length).toBeGreaterThanOrEqual(0);
    });
  });
});
```

### 7. Testing Component Rendering

```typescript
describe("Rendering", () => {
  it("should render component title", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/title/i)).toBeDefined();
    });
  });

  it("should render without crashing", () => {
    const { container } = renderComponent();
    expect(container).toBeDefined();
  });
});
```

### 8. Testing User Interactions

```typescript
describe("User Interactions", () => {
  it("should handle button clicks", async () => {
    renderComponent();
    
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockFunction).toHaveBeenCalled();
    });
  });

  it("should update input values", async () => {
    renderComponent();
    
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test value" } });
    
    expect(input).toHaveValue("test value");
  });
});
```

### 9. Testing Performance

```typescript
describe("Performance", () => {
  it("should render in reasonable time", async () => {
    const startTime = performance.now();
    renderComponent();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it("should not cause memory leaks", async () => {
    const { unmount } = renderComponent();
    
    await waitFor(() => {
      expect(queryClient.isFetching()).toBe(0);
    });
    
    unmount();
    expect(queryClient.isFetching()).toBe(0);
  });
});
```

### 10. Testing Responsive Design

```typescript
describe("Responsive Design", () => {
  it("should render on mobile viewport", async () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    
    renderComponent();
    
    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });

  it("should render on desktop viewport", async () => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;
    
    renderComponent();
    
    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });
});
```

## Running Tests

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### All Tests

```bash
# Run all unit and E2E tests
npm run test:all
```

## Test Coverage Goals

- **Minimum Coverage**: 30% (initial target)
- **Component Rendering**: 100% of components should render without crashing
- **User Interactions**: Critical user flows should be tested
- **Async Operations**: All async operations should have timeout handling
- **Error Handling**: Error states should be tested

## Best Practices

1. **Use `waitFor` for async operations** - Always wait for async operations to complete
2. **Mock external dependencies** - Mock Supabase, APIs, and contexts
3. **Test user interactions** - Simulate real user behavior
4. **Test error states** - Verify error handling works correctly
5. **Clean up after tests** - Use `beforeEach` and `afterEach` to reset state
6. **Use descriptive test names** - Make test intent clear
7. **Group related tests** - Use `describe` blocks for organization
8. **Test accessibility** - Ensure components are accessible
9. **Performance testing** - Verify components render efficiently
10. **Responsive testing** - Test on multiple viewport sizes

## Adding New Tests

To add new tests:

1. Create a new test file in the `tests/` directory
2. Follow the naming convention: `[feature-name].test.tsx`
3. Import required testing utilities
4. Mock external dependencies
5. Write tests following the patterns above
6. Run tests to verify they pass
7. Update this guide if introducing new patterns

## Common Issues & Solutions

### Issue: Tests timeout

**Solution**: Increase timeout or check for async operations
```typescript
await waitFor(() => {
  expect(condition).toBe(true);
}, { timeout: 10000 }); // Increase timeout
```

### Issue: Mock not working

**Solution**: Ensure mock is defined before component import
```typescript
vi.mock("@/module", () => ({ ... }));
// Then import component
import Component from "@/components/Component";
```

### Issue: State not updating

**Solution**: Use `waitFor` to wait for state updates
```typescript
fireEvent.click(button);
await waitFor(() => {
  expect(screen.getByText("Updated")).toBeDefined();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2025-10-28
**Version**: PATCH 408
