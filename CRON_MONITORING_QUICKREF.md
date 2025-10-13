# ⚡ Cron Monitoring - Quick Reference

## 2-Minute Quick Start

### Essential Commands

```bash
# Deploy everything
supabase db push
supabase functions deploy send-daily-assistant-report
supabase functions deploy monitor-cron-health

# Configure secrets
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set RESEND_API_KEY=re_xxxxx
```

### Schedule Cron Jobs

```sql
-- Daily report at 8 AM UTC
SELECT cron.schedule('daily-assistant-report', '0 8 * * *', 
  $$SELECT net.http_post(url:='https://PROJECT.supabase.co/functions/v1/send-daily-assistant-report', headers:='{"Authorization": "Bearer KEY"}'::jsonb);$$
);

-- Health check every 12 hours
SELECT cron.schedule('monitor-cron-health', '0 */12 * * *',
  $$SELECT net.http_post(url:='https://PROJECT.supabase.co/functions/v1/monitor-cron-health', headers:='{"Authorization": "Bearer KEY"}'::jsonb);$$
);
```

## Common Queries

### View Recent Executions
```sql
SELECT function_name, status, message, executed_at
FROM cron_execution_logs
ORDER BY executed_at DESC LIMIT 10;
```

### Success Rate (Last 30 Days)
```sql
SELECT 
  COUNT(*) FILTER (WHERE status='success') * 100.0 / COUNT(*) as rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '30 days';
```

### Find Failures
```sql
SELECT * FROM cron_execution_logs
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC;
```

## Quick Tests

```bash
# Test daily report
curl -X POST https://PROJECT.supabase.co/functions/v1/send-daily-assistant-report \
  -H "Authorization: Bearer ANON_KEY"

# Test health monitor
curl -X POST https://PROJECT.supabase.co/functions/v1/monitor-cron-health \
  -H "Authorization: Bearer ANON_KEY"
```

## Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| `success` | ✅ Function executed successfully | None |
| `error` | ❌ Recoverable error occurred | Review logs |
| `warning` | ⚠️ Cron overdue (>36h) | Check scheduler |
| `critical` | 🔴 Critical failure | Immediate action |

## Troubleshooting (30 seconds)

**Cron not running?**
```sql
SELECT * FROM cron.job WHERE jobname LIKE '%assistant%';
```

**Email not sending?**
```bash
supabase secrets list  # Verify RESEND_API_KEY
```

**No logs?**
```sql
\d cron_execution_logs  # Verify table exists
```

## Environment Variables

```bash
ADMIN_EMAIL           # Email for alerts (required)
RESEND_API_KEY        # Resend API key (required)
EMAIL_FROM            # From email (optional, default: alertas@nautilus.ai)
SUPABASE_URL          # Auto-configured
SUPABASE_SERVICE_ROLE_KEY  # Auto-configured
```

## Monitoring Dashboard Queries

### Execution Count Today
```sql
SELECT COUNT(*) FROM cron_execution_logs
WHERE executed_at >= CURRENT_DATE;
```

### Average Executions Per Day
```sql
SELECT DATE(executed_at) as day, COUNT(*) as executions
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(executed_at)
ORDER BY day DESC;
```

### Error Rate by Function
```sql
SELECT 
  function_name,
  COUNT(*) FILTER (WHERE status='error') as errors,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE status='error') * 100.0 / COUNT(*), 2) as error_rate
FROM cron_execution_logs
WHERE executed_at >= NOW() - INTERVAL '7 days'
GROUP BY function_name;
```

## Cron Schedule Examples

```
0 8 * * *      # Daily at 8 AM UTC
0 */12 * * *   # Every 12 hours
0 0 * * 0      # Weekly on Sunday midnight
0 0 1 * *      # Monthly on 1st at midnight
*/5 * * * *    # Every 5 minutes
```

## Quick Health Check

```sql
-- Check last execution
SELECT 
  function_name,
  status,
  message,
  executed_at,
  EXTRACT(EPOCH FROM (NOW() - executed_at))/3600 as hours_ago
FROM cron_execution_logs
WHERE function_name = 'send-daily-assistant-report'
ORDER BY executed_at DESC LIMIT 1;
```

## Alert Email Sample

When cron fails, admins receive:

**Subject**: ⚠️ Alerta: Cron Diário Não Executado

**Body**:
```
⚠️ Alerta de Monitoramento

O cron send-assistant-report-daily não foi executado nas últimas 36 horas.

Detalhes: Última execução há 48.0 horas

Ação requerida: Revisar logs no painel /admin/reports/assistant

---
Este é um alerta automático do sistema de monitoramento.
Função: monitor-cron-health
```

## Important Notes

✅ Non-blocking logging (won't fail main flow)  
✅ RLS protects sensitive data  
✅ Service role only for inserts  
✅ Optimized indexes for fast queries  
✅ 36-hour detection threshold  

## Next Steps

1. ✅ Deploy migrations and functions
2. ✅ Configure secrets
3. ✅ Schedule cron jobs
4. ✅ Test manually
5. ✅ Monitor logs
6. ✅ Wait for first alert (if needed)

---

For detailed information, see [CRON_MONITORING_INDEX.md](./CRON_MONITORING_INDEX.md)
