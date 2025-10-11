# Restore Report Logs - Quick Reference

## 🚀 Quick Start

### 1. Apply Migration
```bash
supabase db push
```

### 2. Deploy Function
```bash
supabase functions deploy daily-restore-report
```

### 3. Test It
```bash
curl -X POST https://your-project.supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 4. Check Logs
```sql
SELECT * FROM restore_report_logs ORDER BY executed_at DESC LIMIT 5;
```

---

## 📊 Log Statuses

| Status | When | Message |
|--------|------|---------|
| `success` | Email sent | "Relatório enviado com sucesso." |
| `error` | Data fetch failed | "Failed to fetch restore data" |
| `error` | Email failed | "Falha no envio do e-mail" |
| `error` | Unhandled error | "Erro crítico na função" |
| `pending` | Reserved | Not currently used |

---

## 🗄️ Table Schema

```sql
restore_report_logs (
  id uuid PRIMARY KEY,
  executed_at timestamptz DEFAULT now(),
  status text NOT NULL,
  message text,
  error_details text,
  triggered_by text DEFAULT 'automated'
)
```

---

## 🔍 Common Queries

### View Last 10 Runs
```sql
SELECT executed_at, status, message 
FROM restore_report_logs 
ORDER BY executed_at DESC 
LIMIT 10;
```

### Success Rate
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as success,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / COUNT(*), 2) as rate
FROM restore_report_logs;
```

### View Errors
```sql
SELECT executed_at, message, error_details 
FROM restore_report_logs 
WHERE status = 'error'
ORDER BY executed_at DESC;
```

### Daily Success Rate (Last 7 Days)
```sql
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as runs,
  COUNT(*) FILTER (WHERE status = 'success') as success
FROM restore_report_logs
WHERE executed_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

---

## 📁 Files Changed

1. `supabase/migrations/20251011185116_create_restore_report_logs.sql` - Migration
2. `supabase/functions/daily-restore-report/index.ts` - Edge Function
3. `src/pages/admin/reports/RestoreReportLogs.tsx` - Admin UI Page
4. `src/App.tsx` - Route Configuration

---

## 🔒 Security

- **RLS**: Enabled
- **Insert**: Service role only (Edge Function)
- **Select**: Admin users only (`profiles.role = 'admin'`)

---

## ✅ Implementation Checklist

- [x] Migration file created
- [x] Edge Function updated with logging
- [x] Admin UI page created at /admin/reports/logs
- [x] Route added to App.tsx
- [x] Tests created and passing (7 tests)
- [ ] Migration applied to database
- [ ] Function deployed to Supabase
- [ ] First test execution completed
- [ ] Logs verified in database and UI

---

## 🐛 Troubleshooting

### No logs appearing?
```sql
-- Check if table exists
SELECT * FROM information_schema.tables WHERE table_name = 'restore_report_logs';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'restore_report_logs';
```

### Can't view logs?
- Ensure your user has `role = 'admin'` in the `profiles` table
- Try using service role key for testing

### Function not logging?
- Check function deployment: `supabase functions list`
- View function logs: `supabase functions logs daily-restore-report`
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set

---

## 📞 Support

For issues or questions:
1. Check function logs: `supabase functions logs daily-restore-report`
2. Query error logs: `SELECT * FROM restore_report_logs WHERE status = 'error'`
3. Review documentation: `/supabase/functions/daily-restore-report/README.md`
4. Access admin UI: `/admin/reports/logs`

---

## 🎯 Key Features

- ✅ Automatic logging at all execution points
- ✅ Error details captured as JSON
- ✅ RLS for security
- ✅ Indexed for performance
- ✅ Non-blocking (logging failures don't break main flow)
- ✅ Portuguese messages as specified
- ✅ Admin-only viewing
- ✅ Service role insertion
