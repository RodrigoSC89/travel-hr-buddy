# 🤝 Contributing to Nautilus One

Thank you for your interest in contributing to Nautilus One! This guide will help you get started.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing](#testing)
5. [Pull Request Process](#pull-request-process)

---

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm 8.x or higher
- Git

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/travel-hr-buddy.git
cd travel-hr-buddy

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start development server
npm run dev
```

---

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new travel booking feature
fix: resolve authentication issue
docs: update README with new API info
refactor: improve logger implementation
test: add tests for workflow component
```

---

## Code Standards

### TypeScript

- ✅ Use TypeScript for all new files
- ✅ Avoid `any` - use proper types
- ✅ Use interfaces for object shapes
- ✅ Export types when reusable

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
interface DataInput {
  value: string;
  metadata?: Record<string, unknown>;
}

function processData(data: DataInput): string {
  return data.value;
}
```

### Error Handling

- ✅ Always handle errors in catch blocks
- ✅ Use the centralized logger
- ✅ Provide user-friendly error messages

```typescript
// ❌ Bad
try {
  await fetchData();
} catch (error) {
  // Empty catch block
}

// ✅ Good
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

try {
  await fetchData();
} catch (error) {
  logger.error("Failed to fetch data", error);
  toast({
    title: "Error",
    description: "Unable to load data. Please try again.",
    variant: "destructive"
  });
}
```

### Logging

- ✅ Use `logger` instead of `console.log`
- ✅ `logger.info()` for general information (dev only)
- ✅ `logger.debug()` for debugging (dev only)
- ✅ `logger.warn()` for warnings (always)
- ✅ `logger.error()` for errors (always)

```typescript
import { logger } from "@/lib/logger";

// Development-only logs
logger.info("User logged in", { userId: user.id });
logger.debug("API response", { data });

// Always logged
logger.warn("Rate limit approaching", { remaining: 10 });
logger.error("Payment failed", error, { orderId });
```

### Code Style

We use ESLint and Prettier:

```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

### File Organization

```
src/
├── components/     # React components
│   ├── ui/        # Reusable UI components
│   ├── admin/     # Admin-specific components
│   └── ...
├── pages/         # Page components (routes)
├── hooks/         # Custom React hooks
├── lib/           # Utilities and helpers
├── types/         # TypeScript type definitions
├── services/      # API and external services
└── utils/         # Utility functions
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test -- path/to/test.test.tsx
```

### Writing Tests

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    screen.getByRole("button").click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Test Coverage

Aim for:
- ✅ 80%+ coverage for critical paths
- ✅ All error scenarios tested
- ✅ Edge cases covered

---

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run quality checks**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No TypeScript `any` types (or justified)
```

### Review Process

1. Automated checks must pass (CI/CD)
2. Code review by maintainer
3. Address feedback
4. Approval and merge

---

## Common Issues

### Build Failures

```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

### Type Errors

```bash
# Check TypeScript without building
npx tsc --noEmit
```

### Linting Errors

```bash
# Auto-fix most issues
npm run lint:fix

# Format code
npm run format
```

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

## Questions?

- 💬 Open a [Discussion](https://github.com/RodrigoSC89/travel-hr-buddy/discussions)
- 🐛 Report a [Bug](https://github.com/RodrigoSC89/travel-hr-buddy/issues/new?template=bug_report.md)
- ✨ Request a [Feature](https://github.com/RodrigoSC89/travel-hr-buddy/issues/new?template=feature_request.md)

---

**Thank you for contributing! 🎉**
