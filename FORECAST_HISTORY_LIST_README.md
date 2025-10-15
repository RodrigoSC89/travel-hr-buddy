# ForecastHistoryList Component

## Overview

The `ForecastHistoryList` component displays a history of AI-generated forecasts for jobs. It fetches forecast data from the backend API and displays them in a user-friendly card layout.

## Features

- ✅ Automatically fetches forecast history on component mount
- ✅ Displays forecast summary, source, creator, and timestamp
- ✅ Shows loading state while fetching data
- ✅ Handles empty state gracefully
- ✅ Responsive design with Tailwind CSS

## Usage

### Basic Import

```typescript
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';
```

### Using in a Component

```tsx
export default function BIDashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">BI Dashboard</h1>
      
      {/* Add the ForecastHistoryList component */}
      <ForecastHistoryList />
    </div>
  );
}
```

### Using in a Card

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';

export default function BIDashboard() {
  return (
    <div className="p-4">
      <Card>
        <CardContent className="pt-6">
          <ForecastHistoryList />
        </CardContent>
      </Card>
    </div>
  );
}
```

## API Endpoint

The component fetches data from `/api/forecast/list` which returns an array of forecast items:

```typescript
interface ForecastItem {
  id: number;
  forecast_summary: string;
  source: string;
  created_by: string;
  created_at: string;
}
```

## Database Schema

The component relies on the `ai_jobs_forecasts` table:

```sql
CREATE TABLE public.ai_jobs_forecasts (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'AI',
  created_by TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  trend_data JSONB,
  forecast TEXT NOT NULL
);
```

## States

### Loading State
Displays "Carregando previsões..." while fetching data.

### Empty State
Displays "Nenhuma previsão registrada ainda." when no forecasts exist.

### Data State
Displays forecast cards with:
- 📅 Date and time
- 🤖 Source (AI/Manual)
- 👤 Creator
- 📝 Forecast summary

## Styling

The component uses Tailwind CSS classes:
- `space-y-4`: Vertical spacing between cards
- `border rounded p-4 bg-slate-50 shadow-sm`: Card styling
- `text-sm text-slate-500`: Metadata text
- `text-sm text-slate-700 whitespace-pre-wrap`: Forecast content

## Testing

Tests are available in `src/tests/forecast-history-list.test.tsx` covering:
- ✅ Component rendering
- ✅ Loading states
- ✅ Empty states
- ✅ Data display
- ✅ API calls
- ✅ Error handling
- ✅ Date formatting

Run tests with:
```bash
npm test -- forecast-history-list.test.tsx
```

## Example Implementation

See `src/pages/MmiBI.tsx` for a complete working example of how the component is integrated into a BI dashboard.

## Migration

To apply the database migration:
```bash
# The migration file is located at:
# supabase/migrations/20251015230000_create_ai_jobs_forecasts.sql
```

## Related Components

- `JobsForecastReport` - Generates new AI forecasts
- `DashboardJobs` - Shows job distribution by component
- `ExportBIReport` - Exports BI reports to PDF
