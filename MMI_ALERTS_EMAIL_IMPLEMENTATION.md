# 🚨 MMI Alerts Email - Implementation Guide

## Overview

The `send-alerts` edge function monitors critical and high-priority MMI (Manutenção e Manutenabilidade Industrial) maintenance jobs and sends email alerts when jobs are approaching their 3-day deadline.

## Features Implemented

### ✅ Automated Alert System
- **Function**: `send-alerts`
- **Location**: `/supabase/functions/send-alerts/index.ts`
- **Trigger**: Cron job scheduled daily at 7:00 AM UTC
- **Purpose**: Monitor and alert on critical maintenance jobs

### 🔍 Alert Criteria
- **Priority Levels**: Alta (High) and Crítica (Critical)
- **Deadline Window**: Jobs due within the next 3 days
- **Data Source**: `mmi_jobs` table in Supabase

### 📧 Email Features
- **Format**: HTML + Plain Text
- **Content**: 
  - List of critical jobs with titles
  - Component IDs
  - Due dates
  - Priority levels with color coding
- **Recipients**: Configurable via environment variable

### 🎨 Email Template
- Professional HTML design with gradient header
- Color-coded priority indicators:
  - 🔴 Red for "Crítica" (Critical)
  - 🟠 Orange for "Alta" (High)
- Individual job cards with details
- Footer with timestamp and branding

## Configuration

### Environment Variables

```bash
# Email Service API Key (Required - choose one)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Email Configuration
EMAIL_FROM=engenharia@nautilusone.io  # Sender email address
MMI_ALERT_EMAIL=engenharia@nautilusone.io  # Recipient email (optional, defaults to EMAIL_FROM)

# Supabase Configuration (Already configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Cron Configuration

The function is configured in `supabase/config.toml`:

```toml
[[edge_runtime.cron]]
name = "send-alerts"
function_name = "send-alerts"
schedule = "0 7 * * *"  # Every day at 7:00 AM UTC
description = "Send alerts for critical/high priority MMI maintenance jobs with 3-day deadline"
```

## Database Schema

The function expects an `mmi_jobs` table with the following structure:

```sql
CREATE TABLE mmi_jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  component_id TEXT NOT NULL,
  priority TEXT NOT NULL,  -- 'Alta' or 'Crítica'
  due_date TIMESTAMPTZ NOT NULL,
  -- other fields...
);
```

## Usage

### Manual Invocation

```bash
# Test the function manually
curl -X POST https://your-project.supabase.co/functions/v1/send-alerts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Automatic Execution

The function runs automatically every day at 7:00 AM UTC via the configured cron job.

## Response Format

### Success Response (No Critical Jobs)
```json
{
  "success": true,
  "message": "Sem jobs críticos",
  "jobsCount": 0
}
```

### Success Response (Alerts Sent)
```json
{
  "success": true,
  "message": "✅ Alerta enviado para 3 job(s)",
  "jobsCount": 3,
  "recipient": "engenharia@nautilusone.io"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Erro ao enviar e-mail",
  "details": "RESEND_API_KEY or SENDGRID_API_KEY must be configured"
}
```

## Email Sample

**Subject**: ⚠️ Jobs críticos em manutenção

**Body**:
```
🚨 ALERTA DE MANUTENÇÃO 🚨

• Troca de Óleo - Motor Principal | Componente: ENG-001 | Prazo: 2024-10-18
• Inspeção Válvulas Segurança | Componente: SAFE-042 | Prazo: 2024-10-17
• Revisão Sistema Elétrico | Componente: ELEC-123 | Prazo: 2024-10-16

Verifique no sistema Nautilus One.
```

## Deployment

### 1. Deploy the Edge Function

```bash
# Navigate to project directory
cd /path/to/travel-hr-buddy

# Deploy the function
supabase functions deploy send-alerts
```

### 2. Set Environment Variables

```bash
# Set email service API key
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Set recipient email (optional)
supabase secrets set MMI_ALERT_EMAIL=engenharia@nautilusone.io

# Set sender email (optional)
supabase secrets set EMAIL_FROM=engenharia@nautilusone.io
```

### 3. Verify Deployment

```bash
# List all functions
supabase functions list

# Check function logs
supabase functions logs send-alerts --tail
```

## Monitoring

### View Logs

```bash
# Real-time logs
supabase functions logs send-alerts --tail

# Recent logs (last 100)
supabase functions logs send-alerts --limit 100
```

### Common Log Messages

- `🚀 Starting MMI alerts check...` - Function started
- `⚠️ Found X critical job(s) requiring attention` - Critical jobs detected
- `✅ No critical jobs found within 3-day deadline` - No alerts needed
- `📧 Sending alert email to...` - Email being sent
- `✅ Alert email sent successfully!` - Email sent successfully
- `❌ Error in send-alerts:` - Error occurred

## Troubleshooting

### Email Not Sent

**Issue**: Email not being delivered

**Solutions**:
1. Verify API key is set: `supabase secrets list`
2. Check Resend/SendGrid dashboard for delivery status
3. Review function logs: `supabase functions logs send-alerts`
4. Verify recipient email is valid

### No Jobs Detected

**Issue**: Function runs but reports 0 jobs

**Solutions**:
1. Verify `mmi_jobs` table exists and has data
2. Check job priorities are exactly "Alta" or "Crítica"
3. Verify due dates are within 3 days: `NOW() + INTERVAL '3 days'`
4. Check database RLS policies allow access

### Function Not Running

**Issue**: Cron job not executing

**Solutions**:
1. Verify cron configuration in `config.toml`
2. Check if function is deployed: `supabase functions list`
3. Review cron execution logs in Supabase dashboard
4. Ensure project has cron jobs enabled

## Integration with Existing Systems

### Email Service Compatibility

The function supports both Resend and SendGrid, consistent with other email functions in the repository:
- `send-assistant-report`
- `send-restore-dashboard`
- `send-restore-dashboard-daily`

### Fallback Behavior

```typescript
if (resendApiKey) {
  // Use Resend (Primary)
  await sendEmailViaResend(...);
} else if (sendgridApiKey) {
  // Use SendGrid (Fallback)
  await sendEmailViaSendGrid(...);
} else {
  // Error: No email service configured
  throw new Error("RESEND_API_KEY or SENDGRID_API_KEY must be configured");
}
```

## Testing

### Test with Sample Data

```sql
-- Insert test jobs
INSERT INTO mmi_jobs (id, title, component_id, priority, due_date)
VALUES 
  ('test-1', 'Troca de Óleo - Motor Principal', 'ENG-001', 'Crítica', NOW() + INTERVAL '2 days'),
  ('test-2', 'Inspeção Válvulas Segurança', 'SAFE-042', 'Alta', NOW() + INTERVAL '1 day'),
  ('test-3', 'Revisão Sistema Elétrico', 'ELEC-123', 'Crítica', NOW() + INTERVAL '3 days');

-- Run the function manually
-- Then check email delivery
```

### Clean Up Test Data

```sql
DELETE FROM mmi_jobs WHERE id LIKE 'test-%';
```

## Related Documentation

- [PR463 Email Notifications](PR463_REFACTORING_COMPLETE.md)
- [PR403 Cron Monitoring](PR403_QUICKREF.md)
- [Daily Assistant Report](DAILY_ASSISTANT_REPORT_QUICKREF.md)
- [Send Restore Dashboard](SEND_RESTORE_DASHBOARD_QUICK_START.md)

## Technical Details

### Function Structure

```typescript
serve(async (req) => {
  // 1. Handle CORS
  // 2. Query mmi_jobs table for critical jobs
  // 3. Generate email content (HTML + Text)
  // 4. Send email via Resend or SendGrid
  // 5. Return response
});
```

### Dependencies

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
```

### Email API Endpoints

- **Resend**: `https://api.resend.com/emails`
- **SendGrid**: `https://api.sendgrid.com/v3/mail/send`

## Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Error Handling**: Function catches and logs all errors
3. **CORS Support**: Properly configured CORS headers
4. **Service Role Key**: Uses service role for database access (bypasses RLS)
5. **Logging**: Comprehensive console logging for debugging
6. **Email Format**: Both HTML and plain text for compatibility

## Next Steps

1. ✅ Deploy function to production
2. ✅ Configure environment variables
3. ✅ Test email delivery
4. Monitor daily execution
5. Adjust cron schedule if needed
6. Add database logging (optional enhancement)

---

**Created**: 2024-10-15  
**Function**: `send-alerts`  
**Cron Schedule**: `0 7 * * *` (Daily at 7:00 AM UTC)  
**Status**: ✅ Ready for deployment
