# 🚀 Dashboard Logs - Quick Reference

## 📍 Access
```
/admin/reports/dashboard-logs
```

## 🎯 What It Does
Tracks and displays audit logs of automated dashboard report email executions.

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 📊 View Logs | See all dashboard report email executions |
| 🔍 Filter by Status | Filter by success/error |
| 📅 Date Range | Filter by start and end date |
| 📤 CSV Export | Export filtered logs |
| 📈 Summary Stats | Total, successes, and errors count |

## 🗂️ Database Table

```sql
dashboard_report_logs
├── id (UUID)
├── executed_at (TIMESTAMPTZ)
├── status (TEXT: 'success' | 'error')
├── email (TEXT)
├── message (TEXT)
└── created_at (TIMESTAMPTZ)
```

## 🔐 Permissions
- **View**: Admins only (RLS policy)
- **Insert**: Service role only

## 📤 CSV Export Format

```csv
Data,Status,Email,Mensagem
2025-10-14 09:30,success,user@example.com,Dashboard report sent successfully
2025-10-14 09:31,error,admin@example.com,Failed to send email: Invalid API key
```

## 🎨 UI Components

### Filters Card
```
┌─────────────────────────────────────┐
│ Status: [success/error]             │
│ Data Inicial: [YYYY-MM-DD]          │
│ Data Final: [YYYY-MM-DD]            │
└─────────────────────────────────────┘
```

### Summary Cards
```
┌──────────────┬──────────────┬──────────────┐
│ Total: 150   │ Sucessos: 145│ Erros: 5     │
└──────────────┴──────────────┴──────────────┘
```

### Logs Table
```
┌──────────────┬─────────┬─────────────────┬──────────────────┐
│ Data         │ Status  │ E-mail          │ Mensagem         │
├──────────────┼─────────┼─────────────────┼──────────────────┤
│ 14/10/25 9:30│ success │ user@email.com  │ Report sent...   │
│ 14/10/25 9:29│ error   │ admin@email.com │ Failed to send...│
└──────────────┴─────────┴─────────────────┴──────────────────┘
```

## 🛠️ Common Tasks

### View Last 7 Days
```typescript
// Set date filters
const today = new Date()
const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

setDateStart(weekAgo.toISOString().split('T')[0])
setDateEnd(today.toISOString().split('T')[0])
```

### Export Current View
```typescript
// Click "Exportar CSV" button
// Downloads: dashboard_logs_YYYY-MM-DD_HHmmss.csv
```

### Check for Errors
```typescript
// Enter "error" in Status filter
// View all failed email sends
```

## 🔧 Integration

### How Logs Are Created

When `send-dashboard-report` Edge Function runs:

```typescript
// On success
await supabase
  .from("dashboard_report_logs")
  .insert({
    status: "success",
    email: profile.email,
    message: "Dashboard report sent successfully"
  })

// On error
await supabase
  .from("dashboard_report_logs")
  .insert({
    status: "error",
    email: profile.email,
    message: `Failed to send email: ${errorMsg}`
  })
```

## 📊 SQL Queries

### View All Logs
```sql
SELECT * FROM dashboard_report_logs 
ORDER BY executed_at DESC 
LIMIT 100;
```

### Count by Status
```sql
SELECT 
  status, 
  COUNT(*) as total,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM dashboard_report_logs 
GROUP BY status;
```

### Recent Failures
```sql
SELECT * FROM dashboard_report_logs 
WHERE status = 'error' 
  AND executed_at > NOW() - INTERVAL '24 hours'
ORDER BY executed_at DESC;
```

### Success Rate by Day
```sql
SELECT 
  DATE(executed_at) as date,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'success')::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as success_rate
FROM dashboard_report_logs 
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

## 🐛 Troubleshooting

### No Logs Showing
- ✅ Check if user is admin
- ✅ Verify RLS policies are enabled
- ✅ Confirm send-dashboard-report function has run
- ✅ Check date filters aren't too restrictive

### CSV Export Not Working
- ✅ Ensure logs array is not empty
- ✅ Check browser console for errors
- ✅ Verify browser allows downloads

### Logs Not Being Created
- ✅ Check send-dashboard-report function logs
- ✅ Verify Supabase service role key is set
- ✅ Confirm table exists and RLS policies allow insert

## 📚 Related Features

- **Dashboard Page**: `/admin/dashboard` - View the dashboard
- **Restore Report Logs**: `/admin/reports/logs` - Similar logs for restore reports
- **Assistant Report Logs**: `/admin/reports/assistant` - Logs for assistant reports

## 🎯 Use Cases

### 1. Daily Health Check
```
1. Visit /admin/reports/dashboard-logs
2. Check summary cards
3. Verify success count > error count
4. Review any recent errors
```

### 2. Monthly Report
```
1. Set date range to last month
2. Click "Exportar CSV"
3. Open in Excel
4. Create pivot table by status
5. Share with stakeholders
```

### 3. Debug Failed Email
```
1. Enter "error" in Status filter
2. Find the failed email
3. Read error message
4. Check email service status
5. Retry if needed
```

## 💡 Tips

- **Auto-refresh**: Filters apply automatically when changed
- **Hover for Details**: Hover over truncated messages to see full text
- **CSV Encoding**: Files include UTF-8 BOM for proper character display
- **Date Format**: Use YYYY-MM-DD format for date inputs
- **Status Values**: Only "success" and "error" are valid status values

## 📞 Support

For issues or questions:
1. Check the full implementation guide: `DASHBOARD_LOGS_IMPLEMENTATION.md`
2. Review similar patterns: `PR297_IMPLEMENTATION_COMPLETE.md`
3. Check Supabase logs for function execution errors
4. Verify database migrations have been applied

---

**Last Updated**: 2025-10-14  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
