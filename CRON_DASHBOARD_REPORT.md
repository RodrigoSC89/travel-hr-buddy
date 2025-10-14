# Cron Scheduling for Dashboard Report

## Overview
This guide explains how to set up automated daily email reports for the admin dashboard using PostgreSQL's `pg_cron` extension in Supabase.

## Prerequisites
- Supabase project with `pg_cron` extension enabled
- `send-dashboard-report` edge function deployed
- Service role key from Supabase dashboard

## Setup Instructions

### 1. Enable pg_cron Extension
Run in Supabase SQL Editor:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 2. Schedule Daily Report
Run in Supabase SQL Editor to send reports at 9:00 AM (UTC-3):

```sql
SELECT cron.schedule(
  'send-daily-dashboard-report',       -- Job name
  '0 9 * * *',                          -- 9:00 AM every day (UTC-3)
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-dashboard-report',
    headers := '{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY","Content-Type":"application/json"}',
    body := '{}'
  );$$
);
```

**Important:** Replace:
- `YOUR_PROJECT_REF` with your actual Supabase project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key from Settings → API

### 3. Verify Schedule
Check if the job was created:

```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
```

You should see output like:
```
jobid | schedule  | command                    | nodename  | nodeport | database | username | active | jobname
------+-----------+---------------------------+-----------+----------+----------+----------+--------+------------------------
1     | 0 9 * * * | SELECT net.http_post(...) | localhost | 5432     | postgres | postgres | t      | send-daily-dashboard-report
```

## Schedule Options

### Different Times
```sql
-- 8:00 AM
'0 8 * * *'

-- 6:00 PM
'0 18 * * *'

-- Every 3 hours
'0 */3 * * *'

-- Twice a day (9 AM and 5 PM)
'0 9,17 * * *'
```

### Different Days
```sql
-- Weekdays only (Monday-Friday)
'0 9 * * 1-5'

-- Mondays only
'0 9 * * 1'

-- First day of month
'0 9 1 * *'
```

## Managing Cron Jobs

### List All Jobs
```sql
SELECT * FROM cron.job;
```

### Unschedule a Job
```sql
SELECT cron.unschedule('send-daily-dashboard-report');
```

### Update Schedule
```sql
-- First unschedule
SELECT cron.unschedule('send-daily-dashboard-report');

-- Then create with new schedule
SELECT cron.schedule(
  'send-daily-dashboard-report',
  '0 10 * * *',  -- Changed to 10:00 AM
  $$SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-dashboard-report',
    headers := '{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}',
    body := '{}'
  );$$
);
```

### Check Job History
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report')
ORDER BY start_time DESC 
LIMIT 10;
```

## Timezone Considerations

### UTC-3 (Brazil Standard Time)
If your team is in UTC-3 and you want emails at 9:00 AM local time:
- Schedule for 12:00 UTC (9:00 AM UTC-3)
- Cron expression: `0 12 * * *`

### UTC (Default)
Supabase cron jobs run in UTC by default. Convert your desired local time to UTC:
- 9:00 AM UTC-3 = 12:00 PM UTC
- 5:00 PM UTC-3 = 8:00 PM UTC

## Environment Variables
Ensure these are set in Supabase Dashboard (Settings → Edge Functions → Environment Variables):

```bash
RESEND_API_KEY=re_xxxxx...        # Required for email delivery
BASE_URL=https://your-app.com     # Required for dashboard links
EMAIL_FROM=dashboard@empresa.com  # Optional (has default)
```

## Monitoring

### Check Last Run
```sql
SELECT 
  jobname,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report')
ORDER BY start_time DESC 
LIMIT 1;
```

### View Recent Runs
```sql
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report')
ORDER BY start_time DESC 
LIMIT 5;
```

## Troubleshooting

### Job not running
1. Check if `pg_cron` extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Verify job is active:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
   ```

3. Check for errors in job history:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE status != 'succeeded' 
   ORDER BY start_time DESC;
   ```

### Edge function errors
- Check Supabase Functions logs
- Verify environment variables are set
- Test function manually first

### No emails received
- Check Resend API dashboard
- Verify users have email addresses in `profiles` table
- Check edge function response in cron job history

## Manual Testing
Before scheduling, test the function manually:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-dashboard-report \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Security Notes
- Never commit service role keys to version control
- Store keys in Supabase environment variables
- Rotate keys periodically
- Monitor cron job execution logs

## Related Documentation
- `DASHBOARD_REPORT_QUICKREF.md` - Quick start guide
- `supabase/functions/send-dashboard-report/index.ts` - Function implementation
- PostgreSQL pg_cron documentation: https://github.com/citusdata/pg_cron
