# PR #303 Quick Reference Guide

## 🚀 Access the Feature

**URL**: `/admin/reports/logs`  
**Auth Required**: Admin role  
**Database Table**: `restore_report_logs`

## 📊 Key Features at a Glance

### Status Badges
- 🟢 **Success** - Report sent successfully
- 🔴 **Error** - Failed to send report
- ⚪ **Pending** - Execution pending

### Filters
1. **Status Filter**: All, Success, Error, Pending
2. **Date Range**: Start Date and End Date inputs
3. **Export**: CSV download button

### Log Display
- **Newest First**: Logs ordered by `executed_at DESC`
- **Card Layout**: Each log in a separate card
- **Scrollable**: 600px max height with ScrollArea
- **Details**: Timestamp, status, message, error details (if any)

## 🔧 Technical Quick Start

### Component Location
```
src/pages/admin/reports/RestoreReportLogs.tsx
```

### Test Location
```
src/tests/pages/admin/reports/RestoreReportLogs.test.tsx
```

### Route Definition (App.tsx)
```typescript
const RestoreReportLogs = React.lazy(() => import("./pages/admin/reports/RestoreReportLogs"));
// ...
<Route path="/admin/reports/logs" element={<RestoreReportLogs />} />
```

### Database Schema
```sql
create table restore_report_logs (
  id uuid primary key default gen_random_uuid(),
  executed_at timestamptz default now(),
  status text not null check (status in ('success', 'error', 'pending')),
  message text,
  error_details text,
  triggered_by text default 'automated'
);
```

## 📝 Common Queries

### Last 10 Executions
```sql
SELECT * FROM restore_report_logs
ORDER BY executed_at DESC
LIMIT 10;
```

### Error Logs Only
```sql
SELECT * FROM restore_report_logs
WHERE status = 'error'
ORDER BY executed_at DESC;
```

### Success Rate (Last 30 Days)
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM restore_report_logs
WHERE executed_at > NOW() - INTERVAL '30 days'
GROUP BY status;
```

### Failed Executions with Details
```sql
SELECT 
  executed_at,
  message,
  error_details
FROM restore_report_logs
WHERE status = 'error'
ORDER BY executed_at DESC;
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run only RestoreReportLogs tests
npm test -- RestoreReportLogs

# Run tests in watch mode
npm test -- --watch RestoreReportLogs
```

## 📦 Building

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🔍 Debugging

### Enable Console Logs
The component uses `console.error` for errors which are always visible.

### Check Supabase Connection
```typescript
// In browser console
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase
  .from('restore_report_logs')
  .select('*')
  .limit(5);
console.log({ data, error });
```

### Common Issues

**Issue**: Logs not loading  
**Solution**: Check RLS policies - user must have admin role

**Issue**: CSV export not working  
**Solution**: Check browser console for errors, ensure logs exist

**Issue**: Date filter not working  
**Solution**: Ensure start date is before end date

## 📱 Mobile Responsive

The component is fully responsive:
- **Desktop**: Full-width filters side-by-side
- **Mobile**: Filters stack vertically
- **Tablet**: 2-column grid for filters

## 🎨 Customization

### Change Page Title
Edit line ~202 in `RestoreReportLogs.tsx`:
```typescript
<h1 className="text-3xl font-bold tracking-tight">
  Your Custom Title Here
</h1>
```

### Adjust ScrollArea Height
Edit line ~286 in `RestoreReportLogs.tsx`:
```typescript
<ScrollArea className="h-[600px] pr-4">
```

### Modify Status Colors
Edit the `getStatusBadge` function (~183-196):
```typescript
const statusConfig = {
  success: { label: "🟢 Sucesso", variant: "default" as const },
  error: { label: "🔴 Erro", variant: "destructive" as const },
  pending: { label: "⚪ Pendente", variant: "secondary" as const },
};
```

## 🔐 Security

### RLS Policies
1. **Insert**: Service role only
2. **Select**: Admin users only

### Check User Role
```sql
SELECT role FROM profiles WHERE id = auth.uid();
```

### Grant Admin Access
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## 🚨 Monitoring

### Alert on High Error Rate
```sql
-- Get error rate for last 24 hours
SELECT 
  ROUND(
    COUNT(*) FILTER (WHERE status = 'error') * 100.0 / COUNT(*),
    2
  ) as error_rate
FROM restore_report_logs
WHERE executed_at > NOW() - INTERVAL '24 hours';
```

### Check for Missing Executions
```sql
-- Should have at least 1 execution per day
SELECT 
  DATE(executed_at) as date,
  COUNT(*) as executions
FROM restore_report_logs
WHERE executed_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

## 📚 Related Documentation

- Full Implementation: `PR303_IMPLEMENTATION_SUMMARY.md`
- Restore Report Architecture: `RESTORE_REPORT_LOGS_IMPLEMENTATION.md`
- Edge Function: `supabase/functions/daily-restore-report/index.ts`
- Database Migration: `supabase/migrations/20251011185116_create_restore_report_logs.sql`

## 🆘 Support

For issues or questions:
1. Check the full implementation summary
2. Review test files for expected behavior
3. Check browser console for errors
4. Verify database connection and RLS policies

---

**Last Updated**: October 12, 2025  
**Version**: 1.0.0
