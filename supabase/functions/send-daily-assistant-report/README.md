# 📊 Send Daily Assistant Report

## Overview

This Supabase Edge Function sends a daily email report with assistant interaction logs from the last 24 hours. The report is delivered as a CSV attachment via email.

## Features

- ✅ Automatically fetches assistant logs from last 24 hours
- ✅ Generates CSV file with interaction details
- ✅ Sends professional HTML email with attachment
- ✅ Supports Resend API (primary) and SendGrid API (fallback)
- ✅ Scheduled execution via cron (daily at 8:00 AM UTC)
- ✅ Comprehensive error handling and logging

## Configuration

### Required Environment Variables

Set these in Supabase Dashboard → Settings → Edge Functions → Secrets:

```bash
# Email Configuration
ADMIN_EMAIL=admin@yourdomain.com          # Recipient email
EMAIL_FROM=reports@yourdomain.com         # Sender email

# Email Service (choose one)
RESEND_API_KEY=re_xxxxx                   # Resend API key (recommended)
SENDGRID_API_KEY=SG.xxxxx                 # SendGrid API key (fallback)

# Auto-configured by Supabase
SUPABASE_URL=https://xxx.supabase.co      # Project URL
SUPABASE_SERVICE_ROLE_KEY=xxx             # Service role key
```

### Cron Schedule

Configured in `supabase/config.toml`:

```toml
[[edge_runtime.cron]]
name = "daily-assistant-report"
function_name = "send-daily-assistant-report"
schedule = "0 8 * * *"  # Daily at 8:00 AM UTC
description = "Send daily assistant report via email with CSV attachment"
```

## Deployment

### Quick Deploy (Automated)

```bash
# Run setup script (recommended)
npm run setup:daily-assistant-report
```

The script will:
1. Validate Supabase CLI
2. Check function files
3. Deploy function
4. Configure cron schedule
5. Run test invocation

### Manual Deploy

```bash
# Deploy function
supabase functions deploy send-daily-assistant-report --no-verify-jwt

# Configure cron (if supported)
supabase functions schedule send-daily-assistant-report --cron "0 8 * * *"

# Test invocation
supabase functions invoke send-daily-assistant-report --no-verify-jwt
```

## Function Logic

### 1. Data Fetching

```typescript
// Fetch logs from last 24 hours
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const { data: logs } = await supabase
  .from("assistant_logs")
  .select("id, question, answer, created_at, user_email, user_id")
  .gte("created_at", yesterday)
  .order("created_at", { ascending: false });
```

### 2. CSV Generation

```typescript
// Format: Date/Time, User, Question, Answer
const headers = ["Data/Hora", "Usuário", "Pergunta", "Resposta"];
const rows = logs.map((log) => [
  new Date(log.created_at).toLocaleString("pt-BR"),
  log.user_email || "Anônimo",
  log.question.substring(0, 200),
  log.answer.substring(0, 300)
]);
```

### 3. Email Sending

```typescript
// Primary: Resend API
if (RESEND_API_KEY) {
  await sendEmailViaResend(ADMIN_EMAIL, subject, htmlContent, csvContent, RESEND_API_KEY);
}
// Fallback: SendGrid API
else if (SENDGRID_API_KEY) {
  await sendEmailViaSendGrid(ADMIN_EMAIL, subject, htmlContent, csvContent, SENDGRID_API_KEY);
}
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 42,
  "recipient": "admin@example.com",
  "emailSent": true
}
```

### Error Response (500)

```json
{
  "success": false,
  "error": "RESEND_API_KEY or SENDGRID_API_KEY must be configured"
}
```

## Testing

### Manual Invocation

```bash
# Invoke function directly
supabase functions invoke send-daily-assistant-report --no-verify-jwt

# View function logs
supabase functions logs send-daily-assistant-report

# Check recent logs
supabase functions logs send-daily-assistant-report --limit 10
```

### Test with curl

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send-daily-assistant-report \
  -H "Content-Type: application/json"
```

## CSV Report Details

### Filename Format

```
relatorio-assistente-YYYY-MM-DD.csv
```

Example: `relatorio-assistente-2025-10-12.csv`

### CSV Structure

```csv
Data/Hora,Usuário,Pergunta,Resposta
"12/10/2025 18:30:15","user@example.com","Como criar documento?","Para criar um documento..."
"12/10/2025 19:45:22","admin@example.com","Status do projeto?","O projeto está em..."
```

### Column Descriptions

- **Data/Hora**: Interaction timestamp (pt-BR locale)
- **Usuário**: User email or "Anônimo"
- **Pergunta**: Question asked (max 200 chars)
- **Resposta**: Assistant's response (HTML stripped, max 300 chars)

## Email Template

### Subject Line

```
📊 Relatório Diário - Assistente IA DD/MM/YYYY
```

### Content Structure

1. **Header** - Purple gradient with title and date
2. **Summary Box** - Total interactions and attachment status
3. **Description** - Explanation of CSV columns
4. **Footer** - Automatic generation notice

## Troubleshooting

### Function Not Deploying

**Issue:** Deployment fails

**Solutions:**
- Check Supabase CLI is installed: `supabase --version`
- Login: `supabase login`
- Link project: `supabase link --project-ref your-ref`

### Email Not Sending

**Issue:** Function executes but no email received

**Solutions:**
- Verify RESEND_API_KEY or SENDGRID_API_KEY is set
- Check EMAIL_FROM domain is verified
- View logs: `supabase functions logs send-daily-assistant-report`
- Check spam folder

### No Data in Report

**Issue:** CSV is empty

**Solutions:**
- Verify `assistant_logs` table has data from last 24h
- Check function has database read permissions
- Test query manually in Supabase SQL editor

### Cron Not Triggering

**Issue:** Function doesn't run automatically

**Solutions:**
- Verify cron in Supabase Dashboard (Edge Functions → Settings)
- Check your Supabase plan supports cron scheduling
- Configure manually if CLI scheduling fails

## Monitoring

### View Execution Logs

```bash
# Recent logs
supabase functions logs send-daily-assistant-report

# Live tail
supabase functions logs send-daily-assistant-report --tail

# Filter by status
supabase functions logs send-daily-assistant-report | grep "success"
```

### Key Log Messages

```
🚀 Starting daily assistant report generation...
📊 Fetching assistant logs from last 24h...
✅ Fetched 42 logs from last 24h
📧 Sending email report...
Using Resend API...
✅ Email sent successfully!
```

## Performance

- **Execution Time**: ~2-5 seconds (depends on log count)
- **Database Query**: Single SELECT with date filter
- **Email Delivery**: 1-3 seconds via Resend/SendGrid
- **Memory Usage**: Minimal (<50MB)

## Security

- **Authentication**: No JWT verification (scheduled by Supabase)
- **Database Access**: Service role key (full access)
- **Email Security**: Uses HTTPS for all API calls
- **Secrets**: Stored securely in Supabase

## Dependencies

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
```

## Related Files

- **Function**: `supabase/functions/send-daily-assistant-report/index.ts`
- **Config**: `supabase/config.toml`
- **Setup Script**: `scripts/setup-daily-assistant-report.js`
- **Documentation**: `DAILY_ASSISTANT_REPORT_QUICKREF.md`
- **Implementation Guide**: `DAILY_ASSISTANT_REPORT_IMPLEMENTATION.md`

## Version History

- **v1.0** (October 2025) - Initial release

## Support

- **View Logs**: Supabase Dashboard → Edge Functions → send-daily-assistant-report
- **Documentation**: See `DAILY_ASSISTANT_REPORT_QUICKREF.md`
- **Issues**: GitHub Issues

## License

Same as parent project
