# ForecastHistoryList Component - Quick Reference

## Overview
Display AI-generated job forecast history in the BI dashboard.

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
- ✅ Automatic data fetching from `/api/forecast/list`
- ✅ Loading state indicator
- ✅ Empty state handling
- ✅ Formatted timestamps
- ✅ Source and creator information
- ✅ Forecast summary preview (200 chars)
- ✅ Card-based responsive design

## API Endpoint
**GET** `/api/forecast/list`

Returns last 25 forecasts ordered by date (newest first).

## Database Schema
Table: `forecast_history`
- `id` - Unique identifier
- `forecast_summary` - Short summary (200 chars)
- `forecast` - Full forecast text
- `source` - Source type (AI/Manual)
- `created_by` - Creator identifier
- `created_at` - Timestamp
- `trend_data` - JSONB trend data

## Testing
19 comprehensive tests covering:
- Component rendering
- Data fetching
- Error handling
- Forecast item display
- UI/UX validation

Run tests:
```bash
npm test forecast-history-list
```

## Integration
Already integrated in `src/pages/MmiBI.tsx` below the forecast report section.

## Deployment
1. Apply database migration: `supabase db push`
2. Deploy code changes
3. Component is live at `/mmi-bi`
