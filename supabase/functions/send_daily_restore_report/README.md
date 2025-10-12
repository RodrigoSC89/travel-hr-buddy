# Send Daily Restore Report Edge Function

## Overview

This Supabase Edge Function generates and sends a daily PDF report of document restoration metrics via email. It uses Puppeteer to capture a chart screenshot from the `/embed/restore-chart` route and sends it as a PDF attachment via SendGrid.

## Features

- 🎯 **Puppeteer-based PDF Generation**: Headless browser captures chart visualization
- 📊 **Chart.js Integration**: Beautiful restore metrics visualization
- 📧 **SendGrid Email Delivery**: Professional HTML email with PDF attachment
- 🔒 **Token-Protected Access**: Secure embed route access
- 📝 **Execution Logging**: Tracks all report generations in `restore_report_logs` table
- ⏰ **Scheduled Execution**: Can be triggered by pg_cron for daily reports

## Architecture

```
pg_cron (8 AM UTC)
    ↓
Edge Function (Puppeteer)
    ↓
/embed/restore-chart (React + Chart.js)
    ↓
PDF Generation (A4 format)
    ↓
SendGrid Email with PDF Attachment
    ↓
Admin Inbox
```

## Required Environment Variables

Configure these secrets in your Supabase project:

```bash
# Required
SENDGRID_API_KEY=your-sendgrid-api-key
ADMIN_EMAIL=admin@yourdomain.com
VITE_APP_URL=https://your-app.com
VITE_EMBED_ACCESS_TOKEN=your-secure-token

# Optional
EMAIL_FROM=noreply@yourdomain.com  # Defaults to noreply@nautilusone.com
```

### Setting Environment Variables

```bash
# Set individual secrets
supabase secrets set SENDGRID_API_KEY=your-key
supabase secrets set ADMIN_EMAIL=admin@company.com
supabase secrets set VITE_APP_URL=https://your-app.com
supabase secrets set VITE_EMBED_ACCESS_TOKEN=your-token

# Or set multiple at once
supabase secrets set \
  SENDGRID_API_KEY=your-key \
  ADMIN_EMAIL=admin@company.com \
  VITE_APP_URL=https://your-app.com \
  VITE_EMBED_ACCESS_TOKEN=your-token
```

## Deployment

### 1. Deploy the Function

```bash
# Deploy without JWT verification (triggered by pg_cron)
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

### 2. Schedule Daily Execution

Use pg_cron to schedule the function:

```sql
-- Schedule daily at 8:00 AM UTC
SELECT cron.schedule(
  'daily-restore-chart-report',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send_daily_restore_report',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

### 3. Verify Schedule

```sql
-- List all cron jobs
SELECT * FROM cron.job;

-- Check recent job runs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

## Usage

### Manual Trigger

You can manually trigger the function for testing:

```bash
# Using curl
curl -X POST \
  https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Expected Response

Success:
```json
{
  "success": true,
  "message": "Daily restore report sent successfully",
  "recipient": "admin@company.com",
  "pdfSize": 45678,
  "emailSent": true
}
```

Error:
```json
{
  "success": false,
  "error": "SENDGRID_API_KEY environment variable is required"
}
```

## Monitoring

### Execution Logs

All function executions are logged to the `restore_report_logs` table:

```sql
-- Check recent reports
SELECT * FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 20;

-- Check failed reports
SELECT * FROM restore_report_logs 
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC;
```

### Log Levels

- **success**: Report generated and sent successfully
- **error**: Recoverable error (e.g., email failed)
- **critical**: Unrecoverable error (e.g., missing environment variables)

## Troubleshooting

### Common Issues

#### 1. Missing Environment Variables

**Error**: "ADMIN_EMAIL environment variable is required"

**Solution**: Set all required environment variables:
```bash
supabase secrets set ADMIN_EMAIL=your-email@domain.com
```

#### 2. Puppeteer Timeout

**Error**: "Navigation timeout of 30000 ms exceeded"

**Possible causes**:
- App URL is incorrect or inaccessible
- Chart is not loading properly
- Network issues

**Solution**: 
- Verify VITE_APP_URL is correct
- Check if embed route is accessible
- Increase timeout in code if needed

#### 3. Chart Not Ready

**Error**: "Waiting for window.chartReady timed out"

**Solution**: Ensure RestoreChartEmbed component sets `window.chartReady = true` after data loads

#### 4. SendGrid API Error

**Error**: "SendGrid API error: 401 - Unauthorized"

**Solution**: Verify SendGrid API key is valid and has email sending permissions

#### 5. PDF Size Too Large

**Solution**: The function handles this gracefully, but you can reduce chart size by:
- Limiting data points in the query
- Adjusting viewport size in Puppeteer configuration

## Email Template

The email includes:

- **Header**: Gradient banner with Nautilus One branding
- **Summary**: Report date and description
- **Content**: Information about metrics included
- **Attachment**: PDF file named `restore_report_YYYY-MM-DD.pdf`
- **Footer**: Copyright and auto-generation notice

## PDF Specifications

- **Format**: A4 (210mm x 297mm)
- **Margins**: 20px on all sides
- **Background**: Printed (includes chart colors)
- **Orientation**: Portrait

## Performance

- **Average execution time**: 8-12 seconds
- **PDF size**: ~40-60 KB (varies with data)
- **Memory usage**: ~150-200 MB (Puppeteer browser)

## Security

### Token Protection

The embed route requires a valid token:
```javascript
const token = searchParams.get("token");
const allowedToken = import.meta.env.VITE_EMBED_ACCESS_TOKEN;

if (token !== allowedToken) {
  navigate("/unauthorized");
}
```

### Best Practices

1. **Rotate tokens regularly**: Change VITE_EMBED_ACCESS_TOKEN periodically
2. **Restrict email recipients**: Only send to verified admin emails
3. **Monitor logs**: Regular check execution logs for suspicious activity
4. **Use HTTPS**: Always use HTTPS URLs for APP_URL

## Dependencies

- **Puppeteer**: v16.2.0 (Deno-compatible)
- **Supabase JS**: v2.57.4
- **Chart.js**: v4.5.0 (frontend dependency)
- **SendGrid API**: v3

## Related Files

- Frontend component: `src/pages/embed/RestoreChartEmbed.tsx`
- App routes: `src/App.tsx`
- Database functions: `get_restore_count_by_day_with_email`, `get_restore_summary`
- Database table: `restore_report_logs`

## Alternative Approaches

If Puppeteer has issues in your environment, consider:

1. **Screenshot Services**: Use services like urlbox.io or screenshotapi.net
2. **Server-Side Chart Rendering**: Use node-canvas or chartjs-node-canvas
3. **HTML to PDF Services**: Use services like PDFShift or DocRaptor

## Support

For issues or questions:
- Check execution logs: `SELECT * FROM restore_report_logs`
- Review Edge Function logs in Supabase Dashboard
- Verify all environment variables are set
- Test embed route manually: `https://your-app.com/embed/restore-chart?token=your-token`

## Version History

- **v2.0.0** (Current): Puppeteer-based PDF generation
- **v1.0.0** (Legacy): CSV-based email reports
