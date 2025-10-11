# Restore Report Logs - Implementation Guide

## Overview

The **Restore Report Logs** page displays execution logs for the daily restore report email system. This page allows administrators to monitor when daily reports are sent, view their status (success/error), and troubleshoot any issues that may occur.

## Features

### 1. Real-time Log Display
- Shows all execution logs from the `restore_report_logs` table
- Displays execution date/time, status, message, and error details
- Logs are ordered by execution time (most recent first)

### 2. Status Filtering
- Filter logs by status: `success`, `error`, or `pending`
- Clear visual indicators with colored badges:
  - 🟢 **Success**: Green badge
  - 🔴 **Error**: Red badge
  - ⚪ **Pending**: Outlined badge

### 3. Date Range Filtering
- Filter logs by start date
- Filter logs by end date
- Combine both filters for specific date ranges

### 4. CSV Export
- Export filtered logs to CSV format
- Includes: Date, Status, Message, Error Details
- Filename includes current date: `restore-report-logs-YYYY-MM-DD.csv`
- Proper memory management with URL cleanup

### 5. Loading States
- Shows spinner during data fetch
- Prevents user interaction during loading
- Clear feedback for empty states

### 6. Error Handling
- Toast notifications for errors
- Detailed error logging to console
- Graceful degradation when data fetch fails

## Database Schema

### Table: `restore_report_logs`

```sql
CREATE TABLE public.restore_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**Indexes:**
- `idx_restore_report_logs_executed_at` - On `executed_at DESC` for fast sorting
- `idx_restore_report_logs_status` - On `status` for filtered queries

**Security:**
- Row Level Security (RLS) enabled
- Only users with `role = 'admin'` can view logs

## Routes

- **Page URL**: `/admin/reports/logs`
- **Component**: `src/pages/admin/reports/RestoreReportLogs.tsx`
- **Route Config**: `src/App.tsx`

## Usage Examples

### Viewing All Logs
1. Navigate to `/admin/reports/logs`
2. All logs display automatically, newest first

### Filtering by Status
1. Enter status in the filter input: "success" or "error"
2. Results update automatically

### Filtering by Date Range
1. Select start date in the first date picker
2. Select end date in the second date picker
3. Results update automatically

### Exporting Logs
1. Filter logs as needed (optional)
2. Click "📤 Exportar CSV" button
3. CSV file downloads automatically

## Integration with Daily Report System

The `daily-restore-report` Edge Function automatically logs each execution:

### Success Case
```typescript
await supabase.from("restore_report_logs").insert({
  status: "success",
  message: `Relatório enviado com sucesso para ${ADMIN_EMAIL}`,
  error_details: null
});
```

### Error Case
```typescript
await supabase.from("restore_report_logs").insert({
  status: "error",
  message: "Erro ao enviar relatório diário",
  error_details: error.message
});
```

## Testing

### Test Coverage
- ✅ Page rendering
- ✅ Filter inputs and export button
- ✅ Loading state display
- ✅ Empty state display
- ✅ Export button disabled when no logs
- ✅ Status filter functionality
- ✅ Date filter functionality

**Test File**: `src/tests/pages/admin/reports/RestoreReportLogs.test.tsx`

**Run Tests**:
```bash
npm test RestoreReportLogs
```

## Component Structure

```
RestoreReportLogs.tsx
├── State Management
│   ├── logs: RestoreReportLog[]
│   ├── loading: boolean
│   ├── statusFilter: string
│   ├── dateStart: string
│   └── dateEnd: string
├── Effects
│   └── fetchLogs() - Triggered on filter changes
├── Functions
│   ├── fetchLogs() - Fetch data from Supabase
│   └── exportCSV() - Export logs to CSV
└── UI Components
    ├── ScrollArea (container)
    ├── Filter Controls (Input x3, Button)
    ├── Loading Spinner
    ├── Empty State
    └── Log Cards (with Badges)
```

## Best Practices

### 1. Memory Management
```typescript
// Always clean up blob URLs
URL.revokeObjectURL(url);
```

### 2. Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error("Error:", error);
  toast({ title: "Error", variant: "destructive" });
}
```

### 3. Loading States
```typescript
setLoading(true);
try {
  await fetchData();
} finally {
  setLoading(false); // Always in finally block
}
```

### 4. Validation
```typescript
if (logs.length === 0) {
  toast({ title: "No data", variant: "destructive" });
  return;
}
```

## Troubleshooting

### Logs Not Appearing
1. Check RLS policies in Supabase
2. Verify user has `admin` role
3. Check console for errors

### Filters Not Working
1. Clear all filters and try again
2. Check date format (YYYY-MM-DD)
3. Verify status value (success/error/pending)

### CSV Export Fails
1. Check if logs array is empty
2. Verify browser permissions for downloads
3. Check console for detailed errors

### Daily Report Not Logging
1. Check Edge Function deployment
2. Verify database connection
3. Check service role key permissions

## Future Enhancements

- [ ] Pagination for large datasets
- [ ] More advanced filtering (regex, multiple statuses)
- [ ] PDF export option
- [ ] Email notification summary
- [ ] Retry failed reports from UI
- [ ] Charts/graphs for success rates
- [ ] Scheduled cleanup of old logs

## Related Documentation

- [Daily Restore Report Architecture](./DAILY_RESTORE_REPORT_ARCHITECTURE.md)
- [Daily Restore Report Quick Reference](./DAILY_RESTORE_REPORT_QUICKREF.md)
- [Restore Dashboard Implementation](./RESTORE_DASHBOARD_IMPLEMENTATION.md)

## Support

For issues or questions:
1. Check the console for error messages
2. Review the test file for expected behavior
3. Check Supabase logs for database issues
4. Review the Edge Function logs for execution issues
