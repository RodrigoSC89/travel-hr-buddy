# Jobs By Component BI - Quick Reference

## 📊 Feature Overview

Displays job completion statistics and average duration time by component in a horizontal bar chart.

## 🚀 Quick Start

### Access the Dashboard

Navigate to: **MMI Module → BI Dashboard** (`/mmi-bi`)

### API Endpoint

```typescript
GET /functions/v1/bi-jobs-by-component
```

**Response**:
```json
[
  { "component_id": "Component Name", "count": 10, "avg_duration": 2.5 }
]
```

## 📁 File Locations

| File | Purpose |
|------|---------|
| `/supabase/functions/bi-jobs-by-component/index.ts` | Edge Function API |
| `/src/components/bi/DashboardJobs.tsx` | React Component |
| `/src/tests/bi-jobs-by-component.test.tsx` | Component Tests |
| `/src/pages/MmiBI.tsx` | Integration Page |

## 🔧 Component Usage

```tsx
import DashboardJobs from "@/components/bi/DashboardJobs";

function MyPage() {
  return <DashboardJobs />;
}
```

## 🧪 Testing

```bash
# Run component tests
npm run test -- src/tests/bi-jobs-by-component.test.tsx

# Run all MMI tests
npm run test -- src/tests/mmi
```

## 📈 Chart Details

- **Chart Type**: Horizontal Bar Chart
- **Y-Axis**: Component Names
- **X-Axis**: Count/Hours
- **Metrics**:
  - 🔵 Jobs Finalizados (Count) - Dark Blue
  - 🔷 Tempo Médio (h) - Blue

## 🎯 Key Features

✅ Real-time data fetching from Supabase
✅ Loading skeleton for better UX
✅ Responsive design
✅ Error handling
✅ Sorted by job count (descending)

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Sample Output

```
Motor Principal ME-4500    █████████████████ 15 jobs | 2.5h avg
Gerador Principal GE-1     ██████████ 8 jobs | 1.8h avg
Sistema Hidráulico         ████████████ 12 jobs | 3.2h avg
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| No data displayed | Check database has completed jobs |
| Fetch error | Verify environment variables |
| Build fails | Run `npm install` |

## 💡 Pro Tips

- Only completed jobs are counted
- Average duration is calculated from `actual_hours` field
- Chart auto-updates when data changes
- Component names come from `mmi_components` table

## 📚 Related Documentation

- [Full Implementation Guide](./JOBS_BY_COMPONENT_BI_IMPLEMENTATION.md)
- [MMI Schema](./supabase/migrations/20251015032230_mmi_complete_schema.sql)

---

**Created**: 2025-10-15
**Version**: 1.0.0
**Status**: ✅ Production Ready
