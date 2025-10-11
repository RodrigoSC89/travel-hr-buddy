# Migration Guide: Upgrading to SendGrid Version

This guide helps you migrate from the old API-based email system to the new SendGrid-integrated version of the daily-restore-report Edge Function.

## 📋 What Changed?

### Old Version (v1.0)
- ❌ Required separate Node.js API endpoint (`/api/send-restore-report`)
- ❌ Needed SMTP configuration (EMAIL_HOST, EMAIL_PORT, etc.)
- ❌ Depended on nodemailer package
- ❌ Required app to be deployed on Node.js-compatible platform
- ❌ No automatic error alerts
- ❌ Less detailed logging

### New Version (v2.0)
- ✅ Direct SendGrid API integration
- ✅ No external API dependencies
- ✅ Works entirely within Supabase Edge Function
- ✅ Automatic error alerting
- ✅ Better TypeScript types
- ✅ Professional email templates
- ✅ Performance monitoring

## 🚀 Migration Steps

### Step 1: Get SendGrid API Key (5 minutes)

1. Create a free account at [SendGrid](https://sendgrid.com/)
2. Navigate to **Settings** > **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "Travel HR Buddy Daily Report")
5. Select **Full Access** or minimum **Mail Send** permission
6. Copy the API key (save it securely!)

### Step 2: Verify Sender Email (5 minutes)

1. Go to **Settings** > **Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter your email address for `FROM_EMAIL`
4. Fill out the form with your details
5. Check your email and click the verification link

### Step 3: Update Environment Variables

#### Remove Old Variables (Optional)
The new version doesn't use these anymore:
```bash
# These are no longer needed for daily-restore-report
# (but may still be used by other parts of your app)
# EMAIL_HOST
# EMAIL_PORT
# EMAIL_USER
# EMAIL_PASS
```

#### Add New Variables
```bash
# Set SendGrid API key
supabase secrets set SENDGRID_API_KEY=SG.your-sendgrid-api-key-here

# Set sender information
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set FROM_NAME="Travel HR Buddy"

# Keep existing admin email (or update it)
supabase secrets set ADMIN_EMAIL=admin@empresa.com

# Optional: Set separate error alert email
supabase secrets set ERROR_ALERT_EMAIL=alerts@empresa.com

# Verify secrets are set
supabase secrets list
```

### Step 4: Deploy New Version

```bash
# Deploy the updated function
supabase functions deploy daily-restore-report

# Verify deployment
supabase functions list
```

### Step 5: Test the Migration

```bash
# Test with manual invoke
supabase functions invoke daily-restore-report --no-verify-jwt

# Check logs
supabase functions logs daily-restore-report --follow
```

**Expected Success Response**:
```json
{
  "success": true,
  "message": "Daily restore report sent successfully",
  "summary": { "total": 42, "unique_docs": 15, "avg_per_day": 2.1 },
  "dataPoints": 20,
  "emailSent": true,
  "executionTimeMs": 1234
}
```

### Step 6: Verify Email Received

Check your email for:
- ✅ Report received at ADMIN_EMAIL
- ✅ Professional formatting
- ✅ All statistics present
- ✅ Links working correctly

### Step 7: Test Error Alerts

Temporarily break something to test error alerts:

```bash
# Set invalid API key to trigger error
supabase secrets set SENDGRID_API_KEY=invalid-key

# Invoke function (should fail)
supabase functions invoke daily-restore-report --no-verify-jwt

# Restore valid key
supabase secrets set SENDGRID_API_KEY=SG.your-valid-key-here
```

**Verify**:
- ✅ Error alert email received
- ✅ Contains error details
- ✅ Includes troubleshooting tips

### Step 8: Update Documentation (If Applicable)

If you have internal documentation referencing the old setup:
- Update references to SMTP configuration
- Add SendGrid setup instructions
- Update environment variable lists
- Note the error alerting feature

## 🔄 Rollback Plan

If you need to rollback to the old version:

1. **Keep old API endpoint** (`/api/send-restore-report.ts`) - don't delete it yet
2. **Keep old environment variables** - they won't interfere
3. **Redeploy old version**:
   ```bash
   # If you have the old code in git
   git checkout <old-commit-hash> -- supabase/functions/daily-restore-report/
   supabase functions deploy daily-restore-report
   ```

## 🆚 Feature Comparison

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| Email Provider | Any SMTP | SendGrid |
| External Dependencies | Yes (API endpoint) | No |
| Error Alerts | No | Yes, automatic |
| TypeScript Types | Basic | Comprehensive |
| Email Templates | Simple | Professional |
| Performance Tracking | No | Yes |
| Setup Complexity | Medium | Easy |
| Maintenance | Higher | Lower |
| Cost | SMTP fees | SendGrid free tier |

## 💰 Cost Considerations

### SendGrid Free Tier
- 100 emails/day forever free
- Perfect for daily reports
- No credit card required

### If You Need More
- SendGrid paid plans start at $15/month for 40K emails
- Much more reliable than basic SMTP
- Better deliverability and tracking

## 🐛 Common Migration Issues

### Issue: "FROM_EMAIL not verified"

**Symptom**: SendGrid returns 403 error

**Solution**:
```bash
# Check SendGrid dashboard
# Settings > Sender Authentication
# Verify the email address used in FROM_EMAIL
```

### Issue: "Missing SENDGRID_API_KEY"

**Symptom**: Function returns error about missing API key

**Solution**:
```bash
# Set the secret
supabase secrets set SENDGRID_API_KEY=SG.your-key

# Verify it's set
supabase secrets list | grep SENDGRID
```

### Issue: Old API endpoint still being called

**Symptom**: Emails coming from old system instead of SendGrid

**Solution**:
- Verify you deployed the new version
- Check function logs to confirm new code is running
- Redeploy if necessary

### Issue: Emails going to spam

**Solution**:
- Set up SendGrid domain authentication
- Ensure FROM_EMAIL domain matches your verified domain
- Check SPF and DKIM records
- Review SendGrid deliverability guide

## 📊 Monitoring After Migration

### Day 1-3: Active Monitoring
```bash
# Check logs frequently
supabase functions logs daily-restore-report --follow

# Verify scheduled executions
# Check email delivery in SendGrid dashboard
# Monitor error rate
```

### Week 1: Regular Checks
- Review SendGrid activity daily
- Check error alerts (should be none)
- Verify execution time is reasonable
- Confirm emails are being delivered

### Ongoing: Monthly Review
- Review SendGrid statistics
- Check for any delivery issues
- Verify all metrics are accurate
- Update documentation as needed

## ✅ Migration Checklist

Use this checklist to ensure smooth migration:

- [ ] SendGrid account created
- [ ] API key obtained and stored securely
- [ ] Sender email verified in SendGrid
- [ ] Old environment variables documented (for rollback)
- [ ] New environment variables set in Supabase
- [ ] Function deployed successfully
- [ ] Manual test completed successfully
- [ ] Email received and verified
- [ ] Error alerting tested
- [ ] Error alert email received
- [ ] Cron schedule still active
- [ ] Old API endpoint preserved (for rollback)
- [ ] Team notified of changes
- [ ] Documentation updated
- [ ] Monitoring set up
- [ ] Rollback plan documented
- [ ] Success criteria met

## 🎉 Post-Migration Benefits

After successful migration, you'll have:
- ✅ More reliable email delivery
- ✅ Better monitoring and tracking
- ✅ Automatic error alerts
- ✅ Professional email templates
- ✅ Simpler configuration
- ✅ Better security (no SMTP credentials to manage)
- ✅ Improved logging and debugging
- ✅ Performance metrics

## 📚 Additional Resources

- **SendGrid Getting Started**: https://docs.sendgrid.com/for-developers/sending-email
- **SendGrid API Reference**: https://docs.sendgrid.com/api-reference/mail-send
- **Sender Authentication**: https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication
- **Troubleshooting**: See [README.md](./README.md) and [TESTING.md](./TESTING.md)

## 🆘 Need Help?

If you encounter issues during migration:

1. **Check logs**: `supabase functions logs daily-restore-report --follow`
2. **Check SendGrid activity**: https://app.sendgrid.com/email_activity
3. **Review error alert**: Check your ERROR_ALERT_EMAIL inbox
4. **Consult documentation**: [README.md](./README.md)
5. **Test in isolation**: Use manual invoke to test step-by-step

## 📞 Support Contacts

- **SendGrid Support**: https://support.sendgrid.com/
- **Supabase Support**: https://supabase.com/support
- **Internal Team**: [Your team's contact info]

---

**Migration Version**: 1.0 to 2.0  
**Estimated Migration Time**: 15-20 minutes  
**Recommended Migration Window**: Off-peak hours  
**Rollback Time**: < 5 minutes

Good luck with your migration! 🚀
