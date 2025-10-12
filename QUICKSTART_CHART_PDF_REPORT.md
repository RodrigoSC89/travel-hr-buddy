# Quick Start: Chart PDF Email Report (5 minutes)

## Overview
Automated daily email report with restore metrics chart as PDF attachment using Puppeteer.

## Prerequisites
- Supabase project with Edge Functions enabled
- SendGrid API key
- Your application deployed and accessible

## Setup Steps

### 1. Configure Environment Variables (2 min)

Set these secrets in your Supabase project:

```bash
# Via Supabase CLI
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key
supabase secrets set ADMIN_EMAIL=admin@yourcompany.com
supabase secrets set VITE_APP_URL=https://your-app-url.com
supabase secrets set EMAIL_FROM=noreply@yourcompany.com

# Or via Supabase Dashboard
# Project Settings → Edge Functions → Add secret
```

### 2. Deploy Edge Function (1 min)

```bash
cd supabase/functions
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

### 3. Test Manually (1 min)

```bash
# Test the function
supabase functions invoke send_daily_restore_report

# Or via curl
curl -X POST \
  https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Check your email inbox for the PDF report!

### 4. Schedule Daily Execution (1 min)

Run this SQL in Supabase SQL Editor:

```sql
-- Create pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily execution at 8:00 AM UTC
SELECT cron.schedule(
  'daily-restore-chart-report',
  '0 8 * * *',  -- Run at 8:00 AM UTC every day
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send_daily_restore_report',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);

-- Verify cron job was created
SELECT * FROM cron.job WHERE jobname = 'daily-restore-chart-report';
```

Replace:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key (from Project Settings → API)

## How It Works

1. **Embed Route**: `/embed/restore-chart` renders the chart publicly (no auth)
2. **Puppeteer**: Edge Function launches browser, navigates to embed route
3. **PDF Generation**: Captures chart and generates A4 PDF
4. **Email**: Sends PDF via SendGrid with professional template
5. **Logging**: Records execution status in `restore_report_logs` table

## Troubleshooting

### Email not received?
- Check SendGrid API key is valid
- Verify `ADMIN_EMAIL` environment variable
- Check function logs: `supabase functions logs send_daily_restore_report`

### Chart not loading?
- Verify `VITE_APP_URL` is set correctly
- Test embed route directly: `https://your-app.com/embed/restore-chart`
- Check browser console for errors

### Puppeteer errors?
- Ensure Supabase Edge Functions have sufficient resources
- Check function logs for specific errors
- Puppeteer timeout? Increase timeout in code if needed

## Testing the Embed Route

Visit the embed route directly in your browser:
```
https://your-app-url.com/embed/restore-chart
```

You should see a clean chart with no navigation elements.

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SENDGRID_API_KEY` | Yes | SendGrid API key | `SG.xxx...` |
| `ADMIN_EMAIL` | Yes | Recipient email | `admin@company.com` |
| `VITE_APP_URL` | Yes | App URL for embed route | `https://app.company.com` |
| `EMAIL_FROM` | No | Sender email (optional) | `noreply@company.com` |
| `SUPABASE_URL` | Auto | Set by Supabase | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | Set by Supabase | - |

## Next Steps

- Review logs in `restore_report_logs` table
- Customize email template in Edge Function
- Adjust chart styling in `RestoreChartEmbed.tsx`
- Add more recipients or CC/BCC in SendGrid payload

## Support

For detailed implementation guide, see `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md`
