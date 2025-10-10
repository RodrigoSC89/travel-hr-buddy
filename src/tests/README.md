# Tests

This directory contains the test suite for the Travel HR Buddy application.

## Test Framework

We use [Vitest](https://vitest.dev/) as our test framework, which is the official testing framework for Vite projects.

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `setup.ts` - Test setup and configuration
- `basic.test.ts` - Basic sanity tests
- `components/` - Component tests using React Testing Library

## Writing Tests

Tests are written using Vitest's API which is compatible with Jest. Here's a basic example:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Test Files

Test files should follow the naming convention: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx`

## Dependencies

- `vitest` - Test framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM elements
- `jsdom` - Browser environment for tests
