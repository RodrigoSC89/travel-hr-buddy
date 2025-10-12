# 🔍 Cron Execution Monitoring System

## Overview

This system provides automated monitoring and alerting for scheduled cron jobs, specifically tracking the execution of the `send-assistant-report-daily` function. It ensures that critical automated tasks are running as expected and sends alerts when failures are detected.

## Architecture

The monitoring system consists of 4 main components:

### 1. Database Table: `cron_execution_logs`

Tracks all cron job executions with their status and timestamp.

**Schema:**
```sql
create table cron_execution_logs (
  id uuid primary key default gen_random_uuid(),
  function_name text not null,
  status text not null check (status in ('success', 'error', 'warning')),
  message text,
  executed_at timestamptz default now()
);
```

**Fields:**
- `id`: Unique identifier for each log entry
- `function_name`: Name of the cron function being executed
- `status`: Execution status (success, error, or warning)
- `message`: Descriptive message about the execution
- `executed_at`: Timestamp of when the execution occurred

**Indexes:**
- `idx_cron_execution_logs_executed_at`: For time-based queries
- `idx_cron_execution_logs_function_name`: For filtering by function
- `idx_cron_execution_logs_status`: For filtering by status

### 2. Database Function: `check_daily_cron_execution()`

SQL function that checks the health of daily cron executions.

**Returns:**
- `status`: 'ok' if executed within 36 hours, 'warning' if not
- `message`: Human-readable message with last execution time

**Logic:**
```sql
create or replace function check_daily_cron_execution()
returns table(status text, message text)
language sql
as $$
  select
    case
      when max(executed_at) < now() - interval '36 hours'
        then 'warning'
      else 'ok'
    end as status,
    'Última execução: ' || max(executed_at) as message
  from cron_execution_logs
  where function_name = 'send-assistant-report-daily';
$$;
```

### 3. Edge Function: `send-daily-assistant-report`

Updated to log all executions (success and failures) to `cron_execution_logs`.

**Changes:**
- Logs successful executions with status 'success'
- Logs errors at multiple failure points (fetch error, send error, general error)
- Each execution is logged with a descriptive message

**Example logging:**
```typescript
await supabase.from('cron_execution_logs').insert({
  function_name: 'send-assistant-report-daily',
  status: 'success',
  message: 'Enviado com sucesso'
});
```

### 4. Edge Function: `monitor-cron-health`

Monitors cron health and sends email alerts when failures are detected.

**Features:**
- Calls `check_daily_cron_execution()` to check health
- Sends alert email if status is 'warning'
- Returns detailed status information via API

**Alert Email Content:**
- Subject: "⚠️ Falha na execução do CRON diário"
- Includes function name that failed
- Shows last execution timestamp
- Professional HTML formatting

## Setup Instructions

### 1. Deploy Database Migrations

The migrations are automatically included in the repository:
- `20251012213000_create_cron_execution_logs.sql`
- `20251012213001_create_check_daily_cron_function.sql`

Deploy with:
```bash
supabase db push
```

### 2. Deploy Edge Functions

Deploy the updated functions:
```bash
# Deploy send-daily-assistant-report (updated with logging)
supabase functions deploy send-daily-assistant-report

# Deploy monitor-cron-health (new)
supabase functions deploy monitor-cron-health
```

### 3. Set Environment Variables

Required environment variables (should already be set):
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `RESEND_API_KEY`: Resend API key for sending emails
- `ADMIN_EMAIL`: Email address to receive alerts (default: admin@nautilus.ai)
- `EMAIL_FROM`: Sender email address (default: alertas@nautilus.ai)

### 4. Schedule Cron Jobs

#### Daily Report Cron
Already configured to run daily at 7:00 AM UTC:
```bash
# No changes needed - existing schedule
0 7 * * * send-daily-assistant-report
```

#### Health Monitor Cron (NEW)
Add a new cron schedule to check health every 12 hours:
```bash
# In Supabase Dashboard > Edge Functions > Cron
0 */12 * * * monitor-cron-health
```

Or via CLI:
```bash
supabase functions schedule create \
  --function-name monitor-cron-health \
  --cron "0 */12 * * *"
```

## Usage

### Query Execution Logs

View recent executions:
```sql
SELECT 
  function_name,
  status,
  message,
  executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 20;
```

View success rate:
```sql
SELECT 
  function_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as successes,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY function_name;
```

### Manual Health Check

Trigger health check manually via HTTP:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Response format:
```json
{
  "success": true,
  "status": "ok",
  "message": "Cron execution is healthy",
  "details": {
    "status": "ok",
    "message": "Última execução: 2025-10-12 10:30:00"
  }
}
```

### Alert Email Example

When a failure is detected, admins receive:

**Subject:** ⚠️ Falha na execução do CRON diário

**Body:**
```
⚠️ Alerta de Falha no CRON

O cron send-assistant-report-daily não foi executado nas últimas 36h.

Última execução: 2025-10-10 07:00:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este é um alerta automático do sistema de monitoramento de cron jobs.
```

## Monitoring Dashboard

### Key Metrics to Track

1. **Execution Frequency**: Should have daily entries
2. **Success Rate**: Should be close to 100%
3. **Error Patterns**: Look for recurring issues
4. **Alert Response Time**: How quickly issues are resolved

### Grafana/Metabase Query Examples

**Daily Execution Count:**
```sql
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as executions
FROM cron_execution_logs
WHERE function_name = 'send-assistant-report-daily'
  AND executed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(executed_at)
ORDER BY date;
```

**Error Timeline:**
```sql
SELECT 
  executed_at,
  message
FROM cron_execution_logs
WHERE status = 'error'
  AND executed_at >= NOW() - INTERVAL '7 days'
ORDER BY executed_at DESC;
```

## Security

### Row Level Security (RLS)

The `cron_execution_logs` table has RLS enabled with policies:

1. **Service role can insert**: Allows edge functions to log executions
2. **Admin users can view**: Only admins can query execution logs

### Permissions

- Service role key: Required for edge functions to write logs
- Admin role: Required for users to view logs via Supabase dashboard

## Troubleshooting

### Common Issues

#### 1. No Logs Appearing
**Check:**
- Edge function has correct service role key
- Database migrations have been applied
- RLS policies are active

**Fix:**
```sql
-- Verify table exists
SELECT * FROM cron_execution_logs LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'cron_execution_logs';
```

#### 2. Alert Emails Not Sending
**Check:**
- RESEND_API_KEY is set correctly
- ADMIN_EMAIL is configured
- Email domain is verified in Resend

**Test:**
```bash
# Manually trigger health check
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health
```

#### 3. False Positive Alerts
**Cause:** 36-hour threshold too strict for your use case

**Fix:** Adjust the interval in the SQL function:
```sql
-- Change from 36 hours to 48 hours
when max(executed_at) < now() - interval '48 hours'
```

## Performance Considerations

### Index Usage

All queries leverage indexes for optimal performance:
- Time-based queries use `idx_cron_execution_logs_executed_at`
- Function filtering uses `idx_cron_execution_logs_function_name`
- Status filtering uses `idx_cron_execution_logs_status`

### Data Retention

Consider implementing data retention policy:
```sql
-- Delete logs older than 90 days
DELETE FROM cron_execution_logs
WHERE executed_at < NOW() - INTERVAL '90 days';
```

Schedule this as a monthly cleanup job.

## Future Enhancements

- [ ] Support multiple cron functions with different thresholds
- [ ] Add Slack/Discord webhook alerts
- [ ] Create admin dashboard for viewing execution logs
- [ ] Implement automatic retry logic for failed executions
- [ ] Add performance metrics (execution duration)
- [ ] Support custom alert recipients per function
- [ ] Add SMS alerts for critical failures

## Related Files

- `supabase/migrations/20251012213000_create_cron_execution_logs.sql`
- `supabase/migrations/20251012213001_create_check_daily_cron_function.sql`
- `supabase/functions/send-daily-assistant-report/index.ts`
- `supabase/functions/monitor-cron-health/index.ts`

## Support

For questions or issues:
1. Check execution logs in Supabase Dashboard
2. Review edge function logs
3. Test health check endpoint manually
4. Verify environment variables are set

---

**Implemented**: October 12, 2025  
**Status**: ✅ Ready for Production  
**Monitoring**: Automated with alerts
