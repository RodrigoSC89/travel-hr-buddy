# Email Logs Quick Reference

## Quick Access
- **URL:** `/admin/reports/email-logs`
- **Permissions:** Admin only
- **File:** `src/pages/admin/reports/email-logs.tsx`

## Database Quick Reference

**Table:** `report_email_logs`

**Key Fields:**
- `sent_at` - When email was sent
- `status` - success, error, pending
- `recipient_email` - Who received it
- `report_type` - Type of report

## Quick Usage Examples

### View Logs
Navigate to `/admin/reports/email-logs` in your browser

### Log a Success
```typescript
await supabase.from("report_email_logs").insert({
  status: "success",
  message: "Report sent",
  recipient_email: "user@example.com",
  report_type: "daily_report"
});
```

### Log an Error
```typescript
await supabase.from("report_email_logs").insert({
  status: "error",
  message: "Failed to send",
  recipient_email: "user@example.com",
  error_details: "Connection timeout",
  report_type: "weekly_report"
});
```

## Filters

**Status Filter:**
- All statuses
- Success only
- Error only
- Pending only

**Date Range:**
- Start Date - Filter from this date
- End Date - Filter to this date

## Common Queries

### Check recent errors
1. Navigate to email logs page
2. Select "Error" in status filter
3. Set start date to today

### View specific report type
Look at the report_type field in each log card

### Export data
Use browser's save functionality or add CSV export feature

## Status Badge Colors
- **Success** - Green (default variant)
- **Error** - Red (destructive variant)
- **Pending** - Gray (secondary variant)

## Testing
```bash
# Run email logs tests
npm test email-logs

# Run all tests
npm test
```

## Quick Integration

### Wrap email sending with logging:
```typescript
try {
  await sendEmail(recipient, content);
  await logSuccess(recipient, reportType);
} catch (error) {
  await logError(recipient, reportType, error.message);
  throw error;
}
```

## Security Notes
- Only admin users can view logs
- Service role can insert logs
- RLS policies enforced at database level

## Performance Tips
- Indexes on `sent_at` and `status` for fast queries
- Use date filters to limit result sets
- Pagination recommended for 1000+ logs

## Migration File
`supabase/migrations/20251012004018_create_report_email_logs.sql`

## Test File
`src/tests/pages/admin/reports/email-logs.test.tsx`

## Related Components
- Card, Button, Input (shadcn/ui)
- React Query for data fetching
- date-fns for formatting
