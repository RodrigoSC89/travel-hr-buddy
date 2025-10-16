# MMI Forecast Email - Quick Reference

## 🚀 Quick Start

### Prerequisites
```bash
# Environment variables needed in Supabase:
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
RESEND_API_KEY=your-resend-api-key
```

### Deployment Steps

1. **Apply Database Migration**
```bash
# Run migration to add forecast fields to mmi_jobs
supabase db push
```

2. **Deploy Edge Function**
```bash
# Deploy the mmi-forecast-email function
supabase functions deploy mmi-forecast-email
```

3. **Verify Cron Job**
```bash
# Check cron configuration in Supabase dashboard
# Navigate to Edge Functions > mmi-forecast-email > Cron Jobs
```

## 📧 Email Configuration

**Recipients**: `engenharia@nautilus.one`  
**Schedule**: Daily at 09:00 UTC  
**Subject**: 📬 Previsões de Manutenção (últimos 2 dias)

## 🧪 Testing

### Manual Test
```bash
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/mmi-forecast-email \
  -H "Authorization: Bearer [ANON_KEY]"
```

### Insert Test Data
```sql
INSERT INTO mmi_jobs (title, forecast, hours, responsible, forecast_date)
VALUES 
  ('Gerador B', 'Em 72h', 492, 'Pedro', NOW()),
  ('Bomba hidráulica', 'Em 168h', 300, 'Luana', NOW());
```

### Check Logs
```sql
SELECT * FROM cron_execution_logs 
WHERE function_name = 'mmi-forecast-email' 
ORDER BY executed_at DESC LIMIT 5;
```

## 📊 Database Schema

New fields added to `mmi_jobs` table:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `forecast` | TEXT | Forecast timing | "Em 72h" |
| `hours` | NUMERIC(10,2) | Estimated hours | 492 |
| `responsible` | TEXT | Responsible person | "Pedro" |
| `forecast_date` | TIMESTAMPTZ | Forecast creation date | 2025-10-16 |

## 🔍 Monitoring Queries

### Check Recent Executions
```sql
SELECT 
  executed_at,
  status,
  message,
  metadata->>'jobs_count' as jobs_sent,
  execution_duration_ms
FROM cron_execution_logs
WHERE function_name = 'mmi-forecast-email'
ORDER BY executed_at DESC;
```

### Count Forecasts by Status
```sql
SELECT 
  status,
  COUNT(*) as count,
  AVG(execution_duration_ms) as avg_duration_ms
FROM cron_execution_logs
WHERE function_name = 'mmi-forecast-email'
GROUP BY status;
```

### Recent Forecasts
```sql
SELECT 
  title,
  forecast,
  hours,
  responsible,
  forecast_date
FROM mmi_jobs
WHERE forecast_date >= NOW() - INTERVAL '2 days'
ORDER BY forecast_date DESC;
```

## 🛠️ Troubleshooting

### Issue: No emails received
**Check:**
1. ✅ `RESEND_API_KEY` configured
2. ✅ Email logs in `cron_execution_logs`
3. ✅ Resend dashboard for delivery status

### Issue: Function errors
**Check:**
```sql
-- View error details
SELECT error_details 
FROM cron_execution_logs 
WHERE function_name = 'mmi-forecast-email' 
  AND status = 'error'
ORDER BY executed_at DESC LIMIT 1;
```

### Issue: No data found
**Verify:**
```sql
-- Check if forecast records exist
SELECT COUNT(*) as forecast_count
FROM mmi_jobs
WHERE forecast_date >= NOW() - INTERVAL '2 days';
```

## 📝 Customization

### Change Email Recipients
Edit line 133 in `index.ts`:
```typescript
to: ["engenharia@nautilus.one"], // Change here
```

### Change Schedule
Edit `config.toml`:
```toml
schedule = "0 9 * * *"  # Modify cron expression
```

**Common Schedules:**
- Every day at 9 AM: `0 9 * * *`
- Every weekday at 8 AM: `0 8 * * 1-5`
- Every Monday at 10 AM: `0 10 * * 1`
- Twice daily (8 AM, 8 PM): `0 8,20 * * *`

### Change Time Window
Edit line 69 in `index.ts`:
```typescript
// Change from 2 days to 3 days
const twoDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
```

## 📦 Files Overview

```
travel-hr-buddy/
├── supabase/
│   ├── config.toml                          # Cron configuration
│   ├── functions/
│   │   └── mmi-forecast-email/
│   │       └── index.ts                     # Edge function
│   └── migrations/
│       └── 20251016030600_add_mmi_forecast_fields.sql
└── MMI_FORECAST_EMAIL_IMPLEMENTATION.md     # Full documentation
```

## ✅ Verification Checklist

Before going to production:

- [ ] Database migration applied
- [ ] Environment variables set in Supabase
- [ ] Function deployed successfully
- [ ] Manual test passes
- [ ] Test email received
- [ ] Cron schedule verified
- [ ] Monitoring queries tested
- [ ] Error handling tested

## 🔗 Related Resources

- [Full Implementation Guide](./MMI_FORECAST_EMAIL_IMPLEMENTATION.md)
- [MMI System Documentation](./mmi_readme.md)
- [Supabase Cron Jobs Docs](https://supabase.com/docs/guides/functions/schedule-functions)
- [Resend API Docs](https://resend.com/docs)

## 📞 Support

For issues or questions:
1. Check `cron_execution_logs` for error details
2. Review Supabase function logs
3. Verify Resend API status
4. Check network connectivity

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
