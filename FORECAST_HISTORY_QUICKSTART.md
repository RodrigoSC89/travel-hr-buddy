# Forecast History Panel - Quick Start Guide

## Overview
This guide helps you quickly get started with the new Forecast History Panel feature.

## What's New?
A new component that displays historical forecast data with real-time filtering capabilities, integrated into the MmiBI page.

## Quick Setup (3 Steps)

### Step 1: Apply Database Migrations
Run the migrations to create the `forecast_history` table:

```bash
# Navigate to your project
cd /path/to/travel-hr-buddy

# Apply migrations (using your Supabase setup)
# The migrations will:
# - Create forecast_history table
# - Add indexes for performance
# - Set up Row Level Security
# - Insert 5 sample records
```

Migration files created:
- `supabase/migrations/20251016000000_create_forecast_history.sql`
- `supabase/migrations/20251016000001_insert_sample_forecast_history.sql`

### Step 2: Build & Deploy
The component is already integrated! Just build and deploy:

```bash
npm run build
npm start
```

### Step 3: View the Component
Navigate to the BI page in your application:
```
/mmi-bi
```

Scroll down to see the new **📊 Histórico de Previsões** section.

## Using the Component

### Basic Usage
The component automatically loads and displays forecast history data:

```tsx
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

function MyPage() {
  return <ForecastHistoryList />;
}
```

### Filtering
1. **Filter by Source**: Type in the "Filtrar por fonte..." input
2. **Filter by Creator**: Type in the "Filtrar por criador..." input
3. **Clear Filters**: Delete text from inputs to show all records

### What You'll See
- Forecast cards in chronological order (newest first)
- Source name in blue
- Creation date/time in Portuguese format
- Creator name with emoji (👤)
- Full forecast text

## Sample Data Included

The migration includes 5 sample forecasts:

1. **AI Model - GPT-4** by João Silva - Jobs forecast for December 2025
2. **AI Model - GPT-4** by Maria Santos - Trend analysis
3. **Manual Analysis** by Carlos Mendes - Manual inspection forecast
4. **Data Analytics** by Ana Paula - Predictive analysis
5. **AI Model - Claude** by Sistema Automatizado - ML model prediction

## Testing

All tests are included and passing! To run them:

```bash
# Run all tests
npm test

# Run only ForecastHistoryList tests
npm test src/tests/components/bi/ForecastHistoryList.test.tsx
```

Expected: 15 tests passing for ForecastHistoryList

## API Usage

The component uses the existing `/api/forecast/list` endpoint:

```javascript
// Get all forecasts
GET /api/forecast/list

// Filter by source
GET /api/forecast/list?source=AI

// Filter by creator
GET /api/forecast/list?created_by=João

// Combine filters
GET /api/forecast/list?source=AI&created_by=João
```

## Troubleshooting

### Component Not Showing
**Problem**: Component doesn't appear on MmiBI page
**Solution**: Ensure you've run `npm run build` after pulling changes

### No Data Displayed
**Problem**: "Nenhuma previsão encontrada" message
**Solution**: 
1. Check database migrations were applied
2. Verify sample data was inserted
3. Check browser console for API errors

### Filters Not Working
**Problem**: Typing in filters doesn't change results
**Solution**:
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Try clearing browser cache

### API Errors
**Problem**: "Erro ao carregar previsões" in console
**Solution**:
1. Verify Supabase connection
2. Check RLS policies are enabled
3. Ensure user is authenticated

## Database Schema

Quick reference:

```sql
forecast_history
  - id (BIGSERIAL, Primary Key)
  - forecast_summary (TEXT)
  - source (TEXT)
  - created_by (TEXT)
  - created_at (TIMESTAMPTZ)
```

## Adding New Forecasts

To add new forecasts programmatically:

```javascript
// Using Supabase client
const { data, error } = await supabase
  .from('forecast_history')
  .insert([
    {
      forecast_summary: 'Your forecast text here',
      source: 'AI Model - GPT-4',
      created_by: 'Your Name'
    }
  ]);
```

Or via SQL:

```sql
INSERT INTO forecast_history (forecast_summary, source, created_by)
VALUES (
  'Your forecast text',
  'AI Model - GPT-4',
  'Your Name'
);
```

## Component Features

✅ **Real-time Filtering**: Filter by source or creator
✅ **Automatic Fetching**: Loads data on mount
✅ **Loading States**: Skeleton UI while loading
✅ **Empty States**: Clear message when no data
✅ **Error Handling**: Graceful error recovery
✅ **Responsive**: Works on all screen sizes
✅ **Accessible**: Keyboard navigation supported
✅ **Type-Safe**: Full TypeScript support

## Next Steps

Want to extend the functionality? Consider:

1. **Pagination**: Add support for more than 25 results
2. **Date Range**: Filter by creation date range
3. **Export**: Add CSV/PDF export capability
4. **Search**: Full-text search across all fields
5. **Create UI**: Form to create new forecasts

## Getting Help

- Check implementation docs: `FORECAST_HISTORY_IMPLEMENTATION_COMPLETE.md`
- View visual guide: `FORECAST_HISTORY_VISUAL_SUMMARY.md`
- Review tests: `src/tests/components/bi/ForecastHistoryList.test.tsx`
- Inspect component: `src/components/bi/ForecastHistoryList.tsx`

## Summary

The Forecast History Panel is ready to use! It's:
- ✅ Fully tested (15 tests passing)
- ✅ Production-ready
- ✅ Documented
- ✅ Integrated into MmiBI page
- ✅ Includes sample data

Just apply the migrations and start using it! 🚀
