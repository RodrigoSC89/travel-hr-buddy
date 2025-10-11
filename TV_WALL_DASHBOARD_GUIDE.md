# 📺 TV Wall Dashboard - Real-Time Logs Monitoring

## Overview

The TV Wall Dashboard provides a fullscreen, real-time monitoring view of restore logs, designed to be displayed on office TVs or large monitors for continuous system health monitoring.

## Features

- ✅ **Fullscreen Dark Mode Design**: Optimized for TV displays
- ✅ **Real-Time Updates**: Auto-refreshes every 60 seconds
- ✅ **Interactive Charts**:
  - Bar Chart: Restore count by day
  - Pie Chart: Status distribution
- ✅ **Summary Metrics**: Total restores, unique documents, daily average
- ✅ **No Authentication Required**: Public route for easy TV setup

## Access

### URL
```
https://your-app-url.vercel.app/tv/logs
```

### Direct Access
Simply navigate to `/tv/logs` in any browser to view the dashboard.

## Display Configuration

### Recommended Settings

1. **Display Resolution**: 1920x1080 or higher
2. **Browser**: Chrome or Firefox (for best chart rendering)
3. **Zoom Level**: 100% (adjust as needed for your screen size)
4. **Fullscreen**: Press F11 in browser for fullscreen mode
5. **Auto-Refresh**: Built-in, updates every 60 seconds

### Kiosk Mode Setup

#### Chrome Kiosk Mode
```bash
# Windows
chrome.exe --kiosk "https://your-app-url.vercel.app/tv/logs" --disable-pinch --overscroll-history-navigation=0

# Linux
google-chrome --kiosk "https://your-app-url.vercel.app/tv/logs" --disable-pinch --overscroll-history-navigation=0

# macOS
open -a "Google Chrome" --args --kiosk "https://your-app-url.vercel.app/tv/logs" --disable-pinch --overscroll-history-navigation=0
```

#### Firefox Kiosk Mode
```bash
# Windows
firefox.exe -kiosk "https://your-app-url.vercel.app/tv/logs"

# Linux/macOS
firefox -kiosk "https://your-app-url.vercel.app/tv/logs"
```

## Dashboard Components

### 1. Header Section
- **Title**: "📺 Restore Logs - Real Time"
- **Last Update Time**: Shows when data was last refreshed
- **Auto-refresh indicator**: Confirms 60-second refresh cycle

### 2. Summary Cards
Three metric cards displaying:
- **Total de Restaurações**: Total number of restore operations
- **Documentos Únicos**: Count of unique documents restored
- **Média por Dia**: Average restores per day

### 3. Bar Chart - Restaurações por Dia
- Shows restore count for the last 15 days
- X-axis: Date (formatted as "short month, day")
- Y-axis: Number of restores
- Color: Blue (#3b82f6)

### 4. Pie Chart - Status dos Relatórios
- Shows distribution of report statuses
- Colors:
  - Success: Green (#10b981)
  - Error: Red (#ef4444)
  - Warning: Orange (#f59e0b)
  - Info: Blue (#3b82f6)
- Displays percentage labels

### 5. Footer
- Copyright information
- Dashboard identification

## Data Sources

The dashboard fetches data from:

1. **Restore Count by Day**
   - RPC Function: `get_restore_count_by_day_with_email`
   - Returns: Daily restore counts for last 15 days

2. **Summary Statistics**
   - RPC Function: `get_restore_summary`
   - Returns: Total, unique docs, average per day

3. **Status Distribution**
   - Table: `restore_report_logs`
   - Returns: Status field from last 100 logs

## Technical Details

### Component Path
```
/src/pages/tv/LogsPage.tsx
```

### Route
```typescript
<Route path="/tv/logs" element={<TVWallLogs />} />
```

### Key Libraries
- **recharts**: For chart rendering
- **@supabase/supabase-js**: For real-time data fetching
- **shadcn/ui**: For Card components

### Auto-Refresh Implementation
```typescript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 60000); // 60 seconds
  return () => clearInterval(interval);
}, []);
```

## Styling

### Color Scheme
- **Background**: Black (#000000)
- **Text**: White (#ffffff)
- **Cards**: Dark gray (#1f2937)
- **Borders**: Gray (#374151)
- **Accents**: 
  - Blue: #3b82f6
  - Green: #10b981
  - Purple: #a855f7
  - Orange: #f59e0b

### Responsive Design
- Desktop: 2-column grid for charts
- Mobile/Tablet: Single column layout
- Summary cards: 3 columns on desktop, 1 on mobile

## Use Cases

### 1. Office TV Wall
Display real-time system health on office monitors for team visibility.

### 2. NOC (Network Operations Center)
Monitor restore operations alongside other system metrics.

### 3. Executive Dashboard
Provide management with visual KPIs without login requirements.

### 4. Support Team Monitor
Help support teams track system activity in real-time.

## Customization

### Change Refresh Interval
Edit the interval value in `/src/pages/tv/LogsPage.tsx`:
```typescript
const interval = setInterval(fetchData, 30000); // 30 seconds instead of 60
```

### Change Chart Colors
Modify the COLORS constant:
```typescript
const COLORS = {
  success: "#your-color",
  error: "#your-color",
  warning: "#your-color",
  info: "#your-color",
};
```

### Adjust Chart Height
Change the ResponsiveContainer height prop:
```typescript
<ResponsiveContainer width="100%" height={600}> {/* Default: 400 */}
```

## Troubleshooting

### Dashboard not loading
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure RPC functions exist in database
4. Check network connectivity

### Charts not displaying
1. Verify data is being fetched (check console logs)
2. Ensure recharts library is installed
3. Check for JavaScript errors
4. Try different browser

### Data not updating
1. Check refresh interval is working (watch timestamp)
2. Verify Supabase real-time connection
3. Check RLS policies allow anonymous access (if needed)
4. Review browser console for fetch errors

### Screen size issues
1. Adjust browser zoom level (Ctrl/Cmd + +/-)
2. Use fullscreen mode (F11)
3. Modify CSS for custom screen sizes

## Security Considerations

### Public Access
The `/tv/logs` route is public and doesn't require authentication. This is intentional for TV display purposes.

### Data Exposure
The dashboard only shows:
- Aggregated restore counts
- Report statuses
- No sensitive user data
- No document content

### Recommendations
1. Use on internal networks only
2. Consider IP whitelisting if highly sensitive
3. Don't display sensitive document names
4. Monitor access logs if needed

## Performance

### Optimization
- Data fetching is throttled to 60-second intervals
- Queries limited to last 15 days (charts)
- Status query limited to 100 recent logs
- Minimal re-renders with React hooks

### Expected Load
- ~3 Supabase queries per minute
- Minimal bandwidth usage
- Low CPU/memory footprint

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Firefox | ✅ Full | Recommended |
| Safari | ✅ Full | Works well |
| Edge | ✅ Full | Works well |
| Opera | ✅ Full | Works well |
| IE11 | ❌ None | Not supported |

## Related Documentation

- [Restore Dashboard](/RESTORE_DASHBOARD_ARCHITECTURE.md)
- [Restore Logs Implementation](/RESTORE_LOGS_IMPLEMENTATION_SUMMARY.md)
- [Daily Report Guide](/DAILY_RESTORE_REPORT_CSV_GUIDE.md)

## Screenshots

### Desktop View (1920x1080)
The dashboard displays with:
- Full-width header
- 3-column summary cards
- 2-column chart layout
- Clean dark theme

### Mobile View
Automatically adjusts to:
- Single column layout
- Stacked charts
- Touch-friendly interface

## Setup Checklist

- [ ] Deploy application with TV Wall route
- [ ] Configure display device (TV/monitor)
- [ ] Set up browser in kiosk mode
- [ ] Test auto-refresh functionality
- [ ] Verify all charts display correctly
- [ ] Adjust zoom level if needed
- [ ] Enable fullscreen mode
- [ ] Test for 24+ hours to ensure stability

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase connection and RPC functions
3. Review related documentation
4. Test with different browsers

---

**Created**: 2025-10-11  
**Component**: `/src/pages/tv/LogsPage.tsx`  
**Route**: `/tv/logs`  
**Status**: ✅ Production Ready
