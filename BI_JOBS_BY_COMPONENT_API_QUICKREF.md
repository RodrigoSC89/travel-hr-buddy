# BI Jobs By Component API - Quick Reference

## 🚀 Quick Start

### Deploy Database
```bash
# Run migrations in Supabase
supabase db push
```

### Deploy Edge Function
```bash
# Deploy the BI function
supabase functions deploy bi-jobs-by-component
```

## 📡 API Endpoint

### Get Jobs Statistics by Component

**Endpoint:** `GET /bi-jobs-by-component`

**Description:** Returns analytics about maintenance jobs grouped by component, including total job counts, average execution time, and job status breakdown.

**cURL:**
```bash
curl -X GET \
  "https://your-project.supabase.co/functions/v1/bi-jobs-by-component" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**JavaScript:**
```javascript
const response = await fetch(
  `${supabaseUrl}/functions/v1/bi-jobs-by-component`,
  {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${anonKey}` }
  }
);
const data = await response.json();
```

**TypeScript with Supabase Client:**
```typescript
const { data, error } = await supabase.rpc('jobs_by_component_stats');

if (error) {
  console.error('Error fetching stats:', error);
} else {
  console.log('Component stats:', data);
}
```

**Response:**
```json
[
  {
    "component_id": "123e4567-e89b-12d3-a456-426614174000",
    "component_name": "Motor Principal ME-4500",
    "total_jobs": 15,
    "avg_execution_time_days": 4.2,
    "pending_jobs": 3,
    "in_progress_jobs": 5,
    "completed_jobs": 7
  },
  {
    "component_id": "223e4567-e89b-12d3-a456-426614174001",
    "component_name": "Gerador Auxiliar GE-2000",
    "total_jobs": 8,
    "avg_execution_time_days": 2.8,
    "pending_jobs": 1,
    "in_progress_jobs": 2,
    "completed_jobs": 5
  }
]
```

## 📊 Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `component_id` | UUID | Unique identifier of the component |
| `component_name` | TEXT | Name of the component |
| `total_jobs` | BIGINT | Total number of jobs for this component |
| `avg_execution_time_days` | NUMERIC | Average time (in days) from job creation to completion. Only calculated for completed jobs. NULL if no completed jobs. |
| `pending_jobs` | BIGINT | Number of jobs with status 'pending' |
| `in_progress_jobs` | BIGINT | Number of jobs with status 'in_progress' |
| `completed_jobs` | BIGINT | Number of jobs with status 'completed' |

## 📈 Use Cases

### Dashboard Visualization
```typescript
// Fetch data for a bar chart
const { data: stats } = await supabase.rpc('jobs_by_component_stats');

// Prepare chart data
const chartData = {
  labels: stats.map(s => s.component_name),
  datasets: [
    {
      label: 'Total Jobs',
      data: stats.map(s => s.total_jobs),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    },
    {
      label: 'Avg. Execution Time (days)',
      data: stats.map(s => s.avg_execution_time_days || 0),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }
  ]
};
```

### Identify Components Needing Attention
```typescript
const { data: stats } = await supabase.rpc('jobs_by_component_stats');

// Find components with high workload
const highWorkload = stats.filter(s => s.total_jobs > 10);

// Find components with long execution times
const slowComponents = stats.filter(s => s.avg_execution_time_days > 5);

// Find components with pending jobs
const pendingWork = stats.filter(s => s.pending_jobs > 0);
```

### Performance Monitoring
```typescript
const { data: stats } = await supabase.rpc('jobs_by_component_stats');

// Calculate overall metrics
const totalJobs = stats.reduce((sum, s) => sum + s.total_jobs, 0);
const avgExecutionTime = stats
  .filter(s => s.avg_execution_time_days !== null)
  .reduce((sum, s) => sum + s.avg_execution_time_days, 0) / stats.length;

console.log(`Total jobs across all components: ${totalJobs}`);
console.log(`Average execution time: ${avgExecutionTime.toFixed(2)} days`);
```

## 🔧 Database Function

### Direct RPC Call
```sql
-- Call from SQL
SELECT * FROM jobs_by_component_stats();
```

### Function Definition
The function is defined in migration: `20251015183600_create_jobs_by_component_stats.sql`

**Key Features:**
- Aggregates jobs by component
- Calculates average execution time using `EXTRACT(EPOCH FROM (completed_date::timestamp - created_at)) / 86400`
- Includes job status breakdown
- Sorted by total jobs (descending) and component name (ascending)

## 🧪 Testing

Run tests:
```bash
npm test src/tests/bi-jobs-by-component.test.ts
```

## 📝 Notes

- **Execution Time Calculation:** Only includes completed jobs where `completed_date` is not NULL
- **NULL Values:** `avg_execution_time_days` will be NULL for components with no completed jobs
- **Ordering:** Results are ordered by `total_jobs DESC, component_name ASC`
- **Performance:** Uses indexed columns (`component_id`, `status`) for efficient querying
- **RLS:** Respects Row Level Security policies on `mmi_components` and `mmi_jobs` tables

## 🎯 Benefits

✅ **Business Intelligence:** Get insights into maintenance workload distribution  
✅ **Performance Tracking:** Monitor average execution times per component  
✅ **Capacity Planning:** Identify components with high job volumes  
✅ **Dashboard Ready:** Perfect for BI dashboards and visualizations  
✅ **Real-time Stats:** Always up-to-date with current database state
