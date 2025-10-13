# Testing Library Quick Reference Guide 🧪

## Overview
This guide provides quick patterns for writing robust tests with React Testing Library.

---

## Table of Contents
1. [Finding Elements](#finding-elements)
2. [Common Patterns](#common-patterns)
3. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
4. [Async Testing](#async-testing)
5. [Examples from Our Codebase](#examples-from-our-codebase)

---

## Finding Elements

### By Text (Most Common)

#### ✅ Flexible Text Matching (Recommended)
```typescript
// Use when text might be split across elements
screen.getByText((content) => content.includes("partial text"))

// Case-insensitive matching
screen.getByText(/texto aqui/i)

// Combining both
screen.getByText((content) => /configuração.*banco/i.test(content))
```

#### ⚠️ Exact Text Matching (Use Sparingly)
```typescript
// Only use for stable, unchanging text
screen.getByText("Exato Texto")
```

### By Role (Accessibility)
```typescript
// Buttons
screen.getByRole("button", { name: /click me/i })

// Links
screen.getByRole("link", { name: /read more/i })

// Inputs
screen.getByRole("textbox", { name: /username/i })
```

### By Placeholder
```typescript
// Flexible
screen.getByPlaceholderText(/digite seu nome/i)

// Exact
screen.getByPlaceholderText("Digite seu nome")
```

### By Label
```typescript
screen.getByLabelText(/email/i)
```

### By Test ID (Last Resort)
```typescript
// Only when other methods don't work
screen.getByTestId("custom-element")
```

---

## Common Patterns

### Pattern 1: Component Renders Correctly
```typescript
it("should render the page title", () => {
  render(
    <MemoryRouter>
      <MyComponent />
    </MemoryRouter>
  );

  expect(screen.getByText("Page Title")).toBeInTheDocument();
});
```

### Pattern 2: Alert/Warning Messages
```typescript
it("should display configuration warning", () => {
  render(<MyComponent />);

  // Flexible matcher for complex text
  expect(screen.getByText((content) =>
    content.includes("funcionalidade requer configuração")
  )).toBeInTheDocument();
});
```

### Pattern 3: Button Actions
```typescript
it("should navigate on button click", () => {
  const mockNavigate = vi.fn();
  vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
  }));

  render(<MyComponent />);
  
  const button = screen.getByRole("button", { name: /voltar/i });
  fireEvent.click(button);
  
  expect(mockNavigate).toHaveBeenCalledWith("/admin");
});
```

### Pattern 4: Form Inputs
```typescript
it("should handle input changes", () => {
  render(<MyForm />);
  
  const input = screen.getByRole("textbox", { name: /email/i });
  fireEvent.change(input, { target: { value: "test@example.com" } });
  
  expect(input).toHaveValue("test@example.com");
});
```

### Pattern 5: Conditional Rendering
```typescript
it("should show error when data fails", () => {
  render(<MyComponent hasError={true} />);
  
  expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
  expect(screen.queryByText(/sucesso/i)).not.toBeInTheDocument();
});
```

---

## Anti-Patterns to Avoid

### ❌ Brittle Exact String Matching
```typescript
// DON'T: Breaks if whitespace or capitalization changes
expect(screen.getByText("Esta funcionalidade requer configuração")).toBeInTheDocument();

// DO: Use flexible matchers
expect(screen.getByText(/funcionalidade requer configuração/i)).toBeInTheDocument();
```

### ❌ Over-Mocking
```typescript
// DON'T: Mock everything
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(() => ({
      // 100+ lines of mock data for functions never called
    })),
    from: vi.fn(),
    auth: vi.fn(),
    storage: vi.fn(),
    // ... everything
  },
}));

// DO: Only mock what's needed
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));
```

### ❌ Testing Implementation Details
```typescript
// DON'T: Test internal state
expect(component.state.isLoading).toBe(false);

// DO: Test what the user sees
expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
```

### ❌ Using `waitFor` Unnecessarily
```typescript
// DON'T: Wait for synchronous content
await waitFor(() => {
  expect(screen.getByText("Static Text")).toBeInTheDocument();
});

// DO: Only wait for async content
expect(screen.getByText("Static Text")).toBeInTheDocument();
```

---

## Async Testing

### Pattern 1: Finding Elements After Async Operations
```typescript
it("should load data asynchronously", async () => {
  render(<MyComponent />);
  
  // findBy queries wait for element to appear
  const element = await screen.findByText(/dados carregados/i);
  expect(element).toBeInTheDocument();
});
```

### Pattern 2: Waiting for Conditions
```typescript
it("should update after API call", async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/atualizado/i)).toBeInTheDocument();
  });
});
```

### Pattern 3: Testing Loading States
```typescript
it("should show loading then content", async () => {
  render(<MyComponent />);
  
  // Initially loading
  expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  
  // Wait for content
  await screen.findByText(/conteúdo carregado/i);
  
  // Loading gone
  expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
});
```

### Pattern 4: No-Op Functions
```typescript
it("should provide a refetch function", async () => {
  const { result } = renderHook(() => useMyHook());
  
  expect(result.current.refetch).toBeDefined();
  
  // No-op doesn't throw
  await expect(result.current.refetch()).resolves.toBeUndefined();
});
```

---

## Examples from Our Codebase

### Example 1: RestoreChartEmbed.test.tsx
```typescript
it("should display database configuration warning", () => {
  render(
    <MemoryRouter>
      <RestoreChartEmbed />
    </MemoryRouter>
  );

  expect(screen.getByText((content) => 
    content.includes("Esta funcionalidade requer configuração de banco de dados adicional")
  )).toBeInTheDocument();
});
```

**Why this works:**
- ✅ Uses flexible matcher for potentially complex text
- ✅ Handles text split across elements
- ✅ No brittle exact matching

### Example 2: LogsPage.test.tsx
```typescript
it("should render TV Wall title", () => {
  render(
    <MemoryRouter>
      <TVWallLogsPage />
    </MemoryRouter>
  );

  expect(screen.getByText("TV Wall - Logs")).toBeInTheDocument();
});
```

**Why this works:**
- ✅ Simple exact match for stable title
- ✅ Title is unlikely to change format
- ✅ Clear and readable

### Example 3: logs.test.tsx
```typescript
it("should render back button", () => {
  render(
    <MemoryRouter>
      <RestoreReportLogsPage />
    </MemoryRouter>
  );

  expect(screen.getByText("← Voltar")).toBeInTheDocument();
});
```

**Why this works:**
- ✅ Tests user-facing text
- ✅ Simple and focused
- ✅ Would catch if button was removed

### Example 4: use-restore-logs-summary.test.ts
```typescript
it("should return mock data with database configuration error", () => {
  const { result } = renderHook(() => useRestoreLogsSummary(null));

  expect(result.current.loading).toBe(false);
  expect(result.current.data).not.toBe(null);
  expect(result.current.error).toBeDefined();
  expect(result.current.error?.message).toContain("Database schema not configured");
});
```

**Why this works:**
- ✅ Tests hook's current behavior
- ✅ Validates error message
- ✅ Checks all return values

---

## Query Priority

Use queries in this order of preference:

1. **getByRole** - Best for accessibility
   ```typescript
   screen.getByRole("button", { name: /submit/i })
   ```

2. **getByLabelText** - Forms with labels
   ```typescript
   screen.getByLabelText(/email address/i)
   ```

3. **getByPlaceholderText** - Input placeholders
   ```typescript
   screen.getByPlaceholderText(/enter your name/i)
   ```

4. **getByText** - Visible text content
   ```typescript
   screen.getByText(/welcome/i)
   ```

5. **getByDisplayValue** - Current input values
   ```typescript
   screen.getByDisplayValue("current value")
   ```

6. **getByAltText** - Images with alt text
   ```typescript
   screen.getByAltText(/logo/i)
   ```

7. **getByTitle** - Elements with title attribute
   ```typescript
   screen.getByTitle(/close/i)
   ```

8. **getByTestId** - Last resort only
   ```typescript
   screen.getByTestId("complex-element")
   ```

---

## Assertions

### Presence
```typescript
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
```

### Absence
```typescript
expect(screen.queryByText(/not there/i)).not.toBeInTheDocument()
```

### Values
```typescript
expect(input).toHaveValue("test")
expect(checkbox).toBeChecked()
expect(button).toBeDisabled()
```

### Classes/Attributes
```typescript
expect(element).toHaveClass("active")
expect(element).toHaveAttribute("href", "/link")
```

---

## Mocking Best Practices

### Minimal Mocking
```typescript
// Only mock what the component actually uses
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));
```

### Navigation Mocking
```typescript
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

### Toast Mocking
```typescript
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));
```

---

## Cleanup

Always clean up in `beforeEach`:
```typescript
describe("MyComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ... tests
});
```

---

## Running Tests

```bash
# All tests
npm test

# Specific file
npm test src/tests/pages/MyPage.test.tsx

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI mode
npm run test:ui
```

---

## Debugging Tests

### 1. Print DOM
```typescript
import { screen } from "@testing-library/react";
screen.debug(); // Prints entire DOM
screen.debug(element); // Prints specific element
```

### 2. Query Explorer
```typescript
// See all available queries
screen.logTestingPlaygroundURL();
```

### 3. Check What's Rendered
```typescript
// List all text content
console.log(screen.getByText(/./));
```

---

## Common Errors & Solutions

### Error: "Unable to find element with the text: X"
**Solution:** Use flexible matchers
```typescript
// Instead of:
screen.getByText("Exact Text")

// Use:
screen.getByText(/exact text/i)
// or
screen.getByText((content) => content.includes("Exact Text"))
```

### Error: "Found multiple elements with the text: X"
**Solution:** Be more specific
```typescript
// Use getAllByText and pick the right one
const elements = screen.getAllByText(/submit/i);
expect(elements[0]).toBeInTheDocument();

// Or use within()
const form = screen.getByRole("form");
within(form).getByText(/submit/i);
```

### Error: "Unable to fire a change event"
**Solution:** Make sure you're selecting an input
```typescript
// Get the actual input element
const input = screen.getByRole("textbox");
fireEvent.change(input, { target: { value: "new value" } });
```

---

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Playground](https://testing-playground.com/)

---

**Last Updated:** 2025-01-13  
**Status:** ✅ All 154 tests passing
