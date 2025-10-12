# 📧 Daily Assistant Report - Edge Function Documentation

## Overview

Automated daily email reports for AI Assistant interactions with CSV generation using Resend or SendGrid.

## Features

✅ **Automatic daily execution** - Scheduled via Supabase cron (8:00 AM UTC)  
✅ **CSV Report Generation** - Properly formatted with UTF-8 encoding  
✅ **Dual Email Service Support** - Resend (primary) or SendGrid (fallback)  
✅ **24h Log Tracking** - Fetches assistant interactions from last 24 hours  
✅ **Execution Logging** - Tracks all report sends in database  
✅ **User Profile Integration** - Fetches user emails from profiles table

## Architecture

### Database Schema

#### `assistant_logs` Table (Source Data)
```sql
CREATE TABLE assistant_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  origin VARCHAR(50) DEFAULT 'assistant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `assistant_report_logs` Table (Execution Tracking)
```sql
CREATE TABLE assistant_report_logs (
  id UUID PRIMARY KEY,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_email TEXT,
  status TEXT CHECK (status IN ('success', 'error', 'pending', 'critical')),
  message TEXT,
  error_details TEXT,
  logs_count INTEGER DEFAULT 0,
  triggered_by TEXT DEFAULT 'automated'
);
```

### Edge Function

**Location:** `supabase/functions/send-daily-assistant-report/index.ts`

**Flow:**
1. Fetch assistant interactions from `assistant_logs` (last 24h)
2. Fetch user profiles to get email addresses
3. Generate CSV report with proper escaping
4. Send email via Resend API (primary) or SendGrid (fallback) with CSV attachment
5. Log execution result to `assistant_report_logs`

**CSV Format:**
- Column 1: Data/Hora (Timestamp)
- Column 2: Usuário (User email)
- Column 3: Pergunta (Question)
- Column 4: Resposta (Answer)

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

# Set environment variables (choose one email service)
# Option 1: Resend (Recommended)
supabase secrets set RESEND_API_KEY=re_your_api_key

# Option 2: SendGrid (Fallback)
supabase secrets set SENDGRID_API_KEY=SG.your_api_key

# Set email configuration
supabase secrets set ADMIN_EMAIL=admin@yourdomain.com
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
```

### 2. Configure Cron Schedule

The cron job is configured in `supabase/config.toml`:

```toml
[functions.send-daily-assistant-report]
verify_jwt = false

[[edge_runtime.cron]]
name = "daily-assistant-report"
function_name = "send-daily-assistant-report"
schedule = "0 8 * * *"  # Every day at 8:00 AM UTC
description = "Send daily assistant report via email with CSV attachment"
```

After updating `config.toml`, deploy the configuration:

```bash
# Push config changes
supabase functions deploy send-daily-assistant-report
```

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
  "message": "Daily assistant report sent successfully",
  "logsCount": 42,
  "recipient": "admin@yourdomain.com",
  "emailSent": true
}
```

## Environment Variables

### Required

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Email Service (At least one required)

```bash
# Option 1: Resend (Recommended)
RESEND_API_KEY=re_your_resend_api_key

# Option 2: SendGrid (Fallback)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
```

### Optional

```bash
ADMIN_EMAIL=admin@yourdomain.com  # Default recipient
EMAIL_FROM=noreply@yourdomain.com  # Sender email address
```

## Email Configuration

### Resend Setup (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Set the `RESEND_API_KEY` environment variable

**Benefits:**
- 3,000 emails/month free tier
- Modern, developer-friendly API
- Excellent deliverability

### SendGrid Setup (Alternative)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify sender email
3. Create an API key
4. Set the `SENDGRID_API_KEY` environment variable

**Benefits:**
- 100 emails/day free tier
- Enterprise-grade reliability
- Advanced analytics

### Email Template

The email includes:
- 📬 Subject: "Relatório Diário - Assistente IA [Date]"
- Professional HTML body with summary
- CSV attachment: `relatorio-assistente-YYYY-MM-DD.csv`

### CSV Report Format

The CSV contains columns:
- **Data/Hora**: Timestamp of the interaction (localized to pt-BR)
- **Usuário**: User email address
- **Pergunta**: Question asked to the assistant (max 500 chars)
- **Resposta**: Answer provided by the assistant (max 1000 chars, HTML stripped)

Example:
```csv
Data/Hora,Usuário,Pergunta,Resposta
"12/10/2025 18:30:15","user@example.com","Como criar um documento?","Para criar um documento, você deve..."
"12/10/2025 19:45:22","admin@example.com","Qual é o status do projeto?","O projeto está em andamento..."
```

## Monitoring

Monitor function health via:

1. **Supabase Dashboard** → Edge Functions → Metrics
2. **Query `assistant_report_logs`** for execution history:
   ```sql
   SELECT * FROM assistant_report_logs 
   ORDER BY sent_at DESC 
   LIMIT 10;
   ```
3. **Check email service dashboard** (Resend/SendGrid) for delivery status
4. **Review function logs** in Supabase dashboard:
   ```bash
   supabase functions logs send-daily-assistant-report
   ```
5. **Query `assistant_logs`** to see source data:
   ```sql
   SELECT COUNT(*) FROM assistant_logs 
   WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

## Troubleshooting

### No logs found
- Check if `assistant_logs` table has data (not `assistant_report_logs`)
- Verify the 24h time window calculation
- Check database connectivity
- Ensure users are creating assistant interactions

### Email not sending
- Verify either `RESEND_API_KEY` or `SENDGRID_API_KEY` is set correctly
- Check domain verification in email service dashboard
- Review function logs for error details
- Test API key manually with curl

### Permission errors
- Ensure service role key has access to `assistant_logs` table
- Check RLS policies on `assistant_logs` and `profiles` tables
- Verify the function is using `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Verify `ADMIN_EMAIL` is valid

### CSV generation issues
- Check log data format
- Verify CSV escaping is working correctly
- Review function logs for CSV generation errors
- Ensure text fields don't have malformed data

## Security Considerations

- ✅ Environment variables are encrypted in Supabase
- ✅ Service role key required for database access
- ✅ RLS policies protect the logs table
- ✅ Email content is generated server-side
- ✅ CSV data is properly escaped to prevent injection
- ✅ No JWT verification needed for cron-triggered execution
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
