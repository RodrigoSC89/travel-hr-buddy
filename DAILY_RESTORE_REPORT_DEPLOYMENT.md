# Daily Restore Report - Deployment Guide

Complete guide for deploying the daily automated restore report functionality.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Scheduling](#scheduling)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This feature automatically sends a daily email report with restore metrics chart to administrators. The implementation consists of:

- **Supabase Edge Function**: `daily-restore-report` - Orchestrates data fetching and email sending
- **Email API**: `/api/send-restore-report` - Handles email delivery using nodemailer
- **Chart API**: `/api/generate-chart-image` - Generates chart screenshots (optional)
- **Embed Page**: `/embed-restore-chart.html` - Standalone chart visualization

## 📦 Prerequisites

### Required:
- ✅ Supabase project with Edge Functions enabled
- ✅ Node.js application deployed (Vercel, Netlify, etc.)
- ✅ SMTP email service (Gmail, SendGrid, etc.)
- ✅ Supabase RPC functions:
  - `get_restore_count_by_day_with_email`
  - `get_restore_summary`

### Optional:
- 🔲 Screenshot service (API Flash, URL2PNG) for chart images
- 🔲 Puppeteer setup for server-side screenshots

## 🚀 Installation Steps

### Step 1: Verify Database Functions

Ensure these RPC functions exist in your Supabase database:

```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('get_restore_count_by_day_with_email', 'get_restore_summary');
```

If they don't exist, you need to create them based on your restore_logs table structure.

### Step 2: Install Dependencies

The required dependencies are already in package.json:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

For optional Puppeteer support:

```bash
npm install puppeteer
```

### Step 3: Deploy Files

All files have been created in the repository:

```
✅ /supabase/functions/daily-restore-report/index.ts
✅ /supabase/functions/daily-restore-report/README.md
✅ /pages/api/send-restore-report.ts
✅ /pages/api/generate-chart-image.ts
✅ /public/embed-restore-chart.html
```

## ⚙️ Configuration

### 1. Environment Variables - Supabase

Set in Supabase Dashboard → Settings → Edge Functions → Secrets:

```bash
SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_URL=https://your-app-url.vercel.app
ADMIN_EMAIL=admin@empresa.com
```

### 2. Environment Variables - Application

Add to your `.env` file or deployment platform (Vercel, Netlify):

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
EMAIL_FROM=relatorios@yourdomain.com

# Optional: Screenshot Service
APIFLASH_KEY=your_api_flash_key
```

### 3. Gmail Configuration (if using Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use this password as `EMAIL_PASS`

### 4. SendGrid Configuration (alternative to Gmail)

If using SendGrid instead of SMTP:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

## 🧪 Testing

### Test 1: Embed Page

Open in browser to verify chart renders:

```
https://your-app-url.vercel.app/embed-restore-chart.html
```

Expected: Chart should display with restore metrics data.

### Test 2: Email API

Test email sending:

```bash
curl -X POST https://your-app-url.vercel.app/api/send-restore-report \
  -H "Content-Type: application/json" \
  -d '{
    "toEmail": "test@example.com",
    "summary": {
      "total": 100,
      "unique_docs": 50,
      "avg_per_day": 10
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### Test 3: Edge Function

Test the edge function locally (if Supabase CLI is installed):

```bash
supabase functions serve daily-restore-report
```

Then invoke:

```bash
curl -X POST http://localhost:54321/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test 4: End-to-End Test

Deploy and invoke the edge function:

```bash
# Deploy
supabase functions deploy daily-restore-report

# Invoke
supabase functions invoke daily-restore-report --no-verify-jwt
```

Check your email for the report.

## 📤 Deployment

### Deploy to Supabase

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy daily-restore-report

# Verify deployment
supabase functions list
```

### Deploy Application (Vercel)

If using Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add EMAIL_HOST
vercel env add EMAIL_PORT
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
vercel env add EMAIL_FROM
```

### Deploy Application (Netlify)

If using Netlify:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify Dashboard
# Site settings → Environment variables
```

## ⏰ Scheduling

### Option 1: Supabase Cron (Recommended)

Schedule the function to run daily:

```bash
supabase functions schedule daily-restore-report \
  --cron "0 8 * * *" \
  --endpoint-type=public
```

### Option 2: pg_cron (Database)

If you have database access:

```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily at 8 AM
SELECT cron.schedule(
  'daily-restore-report',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/daily-restore-report',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);

-- Verify schedule
SELECT * FROM cron.job;
```

### Option 3: External Cron Service

Use services like:
- **Cron-job.org**: https://cron-job.org/
- **EasyCron**: https://www.easycron.com/
- **GitHub Actions**: Create a workflow

GitHub Actions example (`.github/workflows/daily-report.yml`):

```yaml
name: Daily Restore Report
on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Edge Function
        run: |
          curl -X POST \
            https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/daily-restore-report \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

### Cron Schedule Examples

```bash
# Every day at 8:00 AM
0 8 * * *

# Every weekday at 9:00 AM
0 9 * * 1-5

# Every Monday at 7:00 AM
0 7 * * 1

# Twice a day (8 AM and 8 PM)
0 8,20 * * *

# First day of month at 10 AM
0 10 1 * *
```

## 🔍 Monitoring

### View Logs

```bash
# Supabase function logs
supabase functions logs daily-restore-report

# Follow logs in real-time
supabase functions logs daily-restore-report --follow

# Filter by date
supabase functions logs daily-restore-report --since=2024-01-01
```

### Check Cron Status

```sql
-- Check scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'daily-restore-report';

-- Check job run history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-restore-report')
ORDER BY start_time DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Issue: Function Deployment Failed

**Symptoms**: `supabase functions deploy` fails

**Solutions**:
1. Verify Supabase CLI is up to date: `supabase --version`
2. Check you're logged in: `supabase status`
3. Verify project link: `supabase link --project-ref your-ref`
4. Check function syntax: Review `index.ts` for errors

### Issue: Email Not Sent

**Symptoms**: Function succeeds but no email received

**Solutions**:
1. Check email API logs in Vercel/Netlify dashboard
2. Verify SMTP credentials:
   ```bash
   curl -X POST https://your-app.vercel.app/api/send-restore-report \
     -H "Content-Type: application/json" \
     -d '{"toEmail": "test@example.com"}'
   ```
3. Check spam folder
4. Test SMTP settings with a simple script
5. Verify EMAIL_* environment variables are set

### Issue: Chart Not Displaying

**Symptoms**: Embed page shows blank or error

**Solutions**:
1. Open browser console for errors
2. Verify RPC functions exist and return data:
   ```bash
   curl -X POST \
     'https://vnbptmixvwropvanyhdb.supabase.co/rest/v1/rpc/get_restore_count_by_day_with_email' \
     -H "apikey: YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email_input": ""}'
   ```
3. Check Supabase URL and anon key in embed page
4. Test with sample data first

### Issue: Function Times Out

**Symptoms**: Function returns 500 or timeout error

**Solutions**:
1. Increase function timeout (if supported)
2. Optimize RPC queries
3. Add pagination for large datasets
4. Check Supabase service status

### Issue: Cron Not Executing

**Symptoms**: Scheduled job doesn't run

**Solutions**:
1. Verify cron schedule syntax
2. Check timezone (cron uses UTC)
3. Verify job is active:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'daily-restore-report';
   ```
4. Check job run history for errors
5. Test manual invocation first

## 🔐 Security Checklist

- [ ] SMTP credentials stored as environment variables
- [ ] Service role key not exposed in client code
- [ ] Email recipients validated and whitelisted
- [ ] HTTPS used for all API calls
- [ ] Rate limiting enabled on email endpoint
- [ ] Function access restricted (if needed)
- [ ] Sensitive data not logged

## 📊 Performance Optimization

### Optimize Data Queries

```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restore_logs_restored_at 
ON restore_logs(restored_at DESC);

CREATE INDEX IF NOT EXISTS idx_restore_logs_email 
ON restore_logs(email);
```

### Cache Results (Optional)

Consider caching daily statistics to reduce database load:

```typescript
// In Edge Function
const cacheKey = `restore-summary-${new Date().toISOString().split('T')[0]}`;
// Check cache first, then query if miss
```

## 📝 Next Steps

After successful deployment:

1. ✅ Monitor first few executions
2. ✅ Verify emails are delivered correctly
3. ✅ Adjust schedule if needed
4. ✅ Set up alerting for failures
5. ✅ Document any custom configurations
6. ✅ Train team on accessing reports

## 🆘 Support

If you encounter issues:

1. Check function logs: `supabase functions logs daily-restore-report`
2. Review this troubleshooting guide
3. Test individual components separately
4. Check Supabase status: https://status.supabase.com/
5. Consult Supabase documentation: https://supabase.com/docs

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Cron Expression Guide](https://crontab.guru/)
- [Puppeteer Documentation](https://pptr.dev/)

---

**Created**: 2025-10-11  
**Version**: 1.0  
**Maintainer**: Development Team
