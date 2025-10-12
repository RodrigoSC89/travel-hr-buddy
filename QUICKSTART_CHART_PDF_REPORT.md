# Quick Start: Chart PDF Report Setup

Get the daily restore chart PDF report up and running in 5 minutes.

## Prerequisites

- Supabase project with Edge Functions enabled
- SendGrid account with API key
- Application deployed and accessible via HTTPS
- Supabase CLI installed

## 5-Minute Setup

### Step 1: Set Environment Variables (2 minutes)

```bash
# Get your SendGrid API key from https://app.sendgrid.com/settings/api_keys
supabase secrets set SENDGRID_API_KEY=SG.your_api_key_here

# Set admin email (where reports will be sent)
supabase secrets set ADMIN_EMAIL=admin@yourdomain.com

# Set your application URL
supabase secrets set VITE_APP_URL=https://your-app.vercel.app

# Generate and set a secure access token (use any secure random string)
supabase secrets set VITE_EMBED_ACCESS_TOKEN=$(openssl rand -hex 32)
```

**💡 Tip**: Save your `VITE_EMBED_ACCESS_TOKEN` value - you'll need it for local development too!

### Step 2: Deploy the Edge Function (1 minute)

```bash
# Navigate to your project directory
cd /path/to/your/project

# Deploy the function (no JWT verification needed for cron jobs)
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

Expected output:
```
✓ Deployed Function send_daily_restore_report
  Function URL: https://your-project.supabase.co/functions/v1/send_daily_restore_report
```

### Step 3: Schedule Daily Reports (1 minute)

Connect to your Supabase database and run:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily report at 8:00 AM UTC
SELECT cron.schedule(
  'daily-restore-chart-report',
  '0 8 * * *',  -- 8:00 AM UTC daily
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send_daily_restore_report',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**🔧 Replace**:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anon key (from dashboard)

### Step 4: Test the Setup (1 minute)

#### Option A: Manual Trigger (Recommended for first test)

```bash
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

#### Option B: Force Cron Execution

```sql
-- Manually trigger the cron job
SELECT cron.job_run_details 
FROM cron.schedule_job('daily-restore-chart-report');
```

**✅ Success Indicators**:
- You receive a 200 OK response
- An email arrives at your admin inbox with PDF attachment
- Check logs: `SELECT * FROM restore_report_logs ORDER BY executed_at DESC LIMIT 1;`

## Verification Checklist

- [ ] All environment variables are set
- [ ] Edge Function deployed successfully
- [ ] Cron job created and scheduled
- [ ] Test email received with PDF attachment
- [ ] PDF contains chart with restore metrics
- [ ] Execution logged in `restore_report_logs` table

## What You'll Receive

### Email Contents

- **Subject**: "📊 Relatório Diário de Restaurações - DD/MM/YYYY"
- **Body**: Professional HTML email with:
  - Nautilus One branding header
  - Report date and summary
  - Description of metrics included
  - Instructions on using the report
- **Attachment**: `restore_report_YYYY-MM-DD.pdf` (A4 format, ~40-60 KB)

### PDF Contents

The PDF includes:
- 📦 **Total Restores**: Count of all restore operations
- 📁 **Unique Documents**: Number of distinct documents restored
- 📊 **Average per Day**: Daily restore rate
- 🕒 **Last Execution**: Timestamp of most recent restore
- 📈 **Chart**: Bar chart showing daily restore trends

## Common Time Zones

Adjust cron schedule for your timezone:

```sql
-- 8 AM UTC (default)
'0 8 * * *'

-- 8 AM EST (13:00 UTC)
'0 13 * * *'

-- 8 AM PST (16:00 UTC)
'0 16 * * *'

-- 8 AM BRT (11:00 UTC)
'0 11 * * *'

-- 8 AM IST (2:30 UTC)
'30 2 * * *'
```

## Troubleshooting

### No Email Received?

1. **Check SendGrid API key**:
   ```bash
   # Verify secret is set
   supabase secrets list
   ```

2. **Check function logs**:
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for errors in execution

3. **Check execution logs**:
   ```sql
   SELECT * FROM restore_report_logs 
   WHERE status != 'success'
   ORDER BY executed_at DESC;
   ```

4. **Verify email address**:
   - Check for typos in ADMIN_EMAIL
   - Ensure email is verified in SendGrid (if required)

### PDF Generation Failed?

1. **Check app URL**:
   ```bash
   # Verify URL is accessible
   curl https://your-app.com/embed/restore-chart?token=your-token
   ```

2. **Verify embed token**:
   - Token must match between Edge Function and frontend
   - Check `.env` file has `VITE_EMBED_ACCESS_TOKEN`

3. **Chart not loading**:
   - Verify database has restore data
   - Check browser console at embed URL

### Cron Not Running?

1. **Verify cron job exists**:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'daily-restore-chart-report';
   ```

2. **Check cron execution history**:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (
     SELECT jobid FROM cron.job 
     WHERE jobname = 'daily-restore-chart-report'
   )
   ORDER BY start_time DESC;
   ```

3. **Ensure net extension enabled**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS http;
   ```

## Advanced Configuration

### Change Report Frequency

```sql
-- Every 12 hours
SELECT cron.schedule('daily-restore-chart-report', '0 */12 * * *', $$...$$);

-- Weekly (Monday at 8 AM)
SELECT cron.schedule('weekly-restore-chart-report', '0 8 * * 1', $$...$$);

-- Monthly (1st day at 8 AM)
SELECT cron.schedule('monthly-restore-chart-report', '0 8 1 * *', $$...$$);
```

### Multiple Recipients

Modify the Edge Function to accept multiple recipients:

```typescript
const ADMIN_EMAILS = [
  Deno.env.get("ADMIN_EMAIL"),
  Deno.env.get("ADMIN_EMAIL_2"),
  // Add more as needed
].filter(Boolean);

// Send to each recipient
for (const email of ADMIN_EMAILS) {
  await sendEmailViaSendGrid(email, subject, emailHtml, pdfBuffer, SENDGRID_API_KEY);
}
```

### Custom Email Sender

```bash
# Set custom sender email
supabase secrets set EMAIL_FROM=reports@yourdomain.com

# Verify sender in SendGrid
# Go to SendGrid Dashboard → Settings → Sender Authentication
```

## Next Steps

1. **Monitor for a few days**: Ensure reports arrive consistently
2. **Set up alerts**: Create alerts for failed executions
3. **Customize email template**: Edit `generateEmailHtml()` in Edge Function
4. **Add more metrics**: Extend chart data and queries
5. **Archive reports**: Set up automated backup of PDF files

## Production Checklist

Before going live:

- [ ] Test in production environment
- [ ] Verify all secrets are set in production
- [ ] Test with real data
- [ ] Confirm email deliverability
- [ ] Set up monitoring/alerts
- [ ] Document for team
- [ ] Schedule maintenance window for changes
- [ ] Have rollback plan ready

## Resources

- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Puppeteer Deno Documentation](https://deno.land/x/puppeteer)

## Getting Help

If you encounter issues:

1. Check the detailed implementation guide: `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md`
2. Review Edge Function README: `supabase/functions/send_daily_restore_report/README.md`
3. Check execution logs: `SELECT * FROM restore_report_logs`
4. Review Supabase Edge Function logs in dashboard
5. Test embed route manually in browser

---

**🎉 Congratulations!** Your daily restore report system is now configured!

The first automated report will be sent at the next scheduled time. You can always trigger it manually for testing.
