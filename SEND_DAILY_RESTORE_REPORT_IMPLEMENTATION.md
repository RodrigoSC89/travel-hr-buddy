# Chart PDF Email Report Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Details](#implementation-details)
4. [Deployment](#deployment)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Alternative Approaches](#alternative-approaches)

## Overview

This implementation provides an automated daily email report system that captures restore metrics charts and sends them as PDF attachments via email. It replaces the previous CSV-based report with a visual chart report.

### Key Features
- ✅ Public embed route for chart rendering (`/embed/restore-chart`)
- ✅ Puppeteer-based screenshot capture in Supabase Edge Function
- ✅ PDF generation from chart screenshot
- ✅ SendGrid email delivery with professional template
- ✅ Execution logging to database
- ✅ Scheduled daily execution via pg_cron

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Daily Execution Flow                      │
└─────────────────────────────────────────────────────────────┘

1. pg_cron (8:00 AM UTC)
   ↓
2. Triggers: send_daily_restore_report Edge Function
   ↓
3. Puppeteer launches headless browser
   ↓
4. Navigates to: /embed/restore-chart
   ↓
5. Chart loads data from Supabase RPC
   ↓
6. Puppeteer waits for window.chartReady flag
   ↓
7. Generates PDF from rendered page
   ↓
8. Sends email via SendGrid with PDF attachment
   ↓
9. Logs execution to restore_report_logs table
   ↓
10. Admin receives email with chart PDF
```

### Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (React)                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  /embed/restore-chart                                │    │
│  │  (RestoreChartEmbed.tsx)                            │    │
│  │                                                      │    │
│  │  - No authentication                                 │    │
│  │  - Fetches from get_restore_count_by_day_with_email│    │
│  │  - Renders Chart.js bar chart                       │    │
│  │  - Sets window.chartReady = true                    │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                           ↓ (navigates to)
┌──────────────────────────────────────────────────────────────┐
│              Supabase Edge Function (Deno)                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  send_daily_restore_report                          │    │
│  │                                                      │    │
│  │  1. Launch Puppeteer browser                        │    │
│  │  2. Navigate to /embed/restore-chart                │    │
│  │  3. Wait for chart ready                            │    │
│  │  4. Generate PDF                                    │    │
│  │  5. Send via SendGrid                               │    │
│  │  6. Log execution                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                           ↓ (sends to)
┌──────────────────────────────────────────────────────────────┐
│                    SendGrid Email Service                     │
│                                                               │
│  PDF Attachment: restore_report_YYYY-MM-DD.pdf               │
│  To: ADMIN_EMAIL                                              │
│  Subject: 📊 Relatório Diário - Métricas de Restauração     │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Embed Chart Component

**File**: `src/pages/embed/RestoreChartEmbed.tsx`

This React component renders the restore metrics chart without any navigation or authentication.

**Key Implementation Points:**
```tsx
// No SmartLayout wrapper - public route
export default function RestoreChartEmbed() {
  // Fetch data from Supabase RPC
  const { data, error } = await supabase
    .rpc("get_restore_count_by_day_with_email", {
      email_input: "", // Empty = all data
    });

  // Signal to Puppeteer that chart is ready
  setTimeout(() => {
    window.chartReady = true;
  }, 1000);

  // Render Chart.js bar chart
  return <Bar data={chartData} options={chartOptions} />;
}
```

**Route Configuration** (`App.tsx`):
```tsx
<Routes>
  {/* Public route - no authentication */}
  <Route path="/embed/restore-chart" element={<RestoreChartEmbed />} />
  
  {/* All other routes in SmartLayout */}
  <Route element={<SmartLayout />}>
    {/* ... authenticated routes ... */}
  </Route>
</Routes>
```

### 2. Edge Function with Puppeteer

**File**: `supabase/functions/send_daily_restore_report/index.ts`

**Dependencies:**
```typescript
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
```

**Puppeteer Configuration:**
```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",              // Required for Docker/serverless
    "--disable-setuid-sandbox",   // Security requirement
    "--disable-dev-shm-usage",    // Prevent memory issues
    "--disable-gpu",              // Not needed in headless
  ],
});

await page.setViewport({ width: 1024, height: 768 });
```

**Chart Capture Process:**
```typescript
// 1. Navigate to embed route
await page.goto(`${APP_URL}/embed/restore-chart`, {
  waitUntil: "networkidle0",  // Wait for network to be idle
  timeout: 30000,
});

// 2. Wait for chart ready flag
await page.waitForFunction("window.chartReady === true", { 
  timeout: 15000 
});

// 3. Extra time for animations
await page.waitForTimeout(2000);

// 4. Generate PDF
const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
});
```

**Email Sending:**
```typescript
// Convert PDF to base64
const base64PDF = btoa(String.fromCharCode(...pdfBuffer));

// Send via SendGrid
await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SENDGRID_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: ADMIN_EMAIL }] }],
    from: { email: "noreply@nautilusone.com", name: "Nautilus One Reports" },
    subject: "📊 Relatório Diário - Métricas de Restauração",
    content: [{ type: "text/html", value: emailHtml }],
    attachments: [{
      content: base64PDF,
      filename: `restore_report_${date}.pdf`,
      type: "application/pdf",
      disposition: "attachment",
    }],
  }),
});
```

### 3. Email Template

The email template includes:
- Professional header with gradient background
- Nautilus One branding
- Date stamp
- Report description
- PDF attachment reference
- Footer with copyright

**HTML Structure:**
```html
<div class="header">
  <h1>📊 Relatório Diário - Métricas de Restauração</h1>
  <p>Nautilus One - Travel HR Buddy</p>
  <p>Date</p>
</div>
<div class="content">
  <div class="summary-box">
    <h2>📈 Gráfico de Restaurações</h2>
    <p>O relatório em formato PDF está anexado...</p>
  </div>
</div>
<div class="footer">
  <p>Email automático gerado diariamente às 8:00 AM UTC</p>
</div>
```

## Deployment

### Step 1: Set Environment Variables

```bash
# Required variables
supabase secrets set SENDGRID_API_KEY=SG.your-key-here
supabase secrets set ADMIN_EMAIL=admin@yourcompany.com
supabase secrets set VITE_APP_URL=https://your-app.com

# Optional
supabase secrets set EMAIL_FROM=noreply@yourcompany.com
```

### Step 2: Deploy Edge Function

```bash
cd supabase/functions
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

**Note**: `--no-verify-jwt` is required because this function is triggered by pg_cron, not user requests.

### Step 3: Schedule with pg_cron

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'daily-restore-chart-report',
  '0 8 * * *',  -- 8:00 AM UTC daily
  $$
  SELECT
    net.http_post(
      url:='https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/send_daily_restore_report',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
```

### Step 4: Verify Deployment

```bash
# Check function logs
supabase functions logs send_daily_restore_report

# Test manually
supabase functions invoke send_daily_restore_report

# Check cron jobs
SELECT * FROM cron.job;
```

## Testing

### Manual Test via CLI

```bash
supabase functions invoke send_daily_restore_report
```

### Manual Test via HTTP

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Test Embed Route

Navigate to:
```
https://your-app.com/embed/restore-chart
```

You should see:
- ✅ Chart renders without navigation
- ✅ No authentication required
- ✅ Data loads from Supabase
- ✅ Chart appears with restore metrics

### Verify Email Delivery

1. Check email inbox for recipient
2. Verify PDF attachment is present
3. Open PDF - should show chart clearly
4. Check SendGrid dashboard for delivery status

### Check Execution Logs

```sql
SELECT * 
FROM restore_report_logs 
WHERE triggered_by = 'automated'
ORDER BY executed_at DESC
LIMIT 10;
```

## Troubleshooting

### Issue: Puppeteer Timeout

**Symptoms:**
```
Error: Navigation timeout of 30000 ms exceeded
```

**Solutions:**
1. Increase timeout in code
2. Check if embed route is accessible
3. Verify VITE_APP_URL is correct
4. Check if app is deployed and running

### Issue: Chart Not Ready

**Symptoms:**
```
Error: waiting for function failed: timeout 15000ms exceeded
```

**Solutions:**
1. Check if `window.chartReady` is set in component
2. Verify chart data loads successfully
3. Increase wait timeout
4. Check browser console for errors

### Issue: SendGrid Error

**Symptoms:**
```
SendGrid API error: 401 - Unauthorized
```

**Solutions:**
1. Verify SENDGRID_API_KEY is correct
2. Check API key permissions in SendGrid
3. Ensure key has "Mail Send" permission
4. Check if key is still active

### Issue: No Data in Chart

**Symptoms:**
- Chart renders but shows no bars
- "No data available" error

**Solutions:**
1. Check if `get_restore_count_by_day_with_email` RPC exists
2. Verify RPC returns data
3. Check database has restore logs
4. Test RPC in Supabase SQL Editor

### Issue: PDF is Blank

**Symptoms:**
- PDF generates but contains no content

**Solutions:**
1. Increase wait time before PDF generation
2. Check if chart renders properly in browser
3. Verify `printBackground: true` in PDF options
4. Test embed route in browser first

## Alternative Approaches

### Option 1: External Screenshot Service

If Puppeteer has issues in Edge Functions, use external services:

**API Flash:**
```typescript
const response = await fetch("https://api.apiflash.com/v1/urltoimage", {
  method: "GET",
  params: {
    access_key: API_FLASH_KEY,
    url: `${APP_URL}/embed/restore-chart`,
    format: "pdf",
  },
});
```

**ScreenshotAPI:**
```typescript
const response = await fetch(
  `https://shot.screenshotapi.net/screenshot?token=${TOKEN}&url=${chartUrl}&output=pdf`
);
```

### Option 2: Node.js API Route

Create a separate Node.js API route with Puppeteer:

```typescript
// pages/api/generate-chart-pdf.ts
import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${process.env.APP_URL}/embed/restore-chart`);
  const pdf = await page.pdf();
  await browser.close();
  
  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
}
```

Then call this from Edge Function:
```typescript
const pdfResponse = await fetch(`${APP_URL}/api/generate-chart-pdf`);
const pdfBuffer = await pdfResponse.arrayBuffer();
```

### Option 3: Separate Microservice

Deploy Puppeteer as a separate microservice on:
- **Vercel** (with Puppeteer support)
- **Railway** (Docker with Puppeteer)
- **AWS Lambda** (with Chromium layer)

Edge Function calls this service to generate PDF.

## Performance Considerations

### Memory Usage
- Puppeteer requires ~200-300MB RAM
- Edge Functions have memory limits
- Consider timeout settings appropriately

### Execution Time
- Typical execution: 10-20 seconds
- Chart load: 2-3 seconds
- PDF generation: 2-3 seconds
- Email sending: 1-2 seconds

### Cost Optimization
- Schedule during off-peak hours
- Cache chart data if needed
- Use external services for high-volume scenarios

## Security Best Practices

1. **Environment Variables**: Never commit sensitive keys
2. **JWT Verification**: Disabled for cron jobs only
3. **Public Route**: Embed route has no sensitive data
4. **CORS**: Restricted to necessary origins
5. **Rate Limiting**: Consider implementing if needed

## Future Enhancements

- [ ] Add multiple chart types (line, pie, etc.)
- [ ] Support multiple recipients
- [ ] Add date range filters to charts
- [ ] Include summary statistics in email
- [ ] Add chart customization options
- [ ] Support different PDF formats
- [ ] Add retry logic for failures
- [ ] Implement webhook notifications

## References

- [Puppeteer Deno Documentation](https://deno.land/x/puppeteer)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

## Support

For issues or questions:
1. Check function logs: `supabase functions logs send_daily_restore_report`
2. Review execution logs in `restore_report_logs` table
3. Test embed route in browser first
4. Verify all environment variables are set

---

**Implementation Status**: ✅ Complete
**Last Updated**: October 2025
**Version**: 1.0.0
