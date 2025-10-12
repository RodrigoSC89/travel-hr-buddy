# Send Daily Restore Report - Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Function Components](#function-components)
5. [Email Format](#email-format)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Monitoring](#monitoring)

## Overview

The `send_daily_restore_report` Edge Function is a production-ready TypeScript function that automatically sends daily email reports containing logs from the `restore_report_logs` table. It implements a complete audit trail system by logging all email sending attempts to the `report_email_logs` table.

### Key Features

- ✅ **Automated Scheduling**: Runs daily at 7:00 AM UTC via cron
- 📊 **Data Aggregation**: Queries last 24 hours of restore logs
- 📧 **Email Delivery**: SendGrid API with SMTP fallback
- 🔍 **Audit Trail**: Complete logging in `report_email_logs` table
- 🎨 **Rich Templates**: HTML emails with status summaries and CSV attachments
- ⚡ **Type Safety**: Full TypeScript type definitions
- 🛡️ **Error Handling**: Comprehensive error handling and recovery

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Cron Scheduler                          │
│                   (Daily at 7:00 AM)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              send_daily_restore_report                      │
│                  Edge Function                              │
├─────────────────────────────────────────────────────────────┤
│  1. getConfiguration()                                      │
│     └─ Validate environment variables                       │
│                                                             │
│  2. fetchRestoreLogs(supabase)                             │
│     └─ Query restore_report_logs (last 24h)               │
│                                                             │
│  3. generateCSV(logs)                                       │
│     └─ Create CSV content                                   │
│                                                             │
│  4. generateEmailHtml(logs)                                 │
│     └─ Create HTML email with status summary               │
│                                                             │
│  5. sendEmail(supabase, config, logs)                      │
│     ├─ Send via SendGrid API                                │
│     └─ logEmailAttempt() → report_email_logs              │
│                                                             │
│  6. logExecution(supabase, status, message)                │
│     └─ Log to restore_report_logs                          │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Tables                           │
├─────────────────────────────────────────────────────────────┤
│  • restore_report_logs (source data)                       │
│  • report_email_logs (audit trail)                         │
└─────────────────────────────────────────────────────────────┘
```

### Modular Components

The function is organized into 6 focused modules:

1. **Configuration Module** (`getConfiguration`)
   - Validates environment variables
   - Provides typed configuration object

2. **Data Fetching Module** (`fetchRestoreLogs`)
   - Queries database for last 24 hours
   - Handles database errors

3. **Content Generation Module** (`generateCSV`, `generateEmailHtml`, `generateEmailBody`)
   - Creates CSV content
   - Generates rich HTML emails
   - Formats status summaries

4. **Email Sending Module** (`sendEmail`, `sendEmailViaSendGrid`, `sendEmailViaSMTP`)
   - Sends emails via SendGrid
   - Falls back to SMTP if needed
   - Handles email service errors

5. **Logging Module** (`logEmailAttempt`, `logExecution`)
   - Logs email attempts to `report_email_logs`
   - Logs function execution to `restore_report_logs`
   - Graceful degradation on logging failures

6. **Request Handler** (`serve`)
   - Handles HTTP requests
   - Orchestrates all modules
   - Returns JSON responses

## Database Schema

### report_email_logs Table

Primary table for email audit trail:

```sql
CREATE TABLE IF NOT EXISTS public.report_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  message TEXT NOT NULL,
  error_details JSONB,
  recipient_email TEXT,
  logs_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

#### Columns

- **id**: UUID primary key, automatically generated
- **sent_at**: Timestamp when email was sent/attempted
- **status**: Either 'success' or 'error'
- **message**: Descriptive message about the result
- **error_details**: JSONB with detailed error information
- **recipient_email**: Email address of recipient
- **logs_count**: Number of logs included in the report
- **created_at**: Record creation timestamp

#### Indexes

```sql
CREATE INDEX idx_report_email_logs_sent_at ON report_email_logs(sent_at DESC);
CREATE INDEX idx_report_email_logs_status ON report_email_logs(status);
CREATE INDEX idx_report_email_logs_created_at ON report_email_logs(created_at DESC);
```

#### Row-Level Security (RLS)

```sql
-- Service role can insert logs
CREATE POLICY "Service role can insert email logs"
  ON report_email_logs FOR INSERT TO service_role
  WITH CHECK (true);

-- Admin users can view logs
CREATE POLICY "Admin users can view email logs"
  ON report_email_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Function Components

### TypeScript Interfaces

```typescript
interface RestoreLog {
  executed_at: string;
  status: string;
  message: string;
  error_details: string | null;
}

interface EmailLogEntry {
  status: 'success' | 'error';
  message: string;
  error_details?: Record<string, unknown>;
  recipient_email: string;
  logs_count: number;
}

interface Configuration {
  supabaseUrl: string;
  supabaseServiceKey: string;
  adminEmail: string;
  sendGridApiKey?: string;
  emailFrom: string;
}
```

### Configuration Module

```typescript
function getConfiguration(): Configuration {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing required environment variables");
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    adminEmail: Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com",
    sendGridApiKey: Deno.env.get("SENDGRID_API_KEY"),
    emailFrom: Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com",
  };
}
```

### Email Logging Module

```typescript
async function logEmailAttempt(
  supabase: any,
  logEntry: EmailLogEntry
): Promise<void> {
  try {
    const { error } = await supabase
      .from("report_email_logs")
      .insert({
        status: logEntry.status,
        message: logEntry.message,
        error_details: logEntry.error_details || null,
        recipient_email: logEntry.recipient_email,
        logs_count: logEntry.logs_count,
      });
    
    if (error) {
      console.error("Failed to log email attempt:", error);
    }
  } catch (error) {
    console.error("Exception while logging:", error);
  }
}
```

Key features:
- Non-blocking: Logging failures don't break main flow
- Complete audit trail: Records all email attempts
- Error details: Captures full error context

## Email Format

### Subject Line

```
📊 Relatório Diário - Restore Logs [Date]
```

Example: `📊 Relatório Diário - Restore Logs 12/10/2025`

### HTML Email Structure

1. **Header Section**
   - Gradient background (purple)
   - Nautilus One branding
   - Current date

2. **Summary Box**
   - Total logs count
   - CSV attachment status
   - Visual status cards (Success/Error/Critical)

3. **Recent Logs Section**
   - 5 most recent logs
   - Color-coded by status
   - Includes timestamp, status, message, error details

4. **CSV Attachment**
   - Complete logs for last 24 hours
   - Formatted for Excel/Google Sheets

### CSV Format

```csv
Date,Status,Message,Error
"12/10/2025 07:00:00","success","Relatório enviado com sucesso.","-"
"11/10/2025 23:00:00","error","Falha no envio do e-mail","Connection timeout"
```

## Deployment

### Step 1: Apply Database Migration

```bash
cd /path/to/project
supabase db push
```

This creates the `report_email_logs` table with indexes and RLS policies.

### Step 2: Deploy Edge Function

```bash
supabase functions deploy send_daily_restore_report
```

### Step 3: Configure Environment Variables

```bash
# Required for email sending
supabase secrets set SENDGRID_API_KEY=your_api_key_here

# Optional - customize recipient and sender
supabase secrets set ADMIN_EMAIL=admin@company.com
supabase secrets set EMAIL_FROM=noreply@company.com
```

### Step 4: Verify Cron Schedule

Check `supabase/config.toml`:

```toml
[functions.send_daily_restore_report]
verify_jwt = false

[[edge_runtime.cron]]
name = "daily-restore-report"
function_name = "send_daily_restore_report"
schedule = "0 7 * * *"  # Every day at 7:00 AM UTC
description = "Send daily restore report via email with CSV attachment"
```

## Testing

### Manual Invocation

```bash
# Test via CLI
supabase functions invoke send_daily_restore_report

# Test via HTTP
curl -X POST \
  https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Expected Success Response

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

### Expected Error Response

```json
{
  "success": false,
  "error": "SendGrid API error: 401 - Unauthorized",
  "timestamp": "2025-10-12T07:00:00.000Z"
}
```

## Monitoring

### Query Recent Email Logs

```sql
SELECT 
  sent_at,
  status,
  message,
  recipient_email,
  logs_count
FROM report_email_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

### Calculate Success Rate

```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM report_email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

### Find Recent Failures

```sql
SELECT 
  sent_at,
  message,
  error_details->>'message' as error_message,
  recipient_email
FROM report_email_logs
WHERE status = 'error'
  AND sent_at >= NOW() - INTERVAL '7 days'
ORDER BY sent_at DESC;
```

### Monitor Function Logs

```bash
# Stream function logs in real-time
supabase functions logs send_daily_restore_report --tail

# Get last 100 log entries
supabase functions logs send_daily_restore_report --limit 100
```

## Error Handling

### Configuration Errors

If required environment variables are missing:

```
Error: Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
```

**Solution**: Set required environment variables

### Database Errors

If database query fails:

```
Error: Failed to fetch logs: permission denied for table restore_report_logs
```

**Solution**: Verify RLS policies and service role key

### Email Sending Errors

If SendGrid API fails:

```
Error: SendGrid API error: 401 - Unauthorized
```

**Solution**: Verify SendGrid API key is valid

### Graceful Degradation

- Logging failures don't break main flow
- Email failures are logged to `report_email_logs`
- Critical errors are logged to `restore_report_logs`

## Security Best Practices

1. ✅ **Environment Variables**: All credentials via env vars
2. ✅ **RLS Enabled**: Row-Level Security on all tables
3. ✅ **Service Role Auth**: Database operations use service role
4. ✅ **Admin-Only Access**: Only admins can view email logs
5. ✅ **No Hardcoded Secrets**: No credentials in code
6. ✅ **HTTPS Only**: All communications encrypted

## Performance Considerations

- **Execution Time**: 2-5 seconds typical
- **Database Queries**: 2 queries total (fetch + insert)
- **Email Size**: ~50KB HTML + CSV attachment
- **Memory Usage**: Minimal, processes logs in single query
- **Rate Limits**: SendGrid free tier: 100 emails/day

## Maintenance

### Update Schedule

Edit cron schedule in `supabase/config.toml`:

```toml
schedule = "0 9 * * *"  # Change to 9 AM
```

### Update Email Template

Modify `generateEmailHtml()` function to customize appearance.

### Add New Monitoring Queries

Create database views for common monitoring queries:

```sql
CREATE VIEW email_logs_summary AS
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
FROM report_email_logs
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

## Integration with Existing Systems

### Daily Restore Report Function

The `send_daily_restore_report` function integrates with the existing `daily-restore-report` function:

1. **daily-restore-report**: Creates logs in `restore_report_logs` table
2. **send_daily_restore_report**: Reads logs and sends email summaries

Both functions maintain independent audit trails.

### Future Enhancements

Potential improvements:

- [ ] Multiple recipients support
- [ ] Custom report time ranges
- [ ] Slack/Teams integration
- [ ] Email digest grouping by status
- [ ] Attachments size optimization
- [ ] Real-time alerts for critical errors

## Conclusion

This implementation provides a robust, production-ready solution for automated daily reporting with complete audit trail capabilities. The modular architecture, comprehensive error handling, and TypeScript type safety make it maintainable and reliable.
