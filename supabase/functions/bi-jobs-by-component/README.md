# BI Jobs By Component - Edge Function

## Description
This Supabase Edge Function provides business intelligence analytics for maintenance jobs grouped by component.

## Endpoint
`/functions/v1/bi-jobs-by-component`

## Method
GET

## Response Format
Returns an array of objects with the following structure:

```json
[
  {
    "component_id": "uuid",
    "component_name": "Component Name",
    "total_jobs": 10,
    "avg_execution_time_days": 3.5,
    "pending_jobs": 2,
    "in_progress_jobs": 3,
    "completed_jobs": 5
  }
]
```

## Fields
- `component_id`: UUID of the component
- `component_name`: Name of the component
- `total_jobs`: Total number of jobs for this component
- `avg_execution_time_days`: Average time (in days) from job creation to completion (only for completed jobs)
- `pending_jobs`: Number of jobs with status 'pending'
- `in_progress_jobs`: Number of jobs with status 'in_progress'
- `completed_jobs`: Number of jobs with status 'completed'

## Database Function
This Edge Function calls the `jobs_by_component_stats()` PostgreSQL RPC function.

## Use Cases
- Dashboard analytics to show maintenance workload distribution
- Component performance tracking
- Identifying components with long execution times
- Capacity planning for maintenance teams
