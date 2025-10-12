# AI Assistant: Checklist Creation Quick Reference

## 🎯 Quick Commands

### Create a Checklist
```
"Criar checklist [título]"
"Cria checklist para [propósito]"
"Crie um checklist de [tipo]"
```

**Examples:**
- `Criar checklist para auditoria`
- `Crie checklist de manutenção mensal`
- `Cria um checklist para inspeção de segurança`

### Other Commands
```
"quantas tarefas pendentes"     → Shows pending task count
"documentos recentes"           → Lists last 5 documents
"alertas"                       → Navigate to price alerts
"dashboard"                     → Go to main dashboard
"ajuda"                         → Show all commands
```

## 📊 Interaction Logs

**Table:** `assistant_logs`

**Query Your Logs:**
```sql
SELECT question, answer, action_type, created_at
FROM assistant_logs
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

**Admin View (All Logs):**
```sql
SELECT 
  al.question,
  al.action_type,
  p.full_name as user_name,
  al.created_at
FROM assistant_logs al
JOIN profiles p ON p.id = al.user_id
ORDER BY al.created_at DESC;
```

## 🔧 Technical Details

**Function:** `assistant-query`  
**Location:** `supabase/functions/assistant-query/index.ts`

**Key Features:**
- Pattern matching for commands
- Database integration for queries
- Automatic logging
- RLS security

**Response Format:**
```typescript
{
  answer: string,
  action: "navigation" | "action" | "query" | "info" | "checklist_creation",
  target?: string,
  metadata?: object,
  timestamp: string
}
```

## 🎨 UI Integration

**File:** `src/pages/admin/assistant.tsx`

**Features:**
- Markdown link conversion to HTML
- Loading states
- Error handling
- Scroll to latest message

## 🔒 Security

- ✅ RLS enabled on `assistant_logs`
- ✅ User authentication required
- ✅ Users see only their logs
- ✅ Admins can view all logs

## 📈 Analytics Queries

**Most Used Commands:**
```sql
SELECT 
  action_type,
  COUNT(*) as usage_count
FROM assistant_logs
GROUP BY action_type
ORDER BY usage_count DESC;
```

**Checklist Creation Stats:**
```sql
SELECT 
  COUNT(*) as total_created,
  DATE(created_at) as date
FROM assistant_logs
WHERE action_type = 'checklist_creation'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Active Users:**
```sql
SELECT 
  user_id,
  COUNT(*) as interactions,
  MAX(created_at) as last_interaction
FROM assistant_logs
GROUP BY user_id
ORDER BY interactions DESC;
```

---

**Last Updated:** October 12, 2025
