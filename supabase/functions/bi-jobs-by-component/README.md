# Jobs By Component - BI Analytics API

## Overview

This Supabase Edge Function provides comprehensive Business Intelligence analytics for maintenance jobs grouped by component. It enables dashboard insights, performance monitoring, and capacity planning for the MMI (Intelligent Maintenance Module) system.

## Endpoint

**URL:** `/functions/v1/bi-jobs-by-component`  
**Method:** `GET`  
**Authentication:** Requires Supabase API key

## Response Format

Returns an array of objects with the following structure:

```json
[
  {
    "component_id": "uuid-string",
    "component_name": "Motor Principal ME-4500",
    "total_jobs": 15,
    "avg_execution_time_days": 4.2,
    "pending_jobs": 3,
    "in_progress_jobs": 5,
    "completed_jobs": 7
  },
  {
    "component_id": "uuid-string",
    "component_name": "Gerador Auxiliar GE-2000",
    "total_jobs": 8,
    "avg_execution_time_days": 2.5,
    "pending_jobs": 1,
    "in_progress_jobs": 2,
    "completed_jobs": 5
  }
]
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `component_id` | UUID | Unique identifier of the component |
| `component_name` | String | Name of the component |
| `total_jobs` | Number | Total count of all jobs for this component |
| `avg_execution_time_days` | Number/Null | Average time in days from job creation to completion (only for completed jobs with completed_date) |
| `pending_jobs` | Number | Count of jobs with status='pending' |
| `in_progress_jobs` | Number | Count of jobs with status='in_progress' |
| `completed_jobs` | Number | Count of jobs with status='completed' |

## Usage Examples

### JavaScript/TypeScript

```typescript
const { data, error } = await supabase.rpc('jobs_by_component_stats');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Job statistics:', data);
}
```

### cURL

```bash
curl -X GET 'https://your-project.supabase.co/functions/v1/bi-jobs-by-component' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY"
```

### Fetch API

```javascript
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/bi-jobs-by-component',
  {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY
    }
  }
);
const data = await response.json();
```

## Database Function

This Edge Function calls the PostgreSQL RPC function `jobs_by_component_stats()` which:

- Performs a LEFT JOIN between `mmi_components` and `mmi_jobs`
- Calculates average execution time only for completed jobs with a `completed_date`
- Uses conditional aggregation for status-specific counts
- Sorts results by total jobs (descending), then component name (ascending)
- Leverages existing indexes for optimal performance

## Use Cases

### 📊 Dashboard Analytics
Visualize maintenance workload distribution across components with bar charts, pie charts, or data tables.

### 📈 Performance Monitoring
Track average execution times per component to identify bottlenecks and optimize maintenance processes.

### 🎯 Capacity Planning
Identify components with high job volumes to allocate resources effectively.

### 🔍 Problem Detection
Find components with:
- Long execution times that may need process improvements
- High pending job counts indicating resource constraints
- Components with no completed jobs that may need attention

## Features

✅ **Real-time Analytics** - Always reflects current database state  
✅ **Performance Optimized** - Uses indexed columns and efficient SQL  
✅ **Dashboard Ready** - Perfect for BI visualizations  
✅ **NULL Handling** - Components with no completed jobs show `null` for `avg_execution_time_days`  
✅ **RLS Compliant** - Respects Row Level Security policies  
✅ **CORS Enabled** - Supports cross-origin requests

## Notes

- Average execution time is calculated only for jobs with status='completed' AND a non-null `completed_date`
- Components with no jobs are included in the results with 0 counts
- Results are sorted by total jobs (most active first), then alphabetically by component name
- All timestamps use the server's timezone (TIMESTAMPTZ)

## Error Handling

The function returns appropriate HTTP status codes:

- `200 OK` - Successful request with data
- `500 Internal Server Error` - Database or processing error

Error responses include a JSON object with an `error` field:

```json
{
  "error": "Error message description"
}
```

## Dependencies

- Supabase JS Client v2.39.3
- Deno runtime
- PostgreSQL function `jobs_by_component_stats()`

## Deployment

```bash
# Deploy the edge function
supabase functions deploy bi-jobs-by-component

# Apply the database migration (if not already applied)
supabase db push
```

## Related

- Migration: `20251015183600_create_jobs_by_component_stats.sql`
- Table: `mmi_components`
- Table: `mmi_jobs`
- RPC Function: `jobs_by_component_stats()`
