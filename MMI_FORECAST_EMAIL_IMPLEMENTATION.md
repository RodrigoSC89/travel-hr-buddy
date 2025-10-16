# MMI Forecast Email - Cron Job Implementation

## 📋 Overview

This implementation adds a scheduled email notification system for MMI (Módulo de Manutenção Inteligente) maintenance forecasts. The system automatically sends daily emails with maintenance forecasts from the last 2 days to the engineering team.

## 🎯 Features

- ✅ Automated daily email notifications
- ✅ Queries forecasts from the last 2 days
- ✅ Styled HTML email with maintenance details
- ✅ Error handling and logging to `cron_execution_logs`
- ✅ CORS support for manual invocation
- ✅ Integration with Resend API for email delivery

## 📁 Files Created/Modified

### 1. Database Migration
**File**: `/supabase/migrations/20251016030600_add_mmi_forecast_fields.sql`

Adds the following fields to the `mmi_jobs` table:
- `forecast` (TEXT) - Maintenance forecast timing (e.g., "Em 72h", "Em 168h")
- `hours` (NUMERIC) - Estimated hours for the maintenance job
- `responsible` (TEXT) - Person responsible for the maintenance job
- `forecast_date` (TIMESTAMPTZ) - Date when the forecast was generated

### 2. Edge Function
**File**: `/supabase/functions/mmi-forecast-email/index.ts`

Features:
- Queries `mmi_jobs` table for forecasts from the last 2 days
- Generates styled HTML email with forecast details
- Sends email via Resend API
- Logs execution status to `cron_execution_logs` table
- Handles errors gracefully with proper logging

### 3. Configuration
**File**: `/supabase/config.toml`

Added:
- Function configuration: `[functions.mmi-forecast-email]`
- Cron job schedule: Daily at 09:00 UTC
```toml
[[edge_runtime.cron]]
name = "mmi-forecast-email"
function_name = "mmi-forecast-email"
schedule = "0 9 * * *"  # Every day at 09:00 UTC
description = "MMI: Send daily email with maintenance forecasts from the last 2 days"
```

## 📧 Email Example

**Subject**: 📬 Previsões de Manutenção (últimos 2 dias)

**Content**:
```
📈 Forecast de Manutenção - MMI

• Gerador B: Em 72h - 492h - Resp: Pedro
• Bomba hidráulica: Em 168h - 300h - Resp: Luana
```

## 🔧 Environment Variables Required

The function requires the following environment variables to be set in Supabase:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- `RESEND_API_KEY` - Resend API key for sending emails

## 📊 Data Flow

```
┌─────────────────────────────────────────┐
│   Supabase Cron Scheduler               │
│   (Daily at 09:00 UTC)                  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   mmi-forecast-email Function           │
│   • Query mmi_jobs table                │
│   • Filter by forecast_date (last 2d)   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Generate HTML Email                   │
│   • Format forecast data                │
│   • Apply styling                       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Send via Resend API                   │
│   • To: engenharia@nautilus.one         │
│   • Subject: Previsões de Manutenção    │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Log Execution                         │
│   • Status: success/error/warning       │
│   • Metadata: jobs_count, recipients    │
│   • Duration: execution_duration_ms     │
└─────────────────────────────────────────┘
```

## 🧪 Testing

### Manual Invocation

You can manually trigger the function using the Supabase CLI or via HTTP request:

```bash
# Using curl
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/mmi-forecast-email \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

### Sample Data

To test the function, insert sample forecast data:

```sql
INSERT INTO mmi_jobs (title, forecast, hours, responsible, forecast_date)
VALUES 
  ('Gerador B', 'Em 72h', 492, 'Pedro', NOW()),
  ('Bomba hidráulica', 'Em 168h', 300, 'Luana', NOW());
```

## 📈 Monitoring

The function logs all executions to the `cron_execution_logs` table. You can monitor execution health with:

```sql
SELECT 
  executed_at,
  status,
  message,
  metadata,
  execution_duration_ms
FROM cron_execution_logs
WHERE function_name = 'mmi-forecast-email'
ORDER BY executed_at DESC
LIMIT 10;
```

## 🔍 Troubleshooting

### No emails received

1. Check if `RESEND_API_KEY` is configured correctly
2. Verify email address `engenharia@nautilus.one` is valid
3. Check `cron_execution_logs` for errors
4. Ensure there are forecast records in the last 2 days

### Function not running on schedule

1. Verify cron configuration in `config.toml`
2. Check Supabase dashboard for cron job status
3. Review function deployment status

### Database query errors

1. Ensure migration has been applied
2. Verify `forecast_date` column exists in `mmi_jobs`
3. Check database permissions

## 📝 Future Enhancements

Potential improvements for future versions:

- [ ] Make email recipients configurable via environment variable
- [ ] Add support for multiple languages
- [ ] Include charts/graphs in email
- [ ] Add filtering by priority or component
- [ ] Support for PDF attachment
- [ ] Email template customization

## ✅ Checklist for Deployment

- [x] Database migration created
- [x] Edge function implemented
- [x] Cron job configured
- [x] Error handling and logging
- [ ] Environment variables configured in Supabase
- [ ] Migration applied to database
- [ ] Function deployed to Supabase
- [ ] Test email sent and verified

## 📚 Related Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)
- [Resend API Documentation](https://resend.com/docs)
- [MMI System Documentation](./mmi_readme.md)
