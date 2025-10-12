# 🚀 Assistant Report Logs - Quick Reference

## 📋 What is it?
Tracks when the AI Assistant sends reports to users via email or other channels.

## 🎯 Key Features
- ✅ Track report sending status (success, error, pending)
- ✅ Filter by date range and user email
- ✅ Admin-only access to all logs
- ✅ Export to CSV and PDF
- ✅ Real-time log viewing

## 📍 Locations

### Admin Page
**URL:** `/admin/reports/assistant`

**Access:** Admin only

### API Endpoints

1. **Supabase Edge Function** (Active)
   - `GET /functions/v1/assistant-report-logs`
   - Query params: `start`, `end`, `email`

2. **Next.js App Router** (Reference)
   - `GET /api/report/assistant-logs`
   - Query params: `start`, `end`, `email`

## 📊 Database Table

```sql
assistant_report_logs
├─ id (UUID)
├─ user_email (TEXT) ← Recipient email
├─ status (TEXT) ← 'success' | 'error' | 'pending'
├─ message (TEXT) ← Status message
├─ sent_at (TIMESTAMP) ← When report was sent
├─ user_id (UUID) ← User who received report
├─ report_type (TEXT) ← Type of report
└─ metadata (JSONB) ← Additional data
```

## 🔐 Security

| Role | Permissions |
|------|-------------|
| User | View own logs only |
| Admin | View all logs, filter by email |
| System | Insert logs for automated reports |

## 📤 Export Formats

### CSV Export
```csv
Data,Usuário,Status,Mensagem
12/10/2025 19:00:00,user@example.com,success,Report sent
```

### PDF Export
- Formatted table with headers
- Localized date/time
- Status indicators
- Professional layout

## 💻 Quick Start

### Fetch Logs
```typescript
const { data: { session } } = await supabase.auth.getSession();

const params = new URLSearchParams({
  start: '2025-10-01',
  end: '2025-10-12',
  email: 'user@example.com' // admin only
});

const response = await fetch(
  `${SUPABASE_URL}/functions/v1/assistant-report-logs?${params}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  }
);

const logs = await response.json();
```

### Log a Report Send
```typescript
await supabase.from('assistant_report_logs').insert({
  user_email: 'recipient@example.com',
  status: 'success',
  message: 'Daily report sent',
  report_type: 'daily_summary',
  user_id: userId
});
```

## 🎨 UI Components

### Page Layout
```
┌─────────────────────────────────────────┐
│ 📬 Logs de Envio de Relatórios         │
├─────────────────────────────────────────┤
│ [Date] [Date] [Email] [🔍 Buscar]      │
│ [📤 CSV] [📄 PDF]                       │
├─────────────────────────────────────────┤
│ ╭───────────────────────────────────╮  │
│ │ 📅 12/10/2025 19:00:00           │  │
│ │ 👤 user@example.com               │  │
│ │ 📦 success                        │  │
│ │ 💬 Report sent successfully       │  │
│ ╰───────────────────────────────────╯  │
│ ╭───────────────────────────────────╮  │
│ │ 📅 12/10/2025 18:00:00           │  │
│ │ 👤 admin@example.com              │  │
│ │ 📦 error                          │  │
│ │ 💬 Failed to send email           │  │
│ ╰───────────────────────────────────╯  │
└─────────────────────────────────────────┘
```

### Status Badges
- 🟢 **Success** - Green badge
- 🔴 **Error** - Red badge
- 🟡 **Pending** - Yellow badge

## 📝 Log Entry Fields

| Field | Description | Required |
|-------|-------------|----------|
| `user_email` | Recipient email | ✅ |
| `status` | Send status | ✅ |
| `message` | Status message | ❌ |
| `sent_at` | Timestamp | ✅ (auto) |
| `user_id` | User ID | ❌ |
| `report_type` | Type of report | ❌ |
| `metadata` | Extra data | ❌ |

## 🛠️ Common Tasks

### View Recent Logs
```typescript
// Last 7 days
const today = new Date();
const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

const params = new URLSearchParams({
  start: weekAgo.toISOString().split('T')[0],
  end: today.toISOString().split('T')[0]
});
```

### Filter by Status (Client-side)
```typescript
const successLogs = logs.filter(log => log.status === 'success');
const errorLogs = logs.filter(log => log.status === 'error');
```

### Export to PDF
```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const doc = new jsPDF();
doc.text('📬 Logs de Envio', 14, 16);
autoTable(doc, {
  startY: 24,
  head: [['Data', 'Usuário', 'Status', 'Mensagem']],
  body: logs.map(log => [
    new Date(log.sent_at).toLocaleString(),
    log.user_email,
    log.status,
    log.message || '-'
  ])
});
doc.save('logs-assistente.pdf');
```

## 🔗 Related Files

```
📁 Project Root
├─ 📁 supabase/
│  ├─ 📁 functions/
│  │  └─ 📁 assistant-report-logs/
│  │     └─ index.ts ← Edge Function
│  └─ 📁 migrations/
│     └─ 20251012190000_create_assistant_report_logs.sql
├─ 📁 app/api/report/assistant-logs/
│  ├─ route.ts ← Next.js Route (Reference)
│  └─ README.md
└─ 📁 src/pages/admin/reports/
   └─ assistant.tsx ← Admin Page
```

## ⚡ Performance Tips

1. **Use date filters** to limit results
2. **Limit to 1000 logs** per request
3. **Client-side filtering** for small datasets
4. **Server-side pagination** for large datasets

## 🐛 Troubleshooting

### "Unauthorized" Error
- ✅ Check session is valid
- ✅ Verify Authorization header
- ✅ Confirm user is authenticated

### Empty Results
- ✅ Check date range filters
- ✅ Verify user has permission
- ✅ Confirm logs exist in database

### Export Not Working
- ✅ Check logs array is not empty
- ✅ Verify jsPDF is installed
- ✅ Check browser console for errors

## 📚 Learn More

- [Full API Documentation](./README.md)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
