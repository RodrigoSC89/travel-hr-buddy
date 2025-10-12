# 🔔 Monitor Cron Health - Quick Reference

## 📝 What It Does

Monitors the `send-daily-assistant-report` cron job and sends email alerts when it hasn't executed successfully in the last 36 hours.

## ⚡ Quick Start

### Deploy (3 steps)

```bash
# 1. Apply database migration
supabase db push

# 2. Deploy edge function
supabase functions deploy monitor-cron-health

# 3. Set secrets
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set EMAIL_FROM=alertas@nautilus.ai
```

### Test

```bash
# Test manually
supabase functions invoke monitor-cron-health

# Expected output:
# ✅ Cron executado normalmente.
# OR
# ⚠️ Alerta enviado com sucesso
```

### Schedule

```sql
-- Run daily at 9 AM via pg_cron
SELECT cron.schedule(
  'monitor-cron-health-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/monitor-cron-health',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## 📋 Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251012213000_create_check_daily_cron_function.sql` | SQL function |
| `supabase/functions/monitor-cron-health/index.ts` | Edge function |
| `supabase/functions/monitor-cron-health/README.md` | Detailed docs |
| `MONITOR_CRON_HEALTH_GUIDE.md` | Full guide |
| `src/tests/monitor-cron-health.test.ts` | Test suite |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key | `re_abc123...` |
| `ADMIN_EMAIL` | Alert recipient | `admin@nautilus.ai` |
| `EMAIL_FROM` | Alert sender | `alertas@nautilus.ai` |

### Settings

- **Threshold**: 36 hours (configurable in SQL function)
- **Check**: Queries `assistant_report_logs` table
- **Filter**: `triggered_by = 'automated'` AND `status = 'success'`

## 📊 How It Works

```
Monitor Function
      ↓
SQL: check_daily_cron_execution()
      ↓
Query assistant_report_logs
      ↓
Check last execution time
      ↓
   Is it > 36h?
      ↓
  ┌───┴───┐
  NO     YES
  ↓       ↓
Return  Send
  OK    Alert
```

## ✅ Verification

### Check SQL Function

```sql
-- Test the SQL function
SELECT * FROM check_daily_cron_execution();

-- Expected: { status: 'ok', message: '...' }
-- OR:       { status: 'error', message: '...' }
```

### Check Last Execution

```sql
-- View recent cron executions
SELECT sent_at, status, message
FROM assistant_report_logs
WHERE triggered_by = 'automated'
ORDER BY sent_at DESC
LIMIT 5;
```

### Check Scheduled Job

```sql
-- View pg_cron job
SELECT * FROM cron.job 
WHERE jobname = 'monitor-cron-health-daily';
```

## 🚨 Troubleshooting

### No Alert Email

**Problem**: Cron failed but no email received

**Solutions**:
1. Check Resend API key: `supabase secrets list`
2. Verify email domain in Resend dashboard
3. Check spam folder
4. Test function manually: `supabase functions invoke monitor-cron-health`

### False Positives

**Problem**: Getting alerts but cron is running

**Solutions**:
```sql
-- Check if cron is actually succeeding
SELECT sent_at, status 
FROM assistant_report_logs
WHERE triggered_by = 'automated'
ORDER BY sent_at DESC
LIMIT 10;

-- Look for failures or gaps
```

### Function Error

**Problem**: Function returns 500 error

**Solutions**:
```sql
-- 1. Verify SQL function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'check_daily_cron_execution';

-- 2. Test SQL function directly
SELECT * FROM check_daily_cron_execution();
```

## 📧 Alert Email

**Subject**: ⚠️ Alerta: Cron Diário Não Executado

**Content**:
- Alert description
- Hours since last execution
- Link to admin panel: `/admin/reports/assistant`
- Timestamp

## 📱 API Endpoints

### Manual Invocation

```bash
# Via curl
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Via Supabase CLI
supabase functions invoke monitor-cron-health
```

### Responses

| Status | Message | Meaning |
|--------|---------|---------|
| 200 | ✅ Cron executado normalmente. | Healthy |
| 200 | ⚠️ Alerta enviado com sucesso | Alert sent |
| 500 | Erro na verificação. | Error |

## 🧪 Testing

### Run Tests

```bash
# Run test suite (15 tests)
npm test src/tests/monitor-cron-health.test.ts

# Expected: All tests pass ✓
```

### Simulate Failure

```sql
-- Set last execution to 48h ago (triggers alert)
UPDATE assistant_report_logs
SET sent_at = NOW() - INTERVAL '48 hours'
WHERE triggered_by = 'automated'
AND sent_at = (
  SELECT MAX(sent_at) 
  FROM assistant_report_logs 
  WHERE triggered_by = 'automated'
);

-- Test the function
-- You should receive an alert email

-- Restore
UPDATE assistant_report_logs
SET sent_at = NOW()
WHERE triggered_by = 'automated'
AND sent_at = (
  SELECT MAX(sent_at) 
  FROM assistant_report_logs 
  WHERE triggered_by = 'automated'
);
```

## 📚 Documentation

- **Full Guide**: [MONITOR_CRON_HEALTH_GUIDE.md](./MONITOR_CRON_HEALTH_GUIDE.md)
- **Function Docs**: [supabase/functions/monitor-cron-health/README.md](./supabase/functions/monitor-cron-health/README.md)
- **Integration**: [ASSISTANT_REPORT_LOGS_INDEX.md](./ASSISTANT_REPORT_LOGS_INDEX.md)

## 💡 Tips

1. **Schedule after cron**: Set monitor to run 1 hour after the daily report (e.g., if report runs at 8 AM, monitor at 9 AM)
2. **Test first**: Always test manually before scheduling
3. **Check logs**: Review Supabase function logs regularly
4. **Verify emails**: Ensure domain is verified in Resend
5. **Adjust threshold**: Change 36h if needed in SQL function

## 🔗 Related

- **Monitored Function**: `send-daily-assistant-report`
- **Database Table**: `assistant_report_logs`
- **Admin Panel**: `/admin/reports/assistant`
- **Email Service**: Resend (https://resend.com)

## 📈 Metrics

Track these metrics:
- Alert frequency (should be low)
- False positive rate
- Email delivery rate
- Response time to alerts

## 🎯 Success Criteria

✅ Function deploys successfully  
✅ All tests pass (15/15)  
✅ Manual invocation works  
✅ Alert emails delivered  
✅ Scheduled job runs automatically  
✅ No false positives  
✅ Documentation complete

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: 2025-10-12
