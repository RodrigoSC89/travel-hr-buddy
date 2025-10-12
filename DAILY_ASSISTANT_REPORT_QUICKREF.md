# 📬 Daily Assistant Report - Quick Reference

## Quick Start

### Deploy Function
```bash
supabase functions deploy send-daily-assistant-report
```

### Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_your_key
# OR
supabase secrets set SENDGRID_API_KEY=SG.your_key

supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set EMAIL_FROM=noreply@nautilusone.com
```

### Test Function
```bash
supabase functions invoke send-daily-assistant-report
```

## Database

### Source Table: `assistant_logs`
```sql
-- Check recent assistant interactions
SELECT * FROM assistant_logs 
ORDER BY created_at DESC LIMIT 10;

-- Count interactions by user
SELECT user_id, COUNT(*) 
FROM assistant_logs 
GROUP BY user_id;
```

### Tracking Table: `assistant_report_logs`
```sql
-- Check recent report executions
SELECT * FROM assistant_report_logs 
ORDER BY sent_at DESC LIMIT 10;

-- Count by status
SELECT status, COUNT(*) 
FROM assistant_report_logs 
GROUP BY status;
```

## Cron Schedule

### Daily at 8 AM UTC
Configured in `supabase/config.toml`:
```toml
[[edge_runtime.cron]]
name = "daily-assistant-report"
function_name = "send-daily-assistant-report"
schedule = "0 8 * * *"  # Every day at 8:00 AM UTC
description = "Send daily assistant report via email with CSV attachment"
```

## Email Details

- **From:** noreply@nautilusone.com (configurable via EMAIL_FROM)
- **To:** admin@nautilusone.com (configurable via ADMIN_EMAIL)
- **Subject:** 📬 Relatório Diário - Assistente IA
- **Attachment:** relatorio-assistente-YYYY-MM-DD.csv

## CSV Contents

Table with columns:
- **Data/Hora** - Timestamp of interaction
- **Usuário** - User email
- **Pergunta** - Question asked to assistant
- **Resposta** - Answer provided by assistant

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | ✅ | - | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | - | Service role key |
| `RESEND_API_KEY` | ⚠️ | - | Resend API key (primary) |
| `SENDGRID_API_KEY` | ⚠️ | - | SendGrid API key (fallback) |
| `ADMIN_EMAIL` | ⚠️ | admin@nautilusone.com | Report recipient |
| `EMAIL_FROM` | ⚠️ | noreply@nautilusone.com | Sender address |

⚠️ Note: At least one email service (Resend or SendGrid) must be configured.

## Response Format

### Success
```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 42,
  "recipient": "admin@nautilusone.com",
  "emailSent": true
}
```

### Error
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Common Issues

### ❌ No Email Service Configured
- Set either `RESEND_API_KEY` or `SENDGRID_API_KEY`
- Resend is recommended for its simplicity

### ❌ Email API Error
- Check API key is valid
- Verify domain in email provider dashboard
- Ensure sender email is verified

### ❌ No Logs Found
- `assistant_logs` table might be empty
- Check 24h time window
- Verify database connection

### ❌ Permission Error
- Ensure service role key has proper permissions
- Check RLS policies on `assistant_logs` and `profiles` tables

## Monitoring Commands

```bash
# View function logs
supabase functions logs send-daily-assistant-report

# Check recent executions
supabase db query "SELECT * FROM assistant_report_logs ORDER BY sent_at DESC LIMIT 5"

# Check assistant interactions
supabase db query "SELECT COUNT(*) FROM assistant_logs WHERE created_at > NOW() - INTERVAL '24 hours'"

# Test email sending
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/send-daily-assistant-report" \
  -H "Authorization: Bearer YOUR_KEY"
```

## File Locations

- **Edge Function:** `supabase/functions/send-daily-assistant-report/index.ts`
- **Cron Config:** `supabase/config.toml`
- **Source Table Migration:** `supabase/migrations/20251012043900_create_assistant_logs.sql`
- **Tracking Table Migration:** `supabase/migrations/20251012194000_create_assistant_report_logs.sql`
- **Documentation:** `DAILY_ASSISTANT_REPORT_GUIDE.md`

## Related Features

- Manual reports: `supabase/functions/send-assistant-report/index.ts`
- UI logs viewer: `src/pages/admin/assistant-logs.tsx`
- Assistant interaction logs: `assistant_logs` table
- Report execution tracking: `assistant_report_logs` table

## Architecture

### Data Flow
1. **Cron Trigger** - Runs daily at 8:00 AM UTC
2. **Fetch Logs** - Gets assistant interactions from last 24h (`assistant_logs`)
3. **Fetch Profiles** - Gets user emails from `profiles` table
4. **Generate CSV** - Creates CSV with proper escaping and UTF-8 encoding
5. **Send Email** - Uses Resend (primary) or SendGrid (fallback)
6. **Log Execution** - Records success/error in `assistant_report_logs`

### Email Services
- **Primary:** Resend API (3,000 emails/month free tier)
- **Fallback:** SendGrid API (100 emails/day free tier)
- **Detection:** Automatically uses available service based on API keys

## Next Steps

1. ✅ Deploy function
2. ✅ Set environment variables
3. ✅ Cron job configured in config.toml
4. ✅ Test email delivery
5. ✅ Monitor execution logs

---

**Status:** ✅ Implementado  
**Integration:** Resend API (primary) / SendGrid (fallback)  
**Format:** CSV with UTF-8 encoding  
**Schedule:** Daily at 8:00 AM UTC  
**Source Data:** `assistant_logs` table (user interactions)
