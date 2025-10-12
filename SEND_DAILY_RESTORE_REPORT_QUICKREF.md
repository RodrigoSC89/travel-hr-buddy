# Send Daily Restore Report - Quick Reference

## 🚀 Quick Deploy

### 1. Environment Variables
Add these to Supabase Dashboard → Settings → Edge Functions:
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
ADMIN_EMAIL=admin@empresa.com
```

### 2. Deploy
```bash
# Apply migration
supabase db push

# Deploy function
supabase functions deploy send-daily-restore-report
```

### 3. Test
```bash
# Invoke manually
supabase functions invoke send-daily-restore-report

# Check logs
supabase functions logs send-daily-restore-report
```

## 📋 What It Does

1. **Runs daily at 7:00 AM** (configured in `supabase/config.toml`)
2. **Queries logs** from `restore_report_logs` (last 24 hours)
3. **Formats email** with log details
4. **Sends via SendGrid** to configured admin email
5. **Logs result** in `report_email_logs` table

## 📊 Database Tables

### Input: `restore_report_logs`
- Created by `daily-restore-report` function
- Tracks restore report executions

### Output: `report_email_logs`
- Created by this migration
- Tracks email sending attempts

```sql
-- View recent email logs
SELECT * FROM report_email_logs ORDER BY sent_at DESC LIMIT 10;

-- Success rate
SELECT status, COUNT(*) FROM report_email_logs GROUP BY status;
```

## 📧 Email Format

**Subject**: `📄 Relatório de Logs - 12/10/2025`

**Body**:
```
📅 2025-10-12T07:00:00.000Z
🔹 Status: success
📝 Relatório enviado com sucesso.

📅 2025-10-11T23:00:00.000Z
🔹 Status: error
📝 Falha no envio do e-mail
❗ {"statusCode": 500, "message": "..."}
```

## 🔧 Configuration

### Cron Schedule
File: `supabase/config.toml`
```toml
[functions.send_daily_restore_report]
  schedule = "0 7 * * *"  # Daily at 7:00 AM UTC
```

Change schedule as needed (cron syntax).

## 📁 Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251012002627_create_report_email_logs.sql` | Creates `report_email_logs` table |
| `supabase/functions/send-daily-restore-report/index.ts` | Edge function implementation |
| `supabase/functions/send-daily-restore-report/README.md` | Detailed documentation |
| `supabase/config.toml` | Cron schedule configuration |
| `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md` | Complete implementation guide |

## 🔍 Monitoring

```sql
-- Recent email logs
SELECT sent_at, status, message 
FROM report_email_logs 
ORDER BY sent_at DESC 
LIMIT 10;

-- Success rate (last 30 days)
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM report_email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;

-- Failed emails
SELECT sent_at, message
FROM report_email_logs
WHERE status = 'error'
ORDER BY sent_at DESC;
```

## ⚠️ Troubleshooting

### Email not sending?
1. Check `SENDGRID_API_KEY` is set correctly
2. Verify SendGrid account is active
3. Check function logs: `supabase functions logs send-daily-restore-report`
4. Query `report_email_logs` for error messages

### No logs in email?
1. Verify `restore_report_logs` has data
2. Check date range (last 24 hours)
3. Function runs daily - may not have logs yet

### Cron not triggering?
1. Verify config.toml is deployed
2. Check Supabase Dashboard → Edge Functions → Cron Jobs
3. May need to redeploy after config changes

## 📚 Related Documentation

- Full details: `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md`
- Function README: `supabase/functions/send-daily-restore-report/README.md`
- Related function: `supabase/functions/daily-restore-report/`
