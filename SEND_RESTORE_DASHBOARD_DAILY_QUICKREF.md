# 📊 Send Restore Dashboard Daily - Quick Reference

## 🚀 Quick Start

```bash
# Deploy function
supabase functions deploy send-restore-dashboard-daily

# Set environment variables in Supabase Dashboard
RESEND_API_KEY=re_xxxxxxxxxxxxx
REPORT_ADMIN_EMAIL=admin@example.com
EMAIL_FROM=relatorio@empresa.com

# Test function
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-restore-dashboard-daily
```

## 📁 Files Created

```
supabase/
├── config.toml                                          # ✅ Updated with cron
└── functions/
    └── send-restore-dashboard-daily/
        ├── index.ts                                     # ✅ Main function (242 lines)
        └── README.md                                    # ✅ Documentation

SEND_RESTORE_DASHBOARD_DAILY_IMPLEMENTATION.md          # ✅ Implementation guide
SEND_RESTORE_DASHBOARD_DAILY_QUICKREF.md                # ✅ This file
```

## ⚙️ Configuration

### Cron Schedule
```toml
# File: supabase/config.toml
[[edge_runtime.cron]]
name = "send-restore-dashboard-daily"
function_name = "send-restore-dashboard-daily"
schedule = "0 8 * * *"  # 08:00 UTC = 5h BRT
```

### Environment Variables
| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `RESEND_API_KEY` | ✅ | - | Resend API key |
| `REPORT_ADMIN_EMAIL` | ⚠️ | `ADMIN_EMAIL` | Recipient email |
| `EMAIL_FROM` | ⚠️ | `relatorio@empresa.com` | Sender email |

## 📧 Email Details

**Subject:** 📊 Relatório Diário de Restaurações  
**From:** relatorio@empresa.com  
**Attachment:** relatorio-automatico.pdf  
**Schedule:** Daily at 08:00 UTC (5h BRT)

## 🔍 Monitoring

### Check Logs
```sql
-- Recent executions
SELECT * FROM restore_report_logs 
WHERE triggered_by = 'automated'
ORDER BY executed_at DESC LIMIT 10;

-- Errors only
SELECT * FROM restore_report_logs 
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC;
```

### Supabase Dashboard
Edge Functions → send-restore-dashboard-daily → Invocations

## 📊 Data Flow

```
Cron (08:00 UTC)
    ↓
send-restore-dashboard-daily
    ↓
get_restore_count_by_day_with_email(null)
    ↓
Generate PDF (CSV format)
    ↓
Send via Resend API
    ↓
Log to restore_report_logs
```

## 🎯 Key Functions

```typescript
// Fetch data
const { data } = await supabase.rpc('get_restore_count_by_day_with_email', {
  email_input: null
});

// Generate PDF
const pdfContent = generatePDFContent(data);

// Send email
await sendEmailViaResend(adminEmail, subject, html, pdfContent, apiKey);

// Log execution
await logExecution(supabase, 'success', message);
```

## ✅ Success Response
```json
{
  "success": true,
  "message": "Daily restore dashboard report sent successfully",
  "dataPoints": 15,
  "recipient": "admin@example.com",
  "emailSent": true
}
```

## ❌ Error Response
```json
{
  "success": false,
  "error": "RESEND_API_KEY environment variable is required"
}
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not received | Check RESEND_API_KEY, verify email domain in Resend |
| Function fails | Check environment variables, view Supabase logs |
| No data in PDF | Verify `document_restore_logs` has data |
| Wrong schedule | Update cron expression in config.toml |

## 📚 Related Implementations

- `send_daily_restore_report` - CSV via SendGrid
- `send-daily-assistant-report` - Assistant logs report
- `daily-restore-report` - Chart embedding version

## 🎉 Implementation Status

✅ **Complete** - All features from problem statement implemented

- [x] Edge Function created
- [x] RPC integration
- [x] PDF generation (CSV format)
- [x] Resend API integration
- [x] Cron scheduling (08:00 UTC)
- [x] Error handling & logging
- [x] Professional email template
- [x] Complete documentation

## 📞 Support

**Documentation:**
- Main guide: `SEND_RESTORE_DASHBOARD_DAILY_IMPLEMENTATION.md`
- Function README: `supabase/functions/send-restore-dashboard-daily/README.md`

**Logs:**
- Supabase Dashboard → Edge Functions → Logs
- Database: `restore_report_logs` table
