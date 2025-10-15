# 🚀 Rewrite Template API - Quick Reference

## Endpoint
```
POST /functions/v1/rewrite-template
```

## Request
```json
{
  "input": "Text to rewrite"
}
```

## Response
```json
{
  "result": "Rewritten text",
  "timestamp": "2025-10-14T19:31:04.546Z"
}
```

## Usage Example
```typescript
const { data, error } = await supabase.functions.invoke("rewrite-template", {
  body: { input: selectedText }
});

if (error) throw error;
const rewritten = data?.result;
```

## Configuration
- **Model:** GPT-4
- **Temperature:** 0.4
- **Retries:** 3 with exponential backoff
- **Timeout:** 30 seconds

## Key Features
- ✅ Rewrite selected text snippets
- ✅ Maritime/technical focus
- ✅ Clear, formal, technical language
- ✅ Automatic retry on failure
- ✅ CORS enabled

## Files Created
- `supabase/functions/rewrite-template/index.ts`
- `supabase/functions/rewrite-template/README.md`
- `src/tests/rewrite-template.test.ts`
- `REWRITE_TEMPLATE_API_IMPLEMENTATION.md`

## Test Status
✅ All 267 tests passing (including 5 new tests)

## Differences from rewrite-document

| Feature | rewrite-template | rewrite-document |
|---------|-----------------|------------------|
| Purpose | Snippets | Full documents |
| Model | GPT-4 | GPT-4o-mini |
| Temperature | 0.4 | 0.7 |
| Request key | `input` | `content` |
| Response key | `result` | `rewritten` |

## Error Handling
```typescript
try {
  const { data, error } = await supabase.functions.invoke("rewrite-template", {
    body: { input: text }
  });
  if (error) throw error;
  return data.result;
} catch (error) {
  console.error("[REWRITE_TEMPLATE_ERROR]", error);
  // Show user-friendly error message
}
```

## Next Steps for Integration
1. Add "Rewrite Selection" button to template editor
2. Get selected text from TipTap editor
3. Call the API with selected text
4. Replace selection with rewritten text
5. Show success/error toast notification

## Module Completion Status
✅ Rota `/functions/v1/rewrite-template` criada com sucesso!

Conjunto completo do módulo Templates com IA:
- ✅ TipTap editor
- ✅ Geração com IA (GPT-4)
- ✅ Salvamento no Supabase
- ✅ Exportação PDF
- ✅ Listagem com filtros
- ✅ Aplicar template via localStorage
- ✅ Reescrever seleção com IA
- ✅ API /generate e /rewrite
