# Daily Restore Report - Quick Reference

## 🚀 Quick Start

```bash
# 1. Set SendGrid API Key
supabase secrets set SENDGRID_API_KEY=SG.your-api-key

# 2. Set email configuration
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set FROM_NAME="Travel HR Buddy"
supabase secrets set ADMIN_EMAIL=admin@empresa.com

# 3. Deploy
supabase functions deploy daily-restore-report

# 4. Test
supabase functions invoke daily-restore-report --no-verify-jwt

# 5. Schedule (daily at 8 AM)
supabase functions schedule daily-restore-report --cron "0 8 * * *"
```

## 📋 Required Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `SENDGRID_API_KEY` | `SG.abc123...` | SendGrid authentication |
| `FROM_EMAIL` | `noreply@domain.com` | Sender email (must be verified) |
| `FROM_NAME` | `Travel HR Buddy` | Sender display name |
| `ADMIN_EMAIL` | `admin@empresa.com` | Report recipient |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Auto-set by Supabase |

## 🎯 Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ERROR_ALERT_EMAIL` | `ADMIN_EMAIL` | Separate error alert recipient |
| `VITE_APP_URL` or `APP_URL` | - | Your app URL for chart links |

## 📧 SendGrid Setup (2 minutes)

1. **Create Account**: [sendgrid.com](https://sendgrid.com/)
2. **Get API Key**: Settings > API Keys > Create
3. **Verify Sender**: Settings > Sender Authentication
4. **Set Key**: `supabase secrets set SENDGRID_API_KEY=SG.your-key`

## 🧪 Testing Commands

```bash
# Manual invoke
supabase functions invoke daily-restore-report --no-verify-jwt

# Check logs
supabase functions logs daily-restore-report --follow

# List secrets
supabase secrets list

# Verify deployment
supabase functions list
```

## 📊 Expected Response

**Success**:
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

**Error**:
```json
{
  "success": false,
  "error": "SENDGRID_API_KEY environment variable is not set",
  "executionTimeMs": 5
}
```

## 🔔 Error Alerts

When the function fails:
- ✅ Error alert sent automatically to `ERROR_ALERT_EMAIL`
- ✅ Includes error message and stack trace
- ✅ Provides troubleshooting recommendations
- ✅ Separate from normal daily reports

## 📈 What Gets Sent

### Daily Report Email
- 📊 Executive summary (total, unique docs, avg per day)
- 📅 Daily breakdown of restore activity
- 🔗 Link to interactive chart
- 🎨 Professional responsive design

### Error Alert Email
- 🚨 Urgent notification of failure
- ❌ Detailed error information
- 🔍 Stack trace for debugging
- 💡 Troubleshooting recommendations

## 🕐 Cron Schedule Examples

```bash
# Daily at 8 AM
supabase functions schedule daily-restore-report --cron "0 8 * * *"

# Weekdays at 9 AM
supabase functions schedule daily-restore-report --cron "0 9 * * 1-5"

# Twice daily (8 AM and 8 PM)
supabase functions schedule daily-restore-report --cron "0 8,20 * * *"

# Every Monday at 7 AM
supabase functions schedule daily-restore-report --cron "0 7 * * 1"
```

Use [crontab.guru](https://crontab.guru/) to generate custom schedules.

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Email not received | Check spam, verify FROM_EMAIL in SendGrid |
| "Missing API key" error | Run: `supabase secrets set SENDGRID_API_KEY=...` |
| 401 error from SendGrid | API key invalid, generate new one |
| "No data" in report | Check database has restore_logs data |
| Function timeout | Check database connection, optimize queries |
| Error alert not sent | Verify ERROR_ALERT_EMAIL is set correctly |

## 📝 Quick Commands Reference

```bash
# Deploy
supabase functions deploy daily-restore-report

# Invoke
supabase functions invoke daily-restore-report --no-verify-jwt

# Logs (real-time)
supabase functions logs daily-restore-report --follow

# Logs (last hour)
supabase functions logs daily-restore-report --since 1h

# Set secret
supabase secrets set KEY=value

# List secrets
supabase secrets list

# Remove secret
supabase secrets unset KEY

# Schedule
supabase functions schedule daily-restore-report --cron "0 8 * * *"

# Unschedule
supabase functions unschedule daily-restore-report
```

## 🔒 Security Checklist

- [ ] SendGrid API key set via secrets (not in code)
- [ ] FROM_EMAIL verified in SendGrid
- [ ] Using domain authentication (recommended for production)
- [ ] ADMIN_EMAIL is valid and monitored
- [ ] Error alerts going to appropriate team
- [ ] Logs reviewed regularly for issues
- [ ] API keys rotated periodically

## 📚 Documentation Links

- **Full README**: [README.md](./README.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Supabase Functions**: https://supabase.com/docs/guides/functions

## 🎯 Common Use Cases

### Send Test Email
```bash
supabase functions invoke daily-restore-report --no-verify-jwt
```

### Change Recipient
```bash
supabase secrets set ADMIN_EMAIL=newemail@empresa.com
```

### Update Sender Info
```bash
supabase secrets set FROM_EMAIL=reports@yourdomain.com
supabase secrets set FROM_NAME="Daily Reports Bot"
```

### Enable Error Alerts to Different Email
```bash
supabase secrets set ERROR_ALERT_EMAIL=alerts@empresa.com
```

### Check Recent Execution
```bash
supabase functions logs daily-restore-report | head -50
```

## ✅ Success Indicators

Your setup is working correctly when:
- ✅ Manual invoke returns `{"success": true}`
- ✅ Email received within 30 seconds
- ✅ Email formatting looks professional
- ✅ All statistics are present and accurate
- ✅ Chart link works when clicked
- ✅ Scheduled execution runs automatically
- ✅ Error alerts received when failures occur
- ✅ SendGrid dashboard shows deliveries

## 🔄 Update Procedure

When updating the function:

1. **Make changes** to `index.ts`
2. **Test locally** if possible
3. **Deploy**: `supabase functions deploy daily-restore-report`
4. **Test**: `supabase functions invoke daily-restore-report --no-verify-jwt`
5. **Monitor**: `supabase functions logs daily-restore-report --follow`
6. **Verify**: Check email received successfully

## 💡 Pro Tips

- Use `ERROR_ALERT_EMAIL` for urgent notifications to on-call team
- Check SendGrid activity dashboard regularly
- Set up SendGrid webhooks for delivery tracking
- Use domain authentication for better deliverability
- Monitor execution time - should be < 5s typically
- Keep FROM_EMAIL and ADMIN_EMAIL different for clarity
- Test error alerts by temporarily setting invalid credentials

---

**Need Help?** See full documentation in [README.md](./README.md) or testing guide in [TESTING.md](./TESTING.md)
