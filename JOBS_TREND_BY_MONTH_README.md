# RPC Function: jobs_trend_by_month

## Overview
This RPC (Remote Procedure Call) function retrieves job completion trends grouped by month, specifically designed for visualizing data in trend charts.

## Function Signature
```sql
CREATE OR REPLACE FUNCTION public.jobs_trend_by_month()
RETURNS TABLE (
  month text,
  total_jobs int
)
```

## What it does

✅ **Groups all completed jobs by month** - Aggregates jobs that have `status = 'completed'`

✅ **Filters the last 6 months** - Only returns data from the last 6 months using `completed_at >= now() - interval '6 months'`

✅ **Returns ideal format for charts** - Output is in `YYYY-MM` format, perfect for trend visualization (line or bar charts)

## Usage

### From Supabase Client (JavaScript/TypeScript)
```typescript
const { data, error } = await supabase
  .rpc('jobs_trend_by_month')

if (error) {
  console.error('Error fetching job trends:', error)
} else {
  console.log('Job trends by month:', data)
  // Example output:
  // [
  //   { month: '2025-04', total_jobs: 25 },
  //   { month: '2025-05', total_jobs: 32 },
  //   { month: '2025-06', total_jobs: 28 },
  //   { month: '2025-07', total_jobs: 35 },
  //   { month: '2025-08', total_jobs: 30 },
  //   { month: '2025-09', total_jobs: 27 }
  // ]
}
```

### Direct SQL Query
```sql
SELECT * FROM jobs_trend_by_month();
```

## Return Format

| Column | Type | Description |
|--------|------|-------------|
| `month` | text | Month in YYYY-MM format (e.g., "2025-10") |
| `total_jobs` | int | Total number of completed jobs in that month |

## Use Cases

1. **Dashboard Charts** - Display monthly job completion trends
2. **Performance Analytics** - Track job completion rates over time
3. **Reporting** - Generate monthly summaries for stakeholders
4. **Trend Analysis** - Identify patterns in job completion

## Implementation Details

- **Language**: SQL
- **Security**: SECURITY DEFINER (runs with the privileges of the function owner)
- **Stability**: STABLE (does not modify database, can be optimized)
- **Search Path**: Set to public schema
- **Data Source**: `public.jobs` table
- **Filter Criteria**: 
  - `status = 'completed'`
  - `completed_at >= now() - interval '6 months'`
- **Grouping**: By month (truncated to month start)
- **Ordering**: Chronological by month

## Migration File

Location: `supabase/migrations/20251015185810_create_jobs_trend_by_month_function.sql`

## Notes

- The function assumes the existence of a `jobs` table with the following columns:
  - `status` (text or varchar)
  - `completed_at` (timestamp with time zone)
- Results are ordered chronologically for easy chart rendering
- The 6-month window is calculated dynamically based on the current date
