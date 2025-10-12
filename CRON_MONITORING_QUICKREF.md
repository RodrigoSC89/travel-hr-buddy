# 🚀 Cron Monitoring - Quick Reference

## Quick Setup

1. **Deploy migrations:**
   ```bash
   supabase db push
   ```

2. **Deploy functions:**
   ```bash
   supabase functions deploy send-daily-assistant-report
   supabase functions deploy monitor-cron-health
   ```

3. **Schedule health monitor:**
   ```bash
   # Run every 12 hours
   0 */12 * * * monitor-cron-health
   ```

## Quick Checks

### View Recent Executions
```sql
SELECT function_name, status, message, executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 10;
```

### Check Success Rate
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) as success_rate
FROM cron_execution_logs
WHERE function_name = 'send-assistant-report-daily'
  AND executed_at >= NOW() - INTERVAL '7 days';
```

### Manual Health Check
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Alert Triggers

- **Warning**: No execution in last 36 hours
- **Alert Email**: Sent automatically to ADMIN_EMAIL
- **Check Frequency**: Every 12 hours (recommended)

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_EMAIL` | Alert recipient | admin@nautilus.ai |
| `EMAIL_FROM` | Alert sender | alertas@nautilus.ai |
| `RESEND_API_KEY` | Email service | - |

## Components

| Component | Purpose | File |
|-----------|---------|------|
| Database Table | Store execution logs | `cron_execution_logs` |
| SQL Function | Check health | `check_daily_cron_execution()` |
| Edge Function 1 | Daily report (updated) | `send-daily-assistant-report` |
| Edge Function 2 | Health monitor (new) | `monitor-cron-health` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No logs | Check service role key and migrations |
| No alerts | Verify RESEND_API_KEY and ADMIN_EMAIL |
| False alerts | Adjust 36-hour threshold in SQL function |

## Next Steps

1. ✅ Deploy to production
2. ⏰ Configure cron schedule
3. 📧 Test alert emails
4. 📊 Monitor execution logs
5. 🔧 Adjust thresholds as needed

---

📖 Full documentation: [CRON_MONITORING_GUIDE.md](./CRON_MONITORING_GUIDE.md)
