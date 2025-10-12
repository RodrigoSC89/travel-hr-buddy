# Send Daily Restore Report Edge Function

## Overview

Automated Edge Function that sends daily email reports containing logs from the `restore_report_logs` table. This function queries execution logs from the last 24 hours, formats them into a readable email with CSV attachment, sends via SendGrid, and maintains a complete audit trail in the `report_email_logs` table.

## Features

- ✅ **Automated Daily Execution**: Runs daily at 7:00 AM UTC via cron schedule
- 📊 **CSV Report Generation**: Creates formatted CSV files with restore logs
- 📧 **Email Delivery**: Sends via SendGrid API (with SMTP fallback)
- 🔍 **Complete Audit Trail**: Logs all email attempts to `report_email_logs`
- 🎨 **Rich HTML Emails**: Beautiful, formatted email templates with status summaries
- ⚡ **TypeScript Type Safety**: Full type definitions for all data structures
- 🛡️ **Error Handling**: Comprehensive error handling and logging
- 📈 **Status Summary**: Shows success/error/critical counts in email

## Database Schema

### report_email_logs Table

Tracks all email sending attempts:

```sql
CREATE TABLE report_email_logs (
  id UUID PRIMARY KEY,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('success', 'error')),
  message TEXT NOT NULL,
  error_details JSONB,
  recipient_email TEXT,
  logs_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_report_email_logs_sent_at` - For time-based queries
- `idx_report_email_logs_status` - For status filtering

**RLS Policies:**
- Service role can insert logs
- Admin users can view logs

## Environment Variables

Required configuration in Supabase Dashboard:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | ✅ Yes | Auto-configured | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Auto-configured | Service role key |
| `SENDGRID_API_KEY` | ⚠️ Recommended | - | SendGrid API key for email |
| `ADMIN_EMAIL` | No | admin@empresa.com | Recipient email address |
| `EMAIL_FROM` | No | noreply@nautilusone.com | Sender email address |

## Deployment

### 1. Apply Database Migration

```bash
# Apply the migration to create report_email_logs table
supabase db push
```

### 2. Deploy Edge Function

```bash
# Deploy the function to Supabase
supabase functions deploy send_daily_restore_report
```

### 3. Configure Environment Variables

In Supabase Dashboard → Edge Functions → Settings:

```bash
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key
supabase secrets set ADMIN_EMAIL=your.email@company.com
supabase secrets set EMAIL_FROM=noreply@company.com
```

### 4. Verify Cron Schedule

The function is automatically scheduled via `supabase/config.toml`:

```toml
[[edge_runtime.cron]]
name = "daily-restore-report"
function_name = "send_daily_restore_report"
schedule = "0 7 * * *"  # Every day at 7:00 AM UTC
```

## Testing

### Manual Invocation

Test the function manually:

```bash
# Invoke function via CLI
supabase functions invoke send_daily_restore_report

# Invoke via HTTP (if deployed)
curl -X POST https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Expected Response

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

## Email Format

### Subject
```
📊 Relatório Diário - Restore Logs [Date in pt-BR]
```

### HTML Body

The email includes:
- **Header**: Nautilus One branding with date
- **Status Summary**: Visual cards showing success/error/critical counts
- **Recent Logs**: 5 most recent log entries with color coding
- **CSV Attachment**: Complete logs for last 24 hours

### CSV Format

```csv
Date,Status,Message,Error
"12/10/2025 07:00:00","success","Relatório enviado com sucesso.","-"
"11/10/2025 23:00:00","error","Falha no envio do e-mail","Connection timeout"
```

## Monitoring

### Query Recent Email Logs

```sql
SELECT * FROM report_email_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

### Check Success Rate

```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM report_email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

### View Failed Attempts

```sql
SELECT 
  sent_at,
  message,
  error_details,
  recipient_email
FROM report_email_logs
WHERE status = 'error'
ORDER BY sent_at DESC
LIMIT 20;
```

## Architecture

```
┌─────────────────────┐
│  Cron (7:00 AM)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ send_daily_restore_report       │
│ Edge Function                   │
└──────────┬──────────────────────┘
           │
           ├──► Query restore_report_logs (last 24h)
           │
           ├──► Generate CSV content
           │
           ├──► Format HTML email
           │
           ├──► Send via SendGrid API
           │
           └──► Log result to report_email_logs
```

## Function Flow

1. **Configuration**: Validates environment variables
2. **Fetch Logs**: Queries `restore_report_logs` for last 24 hours
3. **Generate Content**: Creates CSV and HTML email content
4. **Send Email**: Sends via SendGrid (or SMTP fallback)
5. **Log Result**: Records attempt in `report_email_logs`
6. **Return Response**: Returns success/error status

## Error Handling

The function includes comprehensive error handling:

- **Missing Config**: Throws error if required env vars are missing
- **Database Errors**: Catches and logs database query failures
- **Email Failures**: Logs failed email attempts to `report_email_logs`
- **Graceful Degradation**: Logging failures don't break main flow

## Integration

### Daily Restore Report Function

This function integrates with the existing `daily-restore-report` function:

1. `daily-restore-report` creates logs in `restore_report_logs` table
2. `send_daily_restore_report` reads those logs and sends email summaries
3. Both functions maintain independent audit trails

### Audit Trail

Two separate logging systems:

- **restore_report_logs**: Tracks restore report executions
- **report_email_logs**: Tracks email sending attempts

## Troubleshooting

### No Emails Received

1. Check environment variables are set:
   ```bash
   supabase secrets list
   ```

2. Verify SendGrid API key is valid

3. Check email logs for errors:
   ```sql
   SELECT * FROM report_email_logs WHERE status = 'error';
   ```

### Function Errors

1. Check function logs:
   ```bash
   supabase functions logs send_daily_restore_report
   ```

2. Test manually:
   ```bash
   supabase functions invoke send_daily_restore_report --debug
   ```

### Database Migration Issues

1. Verify migration was applied:
   ```sql
   SELECT * FROM pg_tables WHERE tablename = 'report_email_logs';
   ```

2. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'report_email_logs';
   ```

## Security

- ✅ Row-Level Security (RLS) enabled
- ✅ Service role authentication for database operations
- ✅ No hardcoded credentials
- ✅ Environment variable validation
- ✅ Admin-only access to email logs

## Performance

- **Execution Time**: ~2-5 seconds (depends on log count)
- **Database Queries**: 2 queries (fetch logs + insert email log)
- **Email Size**: ~50KB HTML + CSV attachment
- **Rate Limits**: SendGrid free tier: 100 emails/day

## Maintenance

### Update Cron Schedule

Edit `supabase/config.toml`:

```toml
[[edge_runtime.cron]]
schedule = "0 9 * * *"  # Change to 9:00 AM UTC
```

### Update Email Template

Modify `generateEmailHtml()` function in `index.ts`

### Change Recipient

Update environment variable:

```bash
supabase secrets set ADMIN_EMAIL=newemail@company.com
```

## License

MIT License - See project root for details
