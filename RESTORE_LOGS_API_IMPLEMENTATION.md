# Restore Logs Page - API Implementation with Real Database Queries

## 📋 Overview

This implementation adds **real-time database queries** to the AI Assistant API, replacing simulated responses with actual data from the Supabase database.

## ✅ Changes Implemented

### 1. Supabase Edge Function (`supabase/functions/assistant-query/index.ts`)

#### Real Database Queries Added:

**A) Pending Tasks Query**
- **Trigger phrases**: "quantas tarefas", "tarefas pendentes"
- **Database**: `checklist_items` table
- **Query**: Count items where `completed = false`
- **Response format**: `📋 Você tem {count} tarefas pendentes.`

```typescript
if (lower.includes("quantas tarefas") || lower.includes("tarefas pendentes")) {
  const { count, error } = await supabase
    .from("checklist_items")
    .select("*", { count: "exact", head: true })
    .eq("completed", false);

  return { answer: `📋 Você tem ${count || 0} tarefas pendentes.` };
}
```

**B) Recent Documents Query**
- **Trigger phrases**: "documentos recentes", "últimos documentos"
- **Database**: `documents` table
- **Query**: Select latest 5 documents ordered by `created_at` DESC
- **Response format**: List with title and date (formatted in pt-BR)

```typescript
if (lower.includes("documentos recentes") || lower.includes("últimos documentos")) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const list = data
    .map((doc) => `📄 ${doc.title} — ${new Date(doc.created_at).toLocaleDateString("pt-BR")}`)
    .join("\n");

  return { answer: `📑 Últimos documentos:\n${list}` };
}
```

### 2. Request Flow

```
User Question
    ↓
1. Check for "quantas tarefas" or "tarefas pendentes"
    → Query checklist_items table
    ↓
2. Check for "documentos recentes" or "últimos documentos"  
    → Query documents table
    ↓
3. Check predefined command patterns
    → Return navigation/action
    ↓
4. Fallback to OpenAI GPT-4
    → Generate intelligent response
    ↓
5. Final fallback (no OpenAI key)
    → Return help message
```

### 3. Database Schema Reference

**checklist_items table:**
```sql
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY,
  checklist_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  ...
);
```

**documents table:**
```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ...
);
```

### 4. Error Handling

Both queries include proper error handling:
- Database errors return user-friendly messages
- Empty results are handled gracefully
- Supabase client uses authorization headers from the request

### 5. Updated Command Patterns

Removed hardcoded entries for:
- ❌ `"tarefas pendentes"` - Now uses real database query
- ❌ `"tarefas"` - Now uses real database query
- ❌ `"documentos recentes"` - Now uses real database query
- ❌ `"últimos documentos"` - Now uses real database query

Updated help message to reflect real-time queries:
```
⚡ Consultas em tempo real:
• 'quantas tarefas pendentes' - Ver contagem real de tarefas
• 'documentos recentes' - Listar últimos 5 documentos
```

### 6. Next.js API Route (`pages/api/assistant-query.ts`)

Also updated for consistency, though it's primarily used as a fallback. Added note explaining that real queries require Supabase setup.

## 🎯 Features

✅ **Real-time data**: Queries live database instead of simulated responses
✅ **Error handling**: Graceful degradation on database errors
✅ **Empty state**: Handles cases with no data
✅ **Formatted output**: Dates formatted in Brazilian Portuguese (pt-BR)
✅ **Authentication**: Respects RLS policies via authorization headers
✅ **Performance**: Uses `head: true` for count queries (no data transfer)

## 🧪 Testing

To test the implementation:

1. **Test pending tasks query:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/assistant-query \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question": "quantas tarefas pendentes tenho?"}'
```

Expected response:
```json
{
  "answer": "📋 Você tem 5 tarefas pendentes.",
  "action": "query",
  "timestamp": "2025-10-12T04:11:05.606Z"
}
```

2. **Test recent documents query:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/assistant-query \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question": "quais são os últimos documentos?"}'
```

Expected response:
```json
{
  "answer": "📑 Últimos documentos:\n📄 Manual de Segurança — 10/10/2025\n📄 Relatório Anual — 08/10/2025\n...",
  "action": "query",
  "timestamp": "2025-10-12T04:11:05.606Z"
}
```

## 📊 Architecture Comparison

### Before (Simulated):
```typescript
"tarefas pendentes": {
  type: "query",
  message: "📋 Você tem 3 tarefas pendentes...", // Hardcoded
}
```

### After (Real):
```typescript
const { count } = await supabase
  .from("checklist_items")
  .select("*", { count: "exact" })
  .eq("completed", false);

return { answer: `📋 Você tem ${count} tarefas pendentes.` };
```

## 🔐 Security

- Uses Supabase Row Level Security (RLS) policies
- Respects user authentication via Authorization header
- Queries only return data the authenticated user has access to

## 📝 Files Modified

1. `supabase/functions/assistant-query/index.ts` - Main implementation
2. `pages/api/assistant-query.ts` - Next.js fallback route

## 🚀 Next Steps

- ✅ Implement real database queries
- ✅ Update command patterns
- ✅ Update help messages
- ⏳ Deploy to production
- ⏳ Monitor query performance
- ⏳ Add more real-time queries as needed

## 💡 Future Enhancements

Potential additional real-time queries:
- Weather conditions (from weather_integration table)
- Vessel status (from vessels table)
- Crew availability (from crew tables)
- Alert counts (from various alert tables)
- System health metrics (from monitoring tables)

---

**Implementation Date**: October 12, 2025
**Status**: ✅ Complete and Ready for Testing
