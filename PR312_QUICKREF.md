# RestoreReportLogs - Quick Reference Guide

## Overview
Monitoring page for daily restore report email executions at `/admin/reports/logs`.

## Valid Status Values

```
✅ success - Report sent successfully
❌ error   - Error occurred during execution  
⏳ pending - Execution pending/in progress
```

## Database Schema

```sql
CREATE TABLE restore_report_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  message text,
  error_details text,
  triggered_by text DEFAULT 'automated'
);
```

## Usage Examples

### Inserting a Log Entry (Service Role)

```typescript
// Success
await supabase.from("restore_report_logs").insert({
  status: "success",
  message: "Relatório enviado com sucesso",
  triggered_by: "automated"
});

// Error
await supabase.from("restore_report_logs").insert({
  status: "error",
  message: "Falha no envio do e-mail",
  error_details: JSON.stringify(error),
  triggered_by: "automated"
});

// Pending
await supabase.from("restore_report_logs").insert({
  status: "pending",
  message: "Iniciando envio do relatório",
  triggered_by: "manual"
});
```

### Querying Logs (Admin Users)

```typescript
// Get all logs
const { data, error } = await supabase
  .from("restore_report_logs")
  .select("*")
  .order("executed_at", { ascending: false });

// Get only errors
const { data, error } = await supabase
  .from("restore_report_logs")
  .select("*")
  .eq("status", "error")
  .order("executed_at", { ascending: false });

// Get logs in date range
const { data, error } = await supabase
  .from("restore_report_logs")
  .select("*")
  .gte("executed_at", startDate)
  .lte("executed_at", endDate)
  .order("executed_at", { ascending: false });
```

## UI Components

### Status Badges

```tsx
// Success
<Badge className="bg-green-600 hover:bg-green-700">Sucesso</Badge>

// Error  
<Badge variant="destructive">Erro</Badge>

// Pending
<Badge variant="secondary">Pendente</Badge>
```

### Status Icons

```tsx
// Success
<CheckCircle className="h-5 w-5 text-green-600" />

// Error
<XCircle className="h-5 w-5 text-red-600" />

// Pending
<Clock className="h-5 w-5 text-gray-600" />
```

## Features

### 1. Filtering

```typescript
// Status filter
filterStatus: string  // "success", "error", "pending"

// Date range filter
startDate: string     // "2024-01-01"
endDate: string       // "2024-12-31"
```

### 2. Export

```typescript
// CSV Export
exportToCSV()  // Exports filtered logs to CSV file

// PDF Export
exportToPDF()  // Exports filtered logs to PDF file
```

### 3. Pagination

```typescript
page: number          // Current page (starts at 1)
pageSize: number      // Results per page (default: 10)
totalPages: number    // Total pages available
```

## API Endpoints

### Edge Function: daily-restore-report

```bash
# Invoke the function
curl -X POST \
  https://[project-ref].supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer [anon-key]"
```

**Response:**
```json
{
  "success": true,
  "message": "Daily restore report sent successfully",
  "summary": {
    "total": 150,
    "unique_docs": 75,
    "avg_per_day": 5.2
  },
  "dataPoints": 30,
  "emailSent": true,
  "version": "2.0"
}
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run only RestoreReportLogs tests
npm test src/tests/pages/admin/reports/logs.test.tsx

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

```
✓ 16 tests for RestoreReportLogs component
✓ 101 total tests in project
✓ All RestoreReportLogs tests passing
```

## Common Issues

### Issue: Invalid status value
**Error:** `new row for relation "restore_report_logs" violates check constraint`

**Solution:** Only use valid status values: `success`, `error`, `pending`

```typescript
// ❌ Wrong
await supabase.from("restore_report_logs").insert({
  status: "critical"  // Invalid!
});

// ✅ Correct
await supabase.from("restore_report_logs").insert({
  status: "error"     // Valid
});
```

### Issue: Logs not visible
**Cause:** User doesn't have admin role

**Solution:** Ensure user has `role = 'admin'` in profiles table

```sql
-- Check user role
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- Update user role (if needed)
UPDATE profiles SET role = 'admin' WHERE id = '[user-id]';
```

### Issue: Date range error
**Error:** "A data inicial não pode ser posterior à data final"

**Solution:** Ensure start date is before or equal to end date

```typescript
// ❌ Wrong
startDate: "2024-12-31"
endDate: "2024-01-01"

// ✅ Correct
startDate: "2024-01-01"
endDate: "2024-12-31"
```

## Performance Tips

1. **Use indexes:** Logs are indexed on `executed_at DESC` and `status`
2. **Filter data:** Use status and date filters to reduce result set
3. **Pagination:** Results are paginated (10 per page) for better performance
4. **Export limits:** Be mindful of export size with large datasets

## Security

- ✅ RLS enabled on table
- ✅ Service role required for inserts
- ✅ Admin role required for reads
- ✅ No sensitive data in error messages
- ✅ CHECK constraint prevents invalid data

## Maintenance

### Clean old logs (optional)

```sql
-- Delete logs older than 90 days
DELETE FROM restore_report_logs 
WHERE executed_at < NOW() - INTERVAL '90 days';
```

### Monitor success rate

```sql
-- Get success rate for last 30 days
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM restore_report_logs
WHERE executed_at > NOW() - INTERVAL '30 days'
GROUP BY status;
```

## Resources

- **Component:** `src/pages/admin/reports/logs.tsx`
- **Tests:** `src/tests/pages/admin/reports/logs.test.tsx`
- **Migration:** `supabase/migrations/20251011185116_create_restore_report_logs.sql`
- **Function:** `supabase/functions/daily-restore-report/index.ts`
- **Route:** `/admin/reports/logs`

---

**Last Updated:** 2025-10-12
**Version:** 1.0
