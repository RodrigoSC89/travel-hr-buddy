# Monitor Cron Health - Edge Function

## Overview

This Supabase Edge Function monitors the health of the daily assistant report cron job (`send-daily-assistant-report`). It checks if the cron has executed successfully within the last 36 hours and sends an alert email if it hasn't.

## Features

- 🔍 **Automated Monitoring**: Checks if the daily cron executed in the last 36 hours
- 📧 **Email Alerts**: Sends notification via Resend when cron fails
- 🔐 **Secure**: Uses Supabase Service Role for database access
- ⏱️ **Configurable**: 36-hour threshold to account for weekend gaps

## How It Works

1. Calls the SQL function `check_daily_cron_execution()`
2. The function queries `assistant_report_logs` table for recent successful executions
3. If last execution was >36 hours ago, sends alert email to admin
4. If execution is recent, returns success status

## Environment Variables

Required environment variables in Supabase Edge Function settings:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_your_resend_api_key
ADMIN_EMAIL=admin@nautilus.ai
EMAIL_FROM=alertas@nautilus.ai
```

## Deployment

### Deploy the Edge Function

```bash
# Deploy to Supabase
supabase functions deploy monitor-cron-health
```

### Set Environment Variables

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set EMAIL_FROM=alertas@nautilus.ai
```

### Schedule the Monitor (Recommended)

Schedule this function to run daily to check cron health:

```bash
# Run daily at 9 AM (after the daily report should have run at 8 AM)
supabase functions schedule monitor-cron-health \
  --cron "0 9 * * *" \
  --endpoint-type=public
```

Or use pg_cron:

```sql
-- Schedule to run daily at 9 AM
SELECT cron.schedule(
  'monitor-cron-health',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/monitor-cron-health',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

## Manual Testing

### Test the function manually:

```bash
# Using curl
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Using Supabase CLI
supabase functions invoke monitor-cron-health
```

### Expected Responses:

**When cron is healthy:**
```
✅ Cron executado normalmente.
```

**When cron hasn't run in 36+ hours:**
```
⚠️ Alerta enviado com sucesso
```
(Admin receives email alert)

## Database Dependencies

### SQL Function

The function relies on `check_daily_cron_execution()` which:
- Queries `assistant_report_logs` table
- Checks for successful automated executions
- Returns status ('ok' or 'error') and descriptive message

### Migration

Created by: `supabase/migrations/20251012213000_create_check_daily_cron_function.sql`

## Alert Email Format

When a failure is detected, the admin receives:

**Subject:** ⚠️ Alerta: Cron Diário Não Executado

**Body:**
- Description of the issue
- Hours since last execution
- Link to admin panel: `/admin/reports/assistant`
- Timestamp of the alert

## Troubleshooting

### Function returns 500 error

**Check:**
1. Environment variables are set correctly
2. Resend API key is valid
3. SQL function exists in database

```sql
-- Verify function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'check_daily_cron_execution';
```

### No alert email received

**Check:**
1. Resend API key is valid
2. `ADMIN_EMAIL` environment variable is set
3. `EMAIL_FROM` is a verified domain in Resend
4. Check function logs in Supabase dashboard

### False positive alerts

**Possible causes:**
1. Daily cron is legitimately not running
2. Cron is running but failing (check `assistant_report_logs`)
3. Time threshold (36 hours) may need adjustment

```sql
-- Check recent cron executions
SELECT sent_at, status, message, triggered_by 
FROM assistant_report_logs 
WHERE triggered_by = 'automated'
ORDER BY sent_at DESC 
LIMIT 10;
```

## Integration with Existing System

This monitor integrates with:

- **Database Table**: `assistant_report_logs` - tracks all cron executions
- **Monitored Function**: `send-daily-assistant-report` - the function being monitored
- **Admin Panel**: `/admin/reports/assistant` - referenced in alert emails

## Future Enhancements

- [ ] Support multiple notification channels (Slack, SMS)
- [ ] Configurable time threshold
- [ ] Detailed execution statistics in alert
- [ ] Automatic retry of failed cron jobs
- [ ] Dashboard for monitoring history
