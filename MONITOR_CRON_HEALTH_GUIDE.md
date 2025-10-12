# 🔔 Monitor Cron Health - Implementation Guide

## Overview

The **monitor-cron-health** system provides automated monitoring and alerting for the daily assistant report cron job (`send-daily-assistant-report`). It detects when the cron hasn't executed successfully within the last 36 hours and sends email alerts to administrators.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitor Cron Health                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │   Scheduled Execution (Daily 9 AM)     │
        │   - pg_cron / Supabase Scheduler       │
        └────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │   Edge Function: monitor-cron-health   │
        │   - Calls check_daily_cron_execution() │
        └────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │   SQL Function: check_daily_cron_      │
        │   execution()                          │
        │   - Queries assistant_report_logs      │
        │   - Checks last 36h                    │
        └────────────────────────────────────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
            ┌─────────┐            ┌──────────┐
            │  Status │            │  Status  │
            │   OK    │            │  ERROR   │
            └─────────┘            └──────────┘
                  │                       │
                  ▼                       ▼
            Return 200            Send Alert Email
                                  via Resend
```

## Files Created

### 1. SQL Migration
**File:** `supabase/migrations/20251012213000_create_check_daily_cron_function.sql`

**Purpose:** Creates the `check_daily_cron_execution()` SQL function

**What it does:**
- Queries `assistant_report_logs` table
- Finds the most recent successful automated execution
- Calculates hours since last execution
- Returns status ('ok' or 'error') and descriptive message

### 2. Edge Function
**File:** `supabase/functions/monitor-cron-health/index.ts`

**Purpose:** Monitors cron health and sends alerts

**What it does:**
- Calls `check_daily_cron_execution()` SQL function
- If status is 'ok': Returns success message
- If status is 'error': Sends email alert via Resend
- Handles errors gracefully

### 3. Documentation
**Files:**
- `supabase/functions/monitor-cron-health/README.md` - Detailed function docs
- `ASSISTANT_REPORT_LOGS_INDEX.md` - Updated with monitoring section
- `.env.example` - Updated with environment variables

## Deployment Steps

### Step 1: Deploy Database Migration

```bash
# Navigate to project directory
cd /path/to/travel-hr-buddy

# Apply migration
supabase db push

# Or apply specific migration
supabase db execute -f supabase/migrations/20251012213000_create_check_daily_cron_function.sql
```

### Step 2: Verify SQL Function

```sql
-- Check if function exists
SELECT routine_name, routine_schema
FROM information_schema.routines 
WHERE routine_name = 'check_daily_cron_execution';

-- Test the function
SELECT * FROM check_daily_cron_execution();
```

Expected output:
```
status | message
-------|--------
ok     | Cron executado normalmente. Última execução há X.X horas
```

### Step 3: Deploy Edge Function

```bash
# Deploy the function
supabase functions deploy monitor-cron-health
```

### Step 4: Configure Environment Variables

Set the required secrets in Supabase:

```bash
# Resend API key (for sending emails)
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Admin email (who receives alerts)
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai

# From email (sender address)
supabase secrets set EMAIL_FROM=alertas@nautilus.ai
```

**Note:** Ensure your `EMAIL_FROM` domain is verified in Resend.

### Step 5: Test the Function Manually

```bash
# Test via Supabase CLI
supabase functions invoke monitor-cron-health

# Test via curl
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Step 6: Schedule Automated Execution

#### Option A: Using pg_cron (Recommended)

```sql
-- Install pg_cron extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule monitor to run daily at 9:00 AM UTC
SELECT cron.schedule(
  'monitor-cron-health-daily',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/monitor-cron-health',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);

-- Verify schedule
SELECT * FROM cron.job WHERE jobname = 'monitor-cron-health-daily';
```

#### Option B: Using Supabase Cron

```bash
# Schedule via Supabase CLI
supabase functions schedule monitor-cron-health \
  --cron "0 9 * * *" \
  --endpoint-type=public
```

#### Option C: External Cron Service

Use services like:
- GitHub Actions (workflow scheduled)
- Vercel Cron
- Railway Cron
- EasyCron
- cron-job.org

Example GitHub Action (`.github/workflows/monitor-cron.yml`):

```yaml
name: Monitor Cron Health

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:      # Allow manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Call Monitor Function
        run: |
          curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## Configuration

### Time Threshold

The monitoring function checks if the cron has executed in the **last 36 hours**. This threshold:
- Allows for daily execution
- Provides buffer for weekend gaps
- Can be adjusted in the SQL function if needed

To change the threshold:

```sql
-- Edit the SQL function
-- Change line: IF hours_since_execution > 36 THEN
-- To your preferred threshold
```

### Alert Email Template

The alert email is sent when the cron hasn't executed. Template includes:
- Subject: `⚠️ Alerta: Cron Diário Não Executado`
- Details of the issue
- Hours since last execution
- Link to admin panel: `/admin/reports/assistant`
- Timestamp

To customize the email template, edit:
`supabase/functions/monitor-cron-health/index.ts` (lines 58-71)

## Testing

### Test Case 1: Healthy Cron

**Setup:**
- Ensure `send-daily-assistant-report` has run recently

**Execute:**
```bash
supabase functions invoke monitor-cron-health
```

**Expected:**
```
✅ Cron executado normalmente.
```

### Test Case 2: Failed Cron

**Setup:**
```sql
-- Simulate old execution (set last execution to 48 hours ago)
UPDATE assistant_report_logs
SET sent_at = NOW() - INTERVAL '48 hours'
WHERE triggered_by = 'automated'
AND sent_at = (
  SELECT MAX(sent_at) FROM assistant_report_logs 
  WHERE triggered_by = 'automated'
);
```

**Execute:**
```bash
supabase functions invoke monitor-cron-health
```

**Expected:**
- Response: `⚠️ Alerta enviado com sucesso`
- Admin receives email alert

**Cleanup:**
```sql
-- Restore to normal state
UPDATE assistant_report_logs
SET sent_at = NOW()
WHERE triggered_by = 'automated'
AND sent_at = (
  SELECT MAX(sent_at) FROM assistant_report_logs 
  WHERE triggered_by = 'automated'
);
```

### Test Case 3: No Executions in History

**Setup:**
```sql
-- Temporarily clear logs (BE CAREFUL!)
DELETE FROM assistant_report_logs WHERE triggered_by = 'automated';
```

**Execute:**
```bash
supabase functions invoke monitor-cron-health
```

**Expected:**
- Response: `⚠️ Alerta enviado com sucesso`
- Email: "Nenhuma execução do cron encontrada no histórico"

## Monitoring

### View Function Logs

```bash
# View logs in Supabase dashboard
# Navigate to: Edge Functions > monitor-cron-health > Logs

# Or use CLI
supabase functions logs monitor-cron-health
```

### Check Scheduled Job Status

```sql
-- Check pg_cron job
SELECT * FROM cron.job WHERE jobname = 'monitor-cron-health-daily';

-- View job run history
SELECT * 
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'monitor-cron-health-daily')
ORDER BY start_time DESC
LIMIT 10;
```

### Alert Email Delivery

Check Resend dashboard:
- https://resend.com/emails
- Filter by subject: "Alerta: Cron Diário Não Executado"

## Troubleshooting

### Problem: Function returns 500 error

**Possible causes:**
1. SQL function doesn't exist
2. Environment variables not set
3. Database connection issues

**Solutions:**
```sql
-- 1. Verify SQL function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'check_daily_cron_execution';

-- 2. Check environment variables
-- In Supabase dashboard: Settings > Edge Functions > Secrets

-- 3. Check database connection
SELECT NOW();
```

### Problem: No alert email received

**Possible causes:**
1. Resend API key invalid
2. EMAIL_FROM domain not verified
3. ADMIN_EMAIL not set or invalid
4. Email caught in spam filter

**Solutions:**
```bash
# 1. Verify Resend API key
# Test in Resend dashboard: https://resend.com/api-keys

# 2. Verify domain in Resend
# Check: https://resend.com/domains

# 3. Check environment variables
supabase secrets list

# 4. Check email spam folder
# Or test with a personal email first
```

### Problem: False positive alerts

**Possible causes:**
1. Daily cron legitimately not running
2. Time threshold too short
3. Cron is running but failing (status != 'success')

**Solutions:**
```sql
-- 1. Check if cron is actually running
SELECT sent_at, status, message, triggered_by
FROM assistant_report_logs
WHERE triggered_by = 'automated'
ORDER BY sent_at DESC
LIMIT 10;

-- 2. Adjust time threshold in SQL function (change 36 to higher value)

-- 3. Check for failed executions
SELECT COUNT(*) 
FROM assistant_report_logs
WHERE triggered_by = 'automated'
AND status != 'success'
AND sent_at > NOW() - INTERVAL '48 hours';
```

## Maintenance

### Update SQL Function

If you need to modify the monitoring logic:

1. Create a new migration file:
```bash
supabase migration new update_check_daily_cron_function
```

2. Add your changes:
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_update_check_daily_cron_function.sql
DROP FUNCTION IF EXISTS check_daily_cron_execution();

CREATE OR REPLACE FUNCTION check_daily_cron_execution()
-- ... your updated function
```

3. Apply migration:
```bash
supabase db push
```

### Update Edge Function

```bash
# Make changes to: supabase/functions/monitor-cron-health/index.ts

# Deploy updated function
supabase functions deploy monitor-cron-health

# Test
supabase functions invoke monitor-cron-health
```

## Security Considerations

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
2. **Resend API Key**: Keep secure, has access to send emails from your domain
3. **Admin Email**: Ensure only authorized personnel have access
4. **Function Access**: Consider restricting function invocation to scheduled jobs only

## Integration with Existing System

This monitoring system integrates with:

- **Database Table**: `assistant_report_logs` - Primary data source
- **Monitored Function**: `send-daily-assistant-report` - The function being monitored
- **Admin Panel**: `/admin/reports/assistant` - Referenced in alert emails
- **Email Service**: Resend - For sending alert notifications

## Future Enhancements

Potential improvements:

- [ ] Add Slack webhook notifications
- [ ] Add SMS alerts via Twilio
- [ ] Dashboard for monitoring history
- [ ] Configurable thresholds per environment
- [ ] Auto-retry failed cron jobs
- [ ] Multiple admin email recipients
- [ ] Severity levels (warning, critical)
- [ ] Integration with PagerDuty/OpsGenie

## Support

For issues or questions:
1. Check function logs in Supabase dashboard
2. Review SQL function output: `SELECT * FROM check_daily_cron_execution();`
3. Test edge function manually: `supabase functions invoke monitor-cron-health`
4. Check Resend email logs: https://resend.com/emails

## Summary

✅ **What was implemented:**
- SQL function to check cron execution status
- Edge function to monitor and send alerts
- Automated scheduling capability
- Comprehensive documentation
- Testing procedures
- Environment configuration

✅ **How it works:**
1. Scheduled job triggers `monitor-cron-health` daily
2. Function calls SQL to check last execution
3. If >36h since last success, sends email alert
4. Admin receives notification and can investigate

✅ **Value provided:**
- Proactive monitoring of critical cron jobs
- Automated alerts prevent silent failures
- Reduced downtime and faster incident response
- Integration with existing log infrastructure
