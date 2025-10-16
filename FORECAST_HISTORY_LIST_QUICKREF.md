# ForecastHistoryList - Quick Reference

## Component Usage

```typescript
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// In your component
<ForecastHistoryList />
```

## API Endpoint

**Base URL:** `/api/forecast/list`

**Method:** GET

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `source` | string | Filter by source (partial match, case-insensitive) | `jobs-trend` |
| `created_by` | string | Filter by creator (partial match, case-insensitive) | `AI` |
| `created_at` | string | Filter by date (YYYY-MM-DD, matches full day) | `2025-10-15` |

### Example Requests

```bash
# Get all forecasts
curl http://localhost:5173/api/forecast/list

# Filter by source
curl http://localhost:5173/api/forecast/list?source=jobs-trend

# Filter by creator
curl http://localhost:5173/api/forecast/list?created_by=AI

# Filter by date
curl http://localhost:5173/api/forecast/list?created_at=2025-10-15

# Multiple filters
curl http://localhost:5173/api/forecast/list?source=jobs&created_by=AI&created_at=2025-10-15
```

### Response Format

**Success (200):**
```json
[
  {
    "id": 1,
    "forecast_summary": "Análise preditiva...",
    "source": "jobs-trend",
    "created_by": "AI Assistant",
    "created_at": "2025-10-15T10:30:00Z"
  }
]
```

**Error (500):**
```json
{
  "error": "Erro ao carregar previsões."
}
```

## Database Schema

**Table:** `forecast_history`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `forecast_summary` | TEXT | NOT NULL |
| `source` | TEXT | NOT NULL |
| `created_by` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

**Indexes:**
- `idx_forecast_history_source` on `source`
- `idx_forecast_history_created_by` on `created_by`
- `idx_forecast_history_created_at` on `created_at DESC`

**RLS Policies:**
- Public read access (SELECT)
- Authenticated write access (INSERT)

## Component Props

The component takes no props and manages its own state internally.

## Component Features

✅ **Real-time filtering** - Updates automatically as users type
✅ **Three filter types** - Source, Creator, Date
✅ **Loading state** - Shows "Carregando previsões..."
✅ **Empty state** - Shows "Nenhuma previsão encontrada..."
✅ **Responsive design** - Cards with proper spacing and shadows
✅ **Error handling** - Gracefully handles fetch errors

## Files

```
src/components/bi/ForecastHistoryList.tsx         # Component
pages/api/forecast/list.ts                        # API endpoint
src/tests/forecast-history-list.test.tsx          # Component tests
src/tests/forecast-list-api.test.ts               # API tests
supabase/migrations/20251016000000_...sql         # Table schema
supabase/migrations/20251016000001_...sql         # Sample data
```

## Testing

**Component Tests:** 17 tests
**API Tests:** 42 original + 41 filter tests = 83 total
**Status:** ✅ All passing

Run tests:
```bash
npm test
```

## Build & Lint

```bash
# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## Integration Example

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { ForecastHistoryList } from "@/components/bi";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <Card>
        <CardContent>
          <ForecastHistoryList />
        </CardContent>
      </Card>
    </div>
  );
}
```

## Filter Behavior

### Text Filters (Source & Created By)
- **Case-insensitive:** "AI" matches "ai", "AI", "Ai"
- **Partial matching:** "job" matches "jobs-trend", "job-analysis"
- **Empty value:** Shows all results (no filter applied)

### Date Filter
- **Format:** YYYY-MM-DD (HTML5 date input)
- **Matches full day:** 00:00:00 to 23:59:59.999
- **Empty value:** Shows all results (no filter applied)

### Combined Filters
All filters can be used simultaneously:
- Filters are applied with AND logic
- Results must match all active filters

## Performance Tips

1. **Database indexes** ensure fast filtering
2. **Server-side filtering** handles large datasets efficiently
3. **25 record limit** prevents overwhelming the UI
4. **Minimal data** returned (only necessary fields)

## Sample Data

The migration includes 5 sample forecasts:
1. Jobs trend analysis (jobs-trend, AI Assistant)
2. Failure pattern prediction (failure-pattern, AI Assistant)
3. Cost analysis (cost-analysis, System AI)
4. Resource optimization (resource-optimization, AI Assistant)
5. Seasonal analysis (seasonal-analysis, System AI)

## Common Use Cases

1. **View all forecasts:**
   - Leave all filters empty
   
2. **Find forecasts by AI Assistant:**
   - Type "AI Assistant" in Created By filter
   
3. **View forecasts from specific date:**
   - Select date in date picker
   
4. **Filter by source type:**
   - Type "jobs" or "trend" in Source filter

## Troubleshooting

**No data showing:**
- Check database connection
- Verify forecast_history table exists
- Check browser console for errors
- Verify API endpoint is accessible

**Filters not working:**
- Check browser console for fetch errors
- Verify query parameters are being sent
- Check API endpoint logs

**Styling issues:**
- Verify Tailwind CSS is loaded
- Check Card component import

## Support

For issues or questions, refer to:
- Component tests: `src/tests/forecast-history-list.test.tsx`
- API tests: `src/tests/forecast-list-api.test.ts`
- Complete documentation: `FORECAST_HISTORY_LIST_IMPLEMENTATION_COMPLETE.md`
