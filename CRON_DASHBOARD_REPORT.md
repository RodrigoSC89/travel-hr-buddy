# Cron Configuration for Dashboard Report

This document explains how to configure PostgreSQL `pg_cron` to automatically send daily dashboard reports.

## Overview

The dashboard report system sends automated email notifications to all users with the public dashboard link at 9:00 AM (UTC-3 / 6:00 AM UTC) daily.

## Prerequisites

1. **Edge Function Deployed**: `send-dashboard-report` must be deployed to Supabase
2. **Environment Variables Set**:
   - `RESEND_API_KEY`: Your Resend API key for sending emails
   - `EMAIL_FROM`: Sender email address (default: `dash@empresa.com`)
   - `BASE_URL`: Base URL of your application (e.g., `https://your-app.vercel.app`)

## Setup Instructions

### Step 1: Enable pg_cron Extension

Run this SQL in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Step 2: Schedule Daily Dashboard Report

Execute this SQL command to schedule the daily report at 9:00 AM (UTC-3):

```sql
SELECT cron.schedule(
  'send-daily-dashboard-report',
  '0 9 * * *',
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-dashboard-report',
    headers := '{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}',
    body := '{}'
  );$$
);
```

**Important**: Replace:
- `YOUR_PROJECT` with your Supabase project ID
- `YOUR_SERVICE_ROLE_KEY` with your Supabase service role key

### Step 3: Verify Cron Job

Check that the cron job was created successfully:

```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
```

You should see output like:

```
jobid | schedule    | command                  | nodename | nodeport | database | username | active | jobname
------|-------------|--------------------------|----------|----------|----------|----------|--------|------------------------
1     | 0 9 * * *   | SELECT net.http_post...  | ...      | ...      | postgres | ...      | t      | send-daily-dashboard-report
```

## Testing

### Manual Test

Test the edge function manually via curl:

```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/send-dashboard-report" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Expected response:

```json
{
  "success": true,
  "message": "Dashboard report emails sent successfully",
  "emailsSent": 5,
  "emailsFailed": 0,
  "totalUsers": 5
}
```

### Check Execution History

View past executions:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report')
ORDER BY start_time DESC 
LIMIT 10;
```

## Cron Schedule Format

The cron expression `0 9 * * *` means:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday=0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

- `0 9 * * *` = Every day at 09:00 (UTC-3 / 06:00 UTC)

### Common Schedule Examples

```sql
-- Every day at 8:00 AM
'0 8 * * *'

-- Every Monday at 9:00 AM
'0 9 * * 1'

-- Every 1st of the month at 10:00 AM
'0 10 1 * *'

-- Twice a day (9 AM and 6 PM)
'0 9,18 * * *'
```

## Modifying the Schedule

### Change Time

Update the schedule to run at different time:

```sql
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report'),
  schedule := '0 8 * * *'  -- Change to 8 AM
);
```

### Disable/Enable Job

Temporarily disable:

```sql
SELECT cron.unschedule('send-daily-dashboard-report');
```

Re-enable with new schedule:

```sql
SELECT cron.schedule(
  'send-daily-dashboard-report',
  '0 9 * * *',
  $$SELECT net.http_post(...);$$
);
```

## Troubleshooting

### Job Not Running

1. **Check if job is active**:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
   ```
   Ensure `active = t`

2. **Check execution logs**:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report')
   ORDER BY start_time DESC;
   ```

3. **Verify edge function is deployed**:
   ```bash
   supabase functions list
   ```

### Email Not Received

1. **Check environment variables** in Supabase Dashboard:
   - Settings → Edge Functions → Environment Variables
   - Verify `RESEND_API_KEY`, `EMAIL_FROM`, `BASE_URL` are set

2. **Check Resend dashboard** for email delivery status

3. **Verify users have emails**:
   ```sql
   SELECT COUNT(*) FROM profiles WHERE email IS NOT NULL;
   ```

## Environment Variables

Set these in Supabase Dashboard (Settings → Edge Functions → Environment Variables):

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Yes | Resend API key for sending emails | `re_xxxxx...` |
| `EMAIL_FROM` | No | Sender email address | `dash@empresa.com` |
| `BASE_URL` | Yes | Base URL of your application | `https://your-app.vercel.app` |

## Security Notes

- Never commit the service role key to version control
- Use environment variables for all sensitive data
- The edge function uses service role key for database access
- Emails are sent to users with emails in the `profiles` table only

## Related Documentation

- [send-dashboard-report Edge Function](../functions/send-dashboard-report/index.ts)
- [Admin Dashboard Component](../src/pages/admin/dashboard.tsx)
- [Supabase pg_cron Documentation](https://supabase.com/docs/guides/database/extensions/pg_cron)

---

**Last Updated**: October 2025  
**Version**: 1.0.0
