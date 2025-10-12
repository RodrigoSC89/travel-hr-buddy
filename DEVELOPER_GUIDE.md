# 🚀 Developer Quick Reference - Code Quality Guide

> Guia rápido para manter o código com alta qualidade no projeto travel-hr-buddy

## 📚 Table of Contents
- [Logger Usage](#-logger-usage)
- [Type Safety](#-type-safety)
- [Error Handling](#-error-handling)
- [Code Quality Rules](#-code-quality-rules)
- [Pre-Commit Checklist](#-pre-commit-checklist)

---

## 📝 Logger Usage

### ❌ DON'T USE
```typescript
console.log("User logged in");
console.error("Failed to fetch data", error);
console.warn("Deprecated feature");
```

### ✅ DO USE
```typescript
import { logger } from "@/utils/logger";

// Info messages (dev only + Sentry breadcrumb)
logger.info("User logged in", { userId: user.id });

// Warnings (always shown + Sentry breadcrumb)
logger.warn("Deprecated feature used", { feature: "old-api" });

// Errors (always shown + sent to Sentry)
logger.error("Failed to fetch data", error, { 
  endpoint: "/api/users",
  userId: user.id 
});

// Debug (dev only)
logger.debug("Detailed debug info", data);
```

### 🎯 Scoped Logger
```typescript
// Create a logger for your module
const moduleLogger = logger.createLogger("PaymentModule");

moduleLogger.info("Payment started");
moduleLogger.error("Payment failed", error);
// Logs will show: [PaymentModule] Payment failed
```

---

## 🔒 Type Safety

### ❌ AVOID `any`
```typescript
const handleData = (data: any) => {
  return data.items.map((item: any) => item.name);
};
```

### ✅ USE PROPER TYPES
```typescript
interface Item {
  id: string;
  name: string;
  price: number;
}

interface DataResponse {
  items: Item[];
  total: number;
}

const handleData = (data: DataResponse): string[] => {
  return data.items.map((item) => item.name);
};
```

### 🔄 When You MUST Use `unknown`
```typescript
// If you truly don't know the type (e.g., external API)
const handleUnknownData = (data: unknown) => {
  // Use type guards
  if (typeof data === "object" && data !== null && "items" in data) {
    // Now TypeScript knows more about data
  }
};

// Or use Record for flexible objects
const config: Record<string, unknown> = {
  timeout: 5000,
  retries: 3,
};
```

---

## ⚠️ Error Handling

### ❌ BAD ERROR HANDLING
```typescript
try {
  await fetchData();
} catch (error) {
  // Silent failure - BAD!
}

try {
  await fetchData();
} catch (error) {
  console.log("Error:", error); // Not enough!
}
```

### ✅ GOOD ERROR HANDLING
```typescript
import { logger } from "@/utils/logger";
import { toast } from "@/hooks/use-toast";

try {
  await fetchData();
} catch (error) {
  // 1. Log the error (sent to Sentry)
  logger.error("Failed to fetch data", error instanceof Error ? error : undefined, {
    context: "dashboard",
    userId: user?.id
  });
  
  // 2. Show user-friendly message
  toast({
    title: "Erro ao carregar dados",
    description: "Por favor, tente novamente.",
    variant: "destructive",
  });
  
  // 3. Provide fallback or rethrow
  return fallbackData; // or throw error;
}
```

### 🎯 Edge Functions Error Handling
```typescript
// In Supabase Edge Functions
try {
  // ... your code
} catch (error) {
  console.error("Function error:", error);
  
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error instanceof Error ? error.toString() : String(error)
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
```

---

## 📋 Code Quality Rules

### 1. **ESLint Rules**
We enforce these rules:
- ✅ `no-console: warn` - Use logger instead
- ✅ `@typescript-eslint/no-explicit-any: warn` - Use proper types
- ✅ `@typescript-eslint/no-unused-vars: warn` - Remove unused code

### 2. **TypeScript Configuration**
Current settings:
```json
{
  "noImplicitAny": false,     // TODO: Enable gradually
  "strictNullChecks": false,  // TODO: Enable gradually
  "skipLibCheck": true        // Keep for faster builds
}
```

### 3. **Import Conventions**
```typescript
// ✅ Use absolute imports
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// ❌ Avoid relative imports when possible
import { Button } from "../../../components/ui/button";
```

### 4. **Component Conventions**
```typescript
// ✅ Proper component typing
interface MyComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onSubmit, 
  isLoading = false 
}) => {
  // Component logic
};

export default MyComponent;
```

---

## ✅ Pre-Commit Checklist

Before committing your code, verify:

### 1. Build & Type Check
```bash
# Build succeeds
npm run build

# No TypeScript errors
npx tsc --noEmit
```

### 2. Linting
```bash
# Lint your code
npm run lint

# Auto-fix issues
npm run lint:fix
```

### 3. Code Quality
- [ ] No `console.log` statements (use `logger` instead)
- [ ] No hardcoded credentials or API keys
- [ ] Types are specific (avoid `any` when possible)
- [ ] Error handling is comprehensive (log + toast + fallback)
- [ ] Comments explain "why", not "what"

### 4. Testing
```bash
# Run tests (if available)
npm run test

# Check coverage
npm run test:coverage
```

### 5. Documentation
- [ ] Update README if adding new features
- [ ] Add JSDoc comments for complex functions
- [ ] Update CHANGELOG.md for user-facing changes

---

## 🔧 Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run lint               # Check linting issues
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check formatting

# Testing
npm run test               # Run tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:ui            # Open Vitest UI

# Validation
npm run validate:api-keys  # Check API keys configuration
```

---

## 🎯 Quality Goals

| Metric | Current | Target |
|--------|---------|--------|
| `any` types | 190 | < 100 (50% reduction) |
| Console statements | ~160 | < 10 |
| Test coverage | 0% | 60% |
| Build time | ~38s | < 30s |
| Bundle size | 6MB | < 5MB |

---

## 📚 Additional Resources

- [CODE_QUALITY_IMPROVEMENTS.md](./CODE_QUALITY_IMPROVEMENTS.md) - Detailed technical report
- [AUDIT_CHECKLIST.md](./AUDIT_CHECKLIST.md) - Full audit checklist
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)

---

## 💡 Quick Tips

### Performance
- Use `React.lazy()` for code splitting
- Memoize expensive computations with `useMemo`
- Debounce frequent operations (search, resize)
- Use virtual scrolling for long lists

### Security
- Never commit API keys or secrets
- Always use environment variables
- Sanitize user inputs
- Validate data from external sources

### Maintainability
- Keep functions small and focused
- Extract reusable logic to hooks
- Use composition over inheritance
- Write self-documenting code

---

**Last Updated:** 2025-10-12  
**Maintainer:** Development Team  
**Questions?** Check the documentation or create an issue!
