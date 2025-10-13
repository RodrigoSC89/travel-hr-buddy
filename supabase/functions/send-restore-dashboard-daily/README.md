# Send Restore Dashboard Daily

Supabase Edge Function that automatically sends daily restore dashboard reports via email with PDF attachment.

## Overview

This function is scheduled to run daily at **08:00 UTC (5h BRT)** and generates a report of document restoration activity by day.

## Features

- ✅ Fetches restore count data using `get_restore_count_by_day_with_email` RPC function
- ✅ Generates PDF-formatted report (CSV format for Deno Edge Functions)
- ✅ Sends email via Resend API
- ✅ Logs execution status to `restore_report_logs` table
- ✅ Automated daily scheduling via cron
- ✅ Professional HTML email template

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | - |
| `RESEND_API_KEY` | Yes | Resend API key for sending emails | - |
| `REPORT_ADMIN_EMAIL` | No | Admin email address | Falls back to `ADMIN_EMAIL` or `admin@example.com` |
| `EMAIL_FROM` | No | From email address | `relatorio@empresa.com` |

## Cron Configuration

Configured in `supabase/config.toml`:

```toml
[[edge_runtime.cron]]
name = "send-restore-dashboard-daily"
function_name = "send-restore-dashboard-daily"
schedule = "0 8 * * *"  # Every day at 08:00 UTC (5h BRT)
description = "Send daily restore dashboard report via email with PDF attachment"
```

## Database Dependencies

### RPC Function
- `get_restore_count_by_day_with_email(email_input text)` - Returns restore count by day

### Tables
- `restore_report_logs` - Logs execution status and errors

## Email Format

### Subject
📊 Relatório Diário de Restaurações

### Content
- Professional HTML template with header, summary, and footer
- Restore count summary
- PDF attachment with daily restore data

### Attachment
- Filename: `relatorio-automatico.pdf`
- Format: CSV-formatted table (Data, Restaurações)
- Contains: Date and count of restorations per day

## Manual Testing

```bash
# Deploy the function
supabase functions deploy send-restore-dashboard-daily

# Test locally (requires environment variables)
curl -X POST http://localhost:54321/functions/v1/send-restore-dashboard-daily \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test deployed function
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-restore-dashboard-daily \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Success Response

```json
{
  "success": true,
  "message": "Daily restore dashboard report sent successfully",
  "dataPoints": 15,
  "recipient": "admin@example.com",
  "emailSent": true
}
```

## Error Response

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## Monitoring

Check execution logs:

```sql
-- View recent execution logs
SELECT * FROM restore_report_logs 
WHERE triggered_by = 'automated'
ORDER BY executed_at DESC 
LIMIT 10;

-- Check for errors
SELECT * FROM restore_report_logs 
WHERE status = 'error' OR status = 'critical'
ORDER BY executed_at DESC;
```

## Troubleshooting

### Email not received
- Verify `RESEND_API_KEY` is set correctly
- Check `REPORT_ADMIN_EMAIL` or `ADMIN_EMAIL` is configured
- Verify email domain is verified in Resend
- Check spam folder

### No data in report
- Verify `get_restore_count_by_day_with_email` function exists
- Check `document_restore_logs` table has data
- Verify database permissions

### Function fails
- Check logs in Supabase Dashboard under Edge Functions
- Query `restore_report_logs` table for error details
- Verify all required environment variables are set

## Related Functions

- `send_daily_restore_report` - Similar function using SendGrid
- `daily-restore-report` - Alternative implementation with chart embedding
- `send-daily-assistant-report` - Daily assistant logs report

## Implementation Notes

This implementation follows the specification from the problem statement:
- Uses Resend API for email delivery
- Generates PDF-formatted content (CSV for Deno compatibility)
- Scheduled at 08:00 UTC as specified
- Follows existing patterns from assistant report functions
