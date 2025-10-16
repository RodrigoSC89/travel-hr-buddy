# Forecast History List - Quick Reference

## Overview
The ForecastHistoryList component displays a historical list of AI-generated job forecasts in the BI dashboard.

## Files Created
- `src/components/bi/ForecastHistoryList.tsx` - React component
- `pages/api/forecast/list.ts` - API endpoint
- `supabase/migrations/20251016000000_create_ai_jobs_forecasts.sql` - Database migration
- `src/tests/ForecastHistoryList.test.tsx` - Component tests

## Usage

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

## Features
- ✅ Automatic data fetching from API
- ✅ Loading state display
- ✅ Empty state handling
- ✅ Formatted timestamps
- ✅ Source and creator information
- ✅ Forecast summary (first 200 characters)

## Database Schema
The `ai_jobs_forecasts` table includes:
- `id` - Primary key
- `forecast_summary` - First 200 characters of forecast
- `forecast` - Full forecast text
- `source` - Source type (AI/Manual)
- `created_by` - Creator identifier
- `created_at` - Timestamp
- `trend_data` - JSONB trend data

## API Endpoint
`GET /api/forecast/list`
- Returns last 50 forecasts ordered by date (newest first)
- Includes proper error handling
- Uses server-side Supabase client

## Tests
8 comprehensive tests covering:
- Loading states
- Data display
- API calls
- Error handling
- Empty states
- Multiple items
- Date formatting
