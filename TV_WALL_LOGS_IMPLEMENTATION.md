# TV Wall Restore Logs - Implementation Guide

## 📺 Overview

The TV Wall Restore Logs page is a real-time dashboard designed for display on corporate TV screens and monitors. It provides an at-a-glance view of document restoration activity with auto-refreshing charts optimized for visibility from a distance.

## 🎯 Features

### Real-Time Updates
- **Auto-refresh**: Data updates every 60 seconds automatically
- **Live timestamp**: Shows last update time
- **Total counter**: Displays total number of restores

### Visualizations
1. **Bar Chart** - Restore count by day (last 15 days)
   - Shows daily restoration trends
   - X-axis: Dates in DD/MM format
   - Y-axis: Number of restores
   - Color: Cyan (#22d3ee)

2. **Pie Chart** - Distribution by status
   - Success (Green: #4ade80)
   - Warning (Yellow: #facc15)
   - Error (Red: #f87171)
   - Includes legend for easy identification

### Display Optimization
- **Dark theme**: Black background for reduced eye strain
- **Large text**: 4xl title, xl subtitles for readability
- **High contrast**: White text on black background
- **Fullscreen mode**: No navigation, optimized for display
- **Responsive design**: Works on various screen sizes

## 🔧 Technical Implementation

### Frontend Component
**Location**: `/src/pages/tv/TVWallLogs.tsx`

**Key Features**:
- Uses Recharts library for visualizations
- Implements useEffect for auto-refresh
- Error handling with user-friendly messages
- TypeScript types for data safety

**Route**: `/tv/logs`
- Outside SmartLayout for clean fullscreen rendering
- No authentication required (can be configured)

### Backend API Endpoint
**Location**: `/supabase/functions/restore-logs-summary/index.ts`

**Endpoint**: `GET /functions/v1/restore-logs-summary`

**Response Format**:
```json
{
  "success": true,
  "data": {
    "byDay": [
      { "day": "01/10", "count": 5 },
      { "day": "02/10", "count": 3 }
    ],
    "byStatus": [
      { "name": "Success", "value": 10 },
      { "name": "Warning", "value": 2 },
      { "name": "Error", "value": 1 }
    ],
    "total": 13,
    "lastUpdated": "2025-10-11T22:00:00.000Z"
  }
}
```

**Data Processing**:
- Queries last 15 days from `document_restore_logs` table
- Groups data by day for bar chart
- Calculates status distribution for pie chart
- Handles missing days by filling with zero counts

## 📊 Database Schema

**Table**: `document_restore_logs`

```sql
CREATE TABLE public.document_restore_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  version_id UUID REFERENCES document_versions(id),
  restored_by UUID REFERENCES auth.users(id),
  restored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `idx_document_restore_logs_restored_at` - For efficient date filtering
- `idx_document_restore_logs_document_id` - For document lookups
- `idx_document_restore_logs_restored_by` - For user statistics

## 🚀 Deployment

### Edge Function Deployment
```bash
# Deploy the edge function to Supabase
supabase functions deploy restore-logs-summary
```

### Environment Variables
Required in Supabase:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

Required in Frontend:
- `VITE_SUPABASE_URL` - Your Supabase project URL

## 📱 Usage

### Accessing the TV Wall
1. Navigate to `/tv/logs` in your browser
2. For TV display, use fullscreen mode (F11)
3. The page will auto-refresh every 60 seconds

### Best Practices
1. **Screen Resolution**: Optimize for 1920x1080 or higher
2. **Browser**: Use Chrome or Firefox in kiosk mode
3. **Network**: Ensure stable internet connection for data updates
4. **Positioning**: Place TV where team can easily view it

### Kiosk Mode Setup (Optional)
```bash
# Chrome on Linux
chromium-browser --kiosk --app=https://yourapp.com/tv/logs

# Chrome on Windows
chrome.exe --kiosk --app=https://yourapp.com/tv/logs

# Firefox
firefox --kiosk https://yourapp.com/tv/logs
```

## 🧪 Testing

**Test File**: `/src/tests/pages/tv/TVWallLogs.test.tsx`

**Test Coverage**:
- ✅ Renders page title correctly
- ✅ Displays total count from API
- ✅ Shows chart titles
- ✅ Displays auto-refresh message
- ✅ Handles fetch errors gracefully
- ✅ Shows "no data" message when empty

**Run Tests**:
```bash
npm test -- src/tests/pages/tv/TVWallLogs.test.tsx
```

## 🔐 Security Considerations

### Current Implementation
- Edge function uses service role key (unrestricted access)
- Frontend page is publicly accessible
- No sensitive data exposed (only counts and dates)

### Recommended Enhancements
1. **Authentication**: Add optional auth check in component
2. **RLS Policies**: Consider row-level security if needed
3. **Rate Limiting**: Implement on edge function
4. **CORS**: Configure specific allowed origins

## 🎨 Customization

### Colors
Modify the `COLORS` array in `TVWallLogs.tsx`:
```typescript
const COLORS = ["#4ade80", "#facc15", "#f87171"];
// Success: Green, Warning: Yellow, Error: Red
```

### Refresh Interval
Change the interval in the useEffect:
```typescript
const interval = setInterval(fetchData, 60000); // 60 seconds
```

### Date Range
Modify the edge function to fetch different time ranges:
```typescript
fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15); // Change 15 to desired days
```

## 📈 Future Enhancements

### Potential Features
1. **Status Field**: Add actual status tracking to database
2. **User Filters**: Filter by user or department
3. **Animations**: Smooth transitions for data updates
4. **Sound Alerts**: Audio notifications for errors
5. **Multi-view**: Cycle between different dashboards
6. **Export**: Screenshot or PDF export capability
7. **Comparison**: Compare with previous period

### Database Enhancements
```sql
-- Add status column to track actual restore status
ALTER TABLE document_restore_logs 
ADD COLUMN status VARCHAR(20) DEFAULT 'success' 
CHECK (status IN ('success', 'warning', 'error'));

-- Add reason for failures
ALTER TABLE document_restore_logs 
ADD COLUMN error_message TEXT;
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: "VITE_SUPABASE_URL not configured"
- **Solution**: Add `VITE_SUPABASE_URL` to your `.env` file

**Issue**: No data showing
- **Solution**: Check database has records in `document_restore_logs` table

**Issue**: Charts not rendering
- **Solution**: Verify Recharts is installed: `npm install recharts`

**Issue**: Edge function timeout
- **Solution**: Check Supabase function logs and database performance

**Issue**: Stale data
- **Solution**: Clear browser cache or check auto-refresh is working

## 📞 Support

For issues or questions:
1. Check Supabase function logs
2. Check browser console for errors
3. Verify database connectivity
4. Review test suite results

## 🔗 Related Documentation

- [RESTORE_DASHBOARD_IMPLEMENTATION.md](./RESTORE_DASHBOARD_IMPLEMENTATION.md)
- [DAILY_RESTORE_REPORT_SUMMARY.md](./DAILY_RESTORE_REPORT_SUMMARY.md)
- [RESTORE_LOGS_IMPLEMENTATION_SUMMARY.md](./RESTORE_LOGS_IMPLEMENTATION_SUMMARY.md)

## ✅ Implementation Checklist

- [x] Created edge function for data aggregation
- [x] Built TV Wall page component
- [x] Added route configuration
- [x] Implemented auto-refresh mechanism
- [x] Added error handling
- [x] Created comprehensive tests
- [x] Optimized for TV display
- [x] Documented implementation

---

**Version**: 1.0  
**Last Updated**: October 11, 2025  
**Author**: GitHub Copilot  
**Status**: ✅ Production Ready
