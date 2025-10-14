# Dashboard Report - Quick Reference

## 🚀 Quick Access

### Admin Mode (Full Features)
```
/admin/dashboard
```

### Public Mode (Read-Only, TV Display)
```
/admin/dashboard?public=1
```

## 📦 Installation

```bash
# Already installed - no action needed
npm install qrcode.react @types/qrcode.react
```

## 🔑 Environment Variables

Set in Supabase Dashboard (Settings → Edge Functions → Environment Variables):

```bash
RESEND_API_KEY=re_xxxxx           # Your Resend API key
EMAIL_FROM=dash@empresa.com       # Custom sender (optional)
BASE_URL=https://your-app.com     # Your app URL (required)
```

## 🚀 Deployment

### 1. Deploy Edge Function
```bash
supabase functions deploy send-dashboard-report
```

### 2. Schedule Cron Job
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

Replace:
- `PROJECT` with your Supabase project ID
- `SERVICE_ROLE_KEY` with your service role key

## 🧪 Testing

### Test Edge Function
```bash
curl -X POST "https://PROJECT.supabase.co/functions/v1/send-dashboard-report" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Expected Response:
```json
{
  "success": true,
  "message": "Dashboard report emails sent successfully",
  "emailsSent": 5,
  "emailsFailed": 0,
  "totalUsers": 5
}
```

### Check Cron Status
```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
```

### View Execution History
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-dashboard-report')
ORDER BY start_time DESC LIMIT 5;
```

## 📊 Dashboard Features

### Admin Mode Shows:
- ✅ Cron status badge
- ✅ Real-time statistics (3 cards)
- ✅ Trend chart (15 days)
- ✅ QR code for sharing
- ✅ Main dashboard cards
- ✅ Quick links section

### Public Mode Shows:
- ✅ "Modo Somente Leitura" badge
- ✅ Real-time statistics (3 cards)
- ✅ Trend chart (15 days)
- ❌ No cron status
- ❌ No QR code
- ❌ No dashboard cards
- ❌ No quick links

## 📧 Email Report

### When It Sends
- Daily at 9:00 AM (UTC-3 / 6:00 AM UTC)
- Automated via pg_cron

### Who Receives
- All users in `profiles` table with non-null email

### What It Contains
- Subject: 📊 Painel Diário de Indicadores
- Beautiful HTML template
- Direct link to public dashboard
- Dashboard features summary
- Call-to-action button

### Manual Trigger
Use curl command above to manually send report

## 🎨 Styling

### Normal Mode
- Standard light theme
- Blue/purple/indigo accent colors
- Clean, professional look

### Public Mode (TV Display)
- Dark background: `bg-zinc-950`
- Dark cards: `bg-zinc-900`
- High contrast text
- Optimized for large displays

## 🔧 Troubleshooting

### No Statistics Showing
1. Check database has data:
   ```sql
   SELECT COUNT(*) FROM document_restore_logs;
   ```
2. Verify RPC functions exist:
   ```sql
   SELECT * FROM pg_proc WHERE proname LIKE 'get_restore%';
   ```

### QR Code Not Showing
1. Check if `qrcode.react` is installed
2. Verify not in public mode (`?public=1`)
3. Check browser console for errors

### Emails Not Sending
1. Verify `RESEND_API_KEY` is set in Supabase
2. Check users have emails:
   ```sql
   SELECT COUNT(*) FROM profiles WHERE email IS NOT NULL;
   ```
3. Check Resend dashboard for delivery status

### Cron Not Running
1. Verify cron job exists and is active:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-daily-dashboard-report';
   ```
2. Check execution logs for errors:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 1;
   ```

## 📱 Use Cases

### TV Wall Display
1. Open browser on TV
2. Navigate to `/admin/dashboard?public=1`
3. Press F11 for fullscreen
4. Dashboard updates automatically

### Mobile Access
1. Scan QR code from admin dashboard
2. Opens public dashboard on mobile
3. No login required

### Email Reports
1. Automatically sent daily at 9 AM
2. All users receive link
3. Click to view latest data

### Stakeholder Sharing
1. Share public URL: `/admin/dashboard?public=1`
2. Stakeholders view read-only dashboard
3. No admin access needed

## 📚 Related Documentation

- `DASHBOARD_REPORT_IMPLEMENTATION_COMPLETE.md` - Full implementation guide
- `CRON_DASHBOARD_REPORT.md` - Detailed cron setup
- `supabase/functions/send-dashboard-report/index.ts` - Edge function code

## ✅ Checklist

- [ ] Environment variables set in Supabase
- [ ] Edge function deployed
- [ ] Cron job scheduled
- [ ] Test admin dashboard (`/admin/dashboard`)
- [ ] Test public mode (`/admin/dashboard?public=1`)
- [ ] Test QR code works
- [ ] Test email report (manual trigger)
- [ ] Verify cron schedule is active
- [ ] Share public URL with team

---

**Quick Help**: If you have issues, check `CRON_DASHBOARD_REPORT.md` for detailed troubleshooting.

**Status**: ✅ Ready to Deploy  
**Version**: 1.0.0
