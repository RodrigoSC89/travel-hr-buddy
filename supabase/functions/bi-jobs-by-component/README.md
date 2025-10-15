# Jobs By Component - BI Analytics API

## Overview

This Supabase Edge Function provides Business Intelligence analytics for completed maintenance jobs grouped by component with duration metrics. It enables dashboard insights showing both job volume and average execution time for the MMI (Intelligent Maintenance Module) system.

## Endpoint

**URL:** `/functions/v1/bi-jobs-by-component`  
**Method:** `GET`  
**Authentication:** Requires Supabase API key

## Response Format

Returns an array of objects with the following structure:

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

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `component_id` | String | Human-readable name of the component |
| `count` | Number | Total count of completed jobs for this component |
| `avg_duration` | Number | Average execution time in hours based on actual_hours field |

## Usage Examples

### JavaScript/TypeScript

```typescript
const { data, error } = await supabase.functions.invoke('bi-jobs-by-component');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Job statistics:', data);
  // Example output:
  // [
  //   { component_id: "Motor ME-4500", count: 15, avg_duration: 8.5 },
  //   { component_id: "Gerador GE-1", count: 10, avg_duration: 5.2 }
  // ]
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

## Implementation Details

This Edge Function:

- Queries the `mmi_jobs` table for completed jobs only (`status='completed'`)
- Joins with `mmi_components` table to retrieve human-readable component names
- Filters out jobs without `actual_hours` data
- Aggregates data by component to calculate:
  - Total completed jobs per component
  - Average duration (in hours) from the `actual_hours` field
- Sorts results by job count (descending) for easy identification of high-volume components
- Returns component names as `component_id` for backwards compatibility

## Use Cases

### 📊 Dashboard Analytics
Visualize maintenance workload distribution across components with dual-metric bar charts showing both job volume and average execution time.

### 📈 Performance Monitoring
Track average execution times per component to identify components that require more maintenance effort.

### 🎯 Capacity Planning
Identify components with high job volumes to allocate resources effectively.

### 🔍 Efficiency Analysis
Compare components by both frequency and time investment to optimize maintenance processes.

## Features

✅ **Real-time Analytics** - Always reflects current database state  
✅ **Performance Optimized** - Efficient query with proper filtering  
✅ **Dashboard Ready** - Perfect for BI visualizations with dual metrics  
✅ **Human-Readable** - Component names instead of UUIDs  
✅ **Accurate Metrics** - Based on actual_hours field for completed jobs  
✅ **CORS Enabled** - Supports cross-origin requests

## Notes

- Only includes jobs with `status='completed'`
- Only includes jobs with non-null `actual_hours` values
- Component names are returned in the `component_id` field for backwards compatibility
- Results are sorted by job count (most active components first)
- Average duration is calculated in hours and rounded to 1 decimal place

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
- Table: `mmi_components`
- Table: `mmi_jobs`

## Deployment

```bash
# Deploy the edge function
supabase functions deploy bi-jobs-by-component
```

The component can be integrated in any dashboard:

```typescript
import DashboardJobs from '@/components/bi/DashboardJobs';

// Component automatically fetches and displays the data
<DashboardJobs />
```
