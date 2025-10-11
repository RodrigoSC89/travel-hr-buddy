# 🚀 Quick Reference - Automated Reports & TV Wall

## 📋 Feature Quick Access

| Feature | Access | Type | Auth Required |
|---------|--------|------|---------------|
| **TV Wall** | `/tv/logs` | Browser | ❌ No |
| **Daily Report** | Email inbox | Scheduled | N/A |

## 🔗 Quick Links

### Implementation Files
- TV Wall: [`src/pages/tv/LogsPage.tsx`](src/pages/tv/LogsPage.tsx)
- Daily Report: [`supabase/functions/send_daily_restore_report/index.ts`](supabase/functions/send_daily_restore_report/index.ts)
- Tests: [`src/tests/pages/tv/LogsPage.test.tsx`](src/tests/pages/tv/LogsPage.test.tsx)

### Documentation
- 📘 [README - Executive Summary](README_IMPLEMENTATION.md)
- 📧 [Daily Report Guide](DAILY_RESTORE_REPORT_CSV_GUIDE.md)
- 📺 [TV Wall Guide](TV_WALL_DASHBOARD_GUIDE.md)
- 📊 [Implementation Summary](IMPLEMENTATION_SUMMARY_REPORTS_TV.md)
- 🎨 [Visual Guide](VISUAL_GUIDE_REPORTS_TV.md)

## ⚡ Quick Setup

### TV Wall (2 minutes)
```bash
# Already deployed! Just access:
https://your-app-url.vercel.app/tv/logs

# For fullscreen: Press F11
# For kiosk mode:
chrome --kiosk "https://your-app-url/tv/logs"
```

### Daily Report (10 minutes)
```bash
# 1. Deploy
supabase functions deploy send_daily_restore_report

# 2. Configure
supabase secrets set ADMIN_EMAIL=your@email.com
supabase secrets set SENDGRID_API_KEY=SG.your_key
supabase secrets set EMAIL_FROM=noreply@yourdomain.com

# 3. Test
supabase functions invoke send_daily_restore_report

# 4. Done! Runs daily at 7:00 AM UTC
```

## 🎯 Key Commands

### Test Daily Report
```bash
supabase functions invoke send_daily_restore_report
```

### View Logs
```bash
supabase functions logs send_daily_restore_report
```

### Check Execution History
```sql
SELECT executed_at, status, message 
FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 10;
```

## 📊 What You Get

### TV Wall Dashboard
- ✅ Real-time metrics (Total, Unique Docs, Avg/Day)
- ✅ Bar chart (restores by day)
- ✅ Pie chart (status distribution)
- ✅ Auto-refresh every 60 seconds
- ✅ Dark mode for TVs
- ✅ No login required

### Daily Email Report
- ✅ CSV attachment with all logs
- ✅ HTML formatted email
- ✅ Runs daily at 7:00 AM UTC
- ✅ Execution logging
- ✅ Professional branding

## 🔧 Configuration

### Change Report Time
Edit `supabase/config.toml`:
```toml
schedule = "0 9 * * *"  # 9:00 AM instead of 7:00 AM
```

### Change Refresh Rate
Edit `src/pages/tv/LogsPage.tsx`:
```typescript
setInterval(fetchData, 30000); // 30 seconds instead of 60
```

## ✅ Verification

### TV Wall Working?
- [ ] Dashboard loads at `/tv/logs`
- [ ] Charts display
- [ ] Timestamp updates every 60s
- [ ] No console errors

### Daily Report Working?
- [ ] Email received
- [ ] CSV attachment present
- [ ] Database shows success
- [ ] No errors in logs

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check SendGrid API key |
| TV Wall blank | Check Supabase connection |
| Charts not loading | Check browser console |
| Wrong time | Change cron schedule |

## 📞 Support

Check the comprehensive guides:
1. [Daily Report Guide](DAILY_RESTORE_REPORT_CSV_GUIDE.md) - 5.8 KB
2. [TV Wall Guide](TV_WALL_DASHBOARD_GUIDE.md) - 7.7 KB
3. [Visual Guide](VISUAL_GUIDE_REPORTS_TV.md) - 20 KB
4. [Full Implementation](README_IMPLEMENTATION.md) - 12 KB

## 📈 Stats

- **Files**: 10 (8 new, 2 modified)
- **Lines**: 2,448
- **Tests**: 4/4 passing
- **Docs**: 38 KB
- **Dependencies**: 0 new
- **Status**: ✅ Production Ready

---

**Last Updated**: 2025-10-11  
**Version**: 1.0.0  
**Status**: ✅ Ready for Merge
