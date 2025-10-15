# Jobs By Component BI - Quick Reference

## 🎯 What Was Implemented

Enhanced the BI dashboard to show **both volume AND efficiency** metrics for maintenance jobs by component.

## 📊 Features

### Two Metrics Displayed
1. **Jobs Finalizados** (dark blue bar) - Count of completed jobs
2. **Tempo Médio (h)** (blue bar) - Average duration in hours

## 🔧 How It Works

```
Frontend Component → Edge Function → RPC Function → Database
DashboardJobs.tsx → bi-jobs-by-component → jobs_by_component_stats() → mmi_jobs
```

## 📝 Usage

### Frontend
```typescript
import DashboardJobs from "@/components/bi/DashboardJobs";

// In your page
<DashboardJobs />
```

### API Endpoint
```typescript
const { data, error } = await supabase.functions.invoke("bi-jobs-by-component");
// Returns: [{ component_id, count, avg_duration }, ...]
```

### Direct RPC Call
```typescript
const { data, error } = await supabase.rpc("jobs_by_component_stats");
// Returns same format as Edge Function
```

## 📦 Response Format

```json
[
  {
    "component_id": "Motor Principal ME-4500",
    "count": 15,
    "avg_duration": 2.5
  }
]
```

## 🧪 Testing

```bash
# Run component tests
npm test -- src/tests/bi-dashboard-jobs.test.tsx

# Run integration tests
npm test -- src/tests/mmi-bi.test.tsx
```

## 🚀 Deployment

```bash
# Deploy Edge Function
supabase functions deploy bi-jobs-by-component

# No database migration needed (RPC function already exists)
```

## 📁 Files

| File | Purpose |
|------|---------|
| `src/components/bi/DashboardJobs.tsx` | Frontend component with dual bar chart |
| `supabase/functions/bi-jobs-by-component/index.ts` | Edge Function that calls RPC |
| `src/tests/bi-dashboard-jobs.test.tsx` | Component tests |
| `supabase/migrations/20251015184421_create_jobs_by_component_stats_function.sql` | RPC function definition |

## 🔍 Key Changes

### Edge Function
- **Before**: Manual grouping in JavaScript
- **After**: Calls `jobs_by_component_stats()` RPC function

### Frontend
- **Before**: Single bar (count only)
- **After**: Two bars (count + avg_duration)

### Interface
```typescript
interface JobsByComponent {
  component_id: string;
  count: number;
  avg_duration: number; // Added
}
```

## 🎨 Visual

```
📊 Falhas por Componente + Tempo Médio
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Motor ME-4500    ███████ 15 | ██ 2.5h
Sistema Hidráu   ██████ 12 | ███ 3.2h
Gerador GE-1     ████ 8 | █ 1.8h
```

## ✅ Checklist

- [x] Edge Function updated to use RPC
- [x] Frontend displays two bars
- [x] Tests updated and passing
- [x] TypeScript types updated
- [x] No breaking changes
- [x] Production ready

## 💡 Tips

1. **Duration is in hours** - The `avg_duration` field represents hours as a decimal (e.g., 2.5 = 2.5 hours)
2. **Null values** - Components with no completed jobs won't appear
3. **Performance** - Uses SQL aggregation for efficiency
4. **Real-time** - Data refreshes on component mount

## 🐛 Troubleshooting

### No data showing
- Check if there are completed jobs: `status = 'completed'`
- Verify `completed_at` column is populated
- Check Edge Function logs

### Wrong calculations
- Verify `completed_at` and `created_at` timestamps are correct
- Check RPC function logic in migration file

## 🔗 Related

- Original PR #662: Add Jobs By Component BI API
- RPC Function migration: `20251015184421_create_jobs_by_component_stats_function.sql`
- MmiBI page: `src/pages/MmiBI.tsx`
