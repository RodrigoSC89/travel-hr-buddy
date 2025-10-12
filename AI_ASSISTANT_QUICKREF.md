# 🤖 AI Assistant - Quick Reference

## Access
```
URL: /admin/assistant
```

## Quick Commands

### Navigation
- `dashboard` → Main dashboard
- `criar checklist` → Checklist creation
- `documentos` → Documents section
- `alertas` → Price alerts
- `analytics` → Analytics page
- `relatórios` → Reports section

### Information
- `ajuda` → Show all commands
- `tarefas pendentes` → View pending tasks
- `status do sistema` → System status

## Architecture

```
Frontend (React/TypeScript)
    ↓
Supabase Edge Function (Primary)
    ↓ (fallback)
Next.js API Route (Backup)
    ↓
OpenAI GPT-4 (Optional)
```

## Files Created

1. **Frontend Page**
   - `src/pages/admin/assistant.tsx`
   - Chat interface component

2. **Supabase Function**
   - `supabase/functions/assistant-query/index.ts`
   - Command processing and AI integration

3. **API Route**
   - `pages/api/assistant-query.ts`
   - Backup endpoint for local development

4. **Routing**
   - `src/App.tsx` (updated)
   - Added route configuration

5. **Documentation**
   - `AI_ASSISTANT_GUIDE.md`
   - `AI_ASSISTANT_QUICKREF.md`

## Environment Setup

```bash
# .env
OPENAI_API_KEY=sk-...

# Supabase
supabase secrets set OPENAI_API_KEY=sk-...
```

## Key Features

✅ Chat-style interface  
✅ Natural language understanding  
✅ Command pattern matching  
✅ OpenAI integration  
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
