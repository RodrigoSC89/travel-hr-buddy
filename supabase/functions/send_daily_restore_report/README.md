# send_daily_restore_report - Edge Function

## Overview

Supabase Edge Function that automatically captures restore metrics charts and sends them as PDF attachments via email using Puppeteer and SendGrid.

## Purpose

- Captures screenshot of `/embed/restore-chart` route
- Generates A4 PDF from chart
- Sends professional email with PDF attachment
- Logs execution status to database
- Scheduled to run daily via pg_cron

## Dependencies

- **Puppeteer** (`puppeteer@16.2.0`) - Browser automation
- **Supabase JS** (`@supabase/supabase-js@2.57.4`) - Database client
- **SendGrid API** - Email delivery service

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SENDGRID_API_KEY` | Yes | SendGrid API key for email delivery |
| `ADMIN_EMAIL` | Yes | Email address to receive reports |
| `VITE_APP_URL` | Yes | Application URL for embed route |
| `EMAIL_FROM` | No | Sender email address (default: noreply@nautilusone.com) |
| `SUPABASE_URL` | Auto | Automatically provided by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | Automatically provided by Supabase |

## Configuration

### Set Environment Variables

```bash
supabase secrets set SENDGRID_API_KEY=your-key
supabase secrets set ADMIN_EMAIL=admin@company.com
supabase secrets set VITE_APP_URL=https://your-app.com
```

## Deployment

### Deploy Function

```bash
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

**Note**: `--no-verify-jwt` is required because this function is triggered by pg_cron.

### Schedule Execution

Run this SQL in Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'daily-restore-chart-report',
  '0 8 * * *',  -- Run at 8:00 AM UTC daily
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send_daily_restore_report',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
```

## Usage

### Manual Invocation

```bash
# Via Supabase CLI
supabase functions invoke send_daily_restore_report

# Via curl
curl -X POST \
  https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Daily restore chart report sent successfully as PDF",
  "recipient": "admin@company.com",
  "timestamp": "2025-10-12T08:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message details",
  "timestamp": "2025-10-12T08:00:00.000Z"
}
```

## How It Works

1. **Launch Browser**: Puppeteer starts headless Chrome
2. **Navigate**: Goes to `/embed/restore-chart` route
3. **Wait**: Waits for `window.chartReady` flag
4. **Capture**: Generates PDF from rendered page
5. **Email**: Sends PDF via SendGrid
6. **Log**: Records execution in `restore_report_logs` table
7. **Cleanup**: Closes browser

## Execution Flow

```
Function Triggered
      ↓
Launch Puppeteer
      ↓
Navigate to /embed/restore-chart
      ↓
Wait for chart ready (window.chartReady = true)
      ↓
Generate PDF (A4 format)
      ↓
Send via SendGrid with PDF attachment
      ↓
Log execution to restore_report_logs
      ↓
Return response
```

## Logging

All executions are logged to the `restore_report_logs` table:

```sql
SELECT * 
FROM restore_report_logs 
WHERE triggered_by = 'automated'
ORDER BY executed_at DESC;
```

**Log Fields:**
- `executed_at` - Timestamp
- `status` - success/error/critical
- `message` - Execution message
- `error_details` - Error JSON (if any)
- `triggered_by` - 'automated'

## Troubleshooting

### Function Logs

```bash
supabase functions logs send_daily_restore_report
```

### Common Issues

**Puppeteer Timeout:**
- Increase timeout in code
- Check if app is accessible
- Verify VITE_APP_URL

**SendGrid Error:**
- Verify API key is valid
- Check API key permissions
- Ensure "Mail Send" permission

**Chart Not Ready:**
- Verify embed route works in browser
- Check if window.chartReady is set
- Increase wait timeout

**No Email Received:**
- Check spam folder
- Verify ADMIN_EMAIL
- Check SendGrid delivery logs

## PDF Configuration

```typescript
{
  format: "A4",           // Paper size
  printBackground: true,  // Include colors
  margin: {
    top: "20px",
    right: "20px",
    bottom: "20px",
    left: "20px",
  }
}
```

## Puppeteer Configuration

```typescript
{
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
  viewport: { width: 1024, height: 768 }
}
```

## Email Template

- Professional HTML design
- Nautilus One branding
- Date stamp
- PDF attachment reference
- Footer with copyright

## Performance

- Typical execution: 10-20 seconds
- Memory usage: ~200-300MB
- PDF size: ~100-500KB

## Security

- Uses service role key (server-side only)
- Environment variables for secrets
- No sensitive data in public embed route
- CORS headers configured

## Testing

```bash
# Test function
supabase functions invoke send_daily_restore_report

# Test embed route
open https://your-app.com/embed/restore-chart

# Check logs
supabase functions logs send_daily_restore_report
```

## Version History

- **v1.0.0** (2025-10) - Initial implementation with Puppeteer
  - Replaced CSV export with chart PDF
  - Added Puppeteer browser automation
  - Implemented PDF generation
  - Updated email template

## Related Files

- Frontend: `src/pages/embed/RestoreChartEmbed.tsx`
- Route: `src/App.tsx`
- Documentation: `QUICKSTART_CHART_PDF_REPORT.md`
- Implementation Guide: `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md`

## Support

For detailed implementation guide and troubleshooting, see:
- `QUICKSTART_CHART_PDF_REPORT.md` - Quick setup guide
- `SEND_DAILY_RESTORE_REPORT_IMPLEMENTATION.md` - Complete documentation
