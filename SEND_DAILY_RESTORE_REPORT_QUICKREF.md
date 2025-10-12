# Send Daily Restore Report - Quick Reference

## 🚀 Quick Start

### Deployment (3 steps)

```bash
# 1. Apply database migration
supabase db push

# 2. Deploy function
supabase functions deploy send_daily_restore_report

# 3. Set environment variables
supabase secrets set SENDGRID_API_KEY=your_key_here
```

### Test Manually

```bash
supabase functions invoke send_daily_restore_report
```

---

## 📋 Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `SUPABASE_URL` | ✅ | Auto-configured |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Auto-configured |
| `SENDGRID_API_KEY` | ⚠️ | - |
| `ADMIN_EMAIL` | ❌ | admin@empresa.com |
| `EMAIL_FROM` | ❌ | noreply@nautilusone.com |

---

## 🔧 Common Commands

### View Function Logs
```bash
supabase functions logs send_daily_restore_report --tail
```

### Check Email Logs (SQL)
```sql
SELECT * FROM report_email_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

### Success Rate (SQL)
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM report_email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

### View Failed Attempts (SQL)
```sql
SELECT 
  sent_at,
  message,
  error_details
FROM report_email_logs
WHERE status = 'error'
ORDER BY sent_at DESC
LIMIT 20;
```

---

## 📧 Email Details

**Subject:** `📊 Relatório Diário - Restore Logs [Date]`

**Contains:**
- Status summary (Success/Error/Critical counts)
- 5 most recent logs
- CSV attachment with all logs (last 24h)

**Schedule:** Daily at 7:00 AM UTC

---

## 🗄️ Database Schema

### report_email_logs

```sql
id              UUID PRIMARY KEY
sent_at         TIMESTAMP WITH TIME ZONE
status          TEXT ('success' or 'error')
message         TEXT
error_details   JSONB
recipient_email TEXT
logs_count      INTEGER
created_at      TIMESTAMP WITH TIME ZONE
```

---

## 🔍 Monitoring Queries

### Today's Emails
```sql
SELECT * FROM report_email_logs 
WHERE sent_at::date = CURRENT_DATE;
```

### Last 7 Days Summary
```sql
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
FROM report_email_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

### Error Details
```sql
SELECT 
  sent_at,
  error_details->>'message' as error_message
FROM report_email_logs
WHERE status = 'error'
  AND sent_at >= NOW() - INTERVAL '24 hours';
```

---

## 🐛 Troubleshooting

### No Email Received
1. Check SendGrid API key: `supabase secrets list`
2. View email logs: `SELECT * FROM report_email_logs WHERE status = 'error';`
3. Check function logs: `supabase functions logs send_daily_restore_report`

### Function Errors
1. Test manually: `supabase functions invoke send_daily_restore_report --debug`
2. Verify env vars are set
3. Check database permissions

### Database Migration Issues
1. Verify table exists: `SELECT * FROM pg_tables WHERE tablename = 'report_email_logs';`
2. Check RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'report_email_logs';`

---

## 🔐 Security

- ✅ RLS enabled on `report_email_logs`
- ✅ Service role can insert logs
- ✅ Only admins can view logs
- ✅ No hardcoded credentials
- ✅ Environment variable validation

---

## 🛠️ Configuration

### Cron Schedule (config.toml)
```toml
[[edge_runtime.cron]]
name = "daily-restore-report"
function_name = "send_daily_restore_report"
schedule = "0 7 * * *"  # 7:00 AM UTC
```

### Change Schedule
```toml
schedule = "0 9 * * *"  # 9:00 AM UTC
schedule = "0 */6 * * *"  # Every 6 hours
schedule = "0 7 * * 1"  # Every Monday at 7 AM
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Daily restore report sent successfully",
  "logsCount": 15,
  "recipient": "admin@empresa.com",
  "emailSent": true,
  "timestamp": "2025-10-12T07:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "SendGrid API error: 401 - Unauthorized",
  "timestamp": "2025-10-12T07:00:00.000Z"
}
```

---

## 🔗 Integration

This function integrates with:
- **daily-restore-report**: Source of logs
- **restore_report_logs**: Input table
- **report_email_logs**: Audit trail table

---

## 📈 Performance

- **Execution Time**: 2-5 seconds
- **Database Queries**: 2 queries
- **Email Size**: ~50KB
- **Rate Limit**: 100 emails/day (SendGrid free)

---

## 🚨 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing required environment variables` | Missing SUPABASE_URL or SERVICE_ROLE_KEY | Check Supabase setup |
| `SendGrid API error: 401` | Invalid API key | Update SENDGRID_API_KEY |
| `Failed to fetch logs` | Database permission issue | Verify RLS policies |
| `Connection timeout` | Network issue | Check SendGrid service status |

---

## 📚 Documentation

- **Implementation Guide**: `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md`
- **Function README**: `supabase/functions/send_daily_restore_report/README.md`
- **Visual Guide**: `SEND_DAILY_RESTORE_REPORT_VISUAL.md`
- **Index**: `SEND_DAILY_RESTORE_REPORT_INDEX.md`

---

## 🎯 Key Features

- ✅ Automated daily execution
- 📊 CSV report generation
- 📧 Email delivery via SendGrid
- 🔍 Complete audit trail
- 🎨 Rich HTML emails
- ⚡ TypeScript type safety
- 🛡️ Comprehensive error handling
- 📈 Status summaries

---

## 💡 Tips

- Test function before relying on cron schedule
- Monitor email logs regularly
- Set up alerts for failed attempts
- Keep SendGrid API key secure
- Review error details for troubleshooting
- Use SQL queries for analytics
