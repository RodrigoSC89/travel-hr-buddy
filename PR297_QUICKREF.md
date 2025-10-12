# Restore Report Logs Page - Quick Reference

## 🚀 Quick Access

**URL**: `/admin/reports/logs`

**Purpose**: View and manage logs from the automated daily restore report function

---

## 📊 Page Overview

The page displays execution logs from the `restore_report_logs` table with:
- 🕐 Execution timestamps
- ✅ Status indicators (success/error/critical)
- 📝 Messages and error details
- 🔍 Filters and search
- 📤 Export capabilities
- 📄 Pagination

---

## 🎯 Quick Actions

### View Recent Logs
1. Navigate to `/admin/reports/logs`
2. Logs are automatically ordered by most recent first
3. Scroll through the list

### Find Errors
1. Type "error" in the Status filter
2. Press Enter or click away
3. Only error/critical logs will show

### Export Data
1. Apply filters as needed (optional)
2. Click **Exportar CSV** or **Exportar PDF**
3. File downloads automatically

### Debug Failed Reports
1. Filter by "error" status
2. Locate the error log
3. Click "Detalhes do Erro" to expand
4. Review error stack trace

---

## 🔍 Filters

| Filter | Type | Purpose |
|--------|------|---------|
| **Status** | Text input | Filter by status (success, error, critical) |
| **Data Inicial** | Date picker | Start of date range |
| **Data Final** | Date picker | End of date range |

**Tip**: Filters auto-reset pagination to page 1

---

## 📈 Summary Cards

| Card | Shows | Color |
|------|-------|-------|
| **Total de Logs** | Count of all filtered logs | Blue |
| **Sucessos** | Count of successful executions | Green |
| **Erros** | Count of errors + critical | Red |

---

## 📤 Export Formats

### CSV Export
- ✅ Excel/Google Sheets compatible
- ✅ Includes all log fields
- ✅ Quotes handled properly
- ✅ Timestamp in filename

### PDF Export
- ✅ Formatted report
- ✅ Includes generation date
- ✅ Shows all log details
- ✅ Multi-page support

---

## 🎨 Status Badges

| Badge | Meaning |
|-------|---------|
| 🟢 **Sucesso** | Report sent successfully |
| 🔴 **Erro** | Failed to send report |
| ⚫ **Crítico** | Critical system error |

---

## 📄 Pagination

- **Default**: 10 logs per page
- **Navigation**: Previous/Next buttons
- **Smart**: Buttons disabled at boundaries
- **Counter**: Shows current page / total pages

---

## 💡 Common Use Cases

### Daily Health Check
```
1. Visit /admin/reports/logs
2. Check summary cards
3. Look for red error count
4. If > 0, investigate errors
```

### Weekly Report
```
1. Set date range (last 7 days)
2. Click "Exportar PDF"
3. Review in weekly meeting
```

### Error Investigation
```
1. Filter status = "error"
2. Sort by most recent
3. Expand error details
4. Export to CSV for team
```

### Monthly Audit
```
1. Set date range (last 30 days)
2. Export to CSV
3. Calculate success rate
4. Report to management
```

---

## 🔧 Troubleshooting

### No logs showing?
- ✅ Check if table exists: `restore_report_logs`
- ✅ Verify RLS policies allow admin access
- ✅ Check if daily function is running

### Can't export?
- ✅ Ensure logs match filters (count > 0)
- ✅ Check browser popup blockers
- ✅ Try different export format

### Date filter not working?
- ✅ Ensure start date ≤ end date
- ✅ Check for date validation error message
- ✅ Clear filters and try again

---

## 🎓 Best Practices

1. **Daily Monitoring**: Check the page daily for errors
2. **Regular Exports**: Export weekly for records
3. **Date Ranges**: Use specific ranges for analysis
4. **Error Details**: Always expand to understand failures
5. **CSV for Analysis**: Use CSV for Excel pivot tables
6. **PDF for Reports**: Use PDF for stakeholder updates

---

## 📱 Related Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Document Restore Logs** | `/admin/documents/restore-logs` | Document version restores |
| **Restore Dashboard** | `/admin/documents/restore-dashboard` | Restore metrics dashboard |
| **Execution Logs** | `/admin/automation/execution-logs` | Automation workflow logs |

---

## 🔐 Access Requirements

- ✅ Must be authenticated user
- ✅ Must have admin role
- ✅ RLS policies must allow access
- ✅ Service role for Edge Function logging

---

## 📞 Support

### Check Function Logs
```bash
supabase functions logs daily-restore-report
```

### Query Database Directly
```sql
SELECT * FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 10;
```

### Verify RLS
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'restore_report_logs';
```

---

## ✅ Implementation Checklist

- [x] Page created at `/admin/reports/logs`
- [x] Route added to App.tsx
- [x] Filters working (status, date range)
- [x] Export functions (CSV, PDF)
- [x] Pagination (10 per page)
- [x] Summary cards
- [x] Error details expansion
- [x] Loading states
- [x] Empty states
- [x] Toast notifications
- [x] Build successful
- [x] Documentation complete

---

## 🎉 Key Features

- 📊 **Real-time monitoring** of automated reports
- 🔍 **Advanced filtering** by status and date
- 📤 **Export capabilities** for analysis and reporting
- 🐛 **Debug support** with expandable error details
- 📈 **Visual metrics** with summary cards
- 🎨 **Beautiful UI** consistent with admin pages

---

**Last Updated**: October 11, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
