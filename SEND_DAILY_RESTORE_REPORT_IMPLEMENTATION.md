# Send Daily Restore Report Implementation

## 📋 Overview

This implementation creates a new Supabase Edge Function called `send_daily_restore_report` that:
- 🔍 Queries logs from `restore_report_logs` table (last 24 hours)
- 📄 Formats logs into email body
- 📧 Sends email via SendGrid
- 📝 Logs success or error in `report_email_logs` table
- ⏱️ Runs automatically daily at 7:00 AM via cron job

## 📁 Files Created

### 1. Database Migration
**File**: `supabase/migrations/20251012002627_create_report_email_logs.sql`

Creates the `report_email_logs` table:
```sql
create table if not exists report_email_logs (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz default now(),
  status text not null,
  message text
);
```

**Features**:
- ✅ UUID primary key with automatic generation
- ✅ Automatic timestamp on sending
- ✅ Status tracking (success/error)
- ✅ Message field for details
- ✅ Indexes for performance (sent_at, status)
- ✅ Row-Level Security (RLS) enabled
- ✅ Service role can insert logs
- ✅ Admin users can view logs

### 2. Edge Function
**File**: `supabase/functions/send-daily-restore-report/index.ts`

**Key Components**:

#### Configuration Management
```typescript
function loadConfig() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";
  // ... validation
}
```

#### Fetch Recent Logs
```typescript
async function fetchRecentLogs(supabase: any): Promise<RestoreReportLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - 1);
  const iso = since.toISOString();

  const { data: logs, error } = await supabase
    .from("restore_report_logs")
    .select("*")
    .gte("executed_at", iso)
    .order("executed_at", { ascending: false });
  // ... error handling
}
```

#### Format Email Body
```typescript
function formatEmailBody(logs: RestoreReportLog[]): string {
  return logs.map((log) =>
    `📅 ${log.executed_at}\n🔹 Status: ${log.status}\n📝 ${log.message || "N/A"}${
      log.error_details ? `\n❗ ${log.error_details}` : ""
    }`
  ).join("\n\n");
}
```

#### Send via SendGrid
```typescript
async function sendEmailViaSendGrid(
  apiKey: string,
  toEmail: string,
  subject: string,
  body: string
): Promise<void> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: "no-reply@empresa.com", name: "Nautilus Logs" },
      subject,
      content: [{ type: "text/plain", value: body }],
    }),
  });
  // ... error handling
}
```

#### Log Email Status
```typescript
async function logEmailStatus(
  supabase: any,
  status: string,
  message: string
): Promise<void> {
  await supabase.from("report_email_logs").insert({
    status,
    message,
  });
}
```

### 3. Function Documentation
**File**: `supabase/functions/send-daily-restore-report/README.md`

Complete documentation including:
- Overview and features
- Database tables (input/output)
- Environment variables
- Deployment instructions
- Testing procedures
- Monitoring queries

### 4. Cron Configuration
**File**: `supabase/config.toml`

Added cron schedule:
```toml
[functions.send_daily_restore_report]
  schedule = "0 7 * * *"  # Daily at 7:00 AM UTC
```

## ⚙️ Environment Variables

Configure in Supabase Dashboard → Settings → Edge Functions:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENDGRID_API_KEY=your_sendgrid_api_key
ADMIN_EMAIL=admin@empresa.com
```

## 🚀 Deployment

### 1. Apply Database Migration
```bash
# Push migrations to Supabase
supabase db push

# Or manually apply via SQL Editor in Supabase Dashboard
```

### 2. Deploy Edge Function
```bash
# Deploy the function
supabase functions deploy send-daily-restore-report

# Verify deployment
supabase functions list
```

### 3. Test the Function
```bash
# Manual invocation
supabase functions invoke send-daily-restore-report

# Check logs
supabase functions logs send-daily-restore-report
```

## 📧 Email Example

**Subject**: `📄 Relatório de Logs - 12/10/2025`

**Body**:
```
📅 2025-10-12T07:00:00.000Z
🔹 Status: success
📝 Relatório enviado com sucesso.

📅 2025-10-11T23:00:00.000Z
🔹 Status: error
📝 Falha no envio do e-mail
❗ {"statusCode": 500, "message": "SMTP connection failed"}

📅 2025-10-11T22:00:00.000Z
🔹 Status: success
📝 Relatório enviado com sucesso.
```

## 📊 Monitoring

### View Recent Email Logs
```sql
SELECT 
  sent_at,
  status,
  message
FROM report_email_logs
ORDER BY sent_at DESC
LIMIT 10;
```

### Success Rate (Last 30 Days)
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM report_email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

### View Logs with Email Status
```sql
-- Correlation between restore report executions and email sendings
SELECT 
  DATE(rrl.executed_at) as date,
  COUNT(rrl.id) as restore_reports,
  COUNT(rel.id) as email_reports,
  SUM(CASE WHEN rel.status = 'success' THEN 1 ELSE 0 END) as successful_emails
FROM restore_report_logs rrl
LEFT JOIN report_email_logs rel 
  ON DATE(rrl.executed_at) = DATE(rel.sent_at)
WHERE rrl.executed_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(rrl.executed_at)
ORDER BY date DESC;
```

## 🔒 Security

- ✅ Row-Level Security (RLS) enabled on `report_email_logs`
- ✅ Service role can insert logs
- ✅ Admin users can view logs
- ✅ Sensitive keys stored in environment variables
- ✅ CORS headers configured

## ✅ Compliance with Requirements

This implementation fully satisfies the problem statement:

- ✅ Queries logs from `restore_report_logs` table
- ✅ Filters logs from last 24 hours
- ✅ Sends email via SendGrid API
- ✅ Formats logs with emojis and structure
- ✅ Creates `report_email_logs` table
- ✅ Logs success/error after sending
- ✅ Configured cron job (daily at 7 AM)
- ✅ Uses environment variables for configuration
- ✅ Comprehensive error handling
- ✅ Type-safe TypeScript implementation

## 🔄 Workflow

```
┌─────────────────────────────────────┐
│  Cron Trigger (7:00 AM daily)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  send-daily-restore-report          │
│  Edge Function Starts               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Query restore_report_logs          │
│  (last 24 hours)                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Format logs into email body        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Send email via SendGrid            │
└──────────────┬──────────────────────┘
               │
         ┌─────┴──────┐
         │            │
    Success      Error
         │            │
         ▼            ▼
┌────────────┐ ┌─────────────┐
│ Log status │ │ Log error   │
│ = success  │ │ = error     │
└────────────┘ └─────────────┘
         │            │
         └─────┬──────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Insert into report_email_logs      │
└─────────────────────────────────────┘
```

## 🎯 Benefits

1. **Automated Monitoring**: Daily email reports without manual intervention
2. **Audit Trail**: Complete history of email sending attempts
3. **Error Visibility**: Immediate notification of issues
4. **Type Safety**: TypeScript for fewer runtime errors
5. **Scalability**: Serverless architecture scales automatically
6. **Maintainability**: Clean, modular code structure

## 📝 Next Steps

1. Configure environment variables in Supabase Dashboard
2. Deploy the function using Supabase CLI
3. Verify first email is received at scheduled time
4. Monitor `report_email_logs` table for status
5. Adjust cron schedule if needed
