# Monitor Cron Health Edge Function

## 📋 Overview

This Supabase Edge Function monitors the health of the daily assistant report cron job. It checks if the automated report was sent in the last 36 hours and sends an alert email if not.

## 🔍 What It Does

1. **Checks Recent Executions**: Queries the `assistant_report_logs` table for successful automated executions in the last 36 hours
2. **Sends Alerts**: If no successful execution is found, sends an alert email to the admin
3. **Logs Monitoring**: Records all monitoring activities in the `assistant_report_logs` table with `triggered_by = 'monitor'`

## ⚙️ Configuration

### Environment Variables

Required environment variables (configured in Supabase Dashboard):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `RESEND_API_KEY`: API key for Resend email service
- `ADMIN_EMAIL`: Email address to receive alerts (default: admin@nautilus.ai)
- `EMAIL_FROM`: Sender email address (default: nao-responda@nautilus.ai)

### Cron Schedule

This function is scheduled to run daily at **10:00 UTC** (2 hours after the daily report):

```yaml
cron:
  - name: monitor_cron_health
    schedule: '0 10 * * *'
    path: /functions/v1/monitor-cron-health
    method: POST
```

## 🚀 Deployment

### Using Supabase CLI

```bash
# Deploy the function
supabase functions deploy monitor-cron-health

# Test the function
supabase functions invoke monitor-cron-health --no-verify-jwt
```

### Manual Invocation

You can also invoke the function manually via HTTP:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/monitor-cron-health' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## 📊 Response Format

### Success - No Alert Needed

```json
{
  "success": true,
  "alert_sent": false,
  "message": "Verificação OK: último relatório enviado há 12h",
  "last_execution": "2025-10-12T08:00:00Z"
}
```

### Success - Alert Sent

```json
{
  "success": true,
  "alert_sent": true,
  "message": "Alerta enviado: relatório não executado nas últimas 36h"
}
```

### Error

```json
{
  "success": false,
  "error": "Error message"
}
```

## 📝 Monitoring Logs

All monitoring activities are logged in the `assistant_report_logs` table with:

- `triggered_by = 'monitor'`
- `status`: 'success', 'warning', 'error', or 'critical'
- `message`: Description of the monitoring result

### Query Monitoring History

```sql
SELECT * FROM assistant_report_logs
WHERE triggered_by = 'monitor'
ORDER BY sent_at DESC
LIMIT 10;
```

## 🔧 Alert Email

When a report execution is missing, the admin receives an email with:

- **Subject**: "⚠️ Alerta: Relatório Diário do Assistente IA não foi enviado"
- **Content**: 
  - Alert message
  - Recommended actions
  - Timestamp of verification

### Recommended Actions (from email)

1. Check Supabase Edge Functions logs
2. Verify cron job status: `send_assistant_report_daily`
3. Check API configurations (RESEND_API_KEY, ADMIN_EMAIL)
4. Execute report manually if needed

## 🏥 Health Status in Admin Dashboard

The assistant report logs admin page displays a health status indicator:

- **✅ Green**: Last automated report sent within 36 hours
- **⚠️ Yellow**: Last automated report sent more than 36 hours ago

## 🧪 Testing

### Test Locally

```bash
# Start Supabase local development
supabase start

# Deploy function locally
supabase functions serve monitor-cron-health

# Invoke the function
curl -X POST http://localhost:54321/functions/v1/monitor-cron-health
```

### Test Scenarios

1. **Normal Operation**: Should return success without sending alert
2. **Missing Execution**: Insert old logs only, should send alert
3. **Database Error**: Test with invalid credentials, should log error

## 📚 Related Files

- `supabase/cron.yaml` - Cron job configuration
- `supabase/functions/send-daily-assistant-report/index.ts` - The monitored function
- `src/pages/admin/reports/assistant.tsx` - Admin dashboard with health status
- `supabase/migrations/*_create_assistant_report_logs.sql` - Database schema

## 🔄 Integration with Daily Report

The monitoring function works in conjunction with:

- **send-daily-assistant-report** (08:00 UTC): Sends the daily report
- **monitor-cron-health** (10:00 UTC): Checks if report was sent

This creates a self-monitoring system that alerts admins when the automated reports fail.

## ⏰ Timeline

```
06:00 UTC ─────────────────────────────────────────────
               (Last successful report - 26h ago)

08:00 UTC ─────────────────────────────────────────────
          ❌ send_assistant_report_daily FAILS
               (No execution recorded)

10:00 UTC ─────────────────────────────────────────────
          ✅ monitor_cron_health RUNS
          ⚠️ Detects missing execution (>36h)
          📧 Sends alert email to admin

10:05 UTC ─────────────────────────────────────────────
          👤 Admin receives alert
          🔍 Admin checks logs and fixes issue
```

## 🎯 Success Criteria

The monitoring is working correctly when:

1. Function executes daily at 10:00 UTC without errors
2. Alerts are sent only when report hasn't run in 36+ hours
3. All monitoring activities are logged in the database
4. Admin dashboard shows accurate health status

## 🐛 Troubleshooting

### No Alerts Being Sent

- Check `RESEND_API_KEY` is valid
- Verify `ADMIN_EMAIL` is configured
- Check function logs: `supabase functions logs monitor-cron-health`

### False Alerts

- Verify `send_assistant_report_daily` is running
- Check if logs are being written with `triggered_by = 'automated'`
- Confirm cron schedule is active

### Health Status Not Updating

- Check RLS policies on `assistant_report_logs` table
- Verify admin user has correct role in `profiles` table
- Check browser console for fetch errors
