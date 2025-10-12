# 📊 Daily Assistant Report - Quick Reference

## Overview

The Daily Assistant Report is an automated edge function that sends a daily email with assistant interaction logs from the last 24 hours in CSV format.

## Features

- ✅ Fetches assistant logs from the last 24 hours
- ✅ Generates CSV file with columns: Date/Time, User, Question, Answer
- ✅ Sends email via Resend API (recommended) or SendGrid API (fallback)
- ✅ Scheduled to run daily at 8:00 AM UTC via cron
- ✅ Professional HTML email template with summary
- ✅ Automatic error handling and logging

## Quick Setup (3 Steps)

### Step 1: Configure Email Service

Choose **Resend** (recommended) or **SendGrid**:

#### Option A: Resend (Recommended)
```bash
# Get API key from: https://resend.com/api-keys
supabase secrets set RESEND_API_KEY=re_your_api_key
supabase secrets set EMAIL_FROM=relatorios@yourdomain.com
supabase secrets set ADMIN_EMAIL=admin@yourdomain.com
```

#### Option B: SendGrid
```bash
# Get API key from: https://app.sendgrid.com/settings/api_keys
supabase secrets set SENDGRID_API_KEY=SG.your_api_key
supabase secrets set EMAIL_FROM=relatorios@yourdomain.com
supabase secrets set ADMIN_EMAIL=admin@yourdomain.com
```

### Step 2: Run Automated Setup Script

```bash
npm run setup:daily-assistant-report
```

This script will:
- ✅ Validate Supabase CLI installation
- ✅ Check function files
- ✅ Deploy the edge function
- ✅ Configure cron schedule (8 AM UTC daily)
- ✅ Run a test invocation

### Step 3: Verify Setup

Check if function is deployed:
```bash
supabase functions list
```

Check if secrets are set:
```bash
supabase secrets list
```

View function logs:
```bash
supabase functions logs send-daily-assistant-report
```

## Manual Setup (Alternative)

If you prefer manual setup:

### 1. Deploy Function
```bash
supabase functions deploy send-daily-assistant-report --no-verify-jwt
```

### 2. Configure Cron (via Dashboard)
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → send-daily-assistant-report → Settings
3. Add cron schedule: `0 8 * * *` (8:00 AM UTC daily)

### 3. Test Invocation
```bash
supabase functions invoke send-daily-assistant-report --no-verify-jwt
```

## Environment Variables

### Required
- `ADMIN_EMAIL` - Recipient email for the daily report
- `EMAIL_FROM` - Sender email address
- `RESEND_API_KEY` or `SENDGRID_API_KEY` - Email service API key

### Auto-configured (by Supabase)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

## CSV Report Format

The generated CSV includes the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Data/Hora | Timestamp of interaction | 12/10/2025 18:30:15 |
| Usuário | User email | user@example.com |
| Pergunta | Question asked to assistant | Como faço para... |
| Resposta | Assistant's response | Para realizar isso, você deve... |

## Email Template

The email includes:
- Professional header with gradient background
- Summary box with total interactions count
- Date of report generation
- CSV file attachment with detailed logs
- Footer with automatic generation notice

## Cron Schedule

**Default:** Daily at 8:00 AM UTC (`0 8 * * *`)

To change the schedule, edit `supabase/config.toml`:

```toml
[[edge_runtime.cron]]
name = "daily-assistant-report"
function_name = "send-daily-assistant-report"
schedule = "0 8 * * *"  # Modify this line
description = "Send daily assistant report via email with CSV attachment"
```

Cron expression examples:
- `0 8 * * *` - Daily at 8:00 AM UTC
- `0 9 * * *` - Daily at 9:00 AM UTC
- `0 8 * * 1` - Every Monday at 8:00 AM UTC
- `0 */6 * * *` - Every 6 hours

## Troubleshooting

### Function not deploying
- Ensure Supabase CLI is installed and up to date
- Run `supabase login` to authenticate
- Run `supabase link --project-ref your-project-ref` to link your project

### Email not being sent
- Check if RESEND_API_KEY or SENDGRID_API_KEY is set
- Verify EMAIL_FROM domain is verified with your email provider
- Check function logs: `supabase functions logs send-daily-assistant-report`

### No logs in report
- Verify assistant_logs table has data from last 24 hours
- Check if the function has proper database permissions

### Cron not triggering
- Verify cron schedule in Supabase Dashboard
- Some Supabase plans may not support cron scheduling via CLI
- Manually configure in Dashboard: Edge Functions → send-daily-assistant-report → Settings

## Monitoring

### Check Function Logs
```bash
supabase functions logs send-daily-assistant-report
```

### Expected Success Output
```json
{
  "success": true,
  "message": "Daily assistant report sent successfully",
  "logsCount": 42,
  "recipient": "admin@example.com",
  "emailSent": true
}
```

### Expected Error Output
```json
{
  "success": false,
  "error": "RESEND_API_KEY or SENDGRID_API_KEY must be configured"
}
```

## Email Service Comparison

| Feature | Resend | SendGrid |
|---------|--------|----------|
| Free Tier | 3,000/month | 100/day |
| Setup Complexity | Simple | Moderate |
| API | Modern REST | Traditional REST |
| Deliverability | Excellent | Excellent |
| Recommended | ✅ Yes | Fallback |

## Security Considerations

- Edge function runs with service role key (full database access)
- No JWT verification required (function is scheduled by Supabase)
- Secrets stored securely in Supabase
- CSV attachments are not encrypted - use secure email channels

## Related Files

- Function: `supabase/functions/send-daily-assistant-report/index.ts`
- Config: `supabase/config.toml`
- Setup Script: `scripts/setup-daily-assistant-report.js`
- Package Script: `package.json` → `setup:daily-assistant-report`

## Support

- View logs: Supabase Dashboard → Functions → send-daily-assistant-report → Logs
- Issue tracker: GitHub Issues
- Documentation: This file

## Pro Tips

1. **Use Resend** for simpler setup and better free tier (3,000 emails/month)
2. **Verify your domain** with your email provider to avoid spam folder
3. **Check Edge Function logs** when debugging issues
4. **Set EMAIL_FROM** to a real domain you own for better deliverability
5. **Test manually** before relying on cron: `supabase functions invoke send-daily-assistant-report --no-verify-jwt`
6. **Monitor email quota** to avoid hitting limits
7. **Adjust cron schedule** based on your timezone needs (UTC is the default)

## Version History

- **v1.0** (October 2025) - Initial release with Resend/SendGrid support and cron scheduling
