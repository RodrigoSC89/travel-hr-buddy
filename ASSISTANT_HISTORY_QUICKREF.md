# AI Assistant History - Quick Reference

## 🚀 Quick Start

### Access History Page
1. Go to `/admin/assistant`
2. Click "Ver Histórico" button (top-right)
3. View all assistant interactions

### Export to CSV
1. Open history page
2. Apply filters (optional)
3. Click "Exportar CSV"
4. File downloads automatically

## 📋 Key Features

### Automatic Logging
- ✅ Every question → Logged
- ✅ Every answer → Logged
- ✅ User context → Captured
- ✅ Timestamp → Recorded

### Search & Filter
- 🔍 Search by keyword (question or answer)
- 📅 Filter by date range (start/end)
- 🧹 Clear all filters
- 📄 Pagination (10 items/page)

### CSV Export
- 📊 UTF-8 with BOM (Excel compatible)
- 🏷️ Headers: Data/Hora, Pergunta, Resposta, Origem
- 🧹 Clean data (HTML tags removed)
- 📅 Filename with timestamp

## 🔐 Security

### Access Control
- 👤 Users: See own logs only
- 👑 Admins: See all logs
- 🔒 RLS enforced at database level

### Data Logged
- Question text
- Answer text
- User ID
- Origin (default: "assistant")
- Timestamp

## 📁 Key Files

```
Frontend:
├─ src/pages/admin/assistant.tsx          # Main assistant
├─ src/pages/admin/assistant-logs.tsx     # History page
└─ src/App.tsx                             # Routes

Backend:
├─ supabase/functions/assistant-query/index.ts    # Query handler + logging
├─ supabase/functions/assistant-logs/index.ts     # Logs fetcher
└─ supabase/migrations/20251012043900_create_assistant_logs.sql
```

## 🛠️ Functions

### assistant-query
- Handles user questions
- Logs every interaction
- Non-blocking logging

### assistant-logs  
- Admin-only endpoint
- Fetches all logs
- Returns JSON response

## 📊 Database Schema

```sql
assistant_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  origin VARCHAR(50) DEFAULT 'assistant',
  created_at TIMESTAMPTZ DEFAULT NOW()
)

Indexes:
- user_id
- created_at DESC
- origin

RLS Policies:
- Users: SELECT own logs
- Admins: SELECT all logs
- All authenticated: INSERT own logs
```

## 🎯 Usage Examples

### Filter by Date
1. Set "Data Inicial": 2025-10-01
2. Set "Data Final": 2025-10-12
3. Results auto-filter

### Search Keywords
1. Type "checklist" in search
2. Shows only logs with "checklist" in Q or A

### Export Filtered Data
1. Apply filters
2. Click "Exportar CSV"
3. Only filtered data exports

## ⚡ Tips

### For Users
- ✅ Just use assistant normally
- ✅ Everything logs automatically
- ❌ No manual action needed

### For Admins
- 📊 Review logs regularly
- 🔍 Use filters for insights
- 💾 Export for analysis
- 📈 Track usage patterns

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No logs showing | Check admin role in profiles |
| Can't export | Ensure data exists in filtered view |
| Logging not working | Verify user authentication |
| RLS errors | Check policies in Supabase |

## 📞 Support

Check these in order:
1. Browser console (F12)
2. Supabase Edge Function logs
3. Database RLS policies
4. Migration status

## 🔄 Deployment

1. ✅ Run migration
2. ✅ Deploy assistant-query
3. ✅ Deploy assistant-logs
4. ✅ Deploy frontend
5. ✅ Test functionality

## 📝 Notes

- Logging is non-blocking (won't break assistant)
- CSV uses UTF-8 BOM for Excel
- HTML stripped from answers in CSV
- Pagination auto-resets on filter change
- All timestamps in ISO format

## ✨ Status

Build: ✅ PASSING
Tests: ✅ N/A (new feature)
Migration: ✅ INCLUDED
Docs: ✅ COMPLETE
Ready: ✅ YES

---
**Version**: 1.0.0 | **Date**: Oct 12, 2025 | **Status**: Production Ready
