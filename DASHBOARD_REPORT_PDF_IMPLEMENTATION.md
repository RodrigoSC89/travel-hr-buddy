# 📊 Dashboard Report PDF Generation - Implementation Guide

## Overview

This implementation provides automated dashboard report generation with PDF export via email. The system captures a snapshot of the admin dashboard and sends it as a PDF attachment to admin users.

## Architecture

### Components

1. **Next.js API Route**: `/app/api/send-dashboard-report/route.ts`
   - Generates PDF using Puppeteer
   - Sends email via Resend
   - Can be triggered manually or via cron

2. **Cron Configuration**: `supabase/config/cron.yaml`
   - Schedules daily execution at 8:00 AM UTC
   - Configurable schedule using cron syntax

3. **Email Service**: Resend
   - Sends professional HTML emails
   - Supports PDF attachments
   - Reliable delivery with tracking

## Features

✅ **Automated PDF Generation**
- Uses Puppeteer to capture dashboard snapshot
- Generates high-quality A4 PDF with proper formatting
- Captures public dashboard view (`?public=1`)
- Includes all charts, metrics, and visualizations

✅ **Smart Email Delivery**
- Finds admin users automatically from database
- Professional HTML email template with gradient design
- PDF attachment with dated filename
- Link to online dashboard for interactive access

✅ **Flexible Scheduling**
- Configurable cron schedule
- Default: Daily at 8:00 AM UTC
- Easy to modify for different frequencies

✅ **Error Handling**
- Comprehensive error logging
- Graceful failure handling
- Detailed error messages for debugging

## Installation

### 1. Install Dependencies

```bash
npm install resend puppeteer
```

Or if using the provided package.json:

```bash
npm install
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Required for Resend email service
RESEND_API_KEY=re_your_resend_api_key

# Required for Supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co

# Required for PDF generation
BASE_URL=https://yourdomain.com

# Optional: Email sender address
EMAIL_FROM=dashboard@empresa.com
```

### 3. Get API Keys

#### Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Create an API key in the dashboard
4. Copy the key to your `.env` file

#### Supabase Service Role Key
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (secret)
4. Add to `.env` file

## Configuration

### Cron Schedule

Edit `supabase/config/cron.yaml` to customize the schedule:

```yaml
cron:
  - name: send-dashboard-report
    schedule: "0 8 * * *"  # Daily at 8:00 AM UTC
    endpoint: "/api/send-dashboard-report"
```

#### Common Schedules

| Description | Cron Expression |
|------------|----------------|
| Every day at 8:00 AM UTC | `0 8 * * *` |
| Every Monday at 8:00 AM | `0 8 * * 1` |
| First day of month | `0 8 1 * *` |
| Every 6 hours | `0 */6 * * *` |
| Twice daily (8 AM & 8 PM) | `0 8,20 * * *` |

### Dashboard URL

The system uses the public dashboard view to ensure consistent rendering:

```typescript
const dashboardUrl = `${process.env.BASE_URL}/admin/dashboard?public=1`
```

The `?public=1` parameter:
- Removes interactive controls
- Hides navigation elements
- Shows read-only view optimized for PDF

## Usage

### Manual Trigger

You can manually trigger the report generation:

```bash
# Using curl
curl -X GET http://localhost:3000/api/send-dashboard-report

# Using Postman
GET http://localhost:3000/api/send-dashboard-report
```

### Automated Trigger (Cron)

The cron job will automatically trigger based on the schedule in `cron.yaml`.

To set up cron with Supabase:

1. Deploy the endpoint
2. Configure the cron in Supabase Dashboard
3. Monitor logs in Edge Functions section

### Response Format

**Success Response:**
```json
{
  "success": true,
  "sent": true,
  "emailId": "abc123",
  "recipient": "admin@empresa.com",
  "message": "Dashboard report sent successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Stack trace..."
}
```

## Email Template

The system sends a professional HTML email with:

- **Gradient Header**: Purple gradient with date
- **Content Section**: Description of the report
- **PDF Attachment**: Dashboard snapshot
- **CTA Button**: Link to online dashboard
- **Footer**: System information

### Email Preview

```
Subject: 📊 Dashboard Mensal - Painel Automatizado - [Date]

Content:
- Professional gradient header
- Personalized greeting
- Report description
- PDF attachment: dashboard-YYYY-MM-DD.pdf
- "Ver Dashboard Online" button
- System footer
```

## PDF Generation Details

### Puppeteer Configuration

```typescript
{
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
}
```

These args ensure:
- Compatibility with Docker/serverless
- Reduced memory usage
- Better stability in production

### PDF Options

```typescript
{
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '20px',
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "Admin email not found"

**Cause**: No user with `role = 'admin'` exists in profiles table.

**Solution**:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

#### 2. Puppeteer fails to launch

**Cause**: Missing Chrome/Chromium dependencies.

**Solution** (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y \
  chromium-browser \
  libgbm-dev \
  libasound2
```

#### 3. PDF is blank or incomplete

**Cause**: Dashboard not fully loaded before PDF generation.

**Solution**: Increase wait time in route.ts:
```typescript
await page.waitForTimeout(5000) // Increase to 5 seconds
```

#### 4. Email fails to send

**Cause**: Invalid Resend API key or unverified domain.

**Solutions**:
- Verify API key is correct
- Check domain verification in Resend
- Use Resend test domain for development

#### 5. Timeout errors

**Cause**: Dashboard takes too long to load.

**Solution**: Increase timeout:
```typescript
await page.goto(dashboardUrl, {
  waitUntil: 'networkidle0',
  timeout: 120000, // Increase to 2 minutes
})
```

## Monitoring

### Logs

Check logs for debugging:

```bash
# For Next.js deployment
vercel logs

# For Supabase Edge Functions
# Check in Supabase Dashboard → Edge Functions → Logs
```

### Success Indicators

Look for these log messages:
```
📊 Starting dashboard report generation...
✅ Admin email found: admin@example.com
🖨️  Launching Puppeteer to generate PDF...
📍 Navigating to: https://yourdomain.com/admin/dashboard?public=1
📄 Generating PDF...
✅ PDF generated successfully
📧 Sending email via Resend...
✅ Email sent successfully
```

## Security Considerations

🔒 **Environment Variables**
- Never commit `.env` file
- Use service role key only in backend
- Rotate API keys regularly

🔒 **Dashboard Access**
- Public mode shows limited data
- No sensitive operations exposed
- Read-only view only

🔒 **Email Delivery**
- Only sends to admin users
- Validates email before sending
- Secure PDF attachment handling

## Production Deployment

### Vercel

1. **Add Environment Variables**:
   ```bash
   vercel env add RESEND_API_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add BASE_URL
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Note**: Puppeteer may require additional configuration on Vercel. Consider using:
   - Vercel serverless functions with Chrome
   - External PDF service (e.g., Browserless)
   - Pre-built Chrome binary

### Supabase Edge Functions

Alternative: Use the existing Supabase Edge Function without Puppeteer:

1. **Deploy Function**:
   ```bash
   supabase functions deploy send-dashboard-report
   ```

2. **Set Secrets**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_...
   supabase secrets set BASE_URL=https://...
   ```

3. **Configure Cron**:
   - Add cron in Supabase Dashboard
   - Or use `cron.yaml` if supported

**Note**: The Edge Function sends HTML emails without PDF. For PDF generation, use the Next.js route or external service.

## Alternative Approaches

### 1. External PDF Service

Use a third-party PDF generation service:

```typescript
// Example with PDFShift
const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from('api:' + PDFSHIFT_KEY).toString('base64')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source: dashboardUrl,
    landscape: false,
    use_print: true,
  }),
})
```

### 2. Scheduled Screenshots

Use a screenshot service:
- Urlbox.io
- Screenshot API
- Microlink

### 3. HTML to PDF Libraries

Use lightweight libraries:
- jsPDF (client-side)
- PDFKit (Node.js)
- Playwright (alternative to Puppeteer)

## Testing

### Local Testing

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Trigger manually**:
   ```bash
   curl http://localhost:3000/api/send-dashboard-report
   ```

3. **Check email**: Verify email received at admin address

### Test Checklist

- [ ] Environment variables configured
- [ ] Admin user exists in database
- [ ] Dashboard loads in public mode
- [ ] PDF generates correctly
- [ ] Email sends successfully
- [ ] PDF attachment opens properly
- [ ] Cron schedule configured
- [ ] Error handling works

## Related Documentation

- [Resend Documentation](https://resend.com/docs)
- [Puppeteer Documentation](https://pptr.dev/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Cron Expression Guide](https://crontab.guru/)

## Support

For issues or questions:
1. Check logs first
2. Review troubleshooting section
3. Verify environment variables
4. Test manually before enabling cron
5. Check related documentation

## Future Enhancements

Potential improvements:
- [ ] Multiple recipients support
- [ ] Custom date ranges
- [ ] Different dashboard views
- [ ] Report customization options
- [ ] Attachment size optimization
- [ ] Retry mechanism for failures
- [ ] Email templates customization
- [ ] Multi-language support
- [ ] Analytics tracking
- [ ] Webhook notifications

---

## Summary

This implementation provides a complete solution for automated dashboard reporting:

✅ **Next.js API Route** with Puppeteer for PDF generation  
✅ **Cron Configuration** for scheduled execution  
✅ **Professional Email** with Resend integration  
✅ **Error Handling** and logging  
✅ **Production Ready** with security best practices  

The system is ready to use once dependencies are installed and environment variables are configured.
