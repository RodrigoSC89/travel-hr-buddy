# jobs_by_component_stats RPC Function

## Overview
The `jobs_by_component_stats()` function returns statistics about completed maintenance jobs grouped by component.

## Function Signature
```sql
jobs_by_component_stats()
RETURNS TABLE (
  component_id text,
  count int,
  avg_duration numeric
)
```

## Returns
| Field | Type | Description |
|-------|------|-------------|
| `component_id` | text | The UUID of the component (converted to text) |
| `count` | int | Total number of completed jobs for the component |
| `avg_duration` | numeric | Average duration of job execution in hours |

## Usage

### TypeScript/JavaScript (Supabase Client)
```typescript
const { data, error } = await supabase
  .rpc('jobs_by_component_stats');

if (error) {
  console.error('Error fetching job statistics:', error);
} else {
  console.log('Job statistics:', data);
}
```

### SQL
```sql
SELECT * FROM jobs_by_component_stats();
```

## Example Response
```json
[
  {
    "component_id": "550e8400-e29b-41d4-a716-446655440000",
    "count": 15,
    "avg_duration": 2.5
  },
  {
    "component_id": "550e8400-e29b-41d4-a716-446655440001",
    "count": 8,
    "avg_duration": 1.75
  }
]
```

## Notes
- Only jobs with status `'completed'` are included
- Jobs must have both `created_at` and `completed_at` timestamps
- Duration is calculated as the difference between `completed_at` and `created_at` in hours
- The function uses the newly added `completed_at` column in the `mmi_jobs` table

## Migration
This function was added in migration `20251015184421_create_jobs_by_component_stats_function.sql`

The migration also adds a `completed_at` TIMESTAMPTZ column to the `mmi_jobs` table if it doesn't already exist.
