# ⚡ Cron Monitoring - Quick Reference

## 2-Minute Overview

### What It Does
Monitors cron job executions and sends email alerts when jobs fail or don't run on schedule.

### Key Components

| Component | Purpose |
|-----------|---------|
| `cron_execution_logs` table | Stores all execution records |
| `check_daily_cron_execution()` function | Checks if jobs are running on time |
| `monitor-cron-health` function | Sends alerts when problems detected |
| Modified `send-daily-assistant-report` | Logs execution to monitoring table |

### Deploy in 3 Steps

```bash
# 1. Deploy database
supabase db push

# 2. Deploy functions
supabase functions deploy send-daily-assistant-report
supabase functions deploy monitor-cron-health

# 3. Schedule health monitor (in Supabase Dashboard or config.toml)
# Cron: 0 */12 * * * (every 12 hours)
```

### Environment Variables

```bash
ADMIN_EMAIL=admin@nautilus.ai      # Required
EMAIL_FROM=alertas@nautilus.ai     # Required
RESEND_API_KEY=re_xxxxx            # Required
```

## Quick Commands

### Test Health Check
```bash
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### View Recent Executions
```sql
SELECT function_name, status, message, executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 10;
```

### Check Success Rate (Last 30 Days)
```sql
SELECT 
  function_name,
  COUNT(*) FILTER (WHERE status='success') * 100.0 / COUNT(*) as success_rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY function_name;
```

## Alert Behavior

| Scenario | Alert Sent? |
|----------|-------------|
| Job executes successfully | ❌ No |
| Job fails but runs | ❌ No (logged only) |
| Job doesn't run for 36+ hours | ✅ Yes |
| Health monitor runs every 12 hours | ✅ If issue detected |

## What Gets Logged

Every execution of `send-daily-assistant-report` logs:
- ✅ Function name
- ✅ Status (success/error)
- ✅ Message
- ✅ Execution duration
- ✅ Metadata (logs count, recipient, service used)
- ✅ Error details (if failed)

## Monitoring Multiple Functions

To monitor additional cron jobs:

1. Add logging to the function:
```typescript
await supabase.from("cron_execution_logs").insert({
  function_name: "your-function-name",
  status: "success",
  message: "Your message",
  execution_duration_ms: duration,
  metadata: { /* your data */ }
});
```

2. Add health check in `monitor-cron-health`:
```typescript
const { data } = await supabase.rpc("check_daily_cron_execution", {
  p_function_name: "your-function-name",
  p_hours_threshold: 36
});
```

## Security

- **RLS Enabled**: Only admins can view logs
- **Service Role Only**: Only service role can insert logs
- **Secure Function**: SQL function uses SECURITY DEFINER

## Performance

- **Indexes**: 3 optimized indexes for fast queries
- **Non-Blocking**: Logging failures don't break main flow
- **Lightweight**: Minimal overhead on cron jobs

## Troubleshooting

### No Logs Appearing?
Check: Service role key configured, table exists, function deployed

### No Alerts Sent?
Check: RESEND_API_KEY set, ADMIN_EMAIL configured, health monitor scheduled

### False Alerts?
Adjust `p_hours_threshold` in health check (default: 36 hours)

## Next Steps

- 📖 [Complete Guide](./CRON_MONITORING_GUIDE.md)
- 🔧 [Implementation Details](./CRON_MONITORING_IMPLEMENTATION.md)
- 📊 [Visual Guide](./CRON_MONITORING_VISUAL.md)
