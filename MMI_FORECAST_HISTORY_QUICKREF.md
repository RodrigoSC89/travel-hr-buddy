# MMI Forecast History - Quick Reference Guide

## 🚀 Quick Start

### Access the Features

1. **Forecast History**
   - URL: `/admin/mmi/forecast/history`
   - View all saved forecasts with detailed information
   - Click "📄 Gerar OS" to simulate work order generation

2. **BI Dashboard**
   - URL: `/admin/bi/forecasts`
   - View bar chart of forecasts grouped by system
   - Analyze distribution across different systems

### How to Generate a Forecast

1. Navigate to the MMI component page
2. Select a component to analyze
3. Click "Gerar Forecast com GPT-4"
4. Wait for AI to generate the forecast
5. **Automatic**: Forecast is saved to database
6. View in history at `/admin/mmi/forecast/history`

---

## 📋 API Reference

### GET /api/mmi/forecast/all

Fetch all forecasts from the database.

**Response:**
```typescript
Array<{
  id: string
  vessel_name: string
  system_name: string
  hourmeter: number
  last_maintenance: string[]
  forecast_text: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
}>
```

**Example Usage:**
```typescript
fetch('/api/mmi/forecast/all')
  .then(res => res.json())
  .then(forecasts => console.log(forecasts))
```

---

## 🗄️ Database Schema

### Table: `mmi_forecasts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `vessel_id` | UUID | Reference to vessels table |
| `vessel_name` | TEXT | Name of the vessel |
| `system_name` | TEXT | Name of the system |
| `hourmeter` | NUMERIC | Current hours |
| `last_maintenance` | JSONB | Array of maintenance dates |
| `forecast_text` | TEXT | Formatted forecast text |
| `priority` | TEXT | low, medium, high, or critical |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Security:**
- ✅ RLS enabled
- ✅ Authenticated users can read/write

**Indexes:**
- `vessel_id` - Fast vessel lookup
- `system_name` - Fast system filtering
- `created_at` - Fast sorting by date

---

## 💻 Component Usage

### ForecastGenerator

```tsx
import ForecastGenerator from '@/components/mmi/ForecastGenerator'

<ForecastGenerator
  component={mmiComponent}
  systemName="Sistema Hidráulico"
  vesselId="uuid-here"
  vesselName="FPSO Alpha"  // NEW: Required for saving
  maintenanceHistory={history}
  onForecastGenerated={() => console.log('Done!')}
/>
```

**Changes:**
- Added `vesselName` prop (optional but recommended)
- Automatically saves forecast after generation
- Shows toast notification on save

---

## 🔧 Service Functions

### saveForecast()

```typescript
import { saveForecast } from '@/services/mmi/forecastStorageService'

await saveForecast({
  vessel_id: 'uuid',
  vessel_name: 'FPSO Alpha',
  system_name: 'Sistema Hidráulico',
  hourmeter: 850,
  last_maintenance: ['12/04/2025', '20/06/2025'],
  forecast_text: 'Formatted forecast...',
  priority: 'medium'
})
```

### formatForecastText()

```typescript
import { formatForecastText } from '@/services/mmi/forecastStorageService'

const text = formatForecastText(aiForecast)
// Returns formatted text with emojis and structure
```

---

## 🎨 UI Components

### Forecast History Card

```tsx
<Card>
  <CardContent className="space-y-2 p-4">
    <div>🚢 Embarcação: {vessel_name}</div>
    <div>⚙️ Sistema: {system_name}</div>
    <div>⏱ Horímetro: {hourmeter}h</div>
    <div>📅 Manutenções: {last_maintenance.join(', ')}</div>
    <div className="forecast-text">
      {forecast_text}
    </div>
    <Button onClick={...}>📄 Gerar OS</Button>
  </CardContent>
</Card>
```

### BI Chart

```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="total" fill="#0ea5e9" />
  </BarChart>
</ResponsiveContainer>
```

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Specific test
npm test src/tests/mmi-forecast-all-api.test.ts
```

### Test Coverage

- ✅ API response structure
- ✅ Forecast object validation
- ✅ Priority values
- ✅ Array formatting
- ✅ Date sorting
- ✅ Empty states

---

## 🔍 Troubleshooting

### Forecast not saving?

1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies are enabled
4. Ensure user is authenticated

### Chart not showing data?

1. Verify API endpoint is accessible: `/api/mmi/forecast/all`
2. Check browser network tab for API response
3. Ensure at least one forecast exists in database
4. Check console for JavaScript errors

### "Gerar OS" button not working?

This is expected! The button is a mock implementation.
It should show an alert: "📦 Ordem de serviço gerada com base neste forecast!"

Future implementation will create actual work orders.

---

## 📊 Database Queries

### Get all forecasts by system

```sql
SELECT * FROM mmi_forecasts 
WHERE system_name = 'Sistema Hidráulico'
ORDER BY created_at DESC;
```

### Get forecasts by priority

```sql
SELECT * FROM mmi_forecasts 
WHERE priority = 'critical'
ORDER BY created_at DESC;
```

### Count forecasts per system

```sql
SELECT system_name, COUNT(*) as total
FROM mmi_forecasts
GROUP BY system_name
ORDER BY total DESC;
```

### Recent forecasts (last 7 days)

```sql
SELECT * FROM mmi_forecasts 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 🔐 Security

### RLS Policies

- ✅ `SELECT`: All authenticated users
- ✅ `INSERT`: All authenticated users  
- ✅ `UPDATE`: All authenticated users
- ✅ `DELETE`: All authenticated users

### Best Practices

- Always use authenticated requests
- Validate data on client side before API calls
- Use environment variables for sensitive config
- Keep service role key secret (server-side only)

---

## 📝 Code Examples

### React Hook for Forecasts

```typescript
import { useEffect, useState } from 'react'

function useForecastHistory() {
  const [forecasts, setForecasts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mmi/forecast/all')
      .then(res => res.json())
      .then(setForecasts)
      .finally(() => setLoading(false))
  }, [])

  return { forecasts, loading }
}
```

### Filter Forecasts by System

```typescript
const filterBySystem = (forecasts, systemName) => {
  return forecasts.filter(f => f.system_name === systemName)
}
```

### Group by Priority

```typescript
const groupByPriority = (forecasts) => {
  return forecasts.reduce((acc, f) => {
    acc[f.priority] = acc[f.priority] || []
    acc[f.priority].push(f)
    return acc
  }, {})
}
```

---

## 📚 Related Documentation

- [Main Implementation Guide](./MMI_FORECAST_HISTORY_IMPLEMENTATION.md)
- [Visual Summary](./MMI_FORECAST_HISTORY_VISUAL_SUMMARY.md)
- [Test Suite](./src/tests/mmi-forecast-all-api.test.ts)
- [API Route](./pages/api/mmi/forecast/all.ts)
- [Database Migration](./supabase/migrations/20251019170000_create_mmi_forecasts.sql)

---

## 🆘 Support

For issues or questions:

1. Check this quick reference first
2. Review the main implementation guide
3. Check the test suite for examples
4. Review inline code comments
5. Contact the development team

---

**Last Updated:** October 19, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
