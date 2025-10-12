# 📧 Daily Restore Report - Edge Function Documentation

## Overview

The `send_daily_restore_report` edge function automatically generates and sends a daily email report with restore logs from the last 24 hours in CSV format.

## Features

- ✅ Fetches restore report logs from the last 24 hours
- ✅ Generates CSV file with columns: Date, Status, Message, Error
- ✅ Sends email via SendGrid API (recommended) or SMTP (fallback)
- ✅ Logs execution success/failure to `restore_report_logs` table
- ✅ Scheduled to run daily at 7:00 AM UTC via cron

## Environment Variables

### Required

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAIL=admin@example.com
```

### Email Configuration (Choose One)

#### Option 1: SendGrid (Recommended)
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com  # Optional, defaults to noreply@nautilusone.com
```

#### Option 2: SMTP (Fallback)
```bash
VITE_APP_URL=https://your-app.vercel.app  # URL to your app with SMTP endpoint
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_password
EMAIL_FROM=noreply@yourdomain.com
```

## Setup Instructions

### 1. Deploy the Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send_daily_restore_report

# Set environment variables
supabase secrets set ADMIN_EMAIL=your@email.com
supabase secrets set SENDGRID_API_KEY=SG.your_api_key
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
```

### 2. Configure Cron Schedule

The cron schedule is already configured in `supabase/config.toml`:

```toml
[[edge_runtime.cron]]
name = "daily-restore-report"
function_name = "send_daily_restore_report"
schedule = "0 7 * * *"  # Every day at 7:00 AM UTC
description = "Send daily restore report via email with CSV attachment"
```

To change the schedule, modify the `schedule` field using standard cron syntax:
- `0 7 * * *` = Daily at 7:00 AM UTC
- `0 9 * * *` = Daily at 9:00 AM UTC
- `0 */6 * * *` = Every 6 hours

### 3. Test the Function

#### Manual Test
```bash
# Using curl
curl -X POST "https://your-project.supabase.co/functions/v1/send_daily_restore_report" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Or invoke via Supabase CLI
supabase functions invoke send_daily_restore_report
```

## CSV Report Format

The generated CSV file includes the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Date | Timestamp of log entry | 11/10/2025 18:30:15 |
| Status | Execution status | success, error, critical |
| Message | Descriptive message | Relatório enviado com sucesso |
| Error | Error details (if any) | {"statusCode": 500, "message": "..."} |

## Email Template

The email includes:
- Summary of logs count from last 24 hours
- CSV file attachment with all log details
- Professional HTML formatting with company branding

## Logging

All executions are logged to the `restore_report_logs` table:

| Field | Description |
|-------|-------------|
| executed_at | Timestamp of execution |
| status | success, error, or critical |
| message | Descriptive message |
| error_details | JSON error object (if any) |
| triggered_by | "automated" for cron jobs |

### View Execution Logs

```sql
-- Last 10 executions
SELECT executed_at, status, message 
FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 10;

-- Success rate
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as success,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as rate
FROM restore_report_logs
WHERE executed_at >= NOW() - INTERVAL '30 days';
```

## Troubleshooting

### Email not sending
1. Check environment variables are set:
   ```bash
   supabase secrets list
   ```
2. Verify SendGrid API key is valid
3. Check function logs:
   ```bash
   supabase functions logs send_daily_restore_report
   ```

### No data in CSV
- Check if there are logs in `restore_report_logs` table
- Verify the time range (last 24h from execution time)

### Function timing out
- Increase timeout in function configuration
- Check database connectivity
- Review network issues

## Related Files

- Edge Function: `/supabase/functions/send_daily_restore_report/index.ts`
- Configuration: `/supabase/config.toml`
- Database Schema: `/supabase/migrations/20251011185116_create_restore_report_logs.sql`

## SendGrid Setup Guide

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender email address or domain
3. Create an API key:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Select "Full Access"
   - Copy the key and save it securely
4. Set the key in Supabase:
   ```bash
   supabase secrets set SENDGRID_API_KEY=SG.your_api_key
   ```

## SMTP Setup (Alternative)

If using SMTP instead of SendGrid:

1. Create a Node.js API endpoint `/api/send-restore-report-csv`
2. Use nodemailer to send emails
3. Set SMTP environment variables in your app
4. The edge function will call this endpoint as fallback

## Security Considerations

- ✅ Environment variables are encrypted in Supabase
- ✅ Service role key is required for database access
- ✅ Email content is sanitized
- ✅ CSV data is properly escaped
- ✅ RLS policies protect the logs table

## Monitoring

Monitor function health via:
1. Supabase Dashboard > Edge Functions > Metrics
2. Query `restore_report_logs` for execution history
3. Check email delivery in SendGrid dashboard
4. Review function logs for errors

## Future Enhancements

- [ ] Support multiple recipients
- [ ] Add PDF report option
- [ ] Include charts/graphs in email
- [ ] Support custom time ranges
- [ ] Add retry logic for failed sends
- [ ] Email delivery notifications
