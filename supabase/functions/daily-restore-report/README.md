# Daily Restore Report - Supabase Edge Function

Automated daily email report generation with restore metrics and visualizations.

## 📋 Overview

- **Function Name**: `daily-restore-report`
- **Purpose**: Generate and send daily restore metrics report via email
- **Schedule**: Runs daily via Supabase cron (default: 8 AM UTC)
- **Output**: HTML email with summary statistics and chart link
- **Version**: 2.0.0

## 🚀 Quick Start

Use the automated setup script for streamlined deployment:

```bash
# Run the automated setup script
npm run setup:daily-report

# Or manually:
node scripts/setup-daily-restore-report.js
```

The setup script will:
1. ✅ Check Supabase CLI installation
2. ✅ Validate function files
3. ✅ Verify environment variables
4. ✅ Deploy the edge function
5. ✅ Configure cron schedule
6. ✅ Test the deployment

## 🛠️ Manual Setup Instructions

## 🛠️ Manual Setup Instructions

If you prefer to set up manually or the automated script fails:

### 1. Configure Environment Variables

Set these variables in your Supabase project settings (Settings > Edge Functions > Secrets):

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App configuration
VITE_APP_URL=https://your-app-url.vercel.app  # Your deployed app URL
APP_URL=https://your-app-url.vercel.app        # Alternative

# Email configuration
ADMIN_EMAIL=admin@empresa.com  # Email to receive the reports
```

### 2. Deploy the Function

```bash
# Deploy the function
supabase functions deploy daily-restore-report

# Verify deployment
supabase functions list
```

### 3. Schedule Daily Execution

Schedule the function to run daily at 8:00 AM:

```bash
# Option 1: Using Supabase CLI (recommended)
supabase functions schedule daily-restore-report \
  --cron "0 8 * * *" \
  --endpoint-type=public

# Option 2: Using pg_cron (if you have database access)
SELECT cron.schedule(
  'daily-restore-report',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://your-project.supabase.co/functions/v1/daily-restore-report',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

### 4. Test the Function

Test manually before scheduling:

```bash
# Using curl
curl -X POST \
  https://your-project.supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# Using Supabase CLI
supabase functions invoke daily-restore-report
```

## 📊 How It Works

The edge function follows a streamlined process:

1. **Load Configuration**: Validates and loads environment variables
   - Supabase URL and service role key
   - App URL for chart links
   - Admin email for reports

2. **Fetch Data**: Queries Supabase RPC functions
   - `get_restore_count_by_day_with_email`: Daily restore counts (last 30 days)
   - `get_restore_summary`: Summary statistics (total, unique docs, average)

3. **Generate Report**: Creates professional HTML email with:
   - Executive summary with key metrics
   - Visual data presentation
   - Interactive chart link
   - Mobile-responsive design

4. **Send Email**: Calls the `/api/send-restore-report` endpoint
   - Uses nodemailer for SMTP delivery
   - Sends formatted HTML email
   - Includes error handling and logging

## 🔧 Implementation Details

### Architecture

```
┌─────────────────────┐
│  Supabase Cron Job  │
│   (Daily 8 AM UTC)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Edge Function                  │
│  daily-restore-report           │
│                                 │
│  1. Load Config                 │
│  2. Fetch Data from RPC         │
│  3. Generate HTML Email         │
│  4. Call Email API              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  API Route                      │
│  /api/send-restore-report       │
│                                 │
│  - Uses nodemailer              │
│  - Sends SMTP email             │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Admin Email Inbox              │
│  - Professional HTML email      │
│  - Summary statistics           │
│  - Interactive chart link       │
└─────────────────────────────────┘
```

### Email Service Options

The function supports multiple email delivery methods:

#### Option 1: Nodemailer API (Current Implementation) ✅

Best for: Teams with existing SMTP infrastructure

```typescript
// Uses the /api/send-restore-report endpoint
// Requires: EMAIL_HOST, EMAIL_USER, EMAIL_PASS env vars
await sendEmailViaAPI(appUrl, payload, htmlContent);
```

#### Option 2: SendGrid API (Recommended for Production)

Best for: High-volume, reliable email delivery

```typescript
import { MailService } from '@sendgrid/mail';
const sgMail = new MailService();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: ADMIN_EMAIL,
  from: 'noreply@yourdomain.com',
  subject: '📊 Daily Restore Report',
  html: emailHtml,
});
```

#### Option 3: Mailgun API

Best for: Developer-friendly API with good deliverability

```typescript
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

await mailgun.messages().send({
  from: 'noreply@yourdomain.com',
  to: ADMIN_EMAIL,
  subject: '📊 Daily Restore Report',
  html: emailHtml
});
```

## 📧 Email Configuration

To use the nodemailer-based API endpoint (`send-restore-report.ts`), configure these environment variables:

```bash
# SMTP Configuration
EMAIL_HOST=smtp.gmail.com        # SMTP server
EMAIL_PORT=587                    # SMTP port
EMAIL_USER=your@email.com        # SMTP username
EMAIL_PASS=your_password         # SMTP password/app password
EMAIL_FROM=relatorios@yourdomain.com  # From address
```

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password as EMAIL_PASS

## 🧪 Testing

### Test Data Fetch
```bash
# Test that RPC functions are working
curl -X POST \
  'https://your-project.supabase.co/rest/v1/rpc/get_restore_count_by_day_with_email' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email_input": ""}'
```

### Test Email Endpoint
```bash
curl -X POST \
  https://your-app-url.vercel.app/api/send-restore-report \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "toEmail": "test@example.com"
  }'
```

### Test Edge Function
```bash
supabase functions invoke daily-restore-report --no-verify-jwt
```

## 📅 Cron Schedule Examples

```bash
# Every day at 8:00 AM
0 8 * * *

# Every weekday at 9:00 AM
0 9 * * 1-5

# Every Monday at 7:00 AM
0 7 * * 1

# Twice a day (8 AM and 8 PM)
0 8,20 * * *
```

## 🔍 Monitoring

Check logs:
```bash
# View function logs
supabase functions logs daily-restore-report

# Follow logs in real-time
supabase functions logs daily-restore-report --follow
```

## 🐛 Troubleshooting

### Issue: Function times out
- Increase timeout in function configuration
- Optimize data fetching queries
- Use pagination for large datasets

### Issue: Email not sent
- Verify EMAIL_* environment variables
- Check SMTP credentials
- Test with a simple email first
- Check email service logs

### Issue: Chart not rendering
- Verify embed page is accessible: `/embed-restore-chart.html`
- Check Supabase RPC functions return data
- Test embed page in browser first

### Issue: No data in report
- Verify RPC functions exist in database:
  - `get_restore_count_by_day_with_email`
  - `get_restore_summary`
- Check that restore_logs table has data
- Test RPC functions manually

## 📚 Related Files

- `/supabase/functions/daily-restore-report/index.ts` - Edge function code
- `/pages/api/send-restore-report.ts` - Email sending API
- `/pages/api/generate-chart-image.ts` - Chart image generation API
- `/public/embed-restore-chart.html` - Embeddable chart page
- `/src/pages/admin/documents/restore-dashboard.tsx` - Full dashboard page

## 🔐 Security Considerations

- Never expose SMTP credentials in client code
- Use environment variables for all sensitive data
- Limit email recipients to authorized users
- Use HTTPS for all API calls
- Implement rate limiting on email endpoints
- Validate email addresses before sending

## 📈 Future Enhancements

- [ ] Add support for multiple recipients
- [ ] Include more detailed statistics
- [ ] Add email preferences/unsubscribe
- [ ] Support different chart types
- [ ] Add PDF attachment option
- [ ] Implement email templates
- [ ] Add success/failure notifications
- [ ] Track email delivery status
