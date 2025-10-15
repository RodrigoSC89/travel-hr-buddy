# 📊 BI Jobs By Component - Quick Reference

## 🚀 Quick Start

### Import and Use
```tsx
import { DashboardJobs } from "@/components/bi";

<DashboardJobs />
```

### Access Demo
Navigate to: `/admin/bi-jobs`

---

## 📋 Component Props

The component is **prop-less** - it handles all data fetching internally.

---

## 🔌 API Endpoint

**URL**: `/api/bi/jobs-by-component`  
**Method**: `GET`  
**Auth**: Not required  

### Response Format
```typescript
Array<{
  component_id: string;      // Component name
  count: number;             // Number of jobs
  avg_duration: number;      // Average hours
}>
```

---

## 🎨 Visual Customization

### Chart Colors
- **Jobs Count**: `#0f172a` (dark slate)
- **Avg Duration**: `#2563eb` (blue)

### Dimensions
- **Height**: 350px
- **Width**: 100% (responsive)

---

## ✅ Checklist for Integration

- [ ] Import component from `@/components/bi`
- [ ] Add to page layout
- [ ] Verify Supabase function is deployed
- [ ] Check database has completed jobs
- [ ] Test error handling
- [ ] Verify loading state appears
- [ ] Check chart renders correctly

---

## 🔍 Common Use Cases

### 1. Admin Dashboard
```tsx
import { DashboardJobs } from "@/components/bi";

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DashboardJobs />
      {/* Other widgets */}
    </div>
  );
}
```

### 2. Maintenance Reports
```tsx
import { DashboardJobs } from "@/components/bi";
import { Card } from "@/components/ui/card";

export default function MaintenanceReport() {
  return (
    <div className="space-y-6">
      <h1>Maintenance Analytics</h1>
      <DashboardJobs />
    </div>
  );
}
```

### 3. TV Wall Display
```tsx
import { DashboardJobs } from "@/components/bi";

export default function TVWallBI() {
  return (
    <div className="h-screen bg-slate-900 p-8">
      <DashboardJobs />
    </div>
  );
}
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Empty chart | Check if database has jobs with `status='completed'` |
| Error message | Verify Supabase function deployment |
| Slow loading | Add database index on `status` column |
| Wrong data | Clear browser cache and refresh |

---

## 📊 Data Requirements

### Database Table: `mmi_jobs`

Required columns:
- `component_name` (TEXT)
- `status` (TEXT) - must have 'completed' values
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Minimum Data
At least 1 job with `status = 'completed'` to display results.

---

## 🔧 Configuration

### Supabase Config
File: `supabase/config.toml`

```toml
[functions.jobs-by-component]
verify_jwt = false
```

### Deploy Function
```bash
supabase functions deploy jobs-by-component
```

---

## 📈 Performance Tips

1. **Add database index**:
   ```sql
   CREATE INDEX idx_mmi_jobs_status 
   ON mmi_jobs(status);
   ```

2. **Limit results** (if needed):
   Edit `supabase/functions/jobs-by-component/index.ts`
   ```typescript
   // Add at end of query
   .limit(20)
   ```

3. **Add caching** (optional):
   ```typescript
   // In component
   const cacheKey = 'jobs-by-component';
   const cacheTime = 5 * 60 * 1000; // 5 min
   ```

---

## ✨ Features

✅ Error handling with friendly messages  
✅ Loading skeleton for better UX  
✅ Responsive design  
✅ Interactive tooltips  
✅ Sorted by job count (descending)  
✅ Dual metrics (count + duration)  
✅ Portuguese labels  
✅ Professional styling  

---

## 📝 Notes

- Component fetches data on mount
- Auto-refreshes on page reload
- No manual refresh button (add if needed)
- Data sorted by count (most jobs first)
- Duration calculated in hours
- Components with null names show as "Não especificado"

---

## 🔗 Related Components

- `MMIDashboard` - Similar MMI dashboard
- `AnalyticsDashboard` - General analytics
- `DashboardWidgets` - Other dashboard components

---

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: See `BI_JOBS_BY_COMPONENT_IMPLEMENTATION.md`
- **Tests**: `npm test -- bi-jobs-by-component.test.ts`

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025
