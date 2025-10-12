# Assistant Logs Quick Reference

## Quick Start

### 1. Enable Logging (Already Done)
✅ Database migration created
✅ API automatically logs interactions
✅ UI available at `/admin/assistant/logs`

### 2. View Logs
```
Navigate to: /admin/assistant
Click: "Ver Histórico" button
```

### 3. Filter Logs
- **Keyword**: Type in search box
- **Dates**: Select start/end dates
- **Clear**: Click "Limpar Filtros"

### 4. Export Data
```
Click: "Exportar CSV" button
Result: Downloads .csv file with timestamp
```

## Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251012043900_create_assistant_logs.sql` | Database schema |
| `pages/api/assistant-query.ts` | API with logging |
| `src/pages/admin/assistant-logs.tsx` | Logs viewer UI |
| `src/pages/admin/assistant.tsx` | History button |
| `src/tests/pages/admin/assistant-logs.test.tsx` | Tests |

## Database Schema

```sql
assistant_logs (
  id UUID,
  user_id UUID,
  question TEXT,
  answer TEXT,
  origin VARCHAR(50),
  created_at TIMESTAMPTZ
)
```

## API Logging

Every assistant interaction is automatically logged:
```typescript
// Happens automatically in /api/assistant-query
await logAssistantInteraction(userId, question, answer);
```

## RLS Policies

1. ✅ Users see only their logs
2. ✅ Admins see all logs
3. ✅ Users can insert their logs

## Features

### Filtering
- ✅ Keyword search (questions + answers)
- ✅ Date range (start + end)
- ✅ Clear filters button

### Display
- ✅ Card-based layout
- ✅ User/Bot avatars
- ✅ Formatted timestamps
- ✅ Pagination (10 per page)

### Export
- ✅ CSV format
- ✅ UTF-8 BOM (Excel compatible)
- ✅ Character escaping
- ✅ HTML tag removal

## Testing

```bash
npm test
# All 139 tests passing ✅
# Including 6 new assistant-logs tests
```

## Build

```bash
npm run build
# ✅ Build successful (39.2s)
# ✅ Zero TypeScript errors
```

## Common Queries

### Get user's logs
```typescript
const { data } = await supabase
  .from("assistant_logs")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });
```

### Get all logs (admin)
```typescript
const { data } = await supabase
  .from("assistant_logs")
  .select("*")
  .order("created_at", { ascending: false });
```

### Filter by date range
```typescript
const { data } = await supabase
  .from("assistant_logs")
  .select("*")
  .gte("created_at", startDate)
  .lte("created_at", endDate);
```

## Troubleshooting

### Logs not appearing?
1. Check RLS policies are enabled
2. Verify user authentication
3. Check Supabase connection

### Export not working?
1. Ensure data is loaded
2. Check browser download permissions
3. Verify CSV format in console

### Filters not applying?
1. Check filter state in React DevTools
2. Verify date format (YYYY-MM-DD)
3. Clear filters and try again

## Security

- 🔒 JWT token required
- 🔒 RLS enforces access control
- 🔒 XSS prevention in export
- 🔒 User data isolation

## Performance

- ⚡ Database indexes on key columns
- ⚡ Pagination limits data load
- ⚡ Client-side filtering
- ⚡ Lazy component loading
- ⚡ Non-blocking API logging
