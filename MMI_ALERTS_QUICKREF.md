# 🚨 MMI Alerts Email - Quick Reference

## At a Glance

**Function**: `send-alerts`  
**Schedule**: Daily at 7:00 AM UTC  
**Purpose**: Alert on critical maintenance jobs due within 3 days  
**Database**: `mmi_jobs` table  

## Quick Setup

### 1. Deploy Function
```bash
supabase functions deploy send-alerts
```

### 2. Set Environment Variables
```bash
# Required (choose one)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR
supabase secrets set SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Optional
supabase secrets set MMI_ALERT_EMAIL=engenharia@nautilusone.io
supabase secrets set EMAIL_FROM=engenharia@nautilusone.io
```

### 3. Test Manually
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-alerts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Alert Criteria

| Parameter | Value |
|-----------|-------|
| **Priority** | Alta or Crítica |
| **Deadline** | Within next 3 days |
| **Action** | Send email alert |

## Email Format

**Subject**: `⚠️ Jobs críticos em manutenção`

**Recipients**: `MMI_ALERT_EMAIL` env var or `engenharia@nautilusone.io`

**Content**:
- Job title
- Component ID
- Priority level
- Due date
- System reference

## Database Query

```sql
SELECT * FROM mmi_jobs
WHERE priority IN ('Alta', 'Crítica')
  AND due_date < NOW() + INTERVAL '3 days'
```

## Response Examples

### No Critical Jobs
```json
{
  "success": true,
  "message": "Sem jobs críticos",
  "jobsCount": 0
}
```

### Alert Sent
```json
{
  "success": true,
  "message": "✅ Alerta enviado para 3 job(s)",
  "jobsCount": 3,
  "recipient": "engenharia@nautilusone.io"
}
```

## Monitoring

```bash
# View real-time logs
supabase functions logs send-alerts --tail

# Check recent executions
supabase functions logs send-alerts --limit 50
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sent | Check API key: `supabase secrets list` |
| No jobs detected | Verify `mmi_jobs` table has data |
| Function not running | Check cron config in `config.toml` |
| Wrong recipient | Set `MMI_ALERT_EMAIL` environment variable |

## Key Log Messages

- ✅ `No critical jobs found within 3-day deadline`
- ⚠️ `Found X critical job(s) requiring attention`
- 📧 `Sending alert email to...`
- ❌ `Error in send-alerts:`

## Files Modified

1. `/supabase/functions/send-alerts/index.ts` - Main function
2. `/supabase/config.toml` - Cron configuration
3. `/MMI_ALERTS_EMAIL_IMPLEMENTATION.md` - Full documentation
4. `/MMI_ALERTS_QUICKREF.md` - This file

## Cron Configuration

```toml
[[edge_runtime.cron]]
name = "send-alerts"
function_name = "send-alerts"
schedule = "0 7 * * *"
description = "Send alerts for critical/high priority MMI maintenance jobs"
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes* | - | Resend API key |
| `SENDGRID_API_KEY` | Yes* | - | SendGrid API key |
| `EMAIL_FROM` | No | `engenharia@nautilusone.io` | Sender email |
| `MMI_ALERT_EMAIL` | No | `engenharia@nautilusone.io` | Recipient email |
| `SUPABASE_URL` | Auto | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | - | Service role key |

*One of RESEND_API_KEY or SENDGRID_API_KEY is required

## Integration Points

- Follows same pattern as `send-assistant-report`
- Uses same email services as `send-restore-dashboard-daily`
- Compatible with existing cron monitoring system
- Consistent with repository email architecture

## Next Steps

1. Deploy to production
2. Monitor first execution
3. Verify email delivery
4. Adjust schedule if needed

---

**Quick Start**: Deploy → Set Keys → Monitor  
**Status**: ✅ Ready for Production
