# Dashboard Report API - Quick Reference

## Overview
Automated email reporting system for the admin dashboard that sends daily statistics to all users.

## Quick Start

### 1. Set Environment Variables
In Supabase Dashboard (Settings → Edge Functions → Environment Variables):

```bash
RESEND_API_KEY=re_xxxxx...        # Required for email delivery
BASE_URL=https://your-app.com     # Required for dashboard links
EMAIL_FROM=dash@empresa.com       # Optional (has default)
```

### 2. Deploy Edge Function
```bash
supabase functions deploy send-dashboard-report
```

### 3. Test the Function
```bash
curl -X POST https://PROJECT.supabase.co/functions/v1/send-dashboard-report \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### 4. Schedule Cron Job (Optional)
Run in Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'send-daily-dashboard-report',
  '0 9 * * *',  -- 9:00 AM daily (UTC-3)
  $$SELECT net.http_post(
    url := 'https://PROJECT.supabase.co/functions/v1/send-dashboard-report',
    headers := '{"Authorization":"Bearer SERVICE_ROLE_KEY"}',
    body := '{}'
  );$$
);
```

## Features

### ✅ What It Does
- Fetches all users with email addresses from `profiles` table
- Generates beautiful HTML email with gradient header (purple to blue)
- Includes dashboard statistics:
  - Total Restorations
  - Unique Documents Restored
  - Average per Day
- Sends direct link to public dashboard (`/admin/dashboard?public=1`)
- Tracks sent/failed emails with detailed statistics

### 📊 Email Template
- Professional gradient header
- Portuguese date formatting
- Responsive HTML design
- Call-to-action button
- Dashboard feature summary

### 🔒 Security
- Uses Supabase service role key
- Requires Resend API key
- Per-user email tracking
- Error handling for each recipient

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Dashboard reports sent successfully",
  "sent": 25,
  "failed": 0,
  "total": 25,
  "summary": {
    "total": 150,
    "unique_docs": 45,
    "avg_per_day": 10.7
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Missing RESEND_API_KEY environment variable"
}
```

## Use Cases

### 📧 Daily Team Updates
Schedule automated emails at 9 AM to keep entire team informed.

### 📊 On-Demand Reports
Trigger manually via API for ad-hoc reporting needs.

### 🔔 Alert System
Integrate with monitoring systems to send reports on specific events.

## Dashboard Features
The email links to the public dashboard which includes:
- Real-time statistics
- 15-day trend visualization
- Dark theme for TV displays
- QR code for mobile access

## Troubleshooting

### No emails sent
- Check if `RESEND_API_KEY` is set correctly
- Verify users have email addresses in `profiles` table
- Check Resend API dashboard for errors

### Function timeout
- Large user lists may take time
- Consider batching for 100+ users

### Invalid email addresses
- Function continues on individual failures
- Check `errors` array in response for details

## Related Documentation
- `CRON_DASHBOARD_REPORT.md` - Cron scheduling setup
- `DASHBOARD_REPORT_IMPLEMENTATION_COMPLETE.md` - Full technical guide
- `src/pages/admin/dashboard.tsx` - Dashboard frontend implementation
