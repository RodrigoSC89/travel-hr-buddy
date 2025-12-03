# 🤖 AI Assistant - Quick Reference

## Access
```
URL: /admin/assistant
```

## Quick Commands Sidebar

### 5 Pre-defined Buttons (One-Click Access)
1. ✅ **Criar checklist** → Checklist creation
2. 📋 **Tarefas pendentes** → View pending tasks
3. 📄 **Resumir documento** → Document summarization
4. 📊 **Status do sistema** → System status
5. 📚 **Documentos recentes** → Recent documents

### Additional Commands (Type in Chat)
- `dashboard` → Main dashboard
- `alertas` → Price alerts
- `analytics` → Analytics page
- `relatórios` → Reports section
- `ajuda` → Show all commands

## Architecture

```
Frontend (React/TypeScript)
  - Quick Commands Sidebar
  - Capabilities List
  - Responsive Layout
    ↓
Supabase Edge Function (Primary)
    ↓ (fallback)
Next.js API Route (Backup)
    ↓
OpenAI GPT-4o-mini (Cost-Optimized)
```

## Cost Optimization

### Model: GPT-4o-mini
- **Before**: GPT-4 (~$0.50 per 1K queries)
- **After**: GPT-4o-mini (~$0.05 per 1K queries)
- **Savings**: 90% cost reduction 🎉

### Parameters
- Temperature: 0.4 (optimized for accuracy)
- Max Tokens: 1000 (increased from 500)
- Response time: 2-5 seconds

## Files Created

1. **Frontend Page**
   - `src/pages/admin/assistant.tsx`
   - Chat interface with Quick Commands Sidebar
   - Capabilities list and "Powered by GPT-4o-mini" badge

2. **Supabase Function**
   - `supabase/functions/assistant-query/index.ts`
   - Command processing with GPT-4o-mini

3. **API Route**
   - `pages/api/assistant-query.ts`
   - Backup endpoint with GPT-4o-mini

4. **Routing**
   - `src/App.tsx` (updated)
   - Added route configuration

5. **Documentation**
   - `AI_ASSISTANT_GUIDE.md` (enhanced)
   - `AI_ASSISTANT_QUICKREF.md` (enhanced)

## Environment Setup

```bash
# .env
OPENAI_API_KEY=sk-...

# Supabase
supabase secrets set OPENAI_API_KEY=sk-...
```

## Key Features

✅ Chat-style interface  
✅ Quick Commands Sidebar (5 buttons)
✅ Capabilities List (9 features)
✅ "Powered by GPT-4o-mini" badge
✅ Responsive design (desktop/mobile)
✅ Natural language understanding  
✅ Command pattern matching  
✅ GPT-4o-mini integration (90% cost savings)
✅ Error handling  
✅ Loading states  
✅ Fallback responses  

## Response Types

| Type | Description | Example |
|------|-------------|---------|
| `navigation` | Directs to a route | "Abrindo dashboard..." |
| `action` | Instructions for task | "Para resumir, acesse..." |
| `query` | Data lookup | "Você tem 3 tarefas..." |
| `info` | General information | AI-generated response |

## Testing

```bash
# Build
npm run build

# Dev server
npm run dev

# Access
http://localhost:8080/admin/assistant
```

## Production Deploy

```bash
# Deploy Supabase function
supabase functions deploy assistant-query

# Set secrets
supabase secrets set OPENAI_API_KEY=...

# Verify
curl -X POST https://your-project.supabase.co/functions/v1/assistant-query \
  -H "Content-Type: application/json" \
  -d '{"question":"ajuda"}'
```

## Error Handling

- Supabase unavailable → Falls back to API route
- API route unavailable → Shows friendly error
- OpenAI unavailable → Uses predefined responses
- Invalid command → Shows help or AI response

## Command Patterns

Commands are matched using case-insensitive substring matching:

```typescript
"criar checklist" // matches "criar checklist para inspeção"
"dashboard" // matches "abrir dashboard" or "ir para o dashboard"
```
