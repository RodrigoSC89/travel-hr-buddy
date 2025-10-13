# 🚀 Assistant Logs Enhancements - Quick Reference

## Overview
Two new features for restore report logs: email notifications on failure + public view mode.

---

## 📧 Email Notifications on Failure

### Quick Setup
```bash
# Set environment variables
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set REPORT_ADMIN_EMAIL=admin@yourdomain.com

# Deploy Edge Function
supabase functions deploy send-restore-dashboard-daily
```

### When Triggered
- ✉️ Email sent automatically when daily report fails
- 📝 Error logged to database with status "error"
- 🔄 Non-blocking (email failures don't break error flow)

### Email Details
- **Subject**: 🚨 Falha no Envio de Relatório Diário
- **Content**: Error message + timestamp (pt-BR)
- **Style**: Professional HTML with red gradient header

---

## 🌐 Public View Mode

### URL Access

**Admin Mode (Full Controls)**
```
/admin/reports/logs
```

**Public Mode (Read-Only)**
```
/admin/reports/logs?public=1
```

### Public Mode Features
- ✅ Shows all log data and summaries
- ❌ Hides navigation buttons (Back, Refresh)
- ❌ Hides export buttons (CSV, PDF)
- ❌ Hides filter controls
- 👁️ Shows "Modo Somente Leitura" indicator

### Use Cases
1. **TV Monitors**: Display logs on office screens
2. **Stakeholder Sharing**: Share with non-admin users
3. **Public Dashboards**: Embed in status pages
4. **Transparency**: Show system health publicly

---

## 🔧 Environment Variables

### Required
```bash
RESEND_API_KEY          # Resend API key for email
REPORT_ADMIN_EMAIL      # Admin email for notifications
# or fallback to:
ADMIN_EMAIL             # Alternative admin email
```

### Optional
```bash
EMAIL_FROM              # Custom sender (default: relatorio@empresa.com)
```

---

## 📋 Quick Tests

### Test Email Notification
```bash
# Manually trigger Edge Function
curl -X POST "https://your-project.supabase.co/functions/v1/send-restore-dashboard-daily" \
  -H "Authorization: Bearer YOUR_KEY"

# Check admin email for notification
```

### Test Public View Mode
1. Visit: `/admin/reports/logs` → See all controls ✅
2. Visit: `/admin/reports/logs?public=1` → Controls hidden ❌
3. Verify: "Modo Somente Leitura" badge appears ✅

---

## 🎯 Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `supabase/functions/send-restore-dashboard-daily/index.ts` | Email notifications | +48 |
| `src/pages/admin/reports/logs.tsx` | Public view mode | +23 |
| **Total** | - | **+71** |

---

## ⚡ Quick Commands

```bash
# Deploy Everything
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set REPORT_ADMIN_EMAIL=admin@domain.com
supabase functions deploy send-restore-dashboard-daily
npm run build && npm run deploy

# Check Logs
supabase functions logs send-restore-dashboard-daily

# Verify Secrets
supabase secrets list
```

---

## 🐛 Common Issues

### Email Not Received?
1. Check `supabase secrets list` for RESEND_API_KEY
2. Verify email in Resend dashboard
3. Check Edge Function logs for email errors

### Public Mode Not Working?
1. Ensure URL is exactly `?public=1` (lowercase)
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R)

---

## 📊 Summary

### Email Notifications
- **Trigger**: Report failure
- **Recipient**: REPORT_ADMIN_EMAIL
- **Template**: Professional HTML
- **Non-blocking**: Yes

### Public View Mode
- **URL**: `?public=1`
- **Hidden**: Navigation, exports, filters
- **Shown**: All logs + read-only badge
- **Perfect for**: TV displays, sharing

---

## ✅ Checklist

- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Set `REPORT_ADMIN_EMAIL` environment variable
- [ ] Deploy Edge Function
- [ ] Deploy frontend changes
- [ ] Test email notification (trigger failure)
- [ ] Test public view mode (`?public=1`)
- [ ] Share public URL with stakeholders
- [ ] Display on TV monitor (optional)

---

**Quick Help**: See `ASSISTANT_LOGS_API_ENHANCEMENTS.md` for detailed guide.

**Version**: 1.0.0  
**Status**: ✅ Ready to Deploy
