# BI Jobs By Component API - Quick Reference

## 🚀 Quick Start

### Call from Frontend
```typescript
const { data, error } = await supabase.rpc('jobs_by_component_stats');
```

### Call via HTTP
```bash
curl https://your-project.supabase.co/functions/v1/bi-jobs-by-component \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "apikey: YOUR_KEY"
```

## 📊 Response Format

```json
[
  {
    "component_id": "uuid",
    "component_name": "Motor Principal ME-4500",
    "total_jobs": 15,
    "avg_execution_time_days": 4.2,
    "pending_jobs": 3,
    "in_progress_jobs": 5,
    "completed_jobs": 7
  }
]
```

## 📈 What You Get

| Metric | Description |
|--------|-------------|
| **component_id** | Unique UUID of component |
| **component_name** | Name of the component |
| **total_jobs** | All jobs for this component |
| **avg_execution_time_days** | Average days from creation to completion |
| **pending_jobs** | Jobs waiting to start |
| **in_progress_jobs** | Jobs currently being worked on |
| **completed_jobs** | Finished jobs |

## 🎯 Use Cases

- **Dashboard Widgets** - Show component workload distribution
- **Performance Analysis** - Track average execution times
- **Resource Planning** - Identify high-volume components
- **Problem Detection** - Find bottlenecks and delays

## ⚙️ Key Features

✅ Real-time data directly from database  
✅ Optimized with database indexes  
✅ Handles NULL values gracefully  
✅ Sorted by job volume (highest first)  
✅ CORS enabled for web apps  
✅ RLS compliant  

## 📝 Important Notes

- Average time only calculated for **completed** jobs with a `completed_date`
- Components with no completed jobs show `null` for average time
- Results include components with zero jobs
- Execution time is in **days** (decimal format: 4.2 = 4.2 days)

## 🔧 Implementation Details

**Database Function:** `jobs_by_component_stats()`  
**Edge Function:** `bi-jobs-by-component`  
**Tables Used:** `mmi_components`, `mmi_jobs`  
**Migration:** `20251015183600_create_jobs_by_component_stats.sql`

## 🎨 Example Use in React Component

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function JobsByComponentChart() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.rpc('jobs_by_component_stats');
      if (!error) setData(data);
    }
    loadData();
  }, []);
  
  return (
    <div>
      {data.map(item => (
        <div key={item.component_id}>
          <h3>{item.component_name}</h3>
          <p>Total Jobs: {item.total_jobs}</p>
          <p>Avg Time: {item.avg_execution_time_days?.toFixed(1)} days</p>
          <p>Status: {item.pending_jobs}P / {item.in_progress_jobs}IP / {item.completed_jobs}C</p>
        </div>
      ))}
    </div>
  );
}
```

## 📦 Deployment

```bash
# Deploy edge function
supabase functions deploy bi-jobs-by-component

# Apply migration
supabase db push
```

## 🐛 Troubleshooting

**Error: Function does not exist**
- Run `supabase db push` to apply the migration

**Empty results**
- Check if `mmi_components` table has data
- Verify `mmi_jobs` are linked to components

**NULL average time for all components**
- Ensure jobs have `status='completed'` and a `completed_date` set

## 📚 Related Documentation

- Full README: `supabase/functions/bi-jobs-by-component/README.md`
- Implementation Summary: `BI_JOBS_BY_COMPONENT_IMPLEMENTATION_SUMMARY.md`
- Tests: `src/tests/bi-jobs-by-component.test.ts`
