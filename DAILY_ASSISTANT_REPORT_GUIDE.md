# 📧 Daily Assistant Report - Edge Function Documentation

## Overview

Automated daily email reports for AI Assistant interactions with PDF generation using Resend.

## Features

✅ **Automatic daily execution** - Scheduled via Supabase cron  
✅ **PDF Report Generation** - Uses jsPDF and jspdf-autotable  
✅ **Email via Resend** - Professional email service integration  
✅ **24h Log Tracking** - Fetches assistant logs from last 24 hours  
✅ **Execution Logging** - Tracks all report sends in database  

## Architecture

### Database Schema

#### `assistant_report_logs` Table
```sql
CREATE TABLE assistant_report_logs (
  id UUID PRIMARY KEY,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_email TEXT,
  status TEXT CHECK (status IN ('success', 'error', 'pending')),
  message TEXT,
  error_details TEXT,
  logs_count INTEGER,
  triggered_by TEXT DEFAULT 'automated'
);
```

### Edge Function

**Location:** `supabase/functions/send-daily-assistant-report/index.ts`

**Flow:**
1. Fetch logs from `assistant_report_logs` (last 24h)
2. Generate PDF report with jsPDF
3. Send email via Resend API with PDF attachment
4. Log execution result

## Setup Instructions

### 1. Deploy the Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-daily-assistant-report

# Set environment variables
supabase secrets set RESEND_API_KEY=re_your_api_key
supabase secrets set ADMIN_EMAIL=admin@nautilus.ai
supabase secrets set EMAIL_FROM=nao-responda@nautilus.ai
```

### 2. Configure Cron Schedule

Add to your Supabase project dashboard under **Database > Cron Jobs**:

```sql
-- Schedule daily at 7:00 AM UTC
SELECT cron.schedule(
  'daily-assistant-report',
  '0 7 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://your-project.supabase.co/functions/v1/send-daily-assistant-report',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

Or via Supabase Dashboard:
1. Go to Database > Cron Jobs
2. Create new job
3. Name: `daily-assistant-report`
4. Schedule: `0 7 * * *` (7:00 AM UTC)
5. SQL: Use the SELECT statement above

### 3. Test the Function

#### Manual Test
```bash
# Using curl
curl -X POST "https://your-project.supabase.co/functions/v1/send-daily-assistant-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Or invoke via Supabase CLI
supabase functions invoke send-daily-assistant-report
```

#### Expected Response
```json
{
  "success": true,
  "message": "✅ Relatório enviado com sucesso",
  "logsCount": 42
}
```

## Environment Variables

### Required

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_your_resend_api_key
```

### Optional

```bash
ADMIN_EMAIL=admin@nautilus.ai  # Default recipient
EMAIL_FROM=nao-responda@nautilus.ai  # Sender email address
```

## Email Configuration

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Set the `RESEND_API_KEY` environment variable

### Email Template

The email includes:
- 📬 Subject: "Relatório Diário do Assistente IA"
- HTML body with summary
- PDF attachment: `relatorio-assistente.pdf`

### PDF Report Format

The PDF contains a table with:
- **Data**: Timestamp of the log
- **Usuário**: User email
- **Status**: success/error/pending
- **Mensagem**: Description message

## Monitoring

Monitor function health via:

1. **Supabase Dashboard** → Edge Functions → Metrics
2. **Query `assistant_report_logs`** for execution history:
   ```sql
   SELECT * FROM assistant_report_logs 
   ORDER BY sent_at DESC 
   LIMIT 10;
   ```
3. **Check Resend dashboard** for email delivery status
4. **Review function logs** in Supabase dashboard

## Troubleshooting

### No logs found
- Check if `assistant_report_logs` table has data
- Verify the 24h time window
- Check database connectivity

### Email not sending
- Verify `RESEND_API_KEY` is set correctly
- Check domain verification in Resend
- Review function logs for error details
- Verify `ADMIN_EMAIL` is valid

### PDF generation issues
- Ensure jsPDF dependencies are loading
- Check log data format
- Review function logs for jsPDF errors

## Security Considerations

- ✅ Environment variables are encrypted in Supabase
- ✅ Service role key required for database access
- ✅ RLS policies protect the logs table
- ✅ Email content is generated server-side
- ✅ PDF data properly escaped

## Integration with Existing Code

This function complements:
- `src/pages/admin/assistant-logs.tsx` - UI for viewing logs
- `supabase/functions/send-assistant-report/index.ts` - Manual report sending
- `assistant_logs` table - Source data for interactions

## Future Enhancements

- [ ] Support multiple recipients
- [ ] Custom date range selection
- [ ] Charts/graphs in PDF
- [ ] Email templates with branding
- [ ] Retry logic for failed sends
- [ ] Delivery notifications

## Example Usage

### Fetch Recent Report Logs

```typescript
const { data, error } = await supabase
  .from('assistant_report_logs')
  .select('*')
  .eq('status', 'success')
  .order('sent_at', { ascending: false })
  .limit(10);
```

### Check Last Report Status

```typescript
const { data, error } = await supabase
  .from('assistant_report_logs')
  .select('*')
  .order('sent_at', { ascending: false })
  .limit(1)
  .single();

console.log(`Last report: ${data.status} - ${data.message}`);
```

## Related Documentation

- [DAILY_RESTORE_REPORT_CSV_GUIDE.md](./DAILY_RESTORE_REPORT_CSV_GUIDE.md) - Similar pattern for restore reports
- [ASSISTANT_LOGS_QUICKREF.md](./ASSISTANT_LOGS_QUICKREF.md) - Assistant logs feature overview
- [Resend Documentation](https://resend.com/docs) - Email API reference
- [jsPDF Documentation](https://github.com/parallax/jsPDF) - PDF generation library

---

✅ **Envio automático diário por e-mail configurado com sucesso como uma Supabase Edge Function.**

📬 **O que foi implementado:**

🔁 Busca dos logs de envio das últimas 24h  
📄 Geração automática do relatório em PDF  
✉️ Envio diário para admin@nautilus.ai via Resend
