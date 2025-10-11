# Testing Guide for Daily Restore Report Edge Function

This guide provides comprehensive testing procedures for the `daily-restore-report` Edge Function.

## 🧪 Testing Overview

The daily-restore-report Edge Function should be tested at multiple levels:
1. Local testing with Supabase CLI
2. Environment validation
3. Email delivery verification
4. Error handling and alerting
5. Performance and monitoring

## 📋 Prerequisites

Before testing, ensure you have:
- [ ] Supabase CLI installed (`brew install supabase/tap/supabase`)
- [ ] Docker installed and running (for local Supabase)
- [ ] SendGrid API key obtained
- [ ] Sender email verified in SendGrid
- [ ] Test email addresses available

## 🔧 Environment Setup

### 1. Configure Local Environment

Create a `.env.local` file in the function directory:

```bash
# Navigate to function directory
cd supabase/functions/daily-restore-report

# Create local environment file
cat > .env.local << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=test@yourdomain.com
FROM_NAME=Test Sender
ADMIN_EMAIL=your-test-email@example.com
ERROR_ALERT_EMAIL=your-test-email@example.com
VITE_APP_URL=http://localhost:5173
EOF
```

### 2. Set Supabase Secrets (for deployed testing)

```bash
# Set each secret individually
supabase secrets set SENDGRID_API_KEY=SG.your-sendgrid-api-key
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set FROM_NAME="Travel HR Buddy"
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set ERROR_ALERT_EMAIL=alerts@empresa.com
supabase secrets set VITE_APP_URL=https://your-app.vercel.app

# Verify secrets are set
supabase secrets list
```

## 🧪 Test Cases

### Test 1: Environment Variable Validation

**Purpose**: Verify all required environment variables are configured

**Steps**:
```bash
# Deploy or serve the function locally
supabase functions serve daily-restore-report

# In another terminal, invoke the function
curl -X POST http://localhost:54321/functions/v1/daily-restore-report \
  -H "Content-Type: application/json"
```

**Expected Result**:
- If missing variables: Error message indicating which variables are missing
- If all present: Function proceeds to data fetching

**Pass Criteria**: ✅ Clear error messages for missing variables

---

### Test 2: Successful Email Delivery

**Purpose**: Verify the function sends email successfully with valid data

**Steps**:
```bash
# Invoke function (local or deployed)
supabase functions invoke daily-restore-report --no-verify-jwt

# Or with curl
curl -X POST https://your-project.supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Expected Result**:
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

**Verification**:
- [ ] Check email inbox for report
- [ ] Verify email has correct subject line
- [ ] Verify email content is properly formatted
- [ ] Verify all statistics are present
- [ ] Verify "View Full Chart" link works

**Pass Criteria**: ✅ Email received within 30 seconds with correct data

---

### Test 3: Error Handling - Missing SendGrid Key

**Purpose**: Verify error handling when SendGrid API key is missing

**Steps**:
```bash
# Temporarily remove SendGrid key
supabase secrets unset SENDGRID_API_KEY

# Invoke function
supabase functions invoke daily-restore-report --no-verify-jwt
```

**Expected Result**:
```json
{
  "success": false,
  "error": "SENDGRID_API_KEY environment variable is not set",
  "executionTimeMs": 5
}
```

**Verification**:
- [ ] Error message is clear and actionable
- [ ] No email sent
- [ ] Function returns 500 status code
- [ ] Logs show error details

**Cleanup**: Re-set the SendGrid API key after test

**Pass Criteria**: ✅ Clear error message, no crash

---

### Test 4: Error Handling - Invalid SendGrid Key

**Purpose**: Verify error handling when SendGrid API key is invalid

**Steps**:
```bash
# Set invalid key
supabase secrets set SENDGRID_API_KEY=SG.invalid-key-here

# Invoke function
supabase functions invoke daily-restore-report --no-verify-jwt
```

**Expected Result**:
```json
{
  "success": false,
  "error": "SendGrid API error: 401 - ...",
  "executionTimeMs": 450
}
```

**Verification**:
- [ ] Error message indicates SendGrid API failure
- [ ] Logs show API error details
- [ ] Error alert email is sent (if ERROR_ALERT_EMAIL is valid)

**Cleanup**: Re-set valid SendGrid API key after test

**Pass Criteria**: ✅ Clear error message, error alert sent

---

### Test 5: Error Alert System

**Purpose**: Verify error alerts are sent when function fails

**Steps**:
```bash
# Cause a failure (e.g., invalid Supabase credentials)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=invalid-key

# Invoke function
supabase functions invoke daily-restore-report --no-verify-jwt
```

**Expected Result**:
- Primary report email NOT sent
- Error alert email IS sent to ERROR_ALERT_EMAIL

**Verification**:
- [ ] Check error alert email received
- [ ] Email has "🚨 ERRO" in subject
- [ ] Email contains error message
- [ ] Email contains stack trace
- [ ] Email contains execution time
- [ ] Email contains troubleshooting tips

**Cleanup**: Re-set valid Supabase credentials after test

**Pass Criteria**: ✅ Error alert received with complete diagnostics

---

### Test 6: Empty Data Handling

**Purpose**: Verify function handles empty data gracefully

**Prerequisites**: Temporarily empty the restore_logs table or modify RPC to return empty data

**Expected Result**:
- Email still sent
- Summary shows zeros: `{ total: 0, unique_docs: 0, avg_per_day: 0 }`
- Message indicates no data available
- No errors thrown

**Pass Criteria**: ✅ Graceful handling of empty data

---

### Test 7: Performance Test

**Purpose**: Verify function execution time is acceptable

**Steps**:
```bash
# Invoke function multiple times
for i in {1..5}; do
  echo "Test $i:"
  supabase functions invoke daily-restore-report --no-verify-jwt
  sleep 2
done
```

**Expected Result**:
- Each execution completes within 5 seconds (typical)
- `executionTimeMs` in response is reasonable
- No timeouts

**Pass Criteria**: ✅ Average execution time < 5000ms

---

### Test 8: Email Content Validation

**Purpose**: Verify email content is well-formatted and complete

**Steps**:
1. Invoke function
2. Check received email
3. Validate all elements

**Checklist**:
- [ ] Subject line is descriptive and dated
- [ ] Header has gradient background
- [ ] Summary box is present with all metrics
- [ ] Daily data section is present (if data exists)
- [ ] "View Full Chart" button is styled and functional
- [ ] Footer has current year
- [ ] Email is mobile-responsive
- [ ] No broken HTML or styling issues

**Pass Criteria**: ✅ Professional-looking email, all elements present

---

### Test 9: SendGrid API Integration

**Purpose**: Verify SendGrid API is called correctly

**Steps**:
```bash
# Enable verbose logging if possible
# Invoke function
supabase functions invoke daily-restore-report --no-verify-jwt

# Check SendGrid activity
# Go to: https://app.sendgrid.com/email_activity
```

**Verification in SendGrid Dashboard**:
- [ ] Email appears in activity
- [ ] Status is "Delivered" or "Processed"
- [ ] No bounces or spam reports
- [ ] Sender and recipient are correct

**Pass Criteria**: ✅ Email shows as delivered in SendGrid

---

### Test 10: Scheduled Execution Test

**Purpose**: Verify cron schedule works correctly

**Steps**:
```bash
# Set up cron schedule (test with frequent schedule)
supabase functions schedule daily-restore-report \
  --cron "*/5 * * * *" \
  --endpoint-type=public

# Wait 5 minutes and check logs
supabase functions logs daily-restore-report --follow
```

**Expected Result**:
- Function executes automatically every 5 minutes
- Logs show successful executions
- Emails are received

**Cleanup**: Reset to daily schedule after test
```bash
supabase functions schedule daily-restore-report \
  --cron "0 8 * * *" \
  --endpoint-type=public
```

**Pass Criteria**: ✅ Automatic execution works as scheduled

---

## 🔍 Monitoring and Debugging

### View Function Logs

```bash
# Recent logs
supabase functions logs daily-restore-report

# Follow logs in real-time
supabase functions logs daily-restore-report --follow

# Logs from last hour
supabase functions logs daily-restore-report --since 1h

# Logs with grep filter
supabase functions logs daily-restore-report | grep "ERROR"
```

### Check SendGrid Activity

1. Go to [SendGrid Activity](https://app.sendgrid.com/email_activity)
2. Search for your emails by:
   - Recipient email
   - Date range
   - Subject keywords
3. Click on an email to see detailed delivery information

### Common Log Patterns

**Successful execution**:
```
🚀 Starting daily restore report generation...
📧 Recipient: admin@empresa.com
📤 From: Travel HR Buddy <noreply@yourdomain.com>
📊 Fetching restore data from Supabase...
✅ Fetched 20 days of restore data
📈 Summary: { total: 42, unique_docs: 15, avg_per_day: 2.1 }
📧 Sending email via SendGrid...
✅ Email sent via SendGrid successfully
✅ Email sent successfully in 1234ms
```

**Failed execution**:
```
🚀 Starting daily restore report generation...
❌ Error in daily-restore-report: Error: SENDGRID_API_KEY environment variable is not set
❌ Failed to send error alert: Error: ...
```

## 📊 Test Results Template

Document your test results:

```markdown
## Test Execution Report

**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: [Production/Staging/Local]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Environment Validation | ✅ Pass | All variables present |
| 2 | Successful Email Delivery | ✅ Pass | Received in 2.3s |
| 3 | Missing SendGrid Key | ✅ Pass | Clear error message |
| 4 | Invalid SendGrid Key | ✅ Pass | Error alert sent |
| 5 | Error Alert System | ✅ Pass | Alert received |
| 6 | Empty Data Handling | ✅ Pass | Graceful handling |
| 7 | Performance Test | ✅ Pass | Avg 1.8s |
| 8 | Email Content | ✅ Pass | All elements present |
| 9 | SendGrid Integration | ✅ Pass | Shows in dashboard |
| 10 | Scheduled Execution | ✅ Pass | Runs on schedule |

**Overall Result**: ✅ All tests passed
**Ready for Production**: Yes/No
**Issues Found**: None/[List issues]
```

## 🚀 Pre-Production Checklist

Before deploying to production:

- [ ] All tests passed
- [ ] SendGrid sender verified
- [ ] Production secrets configured
- [ ] Test email sent and received
- [ ] Error alert tested and received
- [ ] Logs reviewed for any warnings
- [ ] Documentation reviewed and updated
- [ ] Team notified of deployment
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

## 🐛 Troubleshooting

### Issue: Test emails not received

**Solutions**:
- Check spam/junk folder
- Verify FROM_EMAIL is verified in SendGrid
- Check SendGrid activity dashboard
- Verify ADMIN_EMAIL is correct
- Check SendGrid account status

### Issue: Function times out locally

**Solutions**:
- Increase Docker memory allocation
- Check database connection
- Verify RPC functions are not slow
- Use deployed testing instead

### Issue: Error alerts not sent during test

**Solutions**:
- Verify ERROR_ALERT_EMAIL is set
- Check SendGrid API key is valid
- Review function logs for alert errors
- Ensure error actually occurred

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/functions
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Deno Docs**: https://deno.land/manual
- **Team Contact**: [Your team's contact info]

---

**Version**: 1.0  
**Last Updated**: 2025-10-11  
**Next Review**: Before production deployment
