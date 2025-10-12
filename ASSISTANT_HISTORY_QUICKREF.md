# Assistant History - Quick Reference

## 🚀 Quick Start

### For Users
1. Ask questions in `/admin/assistant`
2. All interactions are automatically logged
3. No action needed from users

### For Admins
1. Click **"Ver Histórico"** button on assistant page
2. View all logged interactions
3. Search/filter as needed
4. Export to CSV if needed

## 📁 File Locations

```
Database:
  supabase/migrations/20251012053000_create_assistant_logs.sql

Backend:
  supabase/functions/assistant-logs/index.ts       (NEW)
  supabase/functions/assistant-query/index.ts      (ENHANCED)

Frontend:
  src/pages/admin/assistant-history.tsx            (NEW)
  src/pages/admin/assistant.tsx                     (ENHANCED)
  src/App.tsx                                       (ENHANCED)
```

## 🔑 Key Features

### Automatic Logging
✅ Every question logged
✅ Every answer logged
✅ User tracking (ID + email)
✅ Action type recorded
✅ Navigation target captured
✅ Timestamp included

### History Viewing
✅ Admin-only access
✅ Card-based display
✅ Real-time search/filter
✅ Sort by date (newest first)
✅ Empty/loading/error states

### CSV Export
✅ One-click download
✅ Proper escaping
✅ HTML stripped from answers
✅ UTF-8 BOM for Excel
✅ Date in filename

## 🗄️ Database Schema

**Table:** `assistant_logs`

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | UUID         | Primary key                    |
| user_id     | UUID         | Foreign key to auth.users      |
| user_email  | TEXT         | User's email address           |
| question    | TEXT         | User's question                |
| answer      | TEXT         | Assistant's response           |
| action      | TEXT         | Action type (navigation, etc.) |
| target      | TEXT         | Target URL for navigation      |
| created_at  | TIMESTAMPTZ  | Timestamp                      |

**Indexes:**
- `idx_assistant_logs_user_id`
- `idx_assistant_logs_created_at`
- `idx_assistant_logs_user_email`

## 🔐 Security (RLS Policies)

1. **Admin Access**: Admins can view all logs
2. **User Access**: Users can view only their own logs
3. **Insert Access**: All authenticated users can insert logs

## 🛠️ API Endpoints

### Fetch History (Admin Only)
```typescript
const { data, error } = await supabase.functions.invoke("assistant-logs");

// Response:
// {
//   logs: AssistantLog[],
//   total: number
// }
```

### Log Query (Automatic)
```typescript
// Called internally by assistant-query function
await logQuery(
  supabase,
  userId,
  userEmail,
  question,
  answer,
  action,
  target
);
```

## 🎨 UI Components

### AssistantPage
- Location: `/admin/assistant`
- New Button: "Ver Histórico"
- Action: Navigates to history page

### AssistantHistoryPage
- Location: `/admin/assistant/history`
- Search Bar: Filter logs
- Export Button: Download CSV
- Back Button: Return to assistant

## 📊 Log Entry Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_email": "admin@example.com",
  "question": "criar checklist",
  "answer": "✅ Navegando para a página de criação de checklists...",
  "action": "navigation",
  "target": "/admin/checklists",
  "created_at": "2025-10-12T05:30:00.000Z"
}
```

## 🔍 Search/Filter

**Searches Across:**
- Question text
- Answer text
- User email

**How to Use:**
1. Type in search box
2. Results filter automatically
3. Case-insensitive matching
4. Clear search to see all

## 📥 CSV Export Format

```csv
Data/Hora,Usuário,Pergunta,Resposta,Ação,Destino
"12/10/2025 05:30:00","admin@example.com","criar checklist","Navegando para...","navigation","/admin/checklists"
```

**Features:**
- UTF-8 BOM for Excel compatibility
- Proper quote escaping
- HTML tags stripped
- Commas and newlines handled

## 🚦 Action Types

| Action       | Description                      |
|--------------|----------------------------------|
| `navigation` | Navigate to internal route       |
| `query`      | Database query (tasks, docs)     |
| `info`       | Informational response           |
| `action`     | Action instruction               |
| `error`      | Error occurred                   |

## 🎯 Common Use Cases

### 1. View All Logs
1. Navigate to `/admin/assistant/history`
2. Scroll through card list
3. See all interactions

### 2. Find User Activity
1. Enter user email in search
2. See all their interactions
3. Export if needed

### 3. Track Popular Questions
1. View all logs
2. Look for patterns
3. Export for analysis

### 4. Audit Trail
1. Filter by date range (future feature)
2. Export to CSV
3. Archive for compliance

## ⚡ Performance Tips

- Logs are fetched once and cached
- Search happens client-side (fast)
- Indexes optimize database queries
- Lazy loading reduces initial load

## 🐛 Troubleshooting

### No Logs Showing
1. Check if RLS policies are enabled
2. Verify user is admin
3. Check browser console for errors
4. Refresh the page

### Can't Export CSV
1. Check if logs array is populated
2. Look for JavaScript errors in console
3. Verify browser allows downloads

### 403 Forbidden
1. Ensure user is authenticated
2. Check user role is 'admin' in profiles table
3. Verify Authorization header is sent

### Logs Not Being Created
1. Check assistant-query function logs
2. Verify database table exists
3. Check RLS insert policy
4. Review function deployment

## 📝 Code Snippets

### Check User's Logs (SQL)
```sql
SELECT * FROM assistant_logs
WHERE user_email = 'user@example.com'
ORDER BY created_at DESC;
```

### Count Total Logs (SQL)
```sql
SELECT COUNT(*) FROM assistant_logs;
```

### View Recent Logs (SQL)
```sql
SELECT * FROM assistant_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Delete Old Logs (SQL)
```sql
DELETE FROM assistant_logs
WHERE created_at < NOW() - INTERVAL '6 months';
```

## 🎓 Best Practices

1. **Regular Exports**: Export logs monthly for backup
2. **Monitor Growth**: Check table size regularly
3. **Archive Old Data**: Remove logs older than 6 months
4. **Review Patterns**: Analyze common questions
5. **Security Audit**: Review access logs periodically

## 📞 Support

**Documentation:**
- Full Implementation Guide: `ASSISTANT_HISTORY_IMPLEMENTATION.md`
- Visual Guide: `ASSISTANT_HISTORY_VISUAL_GUIDE.md`

**Database:**
- Migration: `supabase/migrations/20251012053000_create_assistant_logs.sql`

**Code:**
- Backend: `supabase/functions/assistant-logs/`
- Backend: `supabase/functions/assistant-query/`
- Frontend: `src/pages/admin/assistant-history.tsx`

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-12  
**Status:** ✅ Implemented and Tested
