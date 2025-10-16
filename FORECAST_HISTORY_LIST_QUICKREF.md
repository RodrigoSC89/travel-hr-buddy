# ForecastHistoryList - Quick Reference 🚀

## 📦 Component Usage

```tsx
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

// Simple usage
<ForecastHistoryList />

// In a Card
<Card>
  <CardContent className="pt-6">
    <ForecastHistoryList />
  </CardContent>
</Card>
```

## 🔌 API Endpoints

### Get All Forecasts
```bash
GET /api/forecast/list
```

### Filter by Source
```bash
GET /api/forecast/list?source=jobs-trend
```

### Filter by Creator
```bash
GET /api/forecast/list?created_by=admin
```

### Filter by Date
```bash
GET /api/forecast/list?created_at=2025-10-16
```

### Multiple Filters
```bash
GET /api/forecast/list?source=jobs&created_by=AI&created_at=2025-10-15
```

## 🗄️ Database

### Table Schema
```sql
CREATE TABLE forecast_history (
  id BIGSERIAL PRIMARY KEY,
  forecast_summary TEXT NOT NULL,
  source TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Insert Data
```sql
INSERT INTO forecast_history (forecast_summary, source, created_by)
VALUES ('Your forecast text', 'jobs-trend', 'AI System');
```

### Query Examples
```sql
-- All forecasts
SELECT * FROM forecast_history ORDER BY created_at DESC;

-- Filter by source
SELECT * FROM forecast_history 
WHERE source ILIKE '%jobs%' 
ORDER BY created_at DESC;

-- Filter by date
SELECT * FROM forecast_history 
WHERE created_at::date = '2025-10-16' 
ORDER BY created_at DESC;
```

## 🧪 Testing

### Run Tests
```bash
# Component tests
npm test src/tests/forecast-history-list.test.ts

# API tests
npm test src/tests/forecast-list-api.test.ts

# All tests
npm test
```

### Test Results
- ✅ 17 component tests passing
- ✅ 22 API tests passing
- ✅ Total: 39 tests

## 📁 File Locations

```
pages/api/forecast/list.ts          ← API endpoint
src/components/bi/
  ├── ForecastHistoryList.tsx       ← Component
  └── index.ts                      ← Export
src/pages/MmiBI.tsx                 ← Integration example
src/tests/
  ├── forecast-history-list.test.ts ← Component tests
  └── forecast-list-api.test.ts     ← API tests
supabase/migrations/
  ├── 20251016000000_create_forecast_history.sql
  └── 20251016000001_insert_sample_forecast_data.sql
```

## 🎨 Key Features

| Feature | Description |
|---------|-------------|
| **Real-time Filtering** | Updates as you type |
| **Case-Insensitive** | Search ignores case |
| **Date Matching** | Full day range |
| **Loading States** | Shows progress |
| **Empty States** | Helpful messages |
| **Responsive** | Works on all screens |
| **Performance** | Indexed queries |
| **Secure** | RLS enabled |

## 🔍 Filter Behavior

### Text Filters (Source & Created By)
- Case-insensitive
- Partial matching
- Uses ILIKE pattern: `%{input}%`
- Empty = no filter applied

### Date Filter
- Full day matching (00:00:00 to 23:59:59)
- Format: YYYY-MM-DD
- Empty = no filter applied
- Converts to ISO date range

## 🛠️ Common Tasks

### Add New Forecast
```typescript
// In your code
const newForecast = {
  forecast_summary: "Your forecast text...",
  source: "jobs-trend",
  created_by: "AI System"
};

await supabase
  .from('forecast_history')
  .insert(newForecast);
```

### Custom Filter Logic
```typescript
// Modify pages/api/forecast/list.ts
if (custom_param) {
  query = query.eq('field', custom_param);
}
```

### Styling Customization
```typescript
// Modify src/components/bi/ForecastHistoryList.tsx
className="your-custom-classes"
```

## 📊 Sample Data

5 sample forecasts included:
1. Jobs-trend forecast (AI System)
2. Manual analysis (João Silva)
3. Weekly forecast (AI System)
4. Quarterly report (Maria Santos)
5. Capacity alert (AI System)

## 🔒 Security

- **RLS Enabled**: Row Level Security
- **Public Read**: Anyone can view forecasts
- **Auth Write**: Only authenticated users can insert
- **Input Validation**: All parameters validated

## 🚀 Performance

- **3 Database Indexes**: Fast lookups
- **Server-side Filtering**: Efficient queries
- **Sorted Results**: Database-level sorting
- **Minimal Payload**: Only necessary fields

## 🐛 Troubleshooting

### No Results Shown
1. Check database connection
2. Verify table exists
3. Check RLS policies
4. Verify sample data inserted

### Filters Not Working
1. Check API endpoint is accessible
2. Verify query parameters in network tab
3. Check database indexes exist
4. Test API directly with curl

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Test Failures
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test src/tests/forecast-history-list.test.ts
```

## 📚 Documentation

- `FORECAST_HISTORY_LIST_IMPLEMENTATION.md` - Detailed guide
- `FORECAST_HISTORY_LIST_VISUAL_SUMMARY.md` - Visual diagrams
- This file - Quick reference

## 🎯 Next Steps

Potential enhancements:
- [ ] Add pagination
- [ ] Export to CSV/PDF
- [ ] Date range picker
- [ ] Multiple sources filter
- [ ] Sorting options
- [ ] Forecast comparison
- [ ] Analytics dashboard

## 💡 Tips

1. **Use descriptive sources**: Makes filtering easier
2. **Include timestamps**: For accurate tracking
3. **Format forecasts**: Use line breaks for readability
4. **Test filters**: Verify results match expectations
5. **Monitor performance**: Check query times with indexes

## 🔗 Related Components

- `DashboardJobs` - Job distribution
- `JobsTrendChart` - Trend visualization
- `JobsForecastReport` - AI forecast generation

## ✨ Key Advantages

- **Zero Configuration**: Works out of the box
- **Sample Data Included**: Ready for testing
- **Fully Tested**: 39 passing tests
- **Type Safe**: TypeScript interfaces
- **Documented**: Comprehensive guides
- **Integrated**: Already in MmiBI page
- **Performant**: Database optimized
- **Secure**: RLS policies applied
