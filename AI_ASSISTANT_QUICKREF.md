# 🤖 AI Assistant - Quick Reference

## Access
```
URL: /admin/assistant
```

## Quick Commands

### Quick Command Buttons (Sidebar)
- **Criar checklist** → Creates checklist for technical inspection
- **Tarefas pendentes** → Shows pending tasks today
- **Resumir documento** → Summarizes the last generated document
- **Status do sistema** → System status check
- **Documentos recentes** → Lists recent documents

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
OpenAI GPT-4o-mini
```

## Key Features

✅ Chat-style interface with sidebar  
✅ Quick command buttons for common tasks  
✅ Natural language understanding  
✅ GPT-4o-mini integration (cost-effective)  
✅ Error handling  
✅ Loading states  
✅ Fallback responses  
✅ Responsive design (desktop and mobile)  
✅ Capabilities list showing all features  

## UI Enhancements

### Quick Commands Sidebar
- 5 pre-defined command buttons
- One-click execution of common tasks
- Disabled during loading state

### Capabilities Display
- Visual list of assistant features
- "Powered by GPT-4o-mini" badge
- Compact, informative design

## Model Configuration

**Model**: GPT-4o-mini (cost-effective, fast)  
**Temperature**: 0.4 (balanced creativity/consistency)  
**Max Tokens**: 1000 (generous response length)  

## Cost Estimation

Using GPT-4o-mini for cost efficiency:
- 1,000 queries/month: ~$0.50
- 10,000 queries/month: ~$5
- 100,000 queries/month: ~$50

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

✅ Chat-style interface with sidebar  
✅ Quick command buttons for common tasks  
✅ Natural language understanding  
✅ Command pattern matching  
✅ OpenAI GPT-4o-mini integration  
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
