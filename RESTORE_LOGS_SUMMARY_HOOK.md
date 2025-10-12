# Restore Logs Summary Hook

## Overview

The `useRestoreLogsSummary` hook provides a convenient way to fetch restore logs summary data from Supabase. It aggregates data from the `document_restore_logs` table and provides summary statistics, daily counts, and status distribution.

## Usage

```typescript
import { useRestoreLogsSummary } from "@/hooks/use-restore-logs-summary";

function MyComponent() {
  const { data, loading, error, refetch } = useRestoreLogsSummary();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Restore Logs Summary</h1>
      <p>Total Restores: {data?.summary.total}</p>
      <p>Unique Documents: {data?.summary.unique_docs}</p>
      <p>Average per Day: {data?.summary.avg_per_day}</p>
      <p>Last Execution: {data?.summary.last_execution}</p>

      <h2>By Day</h2>
      {data?.byDay.map((day) => (
        <div key={day.day}>
          {day.day}: {day.count} restores
        </div>
      ))}

      <h2>By Status</h2>
      {data?.byStatus.map((status) => (
        <div key={status.name}>
          {status.name}: {status.value} restores
        </div>
      ))}

      <button onClick={() => refetch()}>Refresh Data</button>
    </div>
  );
}
```

## Filtering by Email

You can optionally filter the results by email:

```typescript
const { data, loading, error } = useRestoreLogsSummary("user@example.com");
```

## Return Value

The hook returns an object with the following properties:

- `data`: The fetched data or `null` if not yet loaded
  - `summary`: Summary statistics
    - `total`: Total number of restores
    - `unique_docs`: Number of unique documents restored
    - `avg_per_day`: Average restores per day
    - `last_execution`: Timestamp of the last restore
  - `byDay`: Array of daily restore counts
    - `day`: Date string
    - `count`: Number of restores on that day
  - `byStatus`: Array of status counts
    - `name`: Status name
    - `value`: Count for this status
- `loading`: Boolean indicating if data is being fetched
- `error`: Error object if an error occurred, or `null`
- `refetch`: Function to manually refetch the data

## Backend Requirements

This hook relies on the following Supabase RPC functions:

- `get_restore_summary`: Returns summary statistics
- `get_restore_count_by_day_with_email`: Returns daily counts with optional email filter

And the `document_restore_logs` table with the following columns:

- `status`: Status of the restore operation
- `restored_at`: Timestamp of the restore

## Relation to Next.js API Route

This hook provides the same functionality as the Next.js API route `/api/restore-logs/summary` but adapted for a React/Vite application. Instead of making an HTTP request to an API endpoint, it directly queries Supabase using the `supabase` client.

### Original Next.js API Route

```typescript
// /app/api/restore-logs/summary/route.ts
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const [summaryRes, byDayRes, byStatusRes] = await Promise.all([
    supabase.rpc("get_restore_summary", { email_input: null }),
    supabase.rpc("get_restore_count_by_day_with_email", { email_input: null }),
    supabase.from("document_restore_logs").select("status, count:id").group("status")
  ]);
  // ... process and return data
}
```

### React Hook Equivalent

```typescript
// src/hooks/use-restore-logs-summary.ts
export function useRestoreLogsSummary(emailInput: string | null = null) {
  // ... same queries but in a React hook
  const [summaryRes, byDayRes] = await Promise.all([
    supabase.rpc("get_restore_summary", { email_input: emailInput }),
    supabase.rpc("get_restore_count_by_day_with_email", { email_input: emailInput }),
  ]);
  // ... process and return data via state
}
```

## Testing

The hook includes comprehensive tests in `src/tests/hooks/use-restore-logs-summary.test.ts`:

- ✅ Fetches and returns summary data correctly
- ✅ Handles errors gracefully
- ✅ Allows refetching data
- ✅ Accepts email filter parameter

Run tests with:

```bash
npm test -- src/tests/hooks/use-restore-logs-summary.test.ts
```
