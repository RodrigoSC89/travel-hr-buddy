# Daily Restore Report - Automated Setup Script

## 📋 Overview

The `setup-daily-restore-report.js` script provides a streamlined, automated way to deploy and configure the daily restore report feature.

## 🚀 Quick Start

```bash
# Using npm script (recommended)
npm run setup:daily-report

# Or directly
node scripts/setup-daily-restore-report.js
```

## 🎯 What It Does

The script automates the entire setup process:

1. **Prerequisites Check** ✅
   - Verifies Supabase CLI is installed
   - Checks that function files exist
   - Validates directory structure

2. **Environment Validation** 🔐
   - Checks for required environment variables
   - Reports missing configuration
   - Validates optional settings

3. **Function Deployment** 🚀
   - Deploys the edge function to Supabase
   - Verifies successful deployment
   - Provides deployment logs

4. **Cron Schedule Setup** ⏰
   - Configures daily execution (8 AM UTC by default)
   - Removes existing schedules if present
   - Confirms schedule creation

5. **Testing** 🧪
   - Invokes the function for testing
   - Checks for runtime errors
   - Displays test results

6. **Summary Report** 📊
   - Shows status of all steps
   - Provides troubleshooting guidance
   - Lists next steps

## 📦 Prerequisites

### Required

1. **Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Supabase Project**
   - Project must be created and linked
   - Run `supabase link` if not already linked

3. **Environment Variables**
   
   Set these in Supabase Dashboard (Settings > Edge Functions > Secrets):
   
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   VITE_APP_URL=https://your-app.vercel.app
   ADMIN_EMAIL=admin@empresa.com
   ```

### Optional (for email functionality)

Set these in your application environment (Vercel/Netlify):

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
EMAIL_FROM=relatorios@yourdomain.com
```

## 🎨 Output Example

```
============================================================
Daily Restore Report - Automated Setup
============================================================

➜ Checking Supabase CLI installation...
✅ Supabase CLI installed: 1.x.x

➜ Checking function directory...
✅ Function directory and files exist

➜ Validating environment variables...
✅ Found 4 required variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ...
⚠️  Missing 0 required variables: 

➜ Deploying edge function...
ℹ Deploying daily-restore-report...
✅ Function deployed successfully!

➜ Setting up cron schedule...
ℹ Scheduling daily-restore-report with cron: 0 8 * * *
✅ Function scheduled successfully: 0 8 * * * (Daily at 8 AM UTC)

➜ Testing the function...
ℹ Invoking function for test...
✅ Function test completed

➜ Setup Summary

============================================================
Daily Restore Report Setup Results
============================================================

Supabase CLI Check:        ✅ SUCCESS
Function Files Check:      ✅ SUCCESS
Environment Variables:     ✅ SUCCESS
Function Deployment:       ✅ SUCCESS
Cron Schedule Setup:       ✅ SUCCESS
Function Test:             ✅ SUCCESS

============================================================

✅ Setup completed successfully! 🎉

Next Steps:

1. Configure email settings in your application:
   - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
   - These are required for sending email reports

2. Verify the cron schedule:
   - supabase functions list-schedules

3. Monitor function logs:
   - supabase functions logs daily-restore-report --follow

4. Test email delivery:
   - Ensure SMTP credentials are correct
   - Check spam folder for test emails

📚 Documentation:
   - DAILY_RESTORE_REPORT_QUICKREF.md
   - supabase/functions/daily-restore-report/README.md

============================================================
```

## 🔧 Configuration

### Cron Schedule

Default: `0 8 * * *` (Daily at 8 AM UTC)

To customize, edit the script:

```javascript
const CONFIG = {
  cronSchedule: "0 8 * * *", // Change this
  // ...
};
```

Common cron patterns:
- `0 8 * * *` - Daily at 8 AM
- `0 9 * * 1-5` - Weekdays at 9 AM
- `0 7 * * 1` - Every Monday at 7 AM
- `0 8,20 * * *` - Twice daily (8 AM and 8 PM)

### Function Name

Default: `daily-restore-report`

To change, update:

```javascript
const CONFIG = {
  functionName: "daily-restore-report",
  // ...
};
```

## 🐛 Troubleshooting

### Error: "Supabase CLI not found"

**Solution:**
```bash
npm install -g supabase
```

Or visit: https://supabase.com/docs/guides/cli

### Error: "Function directory not found"

**Cause:** Script is not running from project root

**Solution:**
```bash
cd /path/to/travel-hr-buddy
npm run setup:daily-report
```

### Error: "Missing required environment variables"

**Solution:** Set variables in Supabase Dashboard
1. Go to your Supabase project
2. Settings > Edge Functions > Secrets
3. Add the required variables

### Error: "Authentication failed"

**Solution:** Link your project
```bash
supabase link --project-ref your-project-ref
```

### Warning: "Scheduling failed"

**Possible causes:**
- Supabase CLI version doesn't support scheduling
- Manual scheduling required

**Solution:** Schedule manually in Supabase Dashboard:
1. Dashboard > Edge Functions
2. Select `daily-restore-report`
3. Add Cron Job
4. Enter: `0 8 * * *`

### Error: "Function test failed"

**Note:** Test failures are often expected if email credentials are not configured.

**Check:**
1. Email environment variables are set
2. SMTP credentials are correct
3. Function logs: `supabase functions logs daily-restore-report`

## 📝 Script Features

### Color-Coded Output

- 🔵 **Blue (ℹ)**: Informational messages
- 🟢 **Green (✅)**: Success messages
- 🟡 **Yellow (⚠️)**: Warnings
- 🔴 **Red (❌)**: Errors
- 🔵 **Cyan (➜)**: Step headers

### Progress Tracking

Each step is tracked and reported in the final summary, making it easy to identify where issues occurred.

### Error Recovery

The script continues even if some steps fail, allowing you to complete as much as possible and manually fix any issues.

### Detailed Logging

All operations are logged with detailed output, making debugging easier.

## 🔗 Related Documentation

- [DAILY_RESTORE_REPORT_QUICKREF.md](../DAILY_RESTORE_REPORT_QUICKREF.md) - Quick reference guide
- [supabase/functions/daily-restore-report/README.md](../supabase/functions/daily-restore-report/README.md) - Function documentation
- [DAILY_RESTORE_REPORT_DEPLOYMENT.md](../DAILY_RESTORE_REPORT_DEPLOYMENT.md) - Full deployment guide

## 🤝 Contributing

If you improve the script:
1. Update this README
2. Test the changes thoroughly
3. Document new features or changes
4. Submit a pull request

## 📄 License

Part of the Nautilus One - Travel HR Buddy project.

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-11  
**Author**: Nautilus One Team
