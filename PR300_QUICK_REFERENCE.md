# 🚀 Quick Reference: Daily Restore Report v2.0

## 📋 One-Page Deployment Guide

### Prerequisites
- Supabase CLI installed
- SendGrid account (free tier: 100 emails/day)
- 15-20 minutes

---

## 🔑 Step 1: Get SendGrid API Key (5 min)

1. Sign up: https://sendgrid.com/
2. Navigate: **Settings** → **API Keys** → **Create API Key**
3. Name: `daily-restore-report`
4. Permission: **Full Access** or **Mail Send**
5. Copy API key (shown only once!)

---

## ✉️ Step 2: Verify Sender Email (5 min)

1. Navigate: **Settings** → **Sender Authentication**
2. Click: **Verify a Single Sender**
3. Fill in your details (use the email you'll send from)
4. Check inbox and verify
5. ⚠️ **Required:** Must verify before sending emails

---

## ⚙️ Step 3: Set Environment Variables (3 min)

```bash
# Required
supabase secrets set SENDGRID_API_KEY=SG.your_actual_api_key_here
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set FROM_NAME="Travel HR Buddy"
supabase secrets set ADMIN_EMAIL=admin@empresa.com

# Optional (defaults to ADMIN_EMAIL if not set)
supabase secrets set ERROR_ALERT_EMAIL=alerts@empresa.com

# Keep existing (should already be set)
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# VITE_APP_URL or APP_URL
```

---

## 🚀 Step 4: Deploy Function (2 min)

```bash
cd /path/to/your/project

# Deploy the function
supabase functions deploy daily-restore-report

# Verify deployment
supabase functions list
```

---

## 🧪 Step 5: Test Manually (2 min)

```bash
# Invoke the function
supabase functions invoke daily-restore-report --no-verify-jwt

# Check output for success
# Example response:
# {
#   "success": true,
#   "message": "Daily restore report sent successfully",
#   "summary": { "total": 42, "unique_docs": 15, "avg_per_day": 6 },
#   "dataPoints": 7,
#   "emailSent": true,
#   "executionTimeMs": 1234,
#   "version": "2.0"
# }

# Check your email inbox for the daily report
```

---

## 📅 Step 6: Schedule Daily Execution (1 min)

```bash
# Schedule for 8:00 AM UTC daily
supabase functions schedule daily-restore-report --cron "0 8 * * *"

# Verify schedule
supabase functions list
```

---

## 🔍 Step 7: Monitor (Ongoing)

### View Logs
```bash
# View recent logs
supabase functions logs daily-restore-report

# Follow logs in real-time
supabase functions logs daily-restore-report --follow
```

### Query Database
```sql
-- View recent executions
SELECT 
  executed_at,
  status,
  message
FROM restore_report_logs
ORDER BY executed_at DESC
LIMIT 10;

-- Success rate
SELECT 
  status,
  COUNT(*) as count
FROM restore_report_logs
GROUP BY status;
```

---

## 🆘 Troubleshooting

### Email Not Sent?
```bash
# Check if API key is set
supabase secrets list | grep SENDGRID

# Check if FROM_EMAIL is verified in SendGrid
# → Go to SendGrid dashboard → Sender Authentication

# View function logs for errors
supabase functions logs daily-restore-report
```

### Function Error?
```bash
# Check all required variables are set
supabase secrets list

# View detailed error logs
supabase functions logs daily-restore-report --filter error

# Check restore_report_logs table
SELECT * FROM restore_report_logs WHERE status = 'critical' ORDER BY executed_at DESC LIMIT 5;
```

### Error Alerts Not Received?
```bash
# Check ERROR_ALERT_EMAIL is set (or ADMIN_EMAIL as fallback)
supabase secrets list | grep EMAIL

# Check logs to see if alert was attempted
supabase functions logs daily-restore-report | grep "error alert"
```

---

## 📊 What You Get

### Daily Report Email
- 📈 Summary statistics (total, unique docs, avg per day)
- 📊 Daily breakdown of restore counts
- 🔗 Link to interactive chart
- 📧 Professional responsive design
- ✅ Sent daily at scheduled time

### Error Alert Email (on failures)
- ❌ Error message and stack trace
- ⏱️ Execution details and timing
- 🔧 Troubleshooting recommendations
- 📧 Professional red-themed alert
- ✅ Sent immediately on failure

### Performance Monitoring
- ⚡ Execution time tracking
- 📝 All runs logged to database
- 📊 Success rate tracking
- 🎯 Typical execution: <2 seconds

---

## 📚 Full Documentation

- **Complete Guide**: `supabase/functions/daily-restore-report/README.md`
- **Implementation Summary**: `PR300_IMPLEMENTATION_SUMMARY.md`
- **Environment Example**: `.env.example`

---

## 🔗 Useful Links

- **SendGrid Dashboard**: https://app.sendgrid.com/
- **SendGrid API Docs**: https://docs.sendgrid.com/api-reference/mail-send/mail-send
- **Supabase Functions**: https://supabase.com/docs/guides/functions
- **Supabase Secrets**: https://supabase.com/docs/guides/functions/secrets

---

## 🎯 Environment Variables Checklist

- [ ] `SENDGRID_API_KEY` - SendGrid API key
- [ ] `FROM_EMAIL` - Sender email (verified in SendGrid)
- [ ] `FROM_NAME` - Sender display name
- [ ] `ADMIN_EMAIL` - Report recipient email
- [ ] `ERROR_ALERT_EMAIL` - Error alert recipient (optional)
- [ ] `SUPABASE_URL` - Already set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Already set
- [ ] `VITE_APP_URL` or `APP_URL` - Already set

---

## ⚡ Quick Commands

```bash
# Deploy
supabase functions deploy daily-restore-report

# Test
supabase functions invoke daily-restore-report --no-verify-jwt

# Schedule (8 AM UTC daily)
supabase functions schedule daily-restore-report --cron "0 8 * * *"

# View logs
supabase functions logs daily-restore-report

# List secrets
supabase secrets list

# Set secret
supabase secrets set KEY=value

# Remove secret
supabase secrets unset KEY
```

---

## 🎓 Cron Schedule Examples

```bash
# Every day at 8:00 AM UTC
"0 8 * * *"

# Every weekday at 9:00 AM UTC
"0 9 * * 1-5"

# Every Monday at 7:00 AM UTC
"0 7 * * 1"

# Twice a day (8 AM and 8 PM UTC)
"0 8,20 * * *"

# Every 6 hours
"0 */6 * * *"
```

---

## ✅ Success Criteria

After deployment, verify:

1. ✅ Function deploys without errors
2. ✅ Manual test returns success response
3. ✅ Daily report email received in inbox
4. ✅ Logs show successful execution
5. ✅ Database entry in `restore_report_logs` table
6. ✅ Error alert works (optional: test with invalid config)
7. ✅ Scheduled cron job appears in function list

---

## 🔄 Migration from v1.0

If upgrading from v1.0:

1. ✅ Keep old EMAIL_* variables during migration
2. ✅ Set new SendGrid variables
3. ✅ Deploy new version
4. ✅ Test manually
5. ✅ Monitor for 2-3 days
6. ✅ Remove old variables (optional)

**Rollback:** Keep old variables and redeploy v1.0 if needed

---

**Version:** 2.0  
**Status:** Production Ready  
**Setup Time:** ~20 minutes  
**Last Updated:** 2025-10-12
