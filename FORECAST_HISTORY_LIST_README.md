# ForecastHistoryList Component - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Component API](#component-api)
5. [Database Schema](#database-schema)
6. [API Endpoint](#api-endpoint)
7. [Testing](#testing)
8. [Styling](#styling)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

## Overview

The `ForecastHistoryList` component displays a historical list of AI-generated job forecasts in the BI dashboard. It provides users with visibility into past forecast predictions, helping track AI performance and forecast trends over time.

### Key Features
- ✅ Automatic data fetching from API
- ✅ Loading state with user feedback
- ✅ Empty state handling
- ✅ Formatted timestamps in user's locale
- ✅ Source and creator information display
- ✅ Forecast summary preview (200 characters)
- ✅ Card-based responsive design
- ✅ Error handling with graceful degradation
- ✅ Hover effects for better UX

## Installation

### Prerequisites
- React 18+
- TypeScript
- Tailwind CSS
- Supabase client configured
- Next.js API routes (for API endpoint)

### Database Migration

Apply the database migration to create the `forecast_history` table:

```bash
supabase db push
```

Or manually run the migration SQL:

```sql
-- See: supabase/migrations/20251016025354_create_forecast_history.sql
```

## Usage

### Basic Usage

```tsx
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';

export default function BIDashboard() {
  return (
    <div className="p-4">
      <h1>BI Dashboard</h1>
      <ForecastHistoryList />
    </div>
  );
}
```

### With Other BI Components

```tsx
import { 
  ForecastHistoryList,
  JobsForecastReport,
  JobsTrendChart 
} from '@/components/bi';

export default function CompleteBIDashboard() {
  const [trendData, setTrendData] = useState([]);
  const [forecastText, setForecastText] = useState("");

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <JobsTrendChart />
      <JobsForecastReport 
        trend={trendData} 
        onForecastUpdate={setForecastText} 
      />
      <ForecastHistoryList />
    </div>
  );
}
```

## Component API

### Props
The `ForecastHistoryList` component accepts no props - it's a fully self-contained component.

### Internal State

```typescript
interface ForecastItem {
  id: number;
  forecast_summary: string;
  source: string;
  created_by: string;
  created_at: string;
}

// Component state
const [items, setItems] = useState<ForecastItem[]>([]);
const [loading, setLoading] = useState(true);
```

### Component States

1. **Loading State**: Shows "Carregando previsões..." while data is being fetched
2. **Empty State**: Shows "Nenhuma previsão registrada ainda." when no forecasts exist
3. **Data State**: Displays list of forecast cards with metadata

## Database Schema

### Table: `forecast_history`

```sql
CREATE TABLE forecast_history (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  forecast TEXT,
  source TEXT DEFAULT 'AI',
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trend_data JSONB
);

-- Index for performance
CREATE INDEX idx_forecast_history_created_at 
  ON forecast_history(created_at DESC);

-- Row Level Security
ALTER TABLE forecast_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read forecasts"
  ON forecast_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert forecasts"
  ON forecast_history FOR INSERT TO authenticated WITH CHECK (true);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-incrementing |
| `forecast_summary` | TEXT | Short summary (200 chars) for display |
| `forecast` | TEXT | Full forecast text from AI |
| `source` | TEXT | Source type: 'AI' or 'Manual' |
| `created_by` | TEXT | Creator identifier (e.g., 'bi-jobs-forecast') |
| `created_at` | TIMESTAMP | When forecast was created |
| `trend_data` | JSONB | Historical trend data used for forecast |

## API Endpoint

### GET `/api/forecast/list`

Returns the last 25 forecasts ordered by date (newest first).

#### Request
```typescript
// No parameters required
fetch('/api/forecast/list')
```

#### Response (Success - 200)
```json
[
  {
    "id": 1,
    "forecast_summary": "Previsão de aumento de 15% nos jobs...",
    "forecast": "Full forecast text here...",
    "source": "AI",
    "created_by": "bi-jobs-forecast",
    "created_at": "2024-01-15T10:30:00Z",
    "trend_data": {...}
  },
  ...
]
```

#### Response (Error - 500)
```json
{
  "error": "Erro ao carregar previsões."
}
```

#### Implementation
```typescript
// File: pages/api/forecast/list.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("forecast_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return res.status(500).json({ 
      error: "Erro ao carregar previsões." 
    });
  }

  return res.status(200).json(data);
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run only ForecastHistoryList tests
npm test forecast-history-list

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Coverage

The component has 19 comprehensive tests covering:

1. **Component Rendering** (3 tests)
   - Loading state display
   - Component title rendering
   - Empty state handling

2. **Data Fetching** (3 tests)
   - API endpoint calls
   - Single forecast display
   - Multiple forecasts display

3. **Error Handling** (2 tests)
   - Graceful error handling
   - Empty state after error

4. **Forecast Item Display** (3 tests)
   - Metadata display
   - Timestamp formatting
   - Source information

5. **Component Structure** (2 tests)
   - Card component wrapper
   - Proper spacing

6. **Integration Tests** (2 tests)
   - MmiBI page integration
   - Rapid re-renders

7. **Data Validation** (2 tests)
   - Required fields validation
   - Item structure validation

8. **UI/UX Tests** (2 tests)
   - Hover styles application
   - Text sizing consistency

### Example Test

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

describe("ForecastHistoryList", () => {
  it("should display forecast items when data is returned", async () => {
    const mockData = [{
      id: 1,
      forecast_summary: "Previsão de aumento...",
      source: "AI",
      created_by: "bi-jobs-forecast",
      created_at: "2024-01-15T10:30:00Z",
    }];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: async () => mockData,
      } as Response)
    ) as typeof fetch;

    render(<ForecastHistoryList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Previsão de aumento/)).toBeInTheDocument();
    });
  });
});
```

## Styling

### Tailwind Classes Used

```tsx
// Card Container
<Card>
  <CardContent className="p-4">
    
    // Title
    <h2 className="text-lg font-semibold mb-4">
      📊 Histórico de Previsões
    </h2>
    
    // Items Container
    <div className="space-y-3">
      
      // Individual Forecast Card
      <div className="border rounded-lg p-3 bg-card hover:bg-accent transition-colors">
        
        // Metadata
        <div className="text-sm text-muted-foreground mb-2">
          {timestamp} — {source} por {creator}
        </div>
        
        // Summary
        <p className="text-sm">{summary}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Custom Styling

If you need to customize the component styling:

```tsx
// Wrap in a custom container
<div className="my-custom-class">
  <ForecastHistoryList />
</div>

// Or override styles globally
.forecast-history-card {
  /* Your custom styles */
}
```

## Examples

### Example 1: Basic Integration

```tsx
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';

export default function SimpleDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ForecastHistoryList />
    </div>
  );
}
```

### Example 2: With Loading Wrapper

```tsx
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';
import { Card } from '@/components/ui/card';

export default function WrappedDashboard() {
  return (
    <div className="p-4">
      <Card>
        <ForecastHistoryList />
      </Card>
    </div>
  );
}
```

### Example 3: In Tabs Layout

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForecastHistoryList } from '@/components/bi/ForecastHistoryList';

export default function TabbedDashboard() {
  return (
    <Tabs defaultValue="history">
      <TabsList>
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="history">
        <ForecastHistoryList />
      </TabsContent>
    </Tabs>
  );
}
```

## Troubleshooting

### Common Issues

#### 1. "Table forecast_history does not exist"

**Solution:** Apply the database migration:
```bash
supabase db push
```

#### 2. "Cannot read property 'json' of undefined"

**Solution:** Ensure the API route `/api/forecast/list` is properly set up and accessible.

#### 3. Empty state always showing

**Solution:** Check that:
- Database has forecast records
- API endpoint is returning data correctly
- No CORS or authentication issues

#### 4. Forecasts not saving

**Solution:** Verify the `bi-jobs-forecast` Supabase function is:
- Updated to save to `forecast_history` table
- Has correct field mappings
- Has proper error handling

#### 5. TypeScript errors

**Solution:** Ensure all interfaces are properly defined:
```typescript
interface ForecastItem {
  id: number;
  forecast_summary: string;
  source: string;
  created_by: string;
  created_at: string;
}
```

### Debug Mode

Add console logging to debug issues:

```tsx
useEffect(() => {
  console.log("Fetching forecasts...");
  fetch("/api/forecast/list")
    .then((res) => {
      console.log("Response:", res);
      return res.json();
    })
    .then((data) => {
      console.log("Data received:", data);
      setItems(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching forecast history:", error);
      setLoading(false);
    });
}, []);
```

### Performance Issues

If the component is slow:

1. **Check Database Indexes:**
   ```sql
   -- Verify index exists
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'forecast_history';
   ```

2. **Reduce Limit:**
   Modify API to return fewer results:
   ```typescript
   .limit(10) // Instead of 25
   ```

3. **Add Pagination:**
   Implement pagination for large datasets (future enhancement)

## Best Practices

1. **Database Management:**
   - Keep forecast_history table optimized
   - Archive old forecasts periodically
   - Monitor table size and performance

2. **Error Handling:**
   - Always provide fallback states
   - Log errors for debugging
   - Show user-friendly error messages

3. **Performance:**
   - Use indexed queries
   - Limit result sets appropriately
   - Consider caching for frequently accessed data

4. **Security:**
   - Keep RLS policies updated
   - Validate user authentication
   - Sanitize inputs in API routes

5. **Testing:**
   - Maintain test coverage above 80%
   - Test edge cases (empty data, errors)
   - Mock external dependencies

## Support

For issues or questions:
1. Check this documentation
2. Review test files for usage examples
3. Check the implementation summary
4. Review the visual guide

## Related Documentation

- [FORECAST_HISTORY_QUICKREF.md](./FORECAST_HISTORY_QUICKREF.md) - Quick reference
- [IMPLEMENTATION_SUMMARY_FORECAST_HISTORY.md](./IMPLEMENTATION_SUMMARY_FORECAST_HISTORY.md) - Implementation details
- [FORECAST_HISTORY_VISUAL_GUIDE.md](./FORECAST_HISTORY_VISUAL_GUIDE.md) - Visual guide and diagrams

## Version History

### v1.0.0 (2024-01-16)
- Initial implementation
- 19 comprehensive tests
- Database schema creation
- API endpoint integration
- Component integration in MmiBI page
- Complete documentation
