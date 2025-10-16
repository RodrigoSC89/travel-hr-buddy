# ForecastHistoryList Component - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

The ForecastHistoryList component displays a historical list of AI-generated job forecasts in the BI dashboard. It provides users with visibility into past forecast predictions, helping track AI performance and forecast trends over time.

### Features
- ✅ Automatic data fetching from API
- ✅ Loading state display
- ✅ Empty state handling
- ✅ Formatted timestamps
- ✅ Source and creator information
- ✅ Forecast summary (first 200 characters)
- ✅ Responsive design
- ✅ Error handling
- ✅ Type-safe TypeScript implementation

## Installation

### 1. Apply Database Migration

Run the migration to create the `ai_jobs_forecasts` table:

```sql
-- Located at: supabase/migrations/20251016000000_create_ai_jobs_forecasts.sql
-- Apply via Supabase CLI:
supabase db push
```

### 2. Import the Component

```tsx
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';
```

## Usage

### Basic Usage

```tsx
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';

export default function BIDashboard() {
  return (
    <div className="p-4">
      <ForecastHistoryList />
    </div>
  );
}
```

### With Card Wrapper (Recommended)

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';

export default function BIDashboard() {
  return (
    <div className="p-4">
      <Card>
        <CardContent>
          <ForecastHistoryList />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Complete Example (MmiBI Page)

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

export default function MmiBI() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <h1 className="text-2xl font-bold">🔍 BI - Efetividade da IA na Manutenção</h1>
      
      <DashboardJobs />
      <JobsTrendChart />
      
      {/* ForecastHistoryList Component */}
      <Card>
        <CardContent>
          <ForecastHistoryList />
        </CardContent>
      </Card>
    </div>
  );
}
```

## API Reference

### Component Props
The ForecastHistoryList component accepts no props. All configuration is handled internally.

### API Endpoint

**Endpoint:** `GET /api/forecast/list`

**Response Format:**
```typescript
interface ForecastItem {
  id: number;
  forecast_summary: string;
  source: string;
  created_by: string;
  created_at: string;
}

type ForecastListResponse = ForecastItem[];
```

**Example Response:**
```json
[
  {
    "id": 1,
    "forecast_summary": "📊 Previsão quantitativa de jobs para os próximos 2 meses: esperado aumento de 15% nos jobs de manutenção preventiva. 📈 Tendência de crescimento estável com foco em sistemas hidráulicos...",
    "source": "AI",
    "created_by": "system",
    "created_at": "2025-10-16T00:00:00Z"
  },
  {
    "id": 2,
    "forecast_summary": "Com base nos dados históricos, prevemos um aumento significativo de jobs relacionados ao sistema hidráulico nos próximos meses. Recomendações: intensificar manutenção preventiva...",
    "source": "AI",
    "created_by": "system",
    "created_at": "2025-10-15T15:45:00Z"
  }
]
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Database Schema

### ai_jobs_forecasts Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `forecast_summary` | TEXT | First 200 characters of forecast |
| `forecast` | TEXT | Full forecast text |
| `source` | TEXT | Source type (default: 'AI') |
| `created_by` | TEXT | Creator identifier |
| `created_at` | TIMESTAMPTZ | Timestamp (default: NOW()) |
| `trend_data` | JSONB | Trend data used for forecast |

### Indexes
- `idx_ai_jobs_forecasts_created_at` on `created_at DESC` for faster queries

### Row Level Security
- Authenticated users can read forecasts
- Authenticated users can insert forecasts

### Example Query

```sql
SELECT id, forecast_summary, source, created_by, created_at
FROM ai_jobs_forecasts
ORDER BY created_at DESC
LIMIT 50;
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run ForecastHistoryList tests only
npm test src/tests/ForecastHistoryList.test.tsx

# Run tests with coverage
npm test:coverage
```

### Test Coverage

The component includes 8 comprehensive tests:

1. ✅ Loading state rendering
2. ✅ Empty state display
3. ✅ Forecast list rendering
4. ✅ API endpoint calling
5. ✅ Multiple forecast items
6. ✅ API error handling
7. ✅ Component title display
8. ✅ Date formatting

### Test Example

```typescript
it("should render forecast list when data is available", async () => {
  const mockData = [
    {
      id: 1,
      forecast_summary: "Test forecast summary",
      source: "AI",
      created_by: "system",
      created_at: "2025-10-16T00:00:00Z",
    },
  ];

  (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    json: async () => mockData,
  });

  render(<ForecastHistoryList />);
  
  await waitFor(() => {
    expect(screen.getByText(/Test forecast summary/i)).toBeDefined();
    expect(screen.getByText(/AI/i)).toBeDefined();
    expect(screen.getByText(/system/i)).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

#### 1. "Carregando previsões..." never disappears

**Cause:** API endpoint not responding or network error

**Solution:**
- Check if `/api/forecast/list` endpoint is accessible
- Verify Supabase environment variables are set
- Check browser console for network errors

#### 2. Empty state always shows despite having forecasts

**Cause:** Database table doesn't exist or no data

**Solution:**
- Apply the database migration: `supabase db push`
- Verify forecasts are being saved by the bi-jobs-forecast function
- Check Supabase logs for errors

#### 3. Dates not formatting correctly

**Cause:** Invalid date format or timezone issues

**Solution:**
- Ensure `created_at` is in ISO 8601 format
- The component uses `toLocaleString()` which formats based on user's locale
- Check browser console for date parsing errors

#### 4. API returns 500 error

**Cause:** Missing environment variables or database connection issues

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- Verify `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Check Supabase dashboard for table existence
- Review API logs for specific error messages

### Debug Mode

To enable debug logging, modify the component:

```tsx
useEffect(() => {
  console.log('Fetching forecasts...');
  fetch('/api/forecast/list')
    .then(res => {
      console.log('Response status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('Forecasts loaded:', data);
      setItems(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error loading forecasts:', err);
      setItems([]);
      setLoading(false);
    });
}, []);
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks Guide](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review test cases in `src/tests/ForecastHistoryList.test.tsx`
3. Consult the [Implementation Summary](IMPLEMENTATION_SUMMARY_FORECAST_HISTORY.md)
