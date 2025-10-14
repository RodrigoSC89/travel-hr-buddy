# Dashboard Report Cron Configuration

## Overview
This document describes how to set up automated daily dashboard reports.

## Cron Schedule
The dashboard report is sent daily at 9:00 AM (UTC-3 / Brasília time = 6:00 AM UTC).

## SQL Configuration

To set up the cron job in Supabase, run the following SQL:

```sql
-- Schedule daily dashboard report
SELECT cron.schedule(
  'send-daily-dashboard-report',
  '0 9 * * *',  -- 9 AM UTC (6 AM Brasília)
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-dashboard-report',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}',
    body := '{}'
  );
  $$
);
```

## Configuration Steps

1. **Replace the URL**: Update `your-project.supabase.co` with your actual Supabase project URL
2. **Add Service Role Key**: Replace `YOUR_SERVICE_ROLE_KEY` with your Supabase service role key
3. **Set Environment Variables** in Supabase:
   - `RESEND_API_KEY`: Your Resend API key for sending emails
   - `EMAIL_FROM`: Sender email address (e.g., `dash@empresa.com`)
   - `BASE_URL`: Your application's base URL (e.g., `https://your-app.vercel.app`)

## Verify Cron Job

Check if the cron job is scheduled:

```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
```

## Unschedule (if needed)

To remove the cron job:

```sql
SELECT cron.unschedule('send-daily-dashboard-report');
```

## Manual Testing

Test the function manually:

```bash
curl -X GET \
  "https://your-project.supabase.co/functions/v1/send-dashboard-report" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Features

✅ Sends email to all users with email in profiles table  
✅ Includes public dashboard link (?public=1)  
✅ Supports TV Wall display mode  
✅ Uses Resend API for reliable email delivery  
✅ Automated daily execution  

## Related Files

- **Edge Function**: `supabase/functions/send-dashboard-report/index.ts`
- **Dashboard Page**: `src/pages/admin/dashboard.tsx`
- **Cron Config**: This file (`CRON_DASHBOARD_REPORT.md`)
