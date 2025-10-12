# TypeScript Type Definitions

This directory contains shared TypeScript type definitions used throughout the application.

## Purpose

Reduce usage of `any` type and improve type safety by providing well-defined, reusable types.

## Files

### `common.ts`
Common type definitions used across the application:
- API responses and errors
- Pagination
- Form data
- Component props
- Loading states
- Select options
- File uploads
- Service configurations

## Usage

Instead of using `any`:

```typescript
// ❌ Bad
function handleData(data: any) {
  return data.value;
}

// ✅ Good
import { DataRecord } from '@/types/common';

function handleData(data: DataRecord) {
  const value = data.value;
  if (typeof value === 'string') {
    return value;
  }
  return '';
}
```

For API responses:

```typescript
// ❌ Bad
async function fetchData(): Promise<any> {
  const response = await fetch('/api/data');
  return response.json();
}

// ✅ Good
import { ApiResponse } from '@/types/common';

async function fetchData(): Promise<ApiResponse<User[]>> {
  const response = await fetch('/api/data');
  return response.json();
}
```

## Guidelines

1. **Use specific types**: When the structure is known, create an interface
2. **Use `unknown`**: For truly unknown data, use `unknown` instead of `any`
3. **Use generics**: Make types reusable with TypeScript generics
4. **Document types**: Add JSDoc comments for complex types
5. **Type guards**: Use type guards to narrow `unknown` types

## Examples

### Type Guard Pattern

```typescript
import { DataRecord } from '@/types/common';

function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
}

function processData(data: unknown) {
  if (isValidUser(data)) {
    // data is now typed as User
    console.log(data.email);
  }
}
```

### Generic API Call

```typescript
import { ApiResponse, AsyncResult } from '@/types/common';

async function apiCall<T>(
  url: string
): Promise<AsyncResult<T>> {
  try {
    const response = await fetch(url);
    const data: ApiResponse<T> = await response.json();
    
    return {
      success: data.success,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
```

## Contributing

When adding new types:
1. Keep them generic and reusable
2. Add JSDoc documentation
3. Export from the appropriate file
4. Update this README

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
