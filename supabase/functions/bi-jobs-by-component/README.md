# BI Jobs By Component - Edge Function

## Overview

This Supabase Edge Function provides Business Intelligence (BI) data about completed maintenance jobs grouped by component, including average execution time metrics for dashboard visualization.

## Endpoint

```
POST /functions/v1/bi-jobs-by-component
```

## Purpose

Returns aggregated data about completed jobs per component, including:
- Total count of completed jobs
- Average duration (in hours) per component
- Component names for better readability

## Response Format

```json
[
  {
    "component_id": "Motor Principal ME-4500",
    "count": 15,
    "avg_duration": 8.5
  },
  {
    "component_id": "Gerador Principal GE-1",
    "count": 10,
    "avg_duration": 5.2
  }
]
```

### Response Fields

- `component_id` (string): Component name (human-readable)
- `count` (number): Total number of completed jobs for this component
- `avg_duration` (number): Average execution time in hours (rounded to 2 decimal places)

## Implementation Details

### Database Query

The function:
1. Queries the `mmi_jobs` table
2. Filters by `status='completed'`
3. Joins with `mmi_components` to get component names
4. Excludes jobs without a component_id
5. Aggregates results by component

### Calculation Logic

- **Job Count**: Counts all completed jobs per component
- **Average Duration**: Calculates mean of `actual_hours` field
  - Formula: `total_hours / job_count`
  - Rounded to 2 decimal places
  - Defaults to 0 if no hours recorded

### Sorting

Results are sorted by job count in descending order (highest count first).

## Usage Example

### Frontend Integration

```typescript
import { supabase } from "@/integrations/supabase/client";

async function fetchJobsStats() {
  const { data, error } = await supabase.functions.invoke("bi-jobs-by-component");
  
  if (error) {
    console.error("Error:", error);
    return [];
  }
  
  return data;
}
```

### Expected Data Structure

```typescript
interface JobsByComponent {
  component_id: string;
  count: number;
  avg_duration: number;
}
```

## Visualization

This endpoint powers the "Jobs By Component" dashboard chart that displays:
- **Jobs Finalizados** (dark blue bars): Total completed jobs
- **Tempo Médio (h)** (blue bars): Average execution time

## Database Dependencies

### Required Tables

- `mmi_jobs`: Source table for job data
  - Fields used: `component_id`, `status`, `actual_hours`
- `mmi_components`: Component names lookup
  - Fields used: `id`, `component_name`

### Required Fields

- `mmi_jobs.component_id`: UUID reference to component
- `mmi_jobs.status`: Job status (filtered by 'completed')
- `mmi_jobs.actual_hours`: Actual execution time in hours
- `mmi_components.component_name`: Human-readable component name

## Error Handling

The function includes comprehensive error handling:
- Returns 500 status with error message on failures
- Handles missing component names gracefully
- Defaults to 0 for missing actual_hours
- Includes proper CORS headers

## CORS Support

Full CORS support included for cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`

## Performance Considerations

- Queries only completed jobs (filtered at database level)
- Aggregation performed in application layer
- Results sorted before return
- No pagination (assumes reasonable dataset size)

## Deployment

```bash
supabase functions deploy bi-jobs-by-component
```

## Testing

The function can be tested using:
- Unit tests in `/src/tests/bi-dashboard-jobs.test.tsx`
- Manual testing via Supabase dashboard
- Frontend integration in DashboardJobs component

## Changelog

### v2.0 (Current)
- Added average duration calculation
- Added join with mmi_components for names
- Filter by status='completed' only
- Sort results by count descending
- Return component names instead of UUIDs

### v1.0 (Previous)
- Basic job counting by component_id
- No duration metrics
- All job statuses included
