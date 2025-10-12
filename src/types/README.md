# Common Type Definitions

This directory contains reusable TypeScript type definitions to improve type safety across the application.

## Usage

### Import types

```typescript
import { ApiResponse, AsyncResult, LoadingState } from "@/types/common";
```

### Example: API Response

```typescript
import { ApiResponse } from "@/types/common";

async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const response = await fetch("/api/users");
  return response.json();
}
```

### Example: Async Result

```typescript
import { AsyncResult } from "@/types/common";

async function saveData(data: FormData): Promise<AsyncResult<User>> {
  try {
    const user = await api.post("/users", data);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Example: Loading State

```typescript
import { LoadingState } from "@/types/common";

const [status, setStatus] = useState<LoadingState>("idle");
```

## Migration from 'any'

Replace `any` types with more specific types from this module:

### Before
```typescript
const data: any = await fetchData();
const result: any = processData(data);
```

### After
```typescript
import { DataRecord } from "@/types/common";

const data: DataRecord = await fetchData();
const result: DataRecord = processData(data);
```

## Type Safety Guidelines

1. **Never use `any`** - Use `unknown` if type is truly unknown, then use type guards
2. **Use specific types** - Create interfaces for your data structures
3. **Use generics** - Make types reusable with generic parameters
4. **Document types** - Add JSDoc comments for complex types

## Available Types

- `ApiResponse<T>` - Generic API response wrapper
- `ErrorResponse` - Error response structure
- `SupabaseResponse<T>` - Supabase response wrapper
- `DataRecord` - Generic data record with string keys
- `JsonValue`, `JsonObject`, `JsonArray` - JSON-compatible types
- `AsyncResult<T, E>` - Async operation result with error handling
- `LoadingState` - Loading state for async operations
- `SelectOption<T>` - Generic select option for dropdowns
- `PaginationParams` - Pagination parameters
- `DateRange` - Date range filter
- `FileUpload` - File upload metadata
- `UserProfile` - User profile structure
- `ChartDataPoint` - Chart data point
- `FormValues` - Generic form values
- `EventHandler<T>` - Event handler type
- `Callback<T>` - Callback function type
- `AsyncCallback<T>` - Async callback function type
