# Send Daily Restore Report Implementation Guide

Complete technical documentation for the Puppeteer-based chart PDF email reporting system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Details](#component-details)
4. [Implementation Steps](#implementation-steps)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Alternative Approaches](#alternative-approaches)

## Overview

This system automatically generates and emails daily PDF reports of document restoration metrics. It uses:

- **Puppeteer**: Headless browser for capturing chart screenshots
- **Chart.js**: Interactive charts rendered in React
- **SendGrid**: Email delivery service
- **Supabase Edge Functions**: Serverless function execution
- **pg_cron**: Scheduled task execution

### Key Features

- ✅ **Automated PDF Generation**: Puppeteer captures live chart visualization
- ✅ **Professional Email Template**: Responsive HTML with branding
- ✅ **Token-Protected Access**: Secure embed route
- ✅ **Execution Logging**: Complete audit trail
- ✅ **Error Handling**: Comprehensive error recovery
- ✅ **Scalable Architecture**: Can handle multiple charts/reports

## Architecture

### System Flow

```
┌─────────────────┐
│   pg_cron       │ Triggers at 8 AM UTC daily
│   (Scheduler)   │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────┐
│  Edge Function                      │
│  send_daily_restore_report          │
│  - Validates environment variables  │
│  - Launches Puppeteer browser       │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│  Puppeteer Browser                  │
│  - Navigates to embed route         │
│  - Waits for chart ready signal     │
│  - Captures screenshot              │
│  - Generates A4 PDF                 │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│  React Embed Component              │
│  /embed/restore-chart               │
│  - Fetches restore data from DB     │
│  - Renders Chart.js visualization   │
│  - Sets window.chartReady flag      │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│  SendGrid API                       │
│  - Sends HTML email                 │
│  - Attaches PDF file                │
│  - Delivers to admin inbox          │
└─────────────────────────────────────┘
```

### Data Flow

```
restore_count_by_day_with_email (RPC)
         │
         v
RestoreChartEmbed Component
         │
         v
Chart.js Visualization
         │
         v
Puppeteer Screenshot
         │
         v
PDF Buffer
         │
         v
Base64 Encoding
         │
         v
SendGrid Email
         │
         v
Admin Inbox
```

## Component Details

### 1. Edge Function (`supabase/functions/send_daily_restore_report/index.ts`)

**Purpose**: Orchestrates the entire report generation and delivery process.

**Key Functions**:

#### `generateChartPDF(appUrl: string, embedToken: string)`

Launches Puppeteer and generates PDF from chart:

```typescript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",              // Required for containerized environments
    "--disable-setuid-sandbox",  // Security sandbox disabled (safe in edge functions)
    "--disable-dev-shm-usage",   // Prevents memory issues
    "--disable-accelerated-2d-canvas", // Software rendering
    "--disable-gpu",             // No GPU acceleration needed
  ],
});
```

**Parameters**:
- `width: 800, height: 600` - Viewport size for consistent rendering
- `format: "A4"` - Standard paper size (210mm x 297mm)
- `printBackground: true` - Includes CSS background colors/images
- `margin: 20px` - Consistent margins on all sides

**Waits**:
1. `waitUntil: "networkidle0"` - All network requests completed
2. `window.chartReady === true` - Chart fully rendered

#### `generateEmailHtml(reportDate: string)`

Creates professional HTML email template with:
- Responsive design (mobile-friendly)
- Gradient header with branding
- Information boxes with metrics description
- Footer with copyright and auto-generation notice

#### `sendEmailViaSendGrid()`

Sends email with PDF attachment:
- Converts `Uint8Array` to base64
- Creates SendGrid API payload
- Handles errors and retries

#### `logExecution()`

Logs all executions to `restore_report_logs` table:
- Status: success, error, critical
- Message: Descriptive text
- Error details: JSON stringified error object

### 2. Embed Component (`src/pages/embed/RestoreChartEmbed.tsx`)

**Purpose**: Renders chart visualization for Puppeteer to capture.

**Key Features**:

#### Token Verification
```typescript
const token = searchParams.get("token");
const allowedToken = import.meta.env.VITE_EMBED_ACCESS_TOKEN;

if (token !== allowedToken) {
  navigate("/unauthorized");
}
```

#### Data Fetching
```typescript
// Chart data - last 30 days
const { data: chartResponse } = await supabase
  .rpc("get_restore_count_by_day_with_email", {
    email_input: email,
  });

// Summary statistics
const { data: summaryResponse } = await supabase
  .rpc("get_restore_summary", {
    email_input: email,
  });
```

#### Chart Configuration
```typescript
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 }, // Integer values only
    },
  },
};
```

#### Ready Signal
```typescript
// Signal to Puppeteer that chart is ready for capture
(window as Window & { chartReady?: boolean }).chartReady = true;
```

### 3. App Routes (`src/App.tsx`)

The embed route is configured **outside** SmartLayout to avoid authentication:

```typescript
<Routes>
  {/* Routes outside SmartLayout (no auth, no navigation) */}
  <Route path="/embed/restore-chart" element={<RestoreChartEmbed />} />
  <Route path="/unauthorized" element={<Unauthorized />} />
  
  {/* All other routes wrapped in SmartLayout */}
  <Route element={<SmartLayout />}>
    {/* Protected routes */}
  </Route>
</Routes>
```

## Implementation Steps

### Phase 1: Frontend Setup

#### 1.1 Create Embed Component

```bash
mkdir -p src/pages/embed
touch src/pages/embed/RestoreChartEmbed.tsx
```

Key requirements:
- No authentication (public access with token)
- No navigation/header/footer
- Clean design for PDF capture
- Sets `window.chartReady` flag

#### 1.2 Configure Route

Add to `App.tsx` before SmartLayout:

```typescript
const RestoreChartEmbed = React.lazy(() => import("./pages/embed/RestoreChartEmbed"));

// In Routes:
<Route path="/embed/restore-chart" element={<RestoreChartEmbed />} />
```

#### 1.3 Add Environment Variable

In `.env`:
```
VITE_EMBED_ACCESS_TOKEN=your-secure-random-token-here
```

### Phase 2: Edge Function Development

#### 2.1 Create Function Directory

```bash
mkdir -p supabase/functions/send_daily_restore_report
touch supabase/functions/send_daily_restore_report/index.ts
```

#### 2.2 Implement Core Functions

1. **generateChartPDF()**: Puppeteer logic
2. **generateEmailHtml()**: Email template
3. **sendEmailViaSendGrid()**: Email delivery
4. **logExecution()**: Audit logging

#### 2.3 Add Error Handling

```typescript
try {
  // Main logic
} catch (error) {
  console.error("❌ Error:", error);
  await logExecution(supabase, "critical", "Erro crítico", error);
  
  return new Response(
    JSON.stringify({ success: false, error: error.message }),
    { status: 500, headers: corsHeaders }
  );
}
```

### Phase 3: Database Setup

#### 3.1 Ensure Required Tables Exist

```sql
-- Should already exist from previous implementation
CREATE TABLE IF NOT EXISTS restore_report_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  executed_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL,
  message TEXT,
  error_details TEXT,
  triggered_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_restore_report_logs_executed_at 
ON restore_report_logs(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_restore_report_logs_status 
ON restore_report_logs(status);
```

#### 3.2 Verify RPC Functions

```sql
-- Should exist: get_restore_count_by_day_with_email
SELECT get_restore_count_by_day_with_email('');

-- Should exist: get_restore_summary
SELECT get_restore_summary('');
```

### Phase 4: Configuration

#### 4.1 Set Supabase Secrets

```bash
supabase secrets set SENDGRID_API_KEY=SG.your_key_here
supabase secrets set ADMIN_EMAIL=admin@yourdomain.com
supabase secrets set VITE_APP_URL=https://your-app.com
supabase secrets set VITE_EMBED_ACCESS_TOKEN=your-token-here
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
```

#### 4.2 Verify Secrets

```bash
supabase secrets list
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENDGRID_API_KEY` | Yes | - | SendGrid API key for email delivery |
| `ADMIN_EMAIL` | Yes | - | Email address to receive reports |
| `VITE_APP_URL` | Yes | - | Application URL (must be HTTPS) |
| `VITE_EMBED_ACCESS_TOKEN` | Yes | - | Secure token for embed route access |
| `EMAIL_FROM` | No | `noreply@nautilusone.com` | Sender email address |
| `SUPABASE_URL` | Auto | - | Set automatically by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | - | Set automatically by Supabase |

### SendGrid Setup

1. **Create SendGrid Account**: https://signup.sendgrid.com/
2. **Verify Sender Email**:
   - Go to Settings → Sender Authentication
   - Verify your domain or single sender
3. **Create API Key**:
   - Go to Settings → API Keys
   - Create key with "Mail Send" permission
   - Copy key immediately (shown only once)

### Cron Schedule Formats

```
# Format: minute hour day month weekday
# Examples:

'0 8 * * *'     # Daily at 8 AM UTC
'0 */6 * * *'   # Every 6 hours
'0 8 * * 1'     # Weekly on Monday at 8 AM
'0 8 1 * *'     # Monthly on 1st at 8 AM
'0 8 1 1 *'     # Yearly on Jan 1st at 8 AM
'*/30 * * * *'  # Every 30 minutes
```

## Testing

### Local Testing

#### 1. Test Embed Route

```bash
# Start dev server
npm run dev

# Visit in browser
http://localhost:5173/embed/restore-chart?token=your-token-here
```

Verify:
- [ ] Chart renders correctly
- [ ] Statistics display properly
- [ ] No navigation/header visible
- [ ] Console shows no errors
- [ ] `window.chartReady` set to true

#### 2. Test Edge Function Locally

```bash
# Serve function locally
supabase functions serve send_daily_restore_report --env-file supabase/.env.local

# Trigger in another terminal
curl -X POST http://localhost:54321/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Production Testing

#### 1. Deploy and Test

```bash
# Deploy function
supabase functions deploy send_daily_restore_report --no-verify-jwt

# Test deployed function
curl -X POST https://your-project.supabase.co/functions/v1/send_daily_restore_report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### 2. Check Logs

```sql
-- Check execution logs
SELECT * FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 10;

-- Check for errors
SELECT * FROM restore_report_logs 
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC;
```

#### 3. Verify Email

- Check inbox for test email
- Verify PDF attachment present
- Open PDF and verify content
- Check email formatting

### Integration Testing

Create a test script:

```bash
#!/bin/bash
# test-report-system.sh

echo "Testing Restore Report System..."

# 1. Test embed route accessibility
echo "1. Testing embed route..."
EMBED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://your-app.com/embed/restore-chart?token=$VITE_EMBED_ACCESS_TOKEN")

if [ "$EMBED_RESPONSE" = "200" ]; then
  echo "✅ Embed route accessible"
else
  echo "❌ Embed route failed: $EMBED_RESPONSE"
  exit 1
fi

# 2. Test Edge Function
echo "2. Testing Edge Function..."
FUNCTION_RESPONSE=$(curl -s -X POST \
  "https://your-project.supabase.co/functions/v1/send_daily_restore_report" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

if echo "$FUNCTION_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Edge Function executed successfully"
else
  echo "❌ Edge Function failed: $FUNCTION_RESPONSE"
  exit 1
fi

# 3. Check database logs
echo "3. Checking database logs..."
# (Requires psql connection)

echo "✅ All tests passed!"
```

## Deployment

### Deployment Checklist

- [ ] Frontend deployed with embed route
- [ ] Environment variables set in production
- [ ] SendGrid sender verified
- [ ] Edge Function deployed
- [ ] Cron job scheduled
- [ ] Test email received
- [ ] Logs verified
- [ ] Monitoring configured

### Deployment Steps

#### 1. Deploy Frontend

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# Custom
npm run build
# Upload dist/ to your hosting
```

#### 2. Deploy Edge Function

```bash
supabase functions deploy send_daily_restore_report --no-verify-jwt
```

#### 3. Configure Cron

```sql
SELECT cron.schedule(
  'daily-restore-chart-report',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send_daily_restore_report',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Rollback Procedure

If issues occur:

```bash
# 1. Unschedule cron job
psql "postgres://..." -c "SELECT cron.unschedule('daily-restore-chart-report');"

# 2. Revert Edge Function (if needed)
git revert <commit-hash>
supabase functions deploy send_daily_restore_report --no-verify-jwt

# 3. Check logs
SELECT * FROM restore_report_logs WHERE status = 'critical';
```

## Monitoring

### Metrics to Track

1. **Success Rate**: `SELECT COUNT(*) / (SELECT COUNT(*) FROM restore_report_logs) * 100 FROM restore_report_logs WHERE status = 'success';`
2. **Average Execution Time**: Track in Edge Function logs
3. **PDF Size**: Stored in log message
4. **Email Delivery**: SendGrid dashboard
5. **Error Rate**: `SELECT COUNT(*) FROM restore_report_logs WHERE status IN ('error', 'critical');`

### Alerting

Set up alerts for:

```sql
-- Create alert for failed reports (example using pg_cron)
SELECT cron.schedule(
  'alert-failed-reports',
  '0 */6 * * *',  -- Every 6 hours
  $$
  DO $$
  DECLARE
    failure_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO failure_count
    FROM restore_report_logs
    WHERE status IN ('error', 'critical')
    AND executed_at > NOW() - INTERVAL '6 hours';
    
    IF failure_count > 0 THEN
      -- Send alert (implement your alerting logic)
      RAISE NOTICE 'Alert: % failed reports in last 6 hours', failure_count;
    END IF;
  END $$;
  $$
);
```

### Dashboard Queries

```sql
-- Success rate (last 30 days)
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  ROUND(COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*) * 100, 2) as success_rate
FROM restore_report_logs
WHERE executed_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;

-- Error summary
SELECT 
  status,
  COUNT(*) as count,
  MAX(executed_at) as last_occurrence
FROM restore_report_logs
WHERE executed_at > NOW() - INTERVAL '7 days'
GROUP BY status;

-- Recent failures
SELECT 
  executed_at,
  message,
  error_details
FROM restore_report_logs
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC
LIMIT 20;
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Puppeteer Launch Fails

**Symptoms**: "Failed to launch browser" error

**Possible Causes**:
- Insufficient memory
- Missing dependencies
- Chrome/Chromium not available

**Solutions**:
```typescript
// Try alternative launch configuration
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--single-process', // Use less memory
    '--no-zygote',      // Reduce processes
  ],
});
```

#### 2. Chart Not Loading

**Symptoms**: Timeout waiting for `window.chartReady`

**Solutions**:
1. Check data exists:
   ```sql
   SELECT * FROM document_restore_logs LIMIT 10;
   ```

2. Verify RPC functions:
   ```sql
   SELECT get_restore_count_by_day_with_email('');
   ```

3. Test embed route manually
4. Check browser console for errors
5. Increase timeout:
   ```typescript
   await page.waitForFunction("window.chartReady === true", { 
     timeout: 30000  // Increase to 30 seconds
   });
   ```

#### 3. SendGrid Errors

**401 Unauthorized**:
- Verify API key is correct
- Check API key hasn't expired
- Ensure "Mail Send" permission enabled

**403 Forbidden**:
- Verify sender email
- Check SendGrid account status
- Review sending limits

**4xx Errors**:
- Check email format validity
- Verify recipient email
- Review attachment size (<30MB)

#### 4. PDF Quality Issues

**Blurry/Low Resolution**:
```typescript
// Increase viewport size
await page.setViewport({ 
  width: 1200,  // Larger width
  height: 900,  // Larger height
  deviceScaleFactor: 2  // Retina display
});
```

**Chart Cut Off**:
```typescript
// Adjust margins
const pdfBuffer = await page.pdf({
  format: "A4",
  margin: {
    top: "40px",    // More space
    right: "40px",
    bottom: "40px",
    left: "40px",
  },
});
```

#### 5. Memory Issues

**Symptoms**: Function timeout or OOM errors

**Solutions**:
1. Ensure browser closes:
   ```typescript
   try {
     // ... code
   } finally {
     await browser.close(); // Always close!
   }
   ```

2. Limit data points:
   ```sql
   -- Only get last 30 days instead of all data
   WHERE created_at > NOW() - INTERVAL '30 days'
   ```

3. Reduce viewport size

### Debug Mode

Enable detailed logging:

```typescript
// Add to Edge Function
const DEBUG = Deno.env.get("DEBUG") === "true";

if (DEBUG) {
  console.log("Environment variables:", {
    ADMIN_EMAIL: Deno.env.get("ADMIN_EMAIL"),
    APP_URL: Deno.env.get("VITE_APP_URL"),
    HAS_SENDGRID_KEY: !!Deno.env.get("SENDGRID_API_KEY"),
    HAS_EMBED_TOKEN: !!Deno.env.get("VITE_EMBED_ACCESS_TOKEN"),
  });
}
```

## Alternative Approaches

If Puppeteer doesn't work in your environment:

### Option 1: Screenshot Services

Use external services like:

**urlbox.io**:
```typescript
const response = await fetch(`https://api.urlbox.io/v1/${API_KEY}/pdf`, {
  method: 'POST',
  body: JSON.stringify({
    url: `${APP_URL}/embed/restore-chart?token=${EMBED_TOKEN}`,
    format: 'pdf',
    width: 800,
    height: 600,
  })
});
```

**Pros**: No browser management, better reliability
**Cons**: Additional cost, external dependency

### Option 2: Server-Side Rendering

Use Chart.js on server:

```typescript
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width: 800, 
  height: 600 
});

const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
```

**Pros**: No browser needed, faster
**Cons**: Different rendering than frontend

### Option 3: HTML-to-PDF Services

Use services like PDFShift or DocRaptor:

```typescript
const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(`api:${API_KEY}`)}`,
  },
  body: JSON.stringify({
    source: `${APP_URL}/embed/restore-chart?token=${EMBED_TOKEN}`,
  })
});
```

**Pros**: Reliable, good quality
**Cons**: Cost, external dependency

### Option 4: Pre-generated PDFs

Generate PDFs in client and upload:

1. User generates PDF in browser
2. Upload to storage
3. Email sends link to PDF

**Pros**: No server-side rendering
**Cons**: Manual process, not automated

## Performance Optimization

### 1. Reduce Bundle Size

```typescript
// Lazy load Chart.js in embed component
const Chart = React.lazy(() => import('react-chartjs-2'));
```

### 2. Cache Data

```typescript
// Cache chart data in Edge Function
const cacheKey = `restore_chart_${new Date().toISOString().split('T')[0]}`;
// Implement caching logic
```

### 3. Optimize Images

```typescript
// Use smaller viewport for faster rendering
await page.setViewport({ width: 600, height: 400 });
```

### 4. Parallel Processing

```typescript
// Generate PDF and fetch additional data in parallel
const [pdfBuffer, additionalData] = await Promise.all([
  generateChartPDF(APP_URL, EMBED_TOKEN),
  fetchAdditionalData()
]);
```

## Security Considerations

### 1. Token Security

- Use cryptographically secure random tokens
- Rotate tokens regularly
- Don't commit tokens to version control

### 2. Rate Limiting

```typescript
// Add rate limiting to prevent abuse
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastCall = rateLimit.get(ip) || 0;
  
  if (now - lastCall < 60000) { // 1 minute
    return false;
  }
  
  rateLimit.set(ip, now);
  return true;
}
```

### 3. Input Validation

```typescript
// Validate email parameter
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (email && !isValidEmail(email)) {
  throw new Error("Invalid email format");
}
```

### 4. CORS Configuration

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.VITE_APP_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## Best Practices

1. **Always close browser**: Use try/finally blocks
2. **Log everything**: Comprehensive logging helps debugging
3. **Handle errors gracefully**: Don't let one failure break the system
4. **Monitor proactively**: Set up alerts before issues occur
5. **Test thoroughly**: Test all edge cases and error scenarios
6. **Document changes**: Keep documentation up to date
7. **Version control**: Track changes to Edge Function
8. **Backup data**: Regular backups of logs and data

## Conclusion

This implementation provides a robust, scalable solution for automated PDF report generation and delivery. The combination of Puppeteer, Chart.js, and SendGrid creates a professional reporting system that can be extended to support multiple report types and schedules.

For questions or issues, refer to:
- Edge Function README
- Quick Start Guide
- Execution logs in database
- Supabase Edge Function logs

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-12  
**Status**: Production Ready
