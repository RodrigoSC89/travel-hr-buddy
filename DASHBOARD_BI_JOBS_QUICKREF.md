# Dashboard BI Jobs - Quick Reference

## 🚀 Quick Start

### Import Component
```tsx
import DashboardJobs from "@/components/bi/DashboardJobs";
```

### Use in Page
```tsx
<DashboardJobs />
```

## 📦 Files

| File | Purpose |
|------|---------|
| `/src/components/bi/DashboardJobs.tsx` | React component |
| `/supabase/functions/bi-jobs-by-component/index.ts` | API endpoint |
| `/src/tests/bi-dashboard-jobs.test.tsx` | Test suite |

## 🔌 API

### Endpoint
```
POST /api/bi/jobs-by-component
```

### Response
```json
[
  { "component_id": "uuid", "count": 5 }
]
```

## 🎨 Component Props

**None** - Component is self-contained and manages its own state.

## 📊 Chart Details

- **Type**: Horizontal Bar Chart
- **X-Axis**: Job Count (number)
- **Y-Axis**: Component ID (string)
- **Color**: `#0f172a` (dark slate)
- **Height**: 300px

## 🧪 Testing

```bash
# Run tests
npm test -- bi-dashboard-jobs

# All tests
npm test

# With coverage
npm run test:coverage
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint
```

## 📝 Key Features

✅ Real-time data fetching  
✅ Loading skeleton  
✅ Error handling  
✅ Responsive design  
✅ TypeScript typed  
✅ Tested  

## 🎯 Requirements Met

From problem statement:
- ✅ Component at `/components/bi/DashboardJobs.tsx`
- ✅ API route `/api/bi/jobs-by-component`
- ✅ Horizontal bar chart
- ✅ Shows job count by component
- ✅ BI focus on failure analysis
- ✅ Uses recharts library
- ✅ Card UI component
- ✅ Title: "📊 Falhas por Componente"

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| No data shows | Check mmi_jobs table has records |
| API error | Verify Supabase env vars |
| Build fails | Run `npm install` |
| Tests fail | Clear mocks with `vi.clearAllMocks()` |

## 📚 Dependencies

- `react` - UI framework
- `recharts` - Charts
- `@/components/ui/card` - Card component
- `@/components/ui/skeleton` - Loading state
- `@/integrations/supabase/client` - API client

## 🔗 Related

- MMI Dashboard (`/pages/MMIDashboard.tsx`)
- MMI Jobs Table (`mmi_jobs`)
- BI Analytics folder (`/components/analytics/`)
