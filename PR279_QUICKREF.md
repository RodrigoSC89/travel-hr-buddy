# Daily Restore Report - Quick Reference

**Version**: 2.0.0 (Refactored)  
**Last Updated**: 2025-10-11  
**Status**: ✅ Production Ready

---

## ⚡ Quick Commands

### Deploy
```bash
# Deploy the edge function
supabase functions deploy daily-restore-report

# Schedule daily at 8 AM
supabase functions schedule daily-restore-report --cron "0 8 * * *"

# Verify deployment
supabase functions list
```

### Test
```bash
# Test edge function
supabase functions invoke daily-restore-report --no-verify-jwt

# Test email API
curl -X POST https://your-app.vercel.app/api/send-restore-report \
  -H "Content-Type: application/json" \
  -d '{"toEmail": "test@example.com", "summary": {"total": 10, "unique_docs": 5, "avg_per_day": 2}}'

# Check logs
supabase functions logs daily-restore-report --follow
```

### Monitor
```bash
# View recent logs
supabase functions logs daily-restore-report --since=1h

# List scheduled jobs
supabase functions list-schedules

# Check email delivery
# (Check your email inbox and spam folder)
```

---

## 🔧 Environment Variables

### Supabase Edge Function
```bash
SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_URL=https://your-app.vercel.app
ADMIN_EMAIL=admin@empresa.com
```

### Application (Vercel)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password_16chars
EMAIL_FROM=relatorios@yourdomain.com
```

---

## 📊 Architecture

```
Cron (8 AM daily)
    ↓
Edge Function (Deno)
    ↓
├─ Validate Config
├─ Fetch Data (parallel)
│  ├─ get_restore_count_by_day_with_email
│  └─ get_restore_summary
├─ Generate HTML Email
└─ Send via API
    ↓
    Email API (Node.js)
    ├─ Verify SMTP
    ├─ Validate Email
    └─ Send via Nodemailer
```

---

## 🐛 Quick Troubleshooting

### Email not received?
```bash
# 1. Check environment variables
vercel env ls | grep EMAIL

# 2. Test SMTP connection
curl -X POST https://your-app.vercel.app/api/send-restore-report \
  -H "Content-Type: application/json" \
  -d '{"toEmail": "your@email.com", "summary": {}}'

# 3. Check spam folder

# 4. View function logs
supabase functions logs daily-restore-report
```

### Function failing?
```bash
# Check logs for errors
supabase functions logs daily-restore-report --since=24h

# Verify environment variables are set
# Go to: Supabase Dashboard > Settings > Edge Functions > Secrets

# Redeploy
supabase functions deploy daily-restore-report
```

### Configuration error?
```bash
# Error: "Missing required environment variable"
# Solution: Set all required variables in Supabase dashboard

# Verify variables (don't expose values):
echo $SUPABASE_URL  # Should show URL
echo $ADMIN_EMAIL   # Should show email
```

---

## 📝 Key Features

✅ **Automated Daily Reports** - Runs via cron  
✅ **Beautiful Emails** - Responsive HTML design  
✅ **Type Safe** - Full TypeScript implementation  
✅ **Error Handling** - Comprehensive validation  
✅ **SMTP Verification** - Pre-checks email config  
✅ **Parallel Fetching** - Fast data retrieval  
✅ **Detailed Logging** - Easy debugging

---

## 🎯 Cron Schedule Examples

| When | Cron Expression |
|------|----------------|
| Daily at 8 AM | `0 8 * * *` |
| Weekdays at 9 AM | `0 9 * * 1-5` |
| Every Monday at 7 AM | `0 7 * * 1` |
| Twice daily (8 AM & 8 PM) | `0 8,20 * * *` |
| First of month at 10 AM | `0 10 1 * *` |

Test your cron: https://crontab.guru/

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/supabase/functions/daily-restore-report/index.ts` | Main edge function |
| `/supabase/functions/daily-restore-report/README.md` | Full documentation |
| `/pages/api/send-restore-report.ts` | Email API |
| `/pages/api/generate-chart-image.ts` | Chart generation |
| `/public/embed-restore-chart.html` | Chart embed page |
| `/PR279_REFACTOR_SUMMARY.md` | This refactoring details |

---

## 🔐 Security Checklist

- [ ] Environment variables set (not hardcoded)
- [ ] SMTP password is app-specific (not account password)
- [ ] Service role key kept secure
- [ ] HTTPS used for all API calls
- [ ] Email recipients validated
- [ ] Logs monitored for unusual activity

---

## 📚 Documentation Links

- [Full README](./supabase/functions/daily-restore-report/README.md)
- [Refactor Summary](./PR279_REFACTOR_SUMMARY.md)
- [Deployment Guide](./DAILY_RESTORE_REPORT_DEPLOYMENT.md)
- [Architecture](./DAILY_RESTORE_REPORT_ARCHITECTURE.md)
- [Supabase Functions](https://supabase.com/docs/guides/functions)

---

## 🚀 Deployment Status

- ✅ Code refactored and tested
- ✅ TypeScript compilation verified
- ✅ Build process successful
- ✅ Documentation complete
- ✅ Ready for production deployment

---

## 📞 Need Help?

1. Check the [Full README](./supabase/functions/daily-restore-report/README.md)
2. Review [Troubleshooting Section](./supabase/functions/daily-restore-report/README.md#troubleshooting)
3. Check function logs: `supabase functions logs daily-restore-report`
4. Verify environment variables are set correctly
5. Test each component individually

---

**For Production Support**: Contact DevOps Team  
**For Code Issues**: Check GitHub Issues  
**For Questions**: See Full Documentation
