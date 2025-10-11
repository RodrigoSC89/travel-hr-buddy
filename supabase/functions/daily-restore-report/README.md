# Daily Restore Report - Supabase Edge Function

This edge function automatically sends a daily email report with restore metrics using **SendGrid** with automatic error alerting.

## 📋 Overview

- **Function Name**: `daily-restore-report`
- **Purpose**: Generate and send daily restore metrics report via email using SendGrid
- **Schedule**: Runs daily (configured via Supabase cron)
- **Output**: Professional HTML email with summary statistics and chart link
- **Error Handling**: Automatic error alerts sent via SendGrid when failures occur

## ✨ Key Features

- ✅ Direct SendGrid integration (no external API dependencies)
- ✅ Automatic error alerting with detailed diagnostics
- ✅ Professional HTML email templates
- ✅ Comprehensive error handling and logging
- ✅ TypeScript type safety
- ✅ Performance monitoring (execution time tracking)

## 🛠️ Setup Instructions

### 1. Configure Environment Variables

Set these variables in your Supabase project settings (Settings > Edge Functions > Secrets):

```bash
# Required - Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required - SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here

# Required - Email Configuration
ADMIN_EMAIL=admin@empresa.com           # Email to receive the reports
FROM_EMAIL=noreply@yourdomain.com       # Sender email (must be verified in SendGrid)
FROM_NAME=Travel HR Buddy               # Sender name

# Optional - App Configuration
VITE_APP_URL=https://your-app-url.vercel.app  # Your deployed app URL
APP_URL=https://your-app-url.vercel.app        # Alternative

# Optional - Error Alerting
ERROR_ALERT_EMAIL=alerts@empresa.com    # Separate email for error alerts (defaults to ADMIN_EMAIL)
```

### 2. Get SendGrid API Key

1. Create a free account at [SendGrid](https://sendgrid.com/)
2. Navigate to Settings > API Keys
3. Click "Create API Key"
4. Give it a name (e.g., "Travel HR Buddy Daily Report")
5. Select "Full Access" or at minimum "Mail Send" permission
6. Copy the API key (you won't see it again!)
7. Add it to your Supabase Edge Function secrets as `SENDGRID_API_KEY`

### 3. Verify Sender Email

SendGrid requires sender verification:

1. Go to Settings > Sender Authentication
2. Choose "Single Sender Verification" (easiest for getting started)
3. Add your `FROM_EMAIL` address
4. Verify it through the email SendGrid sends you

For production, consider using Domain Authentication for better deliverability.

### 4. Deploy the Function

```bash
# Deploy the function
supabase functions deploy daily-restore-report

# Verify deployment
supabase functions list
```

### 5. Schedule Daily Execution

Schedule the function to run daily at 8:00 AM:

```bash
# Using Supabase CLI (recommended)
supabase functions schedule daily-restore-report \
  --cron "0 8 * * *" \
  --endpoint-type=public

# Alternative: Using pg_cron (if you have database access)
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

### 6. Test the Function

Test manually before scheduling:

```bash
# Using Supabase CLI
supabase functions invoke daily-restore-report --no-verify-jwt

# Using curl
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
    "total": 42,
    "unique_docs": 15,
    "avg_per_day": 2.1
  },
  "dataPoints": 20,
  "emailSent": true,
  "executionTimeMs": 1234
}
```

## 📊 How It Works

1. **Fetch Data**: Queries Supabase RPC functions to get restore metrics
   - `get_restore_count_by_day_with_email`: Daily restore counts
   - `get_restore_summary`: Summary statistics (total, unique docs, avg per day)

2. **Generate Report**: Creates professional HTML email with:
   - Summary statistics (total, unique docs, average per day)
   - Daily breakdown data
   - Link to interactive chart
   - Responsive design for mobile and desktop

3. **Send Email**: Uses SendGrid API directly
   - No external dependencies or API endpoints required
   - Reliable delivery through SendGrid's infrastructure
   - Professional sender reputation

4. **Error Handling**: Automatic error alerts
   - Sends detailed error email if function fails
   - Includes error message, stack trace, and execution time
   - Helps with quick debugging and monitoring

## 🔔 Error Alerting

The function automatically sends error alerts when failures occur. These alerts include:

- Error message and stack trace
- Execution timestamp
- Performance metrics (execution time)
- Recommended troubleshooting actions

Error alerts are sent to `ERROR_ALERT_EMAIL` (or `ADMIN_EMAIL` if not set).

### Example Error Alert Email

When an error occurs, you'll receive an email with:
- 🚨 Clear subject line indicating an error
- ❌ Detailed error information
- 📋 Stack trace for debugging
- 💡 Recommended actions to resolve the issue

## 📧 Email Templates

### Daily Report Email

The daily report email includes:
- Professional header with gradient background
- Executive summary with key metrics
- Daily data breakdown
- Call-to-action button to view full chart
- Responsive design for all devices

### Error Alert Email

Error alerts feature:
- Urgent red-themed design
- Detailed error diagnostics
- Stack trace in monospace font
- Troubleshooting recommendations

## 🔧 Advanced Configuration

### Custom Cron Schedules

```bash
# Every day at 8:00 AM
0 8 * * *

# Every weekday at 9:00 AM
0 9 * * 1-5

# Every Monday at 7:00 AM
0 7 * * 1

# Twice a day (8 AM and 8 PM)
0 8,20 * * *

# Every hour during business hours (9 AM - 5 PM, weekdays)
0 9-17 * * 1-5
```

### Multiple Recipients

To send to multiple recipients, modify the function to accept an array:

```typescript
// In environment variables
ADMIN_EMAILS=admin1@empresa.com,admin2@empresa.com,admin3@empresa.com

// In the code
const adminEmails = (Deno.env.get("ADMIN_EMAILS") || "").split(",").filter(e => e.trim());
```

### Custom Email Styling

Modify the `generateEmailHtml` function to customize:
- Colors and branding
- Layout and structure
- Additional data sections
- Footer content

### Integration with Other Services

The function can be extended to:
- Post to Slack/Teams channels
- Store reports in database
- Generate PDF attachments
- Create dashboard screenshots

## 🔍 Monitoring

### View Function Logs

```bash
# View recent logs
supabase functions logs daily-restore-report

# Follow logs in real-time
supabase functions logs daily-restore-report --follow

# View logs for specific time period
supabase functions logs daily-restore-report --since 1h
```

### Check Execution Status

Logs will show:
- ✅ Successful executions with timing
- ❌ Failures with detailed error messages
- 📊 Data fetch results
- 📧 Email sending confirmation

### SendGrid Monitoring

Monitor email delivery in SendGrid dashboard:
1. Go to [SendGrid Activity](https://app.sendgrid.com/email_activity)
2. Search for your emails
3. View delivery status, open rates, etc.
4. Check for bounces or spam reports

## 🐛 Troubleshooting

### Issue: Function times out

**Symptoms**: Function execution exceeds time limit

**Solutions**:
- Check database query performance
- Optimize RPC functions
- Reduce data fetch scope
- Increase function timeout in Supabase settings

### Issue: Email not sent / SendGrid error

**Symptoms**: Error alert received or logs show SendGrid API error

**Solutions**:
- Verify `SENDGRID_API_KEY` is correct and active
- Ensure `FROM_EMAIL` is verified in SendGrid
- Check SendGrid account status (not suspended)
- Verify API key has "Mail Send" permission
- Check SendGrid activity logs for rejection reasons

### Issue: No data in report

**Symptoms**: Email sent but shows zero metrics

**Solutions**:
- Verify RPC functions exist in database:
  - `get_restore_count_by_day_with_email`
  - `get_restore_summary`
- Check that `restore_logs` table has data
- Test RPC functions manually in Supabase SQL editor
- Review function logs for data fetch errors

### Issue: Error alerts not being sent

**Symptoms**: Function fails but no error alert received

**Solutions**:
- Verify `SENDGRID_API_KEY` is configured
- Check `ERROR_ALERT_EMAIL` or `ADMIN_EMAIL` is set
- Review function logs for alert sending errors
- Test SendGrid API key manually with curl

### Issue: Duplicate emails

**Symptoms**: Receiving multiple copies of the same report

**Solutions**:
- Check cron job is not duplicated
- Verify function is only scheduled once
- Review Supabase cron settings
- Check for manual invocations overlapping with scheduled runs

## 📚 Related Files

- `/supabase/functions/daily-restore-report/index.ts` - Edge function code
- `/supabase/functions/daily-restore-report/README.md` - This documentation
- `/public/embed-restore-chart.html` - Embeddable chart page (if available)
- `/src/pages/admin/documents/restore-dashboard.tsx` - Full dashboard page (if available)

## 🔐 Security Best Practices

- ✅ Never expose `SENDGRID_API_KEY` in client code
- ✅ Use environment variables for all sensitive data
- ✅ Limit email recipients to authorized users
- ✅ Use HTTPS for all API calls
- ✅ Implement rate limiting on function invocations
- ✅ Validate email addresses before sending
- ✅ Use SendGrid's domain authentication for production
- ✅ Monitor SendGrid activity for unusual patterns
- ✅ Rotate API keys periodically
- ✅ Use separate API keys for development and production

## 📈 Performance Tips

- **Caching**: Consider caching data for multiple recipients
- **Batch Processing**: If sending to many recipients, use SendGrid's batch API
- **Async Processing**: For large datasets, consider background processing
- **Monitoring**: Set up alerts for execution time anomalies
- **Optimization**: Regularly review and optimize database queries

## 🚀 Production Deployment Checklist

- [ ] SendGrid account created and API key generated
- [ ] Sender email verified in SendGrid
- [ ] All environment variables configured in Supabase
- [ ] Function tested manually with real data
- [ ] Error alerts tested and confirmed working
- [ ] Cron schedule configured correctly
- [ ] Email templates reviewed and approved
- [ ] Monitoring and logging set up
- [ ] Documentation shared with team
- [ ] Backup email recipients configured
- [ ] Domain authentication set up (recommended)
- [ ] Rate limits reviewed and appropriate

## 📞 Support and Resources

- **SendGrid Documentation**: https://docs.sendgrid.com/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Deno Documentation**: https://deno.land/manual
- **Cron Expression Generator**: https://crontab.guru/

## 🎉 Success Criteria

Your setup is complete when:
- ✅ Manual function invocation succeeds
- ✅ Test email received successfully
- ✅ Error alert triggered and received when testing failure
- ✅ Scheduled execution running daily
- ✅ Logs showing successful executions
- ✅ Data in report matches database
- ✅ Email formatting looks professional
- ✅ Links in email work correctly

---

**Version**: 2.0 with SendGrid Integration  
**Last Updated**: 2025-10-11  
**Author**: Copilot  
**Status**: ✅ Production Ready
