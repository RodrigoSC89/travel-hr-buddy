# Dashboard BI Jobs - Implementation Guide

## 📊 Overview

This implementation provides a Business Intelligence dashboard component that visualizes the distribution of maintenance jobs across different components in the MMI (Manutenção e Manutenibilidade Industrial) system.

## 🎯 Features

- **Real-time Data**: Fetches live data from Supabase backend
- **Visual Analytics**: Horizontal bar chart showing job count per component
- **Loading States**: Skeleton loader for better UX
- **Error Handling**: Graceful error handling with console logging
- **Responsive Design**: Uses recharts ResponsiveContainer for adaptive sizing

## 📁 Files Created

### 1. Supabase Edge Function
**Location**: `/supabase/functions/bi-jobs-by-component/index.ts`

**Purpose**: Backend API endpoint that queries the `mmi_jobs` table and aggregates job counts by component.

**Endpoint**: When deployed, accessible via:
```
/api/bi/jobs-by-component
```

**Response Format**:
```json
[
  {
    "component_id": "uuid-1",
    "count": 5
  },
  {
    "component_id": "uuid-2",
    "count": 3
  }
]
```

### 2. React Component
**Location**: `/src/components/bi/DashboardJobs.tsx`

**Purpose**: Frontend component that displays the job distribution chart.

**Usage**:
```tsx
import DashboardJobs from "@/components/bi/DashboardJobs";

function MyPage() {
  return (
    <div>
      <DashboardJobs />
    </div>
  );
}
```

### 3. Test Suite
**Location**: `/src/tests/bi-dashboard-jobs.test.tsx`

**Coverage**:
- Component rendering
- API function invocation
- Loading states
- Error handling
- Data display

**Run Tests**:
```bash
npm test -- src/tests/bi-dashboard-jobs.test.tsx
```

## 🔧 Technical Details

### Database Schema
The component queries the `mmi_jobs` table which has the following structure:
- `id`: UUID (Primary Key)
- `component_id`: UUID (Foreign Key to mmi_components)
- `title`: TEXT
- `status`: TEXT
- `priority`: TEXT
- Other fields...

### Dependencies
- **React**: Component framework
- **Recharts**: Charting library
- **Supabase**: Backend and API
- **shadcn/ui**: UI components (Card, Skeleton)

### API Flow
1. Component mounts → `useEffect` triggers
2. Calls `supabase.functions.invoke("bi-jobs-by-component")`
3. Edge function queries database
4. Data aggregated and returned
5. Component updates state and renders chart

## 🎨 Visual Design

### Chart Characteristics
- **Type**: Horizontal Bar Chart
- **Layout**: Vertical orientation (bars extend horizontally)
- **X-Axis**: Number of jobs (numeric)
- **Y-Axis**: Component IDs (categorical)
- **Color**: Dark slate (`#0f172a`) matching the app theme
- **Height**: 300px fixed

### Loading State
- Shows skeleton placeholder while data loads
- Smooth transition to actual chart

## 🚀 Deployment

### Prerequisites
1. Supabase project configured
2. `mmi_jobs` table with data
3. Environment variables set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Deploy Edge Function
```bash
# Using Supabase CLI
supabase functions deploy bi-jobs-by-component

# Or via CI/CD pipeline
# The function will be automatically deployed when pushed to main
```

### Integration
Add the component to any dashboard or BI page:

```tsx
import DashboardJobs from "@/components/bi/DashboardJobs";

export default function BIDashboard() {
  return (
    <div className="grid gap-6">
      <DashboardJobs />
      {/* Other BI components */}
    </div>
  );
}
```

## 📊 Example Output

When the component has data, it displays:
```
📊 Falhas por Componente
┌─────────────────────────────────────────┐
│ comp-uuid-1  ████████████ 12            │
│ comp-uuid-2  ████████ 8                 │
│ comp-uuid-3  ██████ 6                   │
│ comp-uuid-4  ████ 4                     │
│ comp-uuid-5  ██ 2                       │
└─────────────────────────────────────────┘
```

## 🔍 Troubleshooting

### No Data Displayed
1. Check if `mmi_jobs` table has records
2. Verify component_id is not null
3. Check browser console for errors
4. Verify Supabase connection

### API Errors
1. Check Supabase function logs
2. Verify environment variables
3. Check CORS headers
4. Verify database permissions

### Build Errors
1. Run `npm install` to ensure dependencies
2. Check TypeScript types
3. Verify imports are correct

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- bi-dashboard-jobs
```

### Test Coverage
```bash
npm run test:coverage
```

## 📝 Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint compliant
- ✅ Double quote convention
- ✅ No explicit `any` types
- ✅ Proper error handling
- ✅ Loading states implemented

## 🔄 Future Enhancements

Potential improvements:
1. Add component name labels (join with mmi_components table)
2. Add filtering by status, priority, or date range
3. Add drill-down functionality to see job details
4. Export chart as image/PDF
5. Add refresh button
6. Add time-series view
7. Add comparison with previous periods

## 📚 Related Components

- `MMIDashboard`: Main MMI dashboard page
- `mmi_jobs`: Database table
- `mmi_components`: Related components table
- Other BI analytics components

## 👥 Authors

- Implementation follows existing patterns in travel-hr-buddy
- Integrated with Supabase Edge Functions architecture
- Uses recharts library already in the project

## 📄 License

Same as parent project (travel-hr-buddy)
