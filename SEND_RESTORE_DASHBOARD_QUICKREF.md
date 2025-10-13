# Send Restore Dashboard API - Quick Reference

## 📦 What is this?
API endpoint to send restore dashboard reports via email with CSV/PDF attachment.

## 🔗 Endpoint
```
POST /functions/v1/send-restore-dashboard
```

## 📝 Request
```json
{
  "email": "user@example.com"  // Optional - uses authenticated user if not provided
}
```

## ✅ Response
```json
{
  "status": "ok",
  "message": "Relatório enviado por e-mail com sucesso!",
  "recipient": "user@example.com",
  "dataCount": 15
}
```

## 🚀 Quick Usage

### JavaScript/TypeScript
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/send-restore-dashboard`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Optional
    },
    body: JSON.stringify({ email: "recipient@example.com" })
  }
);

const result = await response.json();
```

### cURL
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-restore-dashboard \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com"}'
```

## 🔧 Environment Variables
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_...
EMAIL_FROM=dash@empresa.com  # Optional
```

## 📧 Email Details
- **Subject:** 📊 Relatório Diário de Restaurações
- **From:** dash@empresa.com (configurable)
- **Attachment:** CSV file with restore count by day
- **Format:** Professional HTML email with table and summary

## 📊 Data Source
Uses RPC function: `get_restore_count_by_day_with_email(email_input text)`
- Returns last 15 days of restore counts
- Filters by email if provided
- Groups by day

## 🔄 Email Providers
- **Primary:** Resend (if RESEND_API_KEY configured)
- **Fallback:** SendGrid (if SENDGRID_API_KEY configured)

## ⏰ Automation (Cron Job)
```sql
-- Run daily at 7:00 AM
SELECT cron.schedule(
  'daily-restore-dashboard',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-restore-dashboard',
    headers := '{"Content-Type":"application/json"}',
    body := '{"email":"admin@empresa.com"}'
  );
  $$
);
```

## 🗂️ Files
- **Active:** `supabase/functions/send-restore-dashboard/index.ts`
- **Reference:** `app/api/send-restore-dashboard/route.ts` (Next.js)
- **Docs:** `SEND_RESTORE_DASHBOARD_API_IMPLEMENTATION.md`

## ✨ Features
✅ Email parameter optional (uses authenticated user)  
✅ CSV attachment with restore data  
✅ Professional HTML email template  
✅ Support for Resend and SendGrid  
✅ Comprehensive error handling  
✅ CORS enabled  
✅ No data scenario handled gracefully  

## 🐛 Troubleshooting
```bash
# View logs
supabase functions logs send-restore-dashboard

# Test function
supabase functions invoke send-restore-dashboard \
  --body '{"email":"test@example.com"}'

# Check secrets
supabase secrets list
```

## 🔗 Related
- `send_daily_restore_report` - Scheduled daily restore logs report
- `send-assistant-report` - AI assistant report emails
- `get_restore_count_by_day_with_email` - RPC function for data

---
**Ready to use!** Just configure your email service API key and call the endpoint. 🎉
