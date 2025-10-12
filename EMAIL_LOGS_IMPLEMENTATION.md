# Email Logs Implementation Guide

## Overview
This document provides comprehensive details about the Email Report Logs feature implementation for auditing sent reports in the Travel HR Buddy system.

## Architecture

### Database Schema
The `report_email_logs` table stores all email report sending events with the following structure:

**Table: report_email_logs**
- `id` (UUID): Primary key, auto-generated
- `sent_at` (TIMESTAMP): When the email was sent (UTC)
- `status` (TEXT): Status of the email (success, error, pending)
- `message` (TEXT): Description of the email sent
- `recipient_email` (TEXT): Email recipient address
- `error_details` (TEXT): Error information if send failed (nullable)
- `report_type` (TEXT): Type of report sent
- `created_at` (TIMESTAMP): Record creation timestamp

**Indexes:**
- `idx_report_email_logs_sent_at`: Optimized for time-based queries
- `idx_report_email_logs_status`: Fast filtering by status
- `idx_report_email_logs_report_type`: Quick lookups by report type

### Security
**Row Level Security (RLS):**
- Enabled on the `report_email_logs` table
- Admin users can view all logs (SELECT policy)
- Service role can insert logs (INSERT policy)
- Regular users cannot access logs

### Frontend Components

**Page Location:** `/admin/reports/email-logs`

**Main Component:** `src/pages/admin/reports/email-logs.tsx`

**Features:**
1. **Real-time Log Display**
   - Fetches logs using React Query
   - Automatic caching and refetching
   - Loading states and error handling

2. **Filtering Capabilities**
   - Status filter (all, success, error, pending)
   - Date range filtering (start and end date)
   - Immediate query updates on filter changes

3. **Visual Design**
   - Color-coded status badges (green for success, red for errors)
   - Card-based layout for each log entry
   - Scrollable interface for large log lists
   - Responsive design for mobile and desktop

4. **Data Display**
   - Formatted timestamps (dd/MM/yyyy HH:mm)
   - Recipient email addresses
   - Report types
   - Error details when applicable

## Usage

### Viewing Logs (Admin Users)
1. Navigate to `/admin/reports/email-logs`
2. Use filters to narrow down results:
   - Select status from dropdown
   - Pick start/end dates
3. Click "Update" to refresh logs
4. Scroll through the log list

### Logging Email Sends (Developers)

**From Frontend:**
```typescript
import { supabase } from "@/integrations/supabase/client";

await supabase.from("report_email_logs").insert({
  status: "success",
  message: "Daily restore report sent successfully",
  recipient_email: "admin@example.com",
  report_type: "daily_restore_report"
});
```

**From Edge Functions:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

await supabase.from("report_email_logs").insert({
  status: "error",
  message: "Failed to send weekly report",
  recipient_email: "user@example.com",
  error_details: "SMTP connection timeout",
  report_type: "weekly_report"
});
```

## Testing

**Test File:** `src/tests/pages/admin/reports/email-logs.test.tsx`

**Test Coverage:**
- Page rendering and layout
- Filter functionality
- Date formatting
- Status badges with correct variants
- Log data display
- Loading states
- Error handling

**Run Tests:**
```bash
npm test email-logs
```

## Integration Examples

### Email Sending Function
```typescript
async function sendEmailReport(
  recipient: string,
  reportType: string,
  content: string
) {
  try {
    // Send email logic here
    await sendEmail(recipient, content);
    
    // Log success
    await supabase.from("report_email_logs").insert({
      status: "success",
      message: `${reportType} sent to ${recipient}`,
      recipient_email: recipient,
      report_type: reportType
    });
  } catch (error) {
    // Log error
    await supabase.from("report_email_logs").insert({
      status: "error",
      message: `Failed to send ${reportType}`,
      recipient_email: recipient,
      error_details: error.message,
      report_type: reportType
    });
    throw error;
  }
}
```

### Scheduled Report with Logging
```typescript
// In a scheduled Edge Function
async function dailyReportJob() {
  const recipients = await getReportRecipients();
  
  for (const recipient of recipients) {
    try {
      const report = await generateReport();
      await sendEmailReport(
        recipient.email,
        "daily_restore_report",
        report
      );
    } catch (error) {
      console.error(`Failed to send report to ${recipient.email}`, error);
      // Error is already logged by sendEmailReport
    }
  }
}
```

## Maintenance

### Database Cleanup
Consider implementing a cleanup job to archive or delete old logs:

```sql
-- Delete logs older than 90 days
DELETE FROM report_email_logs
WHERE sent_at < NOW() - INTERVAL '90 days';
```

### Performance Monitoring
Monitor the table size and query performance:
- Check index usage
- Monitor query execution times
- Review RLS policy performance

## Troubleshooting

### Common Issues

**Issue:** Logs not appearing
- **Solution:** Check RLS policies and user role
- **Verify:** User has admin role in JWT token

**Issue:** Slow queries
- **Solution:** Ensure indexes are present and used
- **Check:** `EXPLAIN ANALYZE` on queries

**Issue:** Cannot insert logs
- **Solution:** Verify service role key permissions
- **Check:** RLS policies for INSERT

## Future Enhancements

Potential improvements:
1. Export logs to CSV
2. Advanced search functionality
3. Log retention policies UI
4. Email notification on errors
5. Dashboard metrics (success rate, volume)
6. Grouping by report type
7. Pagination for very large datasets
