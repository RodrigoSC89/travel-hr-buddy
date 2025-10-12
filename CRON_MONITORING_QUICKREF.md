# ⚡ Cron Monitoring - Quick Reference

2-minute guide for daily operations and common tasks.

## 🚀 Essential Commands

### Deploy Everything
```bash
# Deploy database migrations
supabase db push

# Deploy edge functions
supabase functions deploy send-daily-assistant-report
supabase functions deploy monitor-cron-health
```

### Manual Health Check
```bash
# Check cron health
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Expected response when healthy:
# {"success": true, "status": "ok", "message": "Last execution was 5.2 hours ago...", "alertSent": false}
```

### Manual Trigger Daily Report
```bash
# Test the daily report function
curl -X POST https://your-project.supabase.co/functions/v1/send-daily-assistant-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 📊 Common SQL Queries

### View Recent Executions
```sql
-- Last 10 executions
SELECT 
  function_name,
  status,
  message,
  executed_at,
  error_details
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 10;
```

### Check Success Rate (Last 30 Days)
```sql
SELECT 
  function_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status='success') as successful,
  COUNT(*) FILTER (WHERE status='error') as errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status='success') / COUNT(*), 2) as success_rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY function_name;
```

### Find Failed Executions
```sql
-- Failed executions in last 7 days
SELECT 
  function_name,
  status,
  message,
  error_details,
  executed_at
FROM cron_execution_logs
WHERE status = 'error'
  AND executed_at >= NOW() - INTERVAL '7 days'
ORDER BY executed_at DESC;
```

### Check Last Execution Time
```sql
-- When was the last successful execution?
SELECT 
  function_name,
  executed_at,
  message,
  EXTRACT(EPOCH FROM (NOW() - executed_at))/3600 as hours_ago
FROM cron_execution_logs
WHERE function_name = 'send-assistant-report-daily'
  AND status = 'success'
ORDER BY executed_at DESC
LIMIT 1;
```

## ⚙️ Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ADMIN_EMAIL` | Email address for alerts | `admin@nautilus.ai` | ✅ Yes |
| `EMAIL_FROM` | Sender email address | `alertas@nautilus.ai` | No |
| `RESEND_API_KEY` | Resend API key for emails | - | ✅ Yes |
| `SUPABASE_URL` | Supabase project URL | - | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | - | ✅ Yes |

### Set Environment Variables
```bash
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set EMAIL_FROM=alertas@nautilus.ai
supabase secrets set RESEND_API_KEY=re_your_api_key
```

### View Current Secrets
```bash
supabase secrets list
```

## 🔔 Alert System

### When Alerts Are Sent
- ⚠️ If cron job hasn't executed successfully in **36 hours**
- 📧 Email sent to `ADMIN_EMAIL`
- 🔍 Monitor should run every **12 hours**

### Schedule Health Monitor
```sql
-- Using pg_cron (in Supabase Dashboard)
SELECT cron.schedule(
  'monitor-cron-health',
  '0 */12 * * *',  -- Every 12 hours
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/monitor-cron-health',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

### Verify Cron Schedule
```sql
-- Check active cron jobs
SELECT * FROM cron.job;

-- Check cron job run history
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'monitor-cron-health')
ORDER BY start_time DESC
LIMIT 10;
```

## 🐛 Quick Troubleshooting

### Issue: No Executions Logged
**Check:**
1. Is the function deployed? `supabase functions list`
2. Are environment variables set? `supabase secrets list`
3. Is RLS enabled? Check policies in Supabase Dashboard
4. Check function logs: `supabase functions logs send-daily-assistant-report`

### Issue: Alerts Not Sending
**Check:**
1. Is `RESEND_API_KEY` set correctly?
2. Is `ADMIN_EMAIL` configured?
3. Check monitor logs: `supabase functions logs monitor-cron-health`
4. Test health function manually (see command above)

### Issue: Wrong Success Rate
**Check:**
1. Are logs being created? Query `cron_execution_logs` table
2. Is the function completing successfully? Check function response
3. Are errors being caught and logged? Review error_details column

## 📈 Health Indicators

### Healthy System
```sql
status: "ok"
message: "Last execution was X hours ago..."
last_execution: recent timestamp (< 36 hours)
```

### Unhealthy System
```sql
status: "warning"
message: "Last execution was X hours ago..."
last_execution: old timestamp (> 36 hours) or NULL
```

## 📞 Need Help?

1. **Check Logs**: `supabase functions logs <function-name>`
2. **Query Database**: Run queries above to inspect execution history
3. **Test Manually**: Use curl commands to trigger functions
4. **Review Errors**: Check `error_details` column in `cron_execution_logs`

---

**Tip:** Bookmark this page for quick access during operations! 🔖
