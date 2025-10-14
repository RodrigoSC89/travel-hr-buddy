# 🚀 Quick Start Guide - Dashboard Report System

## Overview

This guide helps you quickly set up the automated dashboard report system with PDF generation.

## Prerequisites

- Node.js 22.x or higher
- npm or yarn
- Supabase account
- Resend account (for email)

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `resend` - Email delivery service
- `puppeteer` - PDF generation
- `express` - API server (for standalone mode)
- `dotenv` - Environment variables

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add these required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=re_your_resend_api_key

# Application
BASE_URL=http://localhost:5173  # For development
EMAIL_FROM=dashboard@empresa.com
```

### Get API Keys

**Resend API Key:**
1. Sign up at https://resend.com
2. Go to Dashboard → API Keys
3. Create new API key
4. Copy to `.env`

**Supabase Service Role Key:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy `service_role` key
4. Add to `.env`

## Step 3: Set Up Admin User

Ensure you have an admin user in your database:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

## Step 4: Choose Implementation Mode

### Option A: Standalone API Server (Recommended for Testing)

Run the standalone Express API:

```bash
npm run dashboard-report-api
```

This starts a server on port 3001. Test it:

```bash
curl http://localhost:3001/api/send-dashboard-report
```

**Pros:**
- ✅ Works immediately with Vite project
- ✅ Independent of main app
- ✅ Easy to test and debug
- ✅ Can be deployed separately

**Cons:**
- ⚠️ Requires separate process
- ⚠️ Not integrated with Vite dev server

### Option B: Supabase Edge Function (Production)

Use the existing Edge Function:

1. **Deploy to Supabase:**
```bash
supabase functions deploy send-dashboard-report
```

2. **Set environment secrets:**
```bash
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set BASE_URL=https://yourdomain.com
supabase secrets set EMAIL_FROM=dashboard@empresa.com
```

3. **Configure cron in Supabase Dashboard:**
   - Go to Edge Functions → Cron Jobs
   - Add new cron job
   - Function: `send-dashboard-report`
   - Schedule: `0 8 * * *` (daily at 8 AM UTC)

**Pros:**
- ✅ Integrated with Supabase
- ✅ Built-in cron scheduling
- ✅ No separate server needed
- ✅ Scales automatically

**Cons:**
- ⚠️ No Puppeteer (need external PDF service)
- ⚠️ Currently sends HTML emails only

## Step 5: Test the System

### Manual Test

**Standalone API:**
```bash
# Start the API server
npm run dashboard-report-api

# In another terminal, trigger the report
curl http://localhost:3001/api/send-dashboard-report
```

**Supabase Edge Function:**
```bash
# Test locally
supabase functions invoke send-dashboard-report

# Test deployed version
curl -X POST https://yourproject.supabase.co/functions/v1/send-dashboard-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Check Results

1. **Console Output:**
   - Should see log messages
   - PDF generation steps
   - Email sending confirmation

2. **Email:**
   - Check admin email inbox
   - Should receive email with PDF attachment
   - PDF should contain dashboard snapshot

3. **Response:**
```json
{
  "success": true,
  "sent": true,
  "emailId": "abc123",
  "recipient": "admin@email.com",
  "message": "Dashboard report sent successfully"
}
```

## Step 6: Enable Automated Scheduling

### Using Cron (Standalone API)

Add to your system crontab:

```bash
# Edit crontab
crontab -e

# Add line (run daily at 8 AM)
0 8 * * * curl http://localhost:3001/api/send-dashboard-report
```

### Using Supabase Cron

1. Go to Supabase Dashboard
2. Edge Functions → Cron Jobs
3. Create new job:
   - Name: `send-dashboard-report`
   - Schedule: `0 8 * * *`
   - Function: `send-dashboard-report`
   - Enabled: ✅

### Using PM2 (Production)

For the standalone API:

```bash
# Install PM2
npm install -g pm2

# Start API with PM2
pm2 start scripts/dashboard-report-api.js --name dashboard-report-api

# Save PM2 configuration
pm2 save

# Set up PM2 startup
pm2 startup
```

## Troubleshooting

### "Admin email not found"

**Solution:** Set admin role in database:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Puppeteer fails to launch

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser libgbm-dev libasound2
```

**macOS:**
```bash
brew install chromium
```

### Email not sending

**Check:**
1. Resend API key is valid
2. Email domain is verified in Resend
3. Check Resend dashboard for delivery logs

### PDF is blank

**Solution:** Increase wait time:
- Edit `scripts/dashboard-report-api.js`
- Change `await page.waitForTimeout(2000)` to `5000`

### Port 3001 already in use

**Solution:** Change port in `.env`:
```env
PORT=3002
```

## Production Deployment

### Vercel (for standalone API)

1. **Create `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "scripts/dashboard-report-api.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/send-dashboard-report",
      "dest": "scripts/dashboard-report-api.js"
    }
  ]
}
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set environment variables in Vercel Dashboard**

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Set build command: `npm install`
3. Set run command: `node scripts/dashboard-report-api.js`
4. Add environment variables
5. Deploy

## Configuration Options

### Email Frequency

Edit `supabase/config/cron.yaml`:

```yaml
# Daily at 8 AM
schedule: "0 8 * * *"

# Weekly on Monday
schedule: "0 8 * * 1"

# Monthly on 1st
schedule: "0 8 1 * *"

# Twice daily
schedule: "0 8,20 * * *"
```

### PDF Settings

Edit `scripts/dashboard-report-api.js`:

```javascript
// Change PDF format
format: 'A4',        // or 'Letter', 'Legal', 'A3'

// Adjust margins
margin: {
  top: '20px',
  right: '20px',
  bottom: '20px',
  left: '20px',
}

// Change orientation
landscape: true,     // for horizontal layout
```

### Email Template

Customize email in `scripts/dashboard-report-api.js`:

```javascript
function generateEmailHtml(dashboardUrl) {
  // Modify HTML template here
  // Change colors, text, layout, etc.
}
```

## Monitoring

### Check Logs

**Standalone API:**
```bash
# View logs
npm run dashboard-report-api

# Or with PM2
pm2 logs dashboard-report-api
```

**Supabase:**
- Dashboard → Edge Functions → Logs
- View function execution history
- Check for errors

### Success Indicators

Look for these log messages:
- `📊 Starting dashboard report generation...`
- `✅ Admin email found`
- `✅ PDF generated successfully`
- `✅ Email sent successfully`

## Next Steps

1. ✅ Test manual trigger
2. ✅ Verify email delivery
3. ✅ Check PDF quality
4. ✅ Enable automated scheduling
5. ✅ Monitor first few runs
6. ✅ Adjust timing if needed
7. ✅ Customize email template
8. ✅ Set up error alerts

## Common Use Cases

### Development
```bash
# Start Vite dev server
npm run dev

# Start API server (separate terminal)
npm run dashboard-report-api

# Test manually
curl http://localhost:3001/api/send-dashboard-report
```

### Production
```bash
# Deploy Supabase Edge Function
supabase functions deploy send-dashboard-report

# Configure cron in Supabase Dashboard
# Done! Reports will be sent automatically
```

### Testing
```bash
# Manual trigger
curl http://localhost:3001/api/send-dashboard-report

# Check response
# Verify email received
# Open PDF attachment
```

## Support

Need help?

1. **Check logs first**
2. **Review troubleshooting section**
3. **Verify environment variables**
4. **Test manually before enabling cron**
5. **Check documentation:**
   - `DASHBOARD_REPORT_PDF_IMPLEMENTATION.md` - Full documentation
   - `IMPLEMENTATION_NOTE.md` - Architecture notes
   - `.env.example` - Configuration reference

## Summary

✅ **3 Implementation Options:**
1. Standalone Express API (fastest setup)
2. Supabase Edge Function (production ready)
3. Next.js API Route (reference implementation)

✅ **Key Features:**
- Automated PDF generation
- Professional email delivery
- Flexible scheduling
- Easy configuration

✅ **Ready to Use:**
- Install dependencies
- Configure environment
- Test manually
- Enable automation

**Estimated Setup Time:** 10-15 minutes

---

**You're all set!** The dashboard report system is ready to generate automated reports with PDF attachments.
