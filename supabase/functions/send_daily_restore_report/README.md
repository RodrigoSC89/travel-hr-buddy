# Send Daily Restore Report - Edge Function

## Overview

This Supabase Edge Function automatically captures a screenshot of the restore chart from `/embed/restore-chart`, generates a PDF, and sends it via email using SendGrid.

## Features

- 📊 **Chart Screenshot Capture**: Uses Puppeteer to capture the restore metrics chart
- 📄 **PDF Generation**: Converts the chart screenshot into a PDF document
- 📧 **Email Delivery**: Sends the PDF via SendGrid to administrators
- 📝 **Logging**: Records execution status to `report_email_logs` table
- ⏰ **Scheduled Execution**: Can be configured to run daily via cron

## Prerequisites

### 1. Environment Variables

Configure the following environment variables in your Supabase project:

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SENDGRID_API_KEY=your-sendgrid-api-key
ADMIN_EMAIL=admin@empresa.com

# Optional (for chart URL)
VITE_APP_URL=https://your-project-url.com
# or
APP_URL=https://your-project-url.com
```

### 2. Database Table

Ensure the `report_email_logs` table exists in your Supabase database:

```sql
CREATE TABLE IF NOT EXISTS report_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Embed Chart Route

The function requires the `/embed/restore-chart` route to be accessible. This route is already configured in the application and renders a clean chart view suitable for screenshots.

## Deployment

### Deploy the Function

```bash
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

### Configure Cron Schedule

To run the function daily at 8 AM UTC:

```sql
SELECT cron.schedule(
  'daily-restore-report-with-chart',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send_daily_restore_report',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
```

## Manual Invocation

### Using Supabase CLI

```bash
supabase functions invoke send_daily_restore_report
```

### Using curl

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## How It Works

1. **Launch Browser**: Puppeteer launches a headless browser
2. **Navigate to Chart**: Opens the `/embed/restore-chart` page
3. **Wait for Data**: Waits for `window.chartReady` flag to be set
4. **Capture Screenshot**: Takes a PNG screenshot of the chart
5. **Generate PDF**: Converts the page to PDF format (A4)
6. **Send Email**: Sends the PDF via SendGrid to the configured admin email
7. **Log Result**: Records success or failure to `report_email_logs` table

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "✅ Enviado com gráfico no PDF",
  "recipient": "admin@empresa.com",
  "fileName": "restore_report_2025-10-12.pdf",
  "timestamp": "2025-10-12T08:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "❌ Erro ao gerar ou enviar gráfico PDF",
  "details": "Error message details here"
}
```

## Troubleshooting

### Issue: "SENDGRID_API_KEY environment variable is required"

**Solution**: Set the `SENDGRID_API_KEY` in your Supabase project settings.

### Issue: "Navigation timeout"

**Cause**: The embed chart page is taking too long to load.

**Solutions**:
1. Check that your application URL is correctly set
2. Verify the `/embed/restore-chart` route is accessible
3. Ensure the database RPC function `get_restore_count_by_day_with_email` exists

### Issue: "window.chartReady is not set"

**Cause**: The chart component is not setting the ready flag.

**Solution**: Verify the `RestoreChartEmbed` component is properly setting `window.chartReady = true` after data loads.

### Issue: Puppeteer fails in Deno

**Note**: Puppeteer support in Deno Edge Functions may have limitations. For production use, consider:
- Using a dedicated screenshot service (API Flash, ScreenshotAPI)
- Deploying a separate Node.js service with Puppeteer
- Using the existing `pages/api/generate-chart-image.ts` if you have a Node.js runtime

## Alternative Implementations

If Puppeteer doesn't work in your Edge Function environment, you can:

1. **Use Screenshot Service**: Replace Puppeteer with an external screenshot API
2. **Node.js API Route**: Use the existing `pages/api/generate-chart-image.ts` endpoint
3. **Separate Service**: Deploy a dedicated screenshot service on Vercel/Railway

See [EMBED_CHART_IMPLEMENTATION.md](../../../EMBED_CHART_IMPLEMENTATION.md) for more details.

## Monitoring

Check the `report_email_logs` table to monitor execution:

```sql
SELECT * FROM report_email_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

## Related Files

- **Embed Component**: `/src/pages/embed/RestoreChartEmbed.tsx`
- **App Routes**: `/src/App.tsx`
- **Static HTML Fallback**: `/public/embed-restore-chart.html`
- **Documentation**: `/EMBED_CHART_IMPLEMENTATION.md`

## Support

For issues or questions, refer to the main documentation or check the Supabase Edge Functions logs:

```bash
supabase functions logs send_daily_restore_report
```
