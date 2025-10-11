# Restore Report Logs - Quick Reference

## 🚀 Quick Access

**URL**: `/admin/reports/logs`

**Permission**: Admin only

## 📊 What It Shows

Logs of daily restore report email executions:
- ✅ When emails were sent
- ✅ Success/failure status
- ✅ Error messages (if any)
- ✅ Detailed error info

## 🎯 Quick Actions

### View All Logs
```
Navigate to: /admin/reports/logs
→ Newest logs appear first
```

### Filter by Status
```
Type in Status field: "success" or "error"
→ Results update automatically
```

### Filter by Date
```
Select Start Date: YYYY-MM-DD
Select End Date: YYYY-MM-DD
→ Shows logs in range
```

### Export to CSV
```
1. Apply filters (optional)
2. Click "📤 Exportar CSV"
3. File downloads: restore-report-logs-YYYY-MM-DD.csv
```

## 📋 Log Entry Format

```
┌────────────────────────────────────┐
│ 11/10/2025 10:30      [SUCCESS] ✅│
│ 📝 Report sent successfully        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 10/10/2025 10:30      [ERROR] ❌  │
│ 📝 Failed to send report           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Error: SMTP connection timeout     │
└────────────────────────────────────┘
```

## 🎨 Status Badge Colors

| Status  | Color | Badge |
|---------|-------|-------|
| Success | 🟢 Green | SUCCESS |
| Error   | 🔴 Red | ERROR |
| Pending | ⚪ White | PENDING |

## 💾 Database Table

```sql
restore_report_logs
├── id (UUID)
├── executed_at (timestamp)
├── status (success/error/pending)
├── message (text)
└── error_details (text)
```

## 🔐 Security

- ✅ RLS enabled
- ✅ Admin role required
- ✅ Service role for logging

## 🧪 Testing

```bash
# Run tests
npm test RestoreReportLogs

# All 7 tests should pass:
✓ Page rendering
✓ Filter inputs present
✓ Loading state
✓ Empty state
✓ Export button disabled when empty
✓ Status filter works
✓ Date filter works
```

## 🛠️ How Logging Works

### 1. Daily Report Runs
```
Edge Function: daily-restore-report
↓
Sends email
↓
Logs result to restore_report_logs
```

### 2. Success Log
```typescript
{
  status: "success",
  message: "Relatório enviado com sucesso",
  error_details: null
}
```

### 3. Error Log
```typescript
{
  status: "error",
  message: "Erro ao enviar relatório",
  error_details: "SMTP timeout: 5000ms"
}
```

## 📁 File Locations

```
Component:
  src/pages/admin/reports/RestoreReportLogs.tsx

Tests:
  src/tests/pages/admin/reports/RestoreReportLogs.test.tsx

Migration:
  supabase/migrations/20251011220000_create_restore_report_logs.sql

Route:
  src/App.tsx (line ~133)
```

## ⚡ Performance Tips

### Fast Queries
- Uses indexes on `executed_at` and `status`
- Ordered DESC by default (newest first)

### Memory Efficient
- CSV export cleans up blob URLs
- No memory leaks

### User Feedback
- Loading spinner during fetch
- Toast notifications for errors
- Disabled buttons when no data

## 🐛 Common Issues

### No Logs Showing
```
Check:
1. User has admin role?
2. RLS policy correct?
3. Console errors?
```

### Filters Not Working
```
Try:
1. Clear all filters
2. Use exact status: "success" or "error"
3. Date format: YYYY-MM-DD
```

### Export Not Working
```
Check:
1. Logs array not empty?
2. Browser allows downloads?
3. Console for errors?
```

## 📞 Support Checklist

Before asking for help:
- [ ] Check console for errors
- [ ] Verify admin role
- [ ] Check Supabase logs
- [ ] Review Edge Function logs
- [ ] Run tests locally

## 🎓 Learn More

- [Full Implementation Guide](./RESTORE_REPORT_LOGS_GUIDE.md)
- [Daily Report Architecture](./DAILY_RESTORE_REPORT_ARCHITECTURE.md)
- [Daily Report Quick Ref](./DAILY_RESTORE_REPORT_QUICKREF.md)

## 💡 Pro Tips

1. **Regular Monitoring**: Check logs weekly
2. **Error Patterns**: Look for recurring errors
3. **Peak Times**: Note when failures occur
4. **Export History**: Keep CSV backups monthly
5. **Clean Old Logs**: Archive logs older than 90 days

## 📈 Success Metrics

| Metric | Target | Monitor |
|--------|--------|---------|
| Success Rate | >95% | Weekly |
| Error Rate | <5% | Weekly |
| Response Time | <2s | Daily |
| Log Retention | 90 days | Monthly |

---

**Last Updated**: October 11, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
