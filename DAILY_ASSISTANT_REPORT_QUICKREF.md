# 📬 Daily Assistant Report - Quick Reference

## Quick Start

### Deploy Function
```bash
supabase functions deploy send-daily-assistant-report
```

### Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set EMAIL_FROM=nao-responda@nautilus.ai
```

### Test Function
```bash
supabase functions invoke send-daily-assistant-report
```

## Database

### Table: `assistant_report_logs`
```sql
-- Check recent reports
SELECT * FROM assistant_report_logs 
ORDER BY sent_at DESC LIMIT 10;

-- Count by status
SELECT status, COUNT(*) 
FROM assistant_report_logs 
GROUP BY status;
```

## Cron Schedule

### Daily at 7 AM UTC
```sql
SELECT cron.schedule(
  'daily-assistant-report',
  '0 7 * * *',
  $$ SELECT net.http_post(...) $$
);
```

## Email Details

- **From:** nao-responda@nautilus.ai
- **To:** admin@nautilus.ai
- **Subject:** 📬 Relatório Diário do Assistente IA
- **Attachment:** relatorio-assistente.pdf

## PDF Contents

Table with columns:
- Data (Timestamp)
- Usuário (Email)
- Status
- Mensagem

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | ✅ | - | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | - | Service role key |
| `RESEND_API_KEY` | ✅ | - | Resend API key |
| `ADMIN_EMAIL` | ⚠️ | admin@nautilus.ai | Report recipient |
| `EMAIL_FROM` | ⚠️ | nao-responda@nautilus.ai | Sender address |

## Response Format

### Success
```json
{
  "success": true,
  "message": "✅ Relatório enviado com sucesso",
  "logsCount": 42
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

### ❌ Resend API Error
- Check API key is valid
- Verify domain in Resend dashboard
- Ensure sender email is verified

### ❌ No Logs Found
- Table might be empty
- Check 24h time window
- Verify database connection

### ❌ PDF Generation Failed
- Check npm dependencies
- Review function logs
- Verify data format

## Monitoring Commands

```bash
# View function logs
supabase functions logs send-daily-assistant-report

# Check recent executions
supabase db query "SELECT * FROM assistant_report_logs ORDER BY sent_at DESC LIMIT 5"

# Test email sending
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/send-daily-assistant-report" \
  -H "Authorization: Bearer YOUR_KEY"
```

## File Locations

- **Edge Function:** `supabase/functions/send-daily-assistant-report/index.ts`
- **Migration:** `supabase/migrations/20251012194000_create_assistant_report_logs.sql`
- **Documentation:** `DAILY_ASSISTANT_REPORT_GUIDE.md`

## Related Features

- Manual reports: `supabase/functions/send-assistant-report/index.ts`
- UI logs viewer: `src/pages/admin/assistant-logs.tsx`
- Assistant logs table: `assistant_logs`

## Next Steps

1. ✅ Deploy function
2. ✅ Set environment variables
3. ✅ Schedule cron job
4. ✅ Test email delivery
5. ✅ Monitor execution logs

---

**Status:** ✅ Implementado  
**Integration:** Resend API  
**Format:** PDF via jsPDF  
**Schedule:** Daily at 7 AM UTC
