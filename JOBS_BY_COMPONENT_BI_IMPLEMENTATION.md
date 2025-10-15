# Jobs By Component BI API - Implementation Guide

## Overview

This implementation adds a Business Intelligence (BI) API endpoint and dashboard component that displays job statistics grouped by component. The feature shows the number of completed jobs and average duration for each component in the MMI (Intelligent Maintenance Module) system.

## Components Created

### 1. Supabase Edge Function: `bi-jobs-by-component`

**Location**: `/supabase/functions/bi-jobs-by-component/index.ts`

**Purpose**: Provides an API endpoint that queries the database and returns aggregated job statistics by component.

**API Response Format**:
```json
[
  {
    "component_id": "Motor Principal ME-4500",
    "count": 15,
    "avg_duration": 2.5
  },
  {
    "component_id": "Gerador Principal GE-1",
    "count": 8,
    "avg_duration": 1.8
  }
]
```

**Features**:
- Fetches only completed jobs from `mmi_jobs` table
- Joins with `mmi_components` to get component names
- Calculates count and average duration per component
- Returns results sorted by job count (descending)
- Implements CORS headers for cross-origin requests

**Usage**:
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/bi-jobs-by-component`, {
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
});
const data = await response.json();
```

### 2. React Component: `DashboardJobs`

**Location**: `/src/components/bi/DashboardJobs.tsx`

**Purpose**: Displays a horizontal bar chart showing job statistics by component.

**Features**:
- Fetches data from the `bi-jobs-by-component` API endpoint
- Shows loading skeleton while fetching data
- Displays two bars per component:
  - Jobs Finalizados (completed jobs count) - dark blue color (#0f172a)
  - Tempo Médio (h) (average duration in hours) - blue color (#2563eb)
- Responsive design using Recharts
- Error handling with console logging

**Visual Layout**:
- Title: "📊 Falhas por Componente + Tempo Médio"
- Chart type: Horizontal bar chart
- Y-axis: Component names
- X-axis: Quantity (Jobs / Hours)
- Legend showing both metrics

### 3. Integration

The `DashboardJobs` component is integrated into the existing `MmiBI` page located at `/src/pages/MmiBI.tsx`.

**Navigation**: The page is accessible through the MMI module in the application.

## Database Schema

The API uses the following tables from the MMI schema:

### mmi_jobs
- `id`: UUID (Primary Key)
- `component_id`: UUID (Foreign Key to mmi_components)
- `status`: TEXT (must be 'completed' for this API)
- `actual_hours`: NUMERIC(5,2) (actual hours spent on the job)

### mmi_components
- `id`: UUID (Primary Key)
- `component_name`: TEXT (displayed in the chart)
- `system_id`: UUID (Foreign Key to mmi_systems)

## Testing

### Unit Tests

**Location**: `/src/tests/bi-jobs-by-component.test.tsx`

The test suite includes:
1. ✅ Rendering the dashboard title
2. ✅ Displaying loading skeleton initially
3. ✅ Fetching and displaying job statistics
4. ✅ Handling fetch errors gracefully
5. ✅ Rendering the component without errors

**Location**: `/src/tests/mmi-bi.test.tsx` (updated)

The MmiBI page tests include:
1. ✅ Rendering the dashboard title
2. ✅ Rendering the chart title
3. ✅ Rendering the jobs by component chart
4. ✅ Rendering the component without errors

### Running Tests

```bash
# Run all BI-related tests
npm run test -- src/tests/bi-jobs-by-component.test.tsx

# Run all MMI tests
npm run test -- src/tests/mmi
```

## Build and Deployment

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Example Data

Sample data shown in the chart (when there are completed jobs):

| Component | Jobs Completed | Avg Duration (h) |
|-----------|----------------|------------------|
| Motor Principal ME-4500 | 15 | 2.5 |
| Gerador Principal GE-1 | 8 | 1.8 |
| Sistema Hidráulico | 12 | 3.2 |

## Future Enhancements

Possible improvements for future iterations:

1. **Filtering Options**:
   - Filter by date range
   - Filter by system type
   - Filter by priority

2. **Additional Metrics**:
   - Total cost per component
   - Failure rate trends
   - Parts consumption statistics

3. **Export Functionality**:
   - Export to CSV
   - Export to PDF
   - Email reports

4. **Real-time Updates**:
   - WebSocket integration for live data
   - Auto-refresh at intervals

5. **Drill-down Capability**:
   - Click on a component to see individual jobs
   - View detailed job history

## Technical Notes

- The component uses environment variables for Supabase configuration:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

- The Edge Function uses server-side environment variables:
  - `SUPABASE_URL`: Supabase project URL
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

- The chart is built using Recharts library for responsive and interactive visualizations

## Troubleshooting

### No Data Displayed

1. Check that there are completed jobs in the database:
   ```sql
   SELECT COUNT(*) FROM mmi_jobs WHERE status = 'completed';
   ```

2. Verify the Edge Function is deployed:
   ```bash
   supabase functions list
   ```

3. Check browser console for fetch errors

### Build Errors

Ensure all dependencies are installed:
```bash
npm install
```

### Test Failures

Clear test cache and re-run:
```bash
npm run test -- --clearCache
npm run test
```

## References

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Recharts Documentation](https://recharts.org/)
- [MMI Complete Schema Migration](../supabase/migrations/20251015032230_mmi_complete_schema.sql)
