# JobsForecastReport Component

## Overview

The `JobsForecastReport` component is an AI-powered forecasting tool that generates predictions for job trends over the next 2 months. It leverages OpenAI's GPT model to analyze historical data and provide actionable insights.

## Features

- 🔮 AI-powered job forecasting for the next 2 months
- 📊 Automatic forecast generation when trend data is available
- 📈 Manual forecast generation on demand
- 🧠 Preventive recommendations based on historical patterns
- ⚠️ Critical attention points and warnings

## Component Location

```
/src/components/bi/JobsForecastReport.tsx
```

## Usage

### Basic Usage

```tsx
import JobsForecastReport from "@/components/bi/JobsForecastReport";

function MyDashboard() {
  const trendData = [
    { date: "2025-01", jobs: 10 },
    { date: "2025-02", jobs: 15 },
    { date: "2025-03", jobs: 12 },
  ];

  return <JobsForecastReport trend={trendData} />;
}
```

### Props

| Prop    | Type          | Required | Description                                              |
| ------- | ------------- | -------- | -------------------------------------------------------- |
| `trend` | `TrendData[]` | Yes      | Array of trend data objects with date, jobs, and other properties |

#### TrendData Interface

```typescript
interface TrendData {
  date?: string;
  jobs?: number;
  [key: string]: unknown;
}
```

### With Empty Trend Data

When no trend data is provided, the component displays a button to manually generate a forecast:

```tsx
<JobsForecastReport trend={[]} />
```

## API Integration

The component uses the Supabase Edge Function `bi-jobs-forecast` to generate forecasts:

```
POST /functions/v1/bi-jobs-forecast
Content-Type: application/json

{
  "trend": [
    { "date": "2025-01", "jobs": 10 },
    { "date": "2025-02", "jobs": 15 }
  ]
}
```

### Response Format

```json
{
  "success": true,
  "forecast": "📊 Previsão quantitativa de jobs para os próximos 2 meses...",
  "generatedAt": "2025-10-15T21:30:00.000Z"
}
```

## Edge Function

The backend Edge Function is located at:

```
/supabase/functions/bi-jobs-forecast/index.ts
```

### Environment Variables Required

- `OPENAI_API_KEY`: OpenAI API key for AI predictions
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Features in Detail

### Automatic Forecast Generation

When the component receives trend data via props, it automatically triggers a forecast generation:

```tsx
useEffect(() => {
  if (trend?.length) {
    void fetchForecast();
  }
}, [trend]);
```

### Loading State

While the forecast is being generated, a skeleton loader is displayed:

```tsx
{loading ? (
  <Skeleton className="h-32 w-full" />
) : (
  // ... forecast content
)}
```

### Error Handling

The component gracefully handles errors and displays user-friendly messages:

```tsx
if (error) {
  console.error("Error fetching forecast:", error);
  setForecast("Erro ao buscar previsão. Tente novamente.");
}
```

## Testing

Comprehensive tests are available at:

```
/src/tests/jobs-forecast-report.test.tsx
```

Run tests with:

```bash
npm test -- jobs-forecast-report.test.tsx
```

### Test Coverage

- ✅ Component rendering
- ✅ Generate button display
- ✅ Loading state
- ✅ Forecast display
- ✅ Error handling
- ✅ Manual forecast generation
- ✅ Automatic forecast trigger
- ✅ Empty trend array handling

## Styling

The component uses:

- **Card**: Primary container with padding
- **CardContent**: Content wrapper
- **Button**: For manual forecast generation
- **Skeleton**: Loading placeholder
- **Prose**: For formatted forecast text display

## Dependencies

- `react`: Core React library
- `@/components/ui/card`: Card UI components
- `@/components/ui/button`: Button component
- `@/components/ui/skeleton`: Skeleton loader
- `@/integrations/supabase/client`: Supabase client

## Best Practices

1. **Always provide trend data**: For meaningful forecasts, provide historical trend data
2. **Handle loading states**: The component shows a skeleton during API calls
3. **Monitor API usage**: OpenAI API calls have costs; use caching when appropriate
4. **Error feedback**: Users receive clear error messages if forecast generation fails

## Example Integration in BI Dashboard

```tsx
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import DashboardJobs from "@/components/bi/DashboardJobs";

function BIDashboard() {
  const [jobsTrend, setJobsTrend] = useState([]);

  useEffect(() => {
    // Fetch jobs trend data from your API
    fetchJobsTrend().then(setJobsTrend);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardJobs />
      <JobsForecastReport trend={jobsTrend} />
    </div>
  );
}
```

## Performance Considerations

- The component uses `useEffect` with proper dependency arrays to prevent unnecessary re-renders
- API calls are debounced through the `useEffect` dependency on `trend`
- Loading states prevent multiple simultaneous API calls

## Future Enhancements

Potential improvements for the component:

- 📊 Visual charts for forecast data
- 📅 Customizable forecast periods (1, 3, 6 months)
- 💾 Local caching of forecasts
- 🔄 Refresh button for forecast updates
- 📤 Export forecast as PDF or CSV
- 🔔 Alert notifications for critical forecasts

## Support

For issues or questions, refer to:

- Component code: `/src/components/bi/JobsForecastReport.tsx`
- Edge function: `/supabase/functions/bi-jobs-forecast/index.ts`
- Tests: `/src/tests/jobs-forecast-report.test.tsx`
