# Send Daily Restore Report Edge Function

## 📋 Overview

This Supabase Edge Function sends a daily email report containing logs from the `restore_report_logs` table. It queries logs from the last 24 hours and sends them via SendGrid.

## 🔧 Features

- 📊 Queries logs from the last 24 hours
- 📧 Sends formatted email via SendGrid
- 📝 Logs all email sending attempts to `report_email_logs` table
- 🔒 Type-safe TypeScript implementation
- ⚡ Automatic error handling and logging

## 🗃️ Database Tables

### Input: `restore_report_logs`
Queries logs from this table (created by `daily-restore-report` function):
- `id` - UUID primary key
- `executed_at` - Timestamp of execution
- `status` - Status (success/error/critical)
- `message` - Human-readable message
- `error_details` - JSON error details
- `triggered_by` - Trigger source

### Output: `report_email_logs`
Logs email sending attempts to this table:
- `id` - UUID primary key
- `sent_at` - Timestamp of email sending
- `status` - Status (success/error)
- `message` - Description of result

## ⚙️ Environment Variables

Required environment variables (configure in Supabase Dashboard):

```bash
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENDGRID_API_KEY=your_sendgrid_api_key
ADMIN_EMAIL=admin@empresa.com
```

## 📅 Cron Schedule

Configured in `supabase/config.toml`:

```toml
[functions.send_daily_restore_report]
  schedule = "0 7 * * *"  # Daily at 7:00 AM
```

## 🚀 Deployment

### Deploy the function:
```bash
supabase functions deploy send-daily-restore-report
```

### Test the function:
```bash
supabase functions invoke send-daily-restore-report
```

## 📧 Email Format

Subject: `📄 Relatório de Logs - [Date]`

Body format:
```
📅 2025-10-12T07:00:00Z
🔹 Status: success
📝 Relatório enviado com sucesso.

📅 2025-10-11T07:00:00Z
🔹 Status: error
📝 Falha no envio do e-mail
❗ {"statusCode": 500, "message": "SMTP connection failed"}
```

## 🔍 Monitoring

### View recent email logs:
```sql
SELECT * FROM report_email_logs
ORDER BY sent_at DESC
LIMIT 10;
```

### Check success rate:
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM report_email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

## 🔐 Security

- Uses Supabase Service Role Key for database access
- Row-Level Security (RLS) enabled on both tables
- Admin users can view logs
- Service role can insert logs

## 📝 Response Format

### Success Response (200):
```json
{
  "success": true,
  "message": "✅ Email enviado com sucesso!",
  "logsCount": 5,
  "recipient": "admin@empresa.com"
}
```

### Error Response (500):
```json
{
  "success": false,
  "error": "❌ Erro no envio de relatório",
  "details": "Error message details"
}
```

## 🧪 Testing

You can test the function manually using the Supabase CLI:

```bash
# Invoke the function
supabase functions invoke send-daily-restore-report

# Or via HTTP request
curl -X POST https://your-project.supabase.co/functions/v1/send-daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 🔄 Related Functions

- `daily-restore-report` - Creates logs in `restore_report_logs` table
- This function reads those logs and sends them via email

## 📚 Dependencies

- `https://deno.land/std@0.168.0/http/server.ts` - HTTP server
- `https://esm.sh/@supabase/supabase-js@2.57.4` - Supabase client
- SendGrid API - Email delivery service
