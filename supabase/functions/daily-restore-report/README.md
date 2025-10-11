# Daily Restore Report - Supabase Edge Function

This edge function automatically sends a daily email report with restore metrics and charts.

## 📋 Overview

- **Function Name**: `daily-restore-report`
- **Purpose**: Generate and send daily restore metrics report via email
- **Schedule**: Runs daily (configured via Supabase cron)
- **Output**: HTML email with chart visualization and summary statistics
- **Architecture**: Serverless edge function with API-based email delivery

## ✨ Features

- ✅ **Automated Scheduling** - Daily execution via cron job
- ✅ **Comprehensive Metrics** - Total restores, unique documents, daily averages
- ✅ **Beautiful Emails** - Responsive HTML templates with gradient styling
- ✅ **Type Safety** - Full TypeScript implementation with interfaces
- ✅ **Error Handling** - Robust error handling with detailed logging
- ✅ **Configuration Validation** - Validates all required environment variables
- ✅ **Performance Optimized** - Parallel data fetching for better speed
- ✅ **SMTP Verification** - Pre-validates email configuration before sending

## 🛠️ Setup Instructions

### 1. Configure Environment Variables

Set these variables in your Supabase project settings (Settings > Edge Functions > Secrets):

```bash
# Required - Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required - App Configuration
VITE_APP_URL=https://your-app-url.vercel.app  # Your deployed app URL
# OR
APP_URL=https://your-app-url.vercel.app        # Alternative

# Required - Email Configuration
ADMIN_EMAIL=admin@empresa.com  # Email to receive the reports

# Required - SMTP Configuration (on your app platform, e.g., Vercel)
EMAIL_HOST=smtp.gmail.com        # SMTP server
EMAIL_PORT=587                    # SMTP port (587 for TLS)
EMAIL_USER=your@email.com        # SMTP username
EMAIL_PASS=your_password         # SMTP password/app password
EMAIL_FROM=relatorios@yourdomain.com  # From address (optional)
```

**Important Notes:**
- All environment variables are validated at runtime
- The function will fail fast if any required variable is missing
- For Gmail, enable 2FA and use an App Password: https://myaccount.google.com/apppasswords

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

### Architecture Flow

```
┌─────────────────────┐
│   Cron Scheduler    │  Daily at 8:00 AM
└──────────┬──────────┘
           │ Triggers
           ▼
┌─────────────────────┐
│  Edge Function      │  daily-restore-report
│  (Deno Runtime)     │  
└──────────┬──────────┘
           │
           ├─► 1. Validate Configuration
           │
           ├─► 2. Fetch Data (Parallel)
           │    ├─ get_restore_count_by_day_with_email
           │    └─ get_restore_summary
           │
           ├─► 3. Generate HTML Email
           │    └─ Beautiful responsive template
           │
           └─► 4. Call Email API
                └─► /api/send-restore-report
                    ├─ Verify SMTP connection
                    ├─ Validate email format
                    └─ Send via nodemailer
```

### Step-by-Step Process

1. **Configuration Validation**
   - Validates all required environment variables
   - Fails fast if any configuration is missing
   - Logs configuration status (without sensitive data)

2. **Data Fetching**
   - Fetches restore metrics via Supabase RPC functions
   - Runs queries in parallel for better performance
   - Handles errors gracefully with fallback values

3. **Email Generation**
   - Creates responsive HTML email template
   - Includes summary statistics and daily breakdown
   - Adds interactive chart link

4. **Email Delivery**
   - Calls the `/api/send-restore-report` endpoint
   - Verifies SMTP connection before sending
   - Provides detailed error messages on failure

## 🔧 Implementation Details

### TypeScript Interfaces

The implementation uses strong typing for better code quality:

```typescript
interface RestoreData {
  day: string;
  count: number;
  email?: string;
}

interface SummaryData {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface EmailPayload {
  embedUrl: string;
  toEmail: string;
  summary: SummaryData;
  data: RestoreData[];
}

interface Config {
  supabaseUrl: string;
  supabaseKey: string;
  appUrl: string;
  adminEmail: string;
}
```

### Key Functions

#### `loadConfig(): Config`
Validates and loads all required environment variables. Throws descriptive errors if any configuration is missing.

#### `fetchRestoreData(supabase, emailInput): Promise<RestoreData[]>`
Fetches daily restore count data from Supabase RPC function.

#### `fetchSummaryData(supabase, emailInput): Promise<SummaryData>`
Fetches summary statistics. Returns default values if fetch fails.

#### `generateEmailHtml(summary, data, embedUrl): string`
Generates responsive HTML email with gradient styling and modern design.

#### `sendEmailViaAPI(appUrl, payload, htmlContent): Promise<void>`
Sends email via the API endpoint with comprehensive error handling.

### Email Sending Implementation

The `/pages/api/send-restore-report.ts` endpoint provides robust email delivery:

**Features:**
- ✅ Email format validation
- ✅ SMTP connection verification before sending
- ✅ Support for image attachments
- ✅ Fallback to default email template
- ✅ Comprehensive error messages
- ✅ Message ID tracking

**Error Handling:**
```typescript
// Validates email configuration
function validateEmailConfig(): EmailConfig

// Main handler with full error catching
export default async function handler(req, res)
```

### Screenshot Generation Options

The problem statement mentions using Puppeteer, but Supabase Edge Functions run on Deno, which has limited browser automation support. Here are the recommended approaches:

#### Option 1: External Screenshot Service (Recommended)
Use a screenshot API service:
- API Flash: https://apiflash.com/
- URL2PNG: https://www.url2png.com/
- ScreenshotAPI: https://screenshotapi.net/

```typescript
const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${API_KEY}&url=${embedUrl}&format=png`;
const imageRes = await fetch(screenshotUrl);
const imageBuffer = await imageRes.arrayBuffer();
```

#### Option 2: Separate Puppeteer Service
Deploy a separate Node.js service with Puppeteer:
- Host on Vercel, Railway, or similar
- Create an API endpoint that takes a URL and returns a screenshot
- Call this service from the Edge Function

```typescript
const response = await fetch(`https://your-screenshot-service.com/screenshot?url=${embedUrl}`);
const imageBuffer = await response.arrayBuffer();
```

#### Option 3: Node.js API Route (Current Implementation)
Use the `pages/api/generate-chart-image.ts` endpoint:
- Requires Puppeteer installed in your Node.js environment
- Only works if your app is deployed on a platform that supports Node.js APIs
- Uncomment the Puppeteer code in the API file and install dependencies

### Email Sending Options

#### Option 1: Use SendGrid API (Recommended for Edge Functions)
```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: ADMIN_EMAIL,
  from: 'noreply@yourdomain.com',
  subject: '📊 Relatório Diário - Gráfico de Restauração',
  html: emailHtml,
  attachments: [{
    content: base64Image,
    filename: 'restore-chart.png',
    type: 'image/png',
    disposition: 'attachment'
  }]
});
```

#### Option 2: Call Node.js API Endpoint (Current Implementation)
The `send-restore-report.ts` API endpoint uses nodemailer:
- Requires EMAIL_HOST, EMAIL_USER, EMAIL_PASS environment variables
- Works on platforms that support Node.js APIs

### Email Configuration

The email system uses nodemailer with SMTP transport.

**Required Environment Variables:**
```bash
EMAIL_HOST=smtp.gmail.com        # SMTP server hostname
EMAIL_PORT=587                    # SMTP port (587 for TLS, 465 for SSL)
EMAIL_USER=your@email.com        # SMTP username
EMAIL_PASS=your_password         # SMTP password or app password
EMAIL_FROM=relatorios@yourdomain.com  # Sender email (optional)
```

**Gmail Setup:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated 16-character password as `EMAIL_PASS`
4. Set `EMAIL_USER` to your Gmail address

**Other SMTP Providers:**
- **Office 365**: `smtp.office365.com`, port 587
- **Outlook**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **SendGrid**: `smtp.sendgrid.net`, port 587 (requires API key as password)
- **Mailgun**: `smtp.mailgun.org`, port 587

**Testing SMTP Connection:**
The API automatically verifies the SMTP connection before attempting to send emails. If verification fails, you'll see a detailed error message in the logs.

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

### Common Issues and Solutions

#### Issue: Function times out
**Symptoms:** Function execution exceeds time limit  
**Solutions:**
- Increase timeout in function configuration
- Check if Supabase RPC functions are optimized
- Verify network connectivity to external APIs
- Review logs for slow operations

#### Issue: Email not sent
**Symptoms:** Function succeeds but no email received  
**Solutions:**
- ✅ Verify all EMAIL_* environment variables are set
- ✅ Check SMTP credentials are correct
- ✅ Test SMTP connection manually
- ✅ Check spam/junk folders
- ✅ Verify sender email is authorized
- ✅ Review email service logs for bounce/reject
- ✅ Check email rate limits haven't been exceeded

**Debug Steps:**
```bash
# 1. Check environment variables
vercel env ls

# 2. Test email API directly
curl -X POST https://your-app.vercel.app/api/send-restore-report \
  -H "Content-Type: application/json" \
  -d '{"toEmail": "test@example.com", "summary": {"total": 10, "unique_docs": 5, "avg_per_day": 2}}'

# 3. Check function logs
supabase functions logs daily-restore-report --follow
```

#### Issue: "Missing required environment variable"
**Symptoms:** Function fails immediately with config error  
**Solutions:**
- Check all required variables are set in Supabase dashboard
- Verify variable names match exactly (case-sensitive)
- Redeploy function after setting variables
- Check variables are set in correct project/environment

#### Issue: Chart not rendering
**Symptoms:** Email sent but chart link broken  
**Solutions:**
- Verify embed page is accessible: `/embed-restore-chart.html`
- Check Supabase RPC functions return data
- Test embed page in browser first
- Verify CORS settings allow chart.js CDN
- Check browser console for JavaScript errors

#### Issue: No data in report
**Symptoms:** Email shows zero metrics  
**Solutions:**
- Verify RPC functions exist in database:
  - `get_restore_count_by_day_with_email`
  - `get_restore_summary`
- Check that `restore_logs` table has data
- Test RPC functions manually via Supabase dashboard
- Verify service role key has proper permissions

#### Issue: "SMTP connection failed"
**Symptoms:** Email validation fails before sending  
**Solutions:**
- Test SMTP credentials with email client
- Check firewall/network allows outbound SMTP
- Verify SMTP port is correct (587 for TLS)
- For Gmail, ensure App Password is used
- Check if 2FA is enabled (required for Gmail App Passwords)

## 📚 Related Files

### Core Files
- `/supabase/functions/daily-restore-report/index.ts` - Main edge function
- `/supabase/functions/daily-restore-report/README.md` - This documentation

### API Endpoints
- `/pages/api/send-restore-report.ts` - Email sending with nodemailer
- `/pages/api/generate-chart-image.ts` - Chart image generation (optional)

### Frontend Components
- `/public/embed-restore-chart.html` - Standalone embeddable chart page
- `/src/pages/admin/documents/restore-dashboard.tsx` - Full dashboard page

### Documentation
- `/DAILY_RESTORE_REPORT_DEPLOYMENT.md` - Detailed deployment guide
- `/DAILY_RESTORE_REPORT_QUICKREF.md` - Quick reference commands
- `/DAILY_RESTORE_REPORT_ARCHITECTURE.md` - System architecture
- `/DAILY_RESTORE_REPORT_VISUAL.md` - Visual diagrams

## 🔐 Security Considerations

### Environment Variables
- ✅ Never commit credentials to source control
- ✅ Use environment variables for all sensitive data
- ✅ Rotate SMTP passwords regularly
- ✅ Use app-specific passwords (not account passwords)

### Email Security
- ✅ Validate email addresses before sending
- ✅ Implement rate limiting on email endpoints
- ✅ Use HTTPS for all API calls
- ✅ Limit email recipients to authorized users
- ✅ Monitor for unusual sending patterns

### Access Control
- ✅ Use Supabase service role key (not anon key) in edge function
- ✅ Restrict edge function invocation to scheduled jobs
- ✅ Validate API requests
- ✅ Log all email sending attempts

### Data Protection
- ✅ Don't include sensitive data in emails
- ✅ Use secure SMTP connections (TLS/SSL)
- ✅ Implement proper error handling to avoid leaking info
- ✅ Follow GDPR/privacy regulations for email data

## 📈 Future Enhancements

### Planned Features
- [ ] Multiple recipients support with personalized reports
- [ ] Configurable report frequency (daily, weekly, monthly)
- [ ] PDF attachment generation option
- [ ] More detailed statistics and trend analysis
- [ ] Email preferences and unsubscribe functionality
- [ ] Different chart types (line, pie, area)
- [ ] Historical data comparison
- [ ] Alert thresholds for unusual activity
- [ ] Integration with Slack/Teams notifications
- [ ] Dashboard widget for quick metrics

### Integration Opportunities
- [ ] Integration with SendGrid for better deliverability
- [ ] Webhook support for custom integrations
- [ ] GraphQL API for flexible data queries
- [ ] Real-time notifications via WebSocket
- [ ] Export data to CSV/Excel
- [ ] Integration with analytics platforms

## 🎯 Best Practices

### Development
1. **Test Locally First**: Test edge function locally before deploying
2. **Use Staging Environment**: Deploy to staging before production
3. **Monitor Logs**: Regularly check function logs for errors
4. **Version Control**: Tag releases for easy rollback
5. **Document Changes**: Update README when modifying functionality

### Production
1. **Set Up Alerts**: Configure alerts for function failures
2. **Monitor Email Delivery**: Track bounce rates and delivery success
3. **Review Logs Weekly**: Check for patterns or recurring issues
4. **Test After Updates**: Always test after Supabase platform updates
5. **Backup Configuration**: Document all environment variables

### Email Best Practices
1. **Warm Up SMTP**: Start with low volume, gradually increase
2. **Monitor Spam Scores**: Use tools to check email deliverability
3. **Maintain Clean List**: Remove bounced/invalid emails
4. **Use Proper From Name**: Clear sender identification
5. **Include Unsubscribe**: Even for internal reports (best practice)

## 📞 Support

### Getting Help
1. **Check Documentation**: Start with this README and related docs
2. **Review Logs**: Check function logs for error details
3. **Test Components**: Test each piece individually
4. **Search Issues**: Check GitHub issues for similar problems
5. **Consult Supabase Docs**: https://supabase.com/docs

### Useful Resources
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Deno Documentation](https://deno.land/)
- [Cron Expression Generator](https://crontab.guru/)
- [SMTP Test Tool](https://www.smtpbucket.com/)

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-11  
**Status**: ✅ Production Ready  
**Maintainer**: Development Team
