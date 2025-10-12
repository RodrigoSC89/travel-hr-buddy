# AI Assistant History - Quick Reference Guide

## 🚀 Quick Start

### For End Users
1. Navigate to `/admin/assistant`
2. Use the assistant normally - all interactions are automatically logged
3. No action required on your part!

### For Administrators
1. Navigate to `/admin/assistant`
2. Click the **"Ver Histórico"** button in the header
3. View all assistant interactions across the system

## 🔍 Using the History Page

### Search & Filter
- **Keyword Search**: Type in the search box to filter by question or answer content
- **Date Range**: Set start and end dates to filter by time period
- **Clear Filters**: Click "Limpar Filtros" to reset all filters

### Pagination
- View 10 interactions per page
- Use "Anterior" and "Próxima" buttons to navigate

### Export Data
- Click **"Exportar CSV"** to download all filtered logs
- File format: `assistant-logs-YYYY-MM-DD-HHmmss.csv`
- UTF-8 encoded for Excel compatibility

## 📊 What's Logged?

Each interaction captures:
- **Question**: What the user asked
- **Answer**: What the assistant responded
- **User**: Who asked (email for admins, "Anônimo" for others)
- **Timestamp**: When the interaction occurred
- **Origin**: Where it came from (currently always "assistant")

## 🔒 Security & Privacy

### Access Control
- **Regular Users**: Can only see their own logs
- **Administrators**: Can see all logs from all users

### Data Storage
- Logs stored in `assistant_logs` table
- Protected by Row Level Security (RLS)
- User context automatically captured
- Foreign key cascade delete on user removal

## 🎯 Common Use Cases

### Track Usage Patterns
```
Filter by date range → See trends over time
```

### Audit User Activity
```
Search by specific user → Review their questions
```

### Improve Assistant
```
Search for specific keywords → Identify common questions
```

### Export for Analysis
```
Export CSV → Analyze in Excel/Google Sheets
```

## 🛠️ Technical Details

### API Endpoints

#### Query the Assistant
```typescript
const { data, error } = await supabase.functions.invoke("assistant-query", {
  body: { question: "criar checklist" }
});
```

#### Fetch Logs (Admin Only)
```typescript
const { data, error } = await supabase.functions.invoke("assistant-logs", {
  method: "GET"
});
```

### Database Schema
```sql
TABLE assistant_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  origin VARCHAR(50) DEFAULT 'assistant',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Response Format
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "question": "criar checklist",
  "answer": "✅ Navegando para...",
  "origin": "assistant",
  "created_at": "2025-10-12T14:30:00Z",
  "user_email": "user@example.com"
}
```

## 🐛 Troubleshooting

### No logs appearing?
- ✅ Check if user is authenticated
- ✅ Verify Edge Functions are deployed
- ✅ Check browser console for errors

### Cannot export CSV?
- ✅ Ensure there are logs to export
- ✅ Check browser allows downloads
- ✅ Try clearing filters

### Wrong permissions?
- ✅ Regular users see only their own logs
- ✅ Admin users see all logs
- ✅ Check user role in profiles table

## 📈 Performance

- **Query Limit**: 1000 most recent logs
- **Indexes**: Optimized on user_id, created_at, origin
- **Non-blocking**: Logging doesn't slow down assistant responses
- **Caching**: Frontend handles filtering client-side for instant results

## 🔮 Future Enhancements

Planned features:
- Real-time log updates via WebSocket
- Analytics dashboard with charts
- Question clustering and insights
- Response quality metrics
- Advanced filtering options

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your user role (admin/user)
3. Review Edge Function logs in Supabase dashboard
4. Contact system administrator

---

**Last Updated**: October 12, 2025
**Version**: 1.0.0
