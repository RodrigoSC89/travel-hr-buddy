# PR #403 Quick Reference Guide
## Cron Execution Monitoring System

### 🎯 What Was Added?

✅ **New Table**: `cron_execution_logs` - Tracks all cron job executions  
✅ **Updated Function**: `send-daily-assistant-report` - Logs to new table  
✅ **Updated Function**: `check_daily_cron_execution()` - Uses new table  
✅ **New Cron**: `monitor-cron-health` - Runs every 12 hours  

---

## 📦 Files Changed

### Created (2 files)
- `supabase/migrations/20251013000000_create_cron_execution_logs.sql`
- `supabase/migrations/20251013000001_update_check_daily_cron_function.sql`

### Modified (3 files)
- `supabase/functions/send-daily-assistant-report/index.ts` (+48 lines)
- `supabase/functions/monitor-cron-health/index.ts` (1 line)
- `supabase/config.toml` (+7 lines)

---

## 🗄️ Database Schema

### `cron_execution_logs` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| function_name | TEXT | Function that executed (e.g., 'send-daily-assistant-report') |
| status | TEXT | 'success', 'error', 'warning', or 'critical' |
| message | TEXT | Human-readable result message |
| executed_at | TIMESTAMPTZ | When it executed (default: NOW()) |
| error_details | JSONB | Error information if failed |
| execution_duration_ms | INTEGER | Duration in milliseconds |
| metadata | JSONB | Additional data (logs_count, recipient, etc.) |

### Indexes
- `idx_cron_execution_logs_executed_at` - Time-based queries
- `idx_cron_execution_logs_function_name` - Filter by function
- `idx_cron_execution_logs_status` - Filter by status

### RLS Policies
- **INSERT**: Service role only
- **SELECT**: Admins only (profiles.role = 'admin')

---

## 🔄 Cron Schedules

| Cron Job | Function | Schedule | Description |
|----------|----------|----------|-------------|
| daily-restore-report | send_daily_restore_report | 0 7 * * * | Daily restore report at 7 AM UTC |
| daily-assistant-report | send-daily-assistant-report | 0 8 * * * | Daily assistant report at 8 AM UTC |
| **monitor-cron-health** | **monitor-cron-health** | **0 */12 * * *** | **Health check every 12 hours** |

---

## 📊 Logging Points in `send-daily-assistant-report`

### 1. ✅ Success
```typescript
await logCronExecution(supabase, "success", 
  `Report sent successfully to ${ADMIN_EMAIL}`,
  { logs_count, recipient, email_service },
  null,
  startTime
);
```

### 2. ❌ Log Fetch Error
```typescript
await logCronExecution(supabase, "error", 
  "Failed to fetch assistant logs", 
  { step: "fetch_logs" }, 
  logsError, 
  startTime
);
```

### 3. ❌ Email Send Error
```typescript
await logCronExecution(supabase, "error", 
  "Failed to send email", 
  { step: "send_email", logs_count, recipient }, 
  emailError, 
  startTime
);
```

### 4. 🚨 Critical Error
```typescript
await logCronExecution(supabase, "critical", 
  "Critical error in function",
  { step: "general_exception" }, 
  error, 
  startTime
);
```

---

## 🔍 Useful Queries

### Recent Executions
```sql
SELECT function_name, status, message, executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC
LIMIT 10;
```

### Failed Executions
```sql
SELECT function_name, status, message, error_details, executed_at
FROM cron_execution_logs
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC;
```

### Success Rate (Last 30 Days)
```sql
SELECT 
  function_name,
  COUNT(*) FILTER (WHERE status='success') * 100.0 / COUNT(*) as success_rate,
  COUNT(*) as total_executions
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY function_name;
```

### Average Execution Duration
```sql
SELECT 
  function_name,
  AVG(execution_duration_ms) as avg_duration_ms,
  MIN(execution_duration_ms) as min_duration_ms,
  MAX(execution_duration_ms) as max_duration_ms
FROM cron_execution_logs
WHERE status = 'success'
GROUP BY function_name;
```

---

## 🚀 Deployment Commands

```bash
# 1. Deploy migrations
supabase db push

# 2. Deploy functions
supabase functions deploy send-daily-assistant-report
supabase functions deploy monitor-cron-health

# 3. Set environment variables (if not already set)
supabase secrets set ADMIN_EMAIL=admin@example.com
supabase secrets set EMAIL_FROM=alerts@example.com
supabase secrets set RESEND_API_KEY=re_xxxxx
```

---

## 🧪 Testing

### Manual Health Check
```bash
curl -X POST https://your-project.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Expected Responses

**When OK:**
```
✅ Cron executado normalmente.
```

**When Warning:**
```
⚠️ Alerta enviado com sucesso
```

---

## 📧 Email Alert Format

**Subject**: `⚠️ Alerta: Cron Diário Não Executado`

**Content**:
- Function name: send-assistant-report-daily
- Last execution timestamp
- Action required: Review logs at /admin/reports/assistant
- Timestamp of alert

**Delivery**: Via Resend API to ADMIN_EMAIL

---

## 🔐 Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| ADMIN_EMAIL | Admin email for alerts | admin@example.com |
| EMAIL_FROM | From address for emails | alerts@example.com |
| RESEND_API_KEY | Resend API key | re_xxxxxxxxxxxxx |

---

## ✅ Checklist

Before deploying:
- [ ] Supabase project configured
- [ ] Environment variables set (ADMIN_EMAIL, EMAIL_FROM, RESEND_API_KEY)
- [ ] Database migrations ready (`supabase/migrations/202510130000*.sql`)
- [ ] Edge functions updated
- [ ] Config.toml updated with cron schedule

After deploying:
- [ ] Migrations applied successfully
- [ ] Functions deployed successfully
- [ ] Cron jobs appear in Supabase dashboard
- [ ] Test manual health check
- [ ] Verify first execution logs appear in `cron_execution_logs`

---

## 🆘 Troubleshooting

### No logs appearing in `cron_execution_logs`
- Check if migrations were applied: `supabase db remote list`
- Verify table exists: `SELECT * FROM cron_execution_logs LIMIT 1;`
- Check function logs in Supabase dashboard

### Email alerts not being sent
- Verify RESEND_API_KEY is set: `supabase secrets list`
- Check ADMIN_EMAIL is configured
- Review monitor-cron-health function logs

### Cron not running
- Verify cron schedule in Supabase dashboard → Edge Functions → Cron Jobs
- Check config.toml is properly formatted
- Ensure function is deployed: `supabase functions list`

---

## 📚 Related Documentation

- Full Implementation: `PR403_IMPLEMENTATION_SUMMARY.md`
- Monitor Cron Health Guide: `MONITOR_CRON_HEALTH_GUIDE.md`
- Monitor Cron Health Quickref: `MONITOR_CRON_HEALTH_QUICKREF.md`

---

**Last Updated**: 2025-10-13  
**PR**: #403  
**Status**: ✅ Ready for Production
