# Daily Restore Report - Quick Reference

Quick commands and configurations for the daily restore report feature.

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Use the automated setup script
npm run setup:daily-report

# Or directly
node scripts/setup-daily-restore-report.js
```

The script will automatically:
- ✅ Verify Supabase CLI installation
- ✅ Check function files exist
- ✅ Validate environment variables
- ✅ Deploy the edge function
- ✅ Configure cron schedule
- ✅ Run test invocation

### Manual Setup

```bash
# 1. Deploy Edge Function
supabase functions deploy daily-restore-report

# 2. Schedule it (daily at 8 AM)
supabase functions schedule daily-restore-report --cron "0 8 * * *" --endpoint-type=public

# 3. Test it
supabase functions invoke daily-restore-report --no-verify-jwt

# 4. Check logs
supabase functions logs daily-restore-report --follow
```

## 📋 Required Environment Variables

### Supabase (Edge Function)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_URL=https://your-app.vercel.app
ADMIN_EMAIL=admin@empresa.com
```

### Application (Vercel/Netlify)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
EMAIL_FROM=relatorios@yourdomain.com
```

## 📁 File Structure

```
📦 Project Root
├── 📂 scripts/
│   └── setup-daily-restore-report.js  # 🆕 Automated setup script
├── 📂 supabase/functions/daily-restore-report/
│   ├── index.ts                       # Edge Function (refactored v2.0)
│   └── README.md                      # Detailed documentation
├── 📂 pages/api/
│   ├── send-restore-report.ts         # Email sending API
│   └── generate-chart-image.ts        # Chart image generation API
├── 📂 public/
│   └── embed-restore-chart.html       # Standalone chart page
├── 📄 DAILY_RESTORE_REPORT_QUICKREF.md    # This file
└── 📄 DAILY_RESTORE_REPORT_DEPLOYMENT.md  # Full deployment guide
```

## 🔧 Common Commands

### Deploy
```bash
# Deploy function
supabase functions deploy daily-restore-report

# Deploy with environment variables
supabase functions deploy daily-restore-report \
  --env-file .env.production
```

### Test
```bash
# Test locally
supabase functions serve daily-restore-report

# Test deployed function
curl -X POST \
  https://your-project.supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test email API
curl -X POST https://your-app.vercel.app/api/send-restore-report \
  -H "Content-Type: application/json" \
  -d '{"toEmail": "test@example.com"}'
```

### Monitor
```bash
# View logs
supabase functions logs daily-restore-report

# Follow logs
supabase functions logs daily-restore-report --follow

# View recent logs
supabase functions logs daily-restore-report --since=1h
```

### Schedule Management
```bash
# Create schedule
supabase functions schedule daily-restore-report \
  --cron "0 8 * * *"

# List schedules
supabase functions list-schedules

# Delete schedule
supabase functions unschedule daily-restore-report
```

## ⏰ Cron Schedule Examples

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Daily at 8 AM | `0 8 * * *` | Every day |
| Weekdays at 9 AM | `0 9 * * 1-5` | Monday to Friday |
| Every Monday at 7 AM | `0 7 * * 1` | Weekly |
| Twice daily | `0 8,20 * * *` | 8 AM and 8 PM |
| First of month | `0 10 1 * *` | Monthly |

Test your cron: https://crontab.guru/

## 🧪 Testing Checklist

- [ ] Embed page loads: `/embed-restore-chart.html`
- [ ] Chart displays with data
- [ ] Email API works: `/api/send-restore-report`
- [ ] Email received successfully
- [ ] Edge function invokes without errors
- [ ] Scheduled job runs on time
- [ ] Logs show success messages

## 🐛 Quick Troubleshooting

### Email not sent?
```bash
# Check environment variables
vercel env ls

# Test SMTP connection
curl -X POST https://your-app.vercel.app/api/send-restore-report \
  -H "Content-Type: application/json" \
  -d '{"toEmail": "test@example.com", "summary": {}}'
```

### Function errors?
```bash
# View logs
supabase functions logs daily-restore-report

# Check function exists
supabase functions list

# Redeploy
supabase functions deploy daily-restore-report
```

### Chart not showing?
```bash
# Test RPC function
curl -X POST \
  'https://your-project.supabase.co/rest/v1/rpc/get_restore_count_by_day_with_email' \
  -H "apikey: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email_input": ""}'
```

## 📊 Features

✅ **Automated Daily Reports** - Scheduled execution via cron  
✅ **Email Delivery** - HTML formatted emails with attachments  
✅ **Chart Visualization** - Interactive charts with restore metrics  
✅ **Summary Statistics** - Total, unique docs, average per day  
✅ **Flexible Scheduling** - Customizable cron expressions  
✅ **Easy Monitoring** - Built-in logging and debugging  
✅ **Scalable Architecture** - Serverless edge functions  

## 🔗 Related Documentation

- [Full Deployment Guide](./DAILY_RESTORE_REPORT_DEPLOYMENT.md)
- [Edge Function README](./supabase/functions/daily-restore-report/README.md)
- [Restore Dashboard](./src/pages/admin/documents/restore-dashboard.tsx)

## 📧 Email Preview

The email includes:
- 📊 Header with title and date
- 📈 Summary statistics (total, unique docs, avg per day)
- 📋 Daily breakdown of restore counts
- 🔗 Link to full dashboard
- 📎 Chart image attachment (if configured)

## 🎯 Production Checklist

Before going to production:

- [ ] All environment variables set
- [ ] SMTP credentials tested
- [ ] Email deliverability verified (check spam)
- [ ] Cron schedule configured
- [ ] Function logs monitored
- [ ] Backup email recipients configured
- [ ] Error alerting set up
- [ ] Documentation reviewed by team

## 💡 Tips

1. **Test with your own email first** before sending to admins
2. **Monitor logs for the first week** to catch any issues
3. **Use UTC for cron schedules** (adjust for your timezone)
4. **Set up email alerts** for function failures
5. **Keep SMTP credentials secure** (use environment variables)
6. **Consider email rate limits** when testing
7. **Document any custom changes** in your deployment notes

## 🆘 Need Help?

1. Check [Deployment Guide](./DAILY_RESTORE_REPORT_DEPLOYMENT.md)
2. Review [Edge Function README](./supabase/functions/daily-restore-report/README.md)
3. Check function logs: `supabase functions logs daily-restore-report`
4. Test components individually
5. Consult [Supabase Docs](https://supabase.com/docs)

## 🆕 What's New in v2.0

### Automated Setup Script
- ✅ One-command deployment: `npm run setup:daily-report`
- ✅ Automated validation and configuration
- ✅ Step-by-step progress tracking
- ✅ Comprehensive error handling

### Refactored Edge Function
- ✅ TypeScript interfaces for type safety
- ✅ Improved error handling and logging
- ✅ Enhanced email HTML with modern design
- ✅ Better configuration management
- ✅ More detailed documentation

### Professional Email Template
- ✅ Mobile-responsive design
- ✅ Enhanced visual hierarchy
- ✅ Grid layout for metrics
- ✅ Branded color scheme
- ✅ Actionable call-to-action button

---

**Last Updated**: 2025-10-11 (v2.0)  
**Status**: ✅ Ready for deployment with automated setup
