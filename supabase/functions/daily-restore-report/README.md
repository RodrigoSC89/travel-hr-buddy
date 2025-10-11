# Daily Restore Report - Supabase Edge Function v2.0

This edge function automatically sends a daily email report with restore metrics using direct SendGrid integration.

## 📋 Overview

- **Function Name**: `daily-restore-report`
- **Version**: 2.0
- **Purpose**: Generate and send daily restore metrics report via email
- **Email Provider**: SendGrid (direct API integration)
- **Schedule**: Runs daily (configured via Supabase cron)
- **Output**: Professional HTML email with summary statistics and chart link
- **Logging**: Execution logs stored in `restore_report_logs` table
- **Error Alerts**: Automatic email notifications on failures

## ✨ What's New in v2.0

- ✅ **Direct SendGrid Integration** - No external API dependencies
- ✅ **Automatic Error Alerts** - Get notified immediately when something goes wrong
- ✅ **TypeScript Type Safety** - Full type definitions for better code quality
- ✅ **Performance Monitoring** - Track execution time for each run
- ✅ **Enhanced Error Handling** - Detailed error messages and diagnostics
- ✅ **Simplified Configuration** - Only 3 required environment variables (vs 7+)
- ✅ **Professional Email Design** - Responsive, modern email templates
- ✅ **Better Validation** - Comprehensive environment variable checks

## 📊 Execution Logging

All executions are automatically logged to the `restore_report_logs` table:

### Log Statuses
- **success**: Report sent successfully
- **error**: Non-critical error (e.g., email sending failure)
- **critical**: Critical error that prevented execution

### Log Fields
- `id`: Unique log identifier (UUID)
- `executed_at`: Timestamp of execution
- `status`: Execution status (success/error/critical)
- `message`: Human-readable message
- `error_details`: JSON with error details (if applicable)
- `triggered_by`: Trigger source (automated/manual)

### Query Logs
```sql
-- View recent executions
SELECT * FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 10;

-- Count by status
SELECT status, COUNT(*) 
FROM restore_report_logs 
GROUP BY status;

-- View errors only
SELECT * FROM restore_report_logs 
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC;
```

## 🛠️ Setup Instructions

### 1. Create SendGrid Account

1. Sign up for free at [SendGrid](https://sendgrid.com/) (100 emails/day free tier)
2. Verify your account via email
3. Complete sender authentication

### 2. Configure Sender Email

**Option A: Single Sender Verification (Quick - 5 minutes)**
1. Go to Settings > Sender Authentication > Single Sender Verification
2. Add your email address (e.g., `noreply@yourdomain.com`)
3. Verify the email address through the confirmation link
4. ✅ Ready to send!

**Option B: Domain Authentication (Recommended for production)**
1. Go to Settings > Sender Authentication > Domain Authentication
2. Add your domain and configure DNS records
3. Wait for DNS propagation (can take up to 48 hours)
4. ✅ All emails from your domain are authenticated

### 3. Get SendGrid API Key

1. Go to Settings > API Keys
2. Click "Create API Key"
3. Name it: `daily-restore-report`
4. Choose "Restricted Access"
5. Enable only: **Mail Send** > **Mail Send**
6. Copy the API key (starts with `SG.`)
7. ⚠️ Save it securely - you won't see it again!

### 4. Configure Environment Variables

Set these in your Supabase project (Settings > Edge Functions > Secrets):

```bash
# Required - SendGrid Configuration
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=noreply@yourdomain.com  # Must be verified in SendGrid
FROM_NAME=Travel HR Buddy

# Required - Recipients
ADMIN_EMAIL=admin@empresa.com
ERROR_ALERT_EMAIL=alerts@empresa.com  # Optional, defaults to ADMIN_EMAIL

# Required - Supabase (usually auto-configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - Application URL
VITE_APP_URL=https://your-app-url.vercel.app
APP_URL=https://your-app-url.vercel.app
```

**Environment Variable Details:**

- `SENDGRID_API_KEY`: Your SendGrid API key (starts with `SG.`)
- `FROM_EMAIL`: Sender email address (must be verified in SendGrid)
- `FROM_NAME`: Sender display name (default: "Travel HR Buddy")
- `ADMIN_EMAIL`: Email address to receive daily reports
- `ERROR_ALERT_EMAIL`: Email to receive error notifications (optional)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase
- `VITE_APP_URL` or `APP_URL`: Your app URL for chart links

### 5. Deploy the Function

```bash
# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy daily-restore-report

# Verify deployment
supabase functions list
```

### 6. Test the Function

Test manually before scheduling:

```bash
# Test using Supabase CLI (recommended)
supabase functions invoke daily-restore-report --no-verify-jwt

# Or using curl
curl -X POST \
  https://your-project.supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "message": "Daily restore report sent successfully",
  "summary": {
    "total": 150,
    "unique_docs": 45,
    "avg_per_day": 5.5
  },
  "dataPoints": 30,
  "emailSent": true,
  "executionTimeMs": 1234
}
```

### 7. Schedule Daily Execution

Schedule the function to run daily at 8:00 AM:

```bash
# Using Supabase CLI (recommended)
supabase functions schedule daily-restore-report \
  --cron "0 8 * * *"

# View scheduled functions
supabase functions list
```

**Common Cron Schedules:**
- `0 8 * * *` - Every day at 8:00 AM
- `0 9 * * 1-5` - Every weekday at 9:00 AM
- `0 8,20 * * *` - Twice daily (8 AM and 8 PM)
- `0 7 * * 1` - Every Monday at 7:00 AM

## 📊 How It Works

1. **Environment Validation**: Validates all required environment variables
   - SendGrid API key
   - Sender email (FROM_EMAIL)
   - Recipient email (ADMIN_EMAIL)
   - Supabase credentials

2. **Fetch Data**: Queries Supabase RPC functions to get restore metrics
   - `get_restore_count_by_day_with_email`: Daily restore counts
   - `get_restore_summary`: Summary statistics (total, unique docs, average)

3. **Generate Report**: Creates professional HTML email with:
   - Summary statistics in visually appealing cards
   - Daily breakdown data
   - Link to interactive chart
   - Responsive design for mobile devices

4. **Send Email**: Direct SendGrid API integration
   - Sends via SendGrid's `/v3/mail/send` API
   - No external dependencies or relay servers
   - Immediate delivery confirmation

5. **Error Handling**: Automatic error alerts
   - On failure, sends detailed error email to administrators
   - Includes error message, stack trace, and troubleshooting steps
   - Logs all errors to `restore_report_logs` table

6. **Logging**: Records execution in database
   - Success/error status
   - Execution time
   - Error details (if any)
   - Query via `restore_report_logs` table

## 🔧 Features

### TypeScript Type Safety
All data structures are fully typed:
- `RestoreDataPoint`: Daily restore data structure
- `RestoreSummary`: Summary statistics structure
- `SendGridEmailRequest`: SendGrid API request format
- `EmailParams`: Email sending parameters

### Automatic Error Alerts
When the function fails, administrators automatically receive an email with:
- Error message and stack trace
- Execution time and timestamp
- Troubleshooting recommendations
- Professional red-themed error template

### Performance Monitoring
Every execution tracks:
- Start time
- End time
- Total execution duration (milliseconds)
- Returned in API response

### Enhanced Email Design
Professional HTML email templates with:
- Responsive design (mobile-friendly)
- Modern gradient header
- Summary cards with clear metrics
- Interactive chart button
- Clean footer with version badge

### Comprehensive Error Handling
- Environment variable validation before execution
- Detailed error messages with context
- Graceful degradation (logging failures don't break main flow)
- Both console logging and database logging

## 🧪 Testing

### Test Environment Variables

Before testing, verify all environment variables are set:

```bash
# Check if variables are set in Supabase
supabase functions list

# Or test locally with .env file
echo "SENDGRID_API_KEY=SG.xxx" > .env.local
echo "FROM_EMAIL=noreply@yourdomain.com" >> .env.local
echo "ADMIN_EMAIL=admin@empresa.com" >> .env.local
```

### Manual Test

```bash
# Test the function
supabase functions invoke daily-restore-report --no-verify-jwt

# Expected output:
# {
#   "success": true,
#   "message": "Daily restore report sent successfully",
#   "summary": { "total": 150, "unique_docs": 45, "avg_per_day": 5.5 },
#   "dataPoints": 30,
#   "emailSent": true,
#   "executionTimeMs": 1234
# }
```

### Test Error Handling

To test the error alert system, temporarily set an invalid API key:

```bash
# Set invalid key
supabase secrets set SENDGRID_API_KEY=invalid_key

# Invoke function
supabase functions invoke daily-restore-report --no-verify-jwt

# You should receive an error alert email
# Then restore the correct key
supabase secrets set SENDGRID_API_KEY=SG.your-real-key
```

### Test Data Fetch

Test that RPC functions are working:

```bash
curl -X POST \
  'https://your-project.supabase.co/rest/v1/rpc/get_restore_count_by_day_with_email' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email_input": ""}'
```

## 🔍 Monitoring

### View Function Logs

```bash
# View recent logs
supabase functions logs daily-restore-report

# Follow logs in real-time
supabase functions logs daily-restore-report --follow

# View logs with more detail
supabase functions logs daily-restore-report --limit 100
```

### View Execution History

Query the `restore_report_logs` table to see execution history:

```sql
-- Recent executions with status
SELECT 
  executed_at,
  status,
  message,
  triggered_by
FROM restore_report_logs
ORDER BY executed_at DESC
LIMIT 20;

-- Success rate over last 30 days
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status IN ('error', 'critical')) as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as success_rate
FROM restore_report_logs
WHERE executed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;

-- View error details
SELECT 
  executed_at,
  message,
  error_details
FROM restore_report_logs
WHERE status IN ('error', 'critical')
ORDER BY executed_at DESC
LIMIT 10;

-- Average execution time (if tracked)
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as runs,
  AVG((error_details::jsonb->>'executionTimeMs')::int) as avg_time_ms
FROM restore_report_logs
WHERE status = 'success'
  AND error_details::jsonb ? 'executionTimeMs'
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

## 🐛 Troubleshooting

### Issue: "SENDGRID_API_KEY is not set"

**Cause**: Environment variable not configured

**Solution**:
```bash
# Set the variable in Supabase
supabase secrets set SENDGRID_API_KEY=SG.your-api-key-here

# Verify it's set
supabase secrets list
```

### Issue: "FROM_EMAIL is not set" or emails not sending

**Cause**: Sender email not configured or not verified in SendGrid

**Solution**:
1. Set FROM_EMAIL: `supabase secrets set FROM_EMAIL=noreply@yourdomain.com`
2. Verify the email in SendGrid (Settings > Sender Authentication)
3. Wait for verification email and click the link
4. Test again

### Issue: SendGrid API returns 401 Unauthorized

**Cause**: Invalid or expired API key

**Solution**:
1. Go to SendGrid > Settings > API Keys
2. Create a new API key with "Mail Send" permission
3. Update the environment variable:
   ```bash
   supabase secrets set SENDGRID_API_KEY=SG.new-api-key-here
   ```

### Issue: SendGrid API returns 403 Forbidden

**Cause**: Sender email not verified or domain not authenticated

**Solution**:
1. Verify single sender in SendGrid
2. OR set up domain authentication
3. Ensure FROM_EMAIL matches verified address

### Issue: Function times out

**Symptoms**: Function doesn't complete within time limit

**Solution**:
- Check Supabase RPC functions are responding quickly
- Verify network connectivity to SendGrid
- Check Supabase function logs for slow queries
- Consider optimizing RPC functions

### Issue: Email not received

**Symptoms**: Function succeeds but email not in inbox

**Solution**:
1. Check spam/junk folder
2. Verify ADMIN_EMAIL is correct
3. Check SendGrid Activity Feed for delivery status
4. Ensure SendGrid account is not suspended
5. Check email provider's filter rules

### Issue: No data in report

**Symptoms**: Email received but shows 0 for all metrics

**Solution**:
1. Verify RPC functions exist:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name IN ('get_restore_count_by_day_with_email', 'get_restore_summary');
   ```
2. Check restore_logs table has data
3. Test RPC functions manually (see Testing section)
4. Verify RPC function permissions

### Issue: Error alerts not sending

**Symptoms**: Function fails but no error email received

**Solution**:
1. Set ERROR_ALERT_EMAIL: `supabase secrets set ERROR_ALERT_EMAIL=alerts@empresa.com`
2. Verify SendGrid API key is valid
3. Check function logs for "Failed to send error alert" messages
4. Ensure error alerts don't fail due to same issue as main function

### Issue: Function deployment fails

**Symptoms**: `supabase functions deploy` fails

**Solutions**:
1. Update Supabase CLI: `npm install -g supabase`
2. Verify you're logged in: `supabase status`
3. Check project is linked: `supabase link --project-ref your-ref`
4. Verify index.ts has no syntax errors
5. Check internet connectivity

## 📚 Related Files

- `/supabase/functions/daily-restore-report/index.ts` - Edge function code (v2.0)
- `/public/embed-restore-chart.html` - Embeddable chart page (if exists)
- `/src/pages/admin/documents/restore-dashboard.tsx` - Full dashboard page (if exists)

## 🔐 Security Considerations

- ✅ Never expose SendGrid API key in client code
- ✅ Use environment variables for all sensitive data
- ✅ Restrict SendGrid API key to "Mail Send" permission only
- ✅ Use HTTPS for all API calls (SendGrid enforces this)
- ✅ Limit email recipients to authorized users
- ✅ Validate email addresses before sending
- ✅ Implement rate limiting if calling from public endpoint
- ✅ Use Supabase service role key, not anon key
- ✅ Review SendGrid Activity Feed regularly for suspicious activity
- ✅ Rotate API keys periodically (every 90 days recommended)

## 📈 Migration from v1.0

If you're migrating from the old version that used external API endpoints:

### What Changed
- ❌ Removed: External API dependency (`sendEmailViaAPI`)
- ❌ Removed: Need for Node.js email endpoint
- ❌ Removed: SMTP configuration (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS)
- ✅ Added: Direct SendGrid integration
- ✅ Added: TypeScript type definitions
- ✅ Added: Automatic error alerting
- ✅ Added: Performance monitoring

### Migration Steps

1. **Get SendGrid API key** (see Setup Instructions)

2. **Update environment variables**:
   ```bash
   # Remove old variables (optional, they won't cause issues)
   supabase secrets unset EMAIL_HOST
   supabase secrets unset EMAIL_PORT
   supabase secrets unset EMAIL_USER
   supabase secrets unset EMAIL_PASS
   supabase secrets unset EMAIL_FROM

   # Add new variables
   supabase secrets set SENDGRID_API_KEY=SG.your-key
   supabase secrets set FROM_EMAIL=noreply@yourdomain.com
   supabase secrets set FROM_NAME="Travel HR Buddy"
   ```

3. **Deploy new version**:
   ```bash
   supabase functions deploy daily-restore-report
   ```

4. **Test**:
   ```bash
   supabase functions invoke daily-restore-report --no-verify-jwt
   ```

5. **Monitor**: Check logs and email delivery for the first few days

### Rollback Plan
If you need to rollback to v1.0:
```bash
git checkout <previous-commit-hash> supabase/functions/daily-restore-report/
supabase functions deploy daily-restore-report
```

## 📊 Performance Metrics

- **Typical execution time**: 0.5-2 seconds
- **SendGrid API latency**: ~100-300ms
- **Data fetch time**: ~200-500ms (depends on data volume)
- **Email generation**: ~10-50ms
- **Total**: Usually < 3 seconds

## 🎯 Best Practices

1. **Test before scheduling**: Always test manually before setting up cron
2. **Monitor regularly**: Check logs weekly for the first month
3. **Review email content**: Test email appearance on different devices/clients
4. **Set up alerts**: Configure ERROR_ALERT_EMAIL for immediate notification
5. **Keep API keys secure**: Never commit keys to version control
6. **Verify sender email**: Always verify sender in SendGrid before deploying
7. **Use restricted keys**: Only grant "Mail Send" permission to API key
8. **Update documentation**: Keep README updated with any configuration changes

## 📞 Support

### SendGrid Support
- Documentation: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/
- Status: https://status.sendgrid.com/

### Supabase Support
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com/
- GitHub: https://github.com/supabase/supabase

## 📝 Changelog

### v2.0 (Current)
- ✨ Direct SendGrid integration
- ✨ Automatic error alerts
- ✨ TypeScript type safety
- ✨ Performance monitoring
- ✨ Enhanced error handling
- ✨ Professional email design
- ✨ Comprehensive validation
- 📝 Updated documentation

### v1.0 (Previous)
- ✅ Basic email sending via external API
- ✅ Supabase RPC integration
- ✅ HTML email generation
- ✅ Execution logging
