# Dashboard Report API - Quick Reference

## 🚀 Quick Start

### Access Dashboard
```
Normal Mode:  /admin/dashboard
Public Mode:  /admin/dashboard?public=1
```

### Test Email Function
```bash
curl -X GET \
  "${SUPABASE_URL}/functions/v1/send-dashboard-report" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}"
```

---

## 📁 Files

| File | Purpose |
|------|---------|
| `src/pages/admin/dashboard.tsx` | Main dashboard component |
| `supabase/functions/send-dashboard-report/index.ts` | Email sending edge function |
| `CRON_DASHBOARD_REPORT.md` | Cron setup documentation |
| `DASHBOARD_REPORT_VISUAL_SUMMARY.md` | Complete implementation guide |

---

## 🔧 Setup Steps

### 1. Environment Variables
```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=dash@empresa.com
BASE_URL=https://your-app.vercel.app
```

### 2. Schedule Cron (SQL)
```sql
SELECT cron.schedule(
  'send-daily-dashboard-report',
  '0 9 * * *',
  $$SELECT net.http_post(
    url := 'https://PROJECT.supabase.co/functions/v1/send-dashboard-report',
    headers := '{"Authorization":"Bearer SERVICE_ROLE_KEY"}',
    body := '{}'
  );$$
);
```

### 3. Verify
```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
```

---

## 🎨 Features

### Normal Mode
- ✅ Cron status badge
- ✅ Statistics cards
- ✅ Trend chart
- ✅ QR code section

### Public Mode (`?public=1`)
- ✅ Eye icon in title
- ✅ Statistics cards
- ✅ Trend chart
- ✅ "Read-only" badge
- ❌ No QR code
- ❌ No cron status

---

## 📊 Dashboard Statistics

| Metric | Source |
|--------|--------|
| Total Restaurações | `get_restore_summary()` |
| Docs Únicos | `get_restore_summary()` |
| Média por Dia | `get_restore_summary()` |
| Trend (15 days) | `get_restore_count_by_day_with_email()` |

---

## 📧 Email Details

**Subject**: 📊 Painel Diário de Indicadores

**Recipients**: All users from `profiles` table with email

**Schedule**: Daily at 9:00 AM (UTC-3)

**Content**: HTML email with button linking to public dashboard

---

## 🧪 Testing

### Manual Email Test
```bash
curl -X GET \
  "https://PROJECT.supabase.co/functions/v1/send-dashboard-report" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

### Expected Response
```json
{
  "status": "ok",
  "message": "Relatórios enviados com sucesso!",
  "emailsSent": 5,
  "emailsFailed": 0,
  "totalUsers": 5
}
```

### Dashboard Tests
1. Normal: `/admin/dashboard` → Should show QR code
2. Public: `/admin/dashboard?public=1` → Should hide QR code, show read-only badge

---

## 🔍 Troubleshooting

### No emails sent
- Check `RESEND_API_KEY` is set
- Verify users have email in profiles table
- Check edge function logs

### Dashboard not loading stats
- Verify RPC functions exist: `get_restore_summary`, `get_restore_count_by_day_with_email`
- Check browser console for errors
- Verify Supabase connection

### QR code not showing
- Only shows in normal mode (without `?public=1`)
- Check `publicUrl` is generated correctly
- Verify `qrcode.react` is installed

---

## 🎯 Use Cases

1. **TV Wall Display**: Use `?public=1` on office monitors
2. **Mobile Sharing**: Scan QR code for quick mobile access
3. **Daily Updates**: Automated emails to all users
4. **Stakeholder Reports**: Public link for read-only access

---

## ⚡ Dependencies

- `recharts` - Chart visualization
- `qrcode.react` - QR code generation
- Resend API - Email delivery
- Supabase - Database and edge functions

---

## 📋 Checklist

- [ ] Install dependencies (`qrcode.react`)
- [ ] Set environment variables
- [ ] Deploy edge function
- [ ] Schedule cron job
- [ ] Test normal mode dashboard
- [ ] Test public mode dashboard
- [ ] Test email sending
- [ ] Verify scheduled execution

---

## 🔗 Related

- **Public Mode**: `PR470_PUBLIC_MODE_VISUAL_GUIDE.md`
- **Email Reports**: `DAILY_ASSISTANT_REPORT_VISUAL_SUMMARY.md`
- **Restore Dashboard**: `src/pages/admin/documents/restore-dashboard.tsx`
