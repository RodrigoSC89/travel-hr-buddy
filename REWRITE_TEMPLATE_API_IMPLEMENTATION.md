# 🔄 Template Rewrite API - Implementation Summary

## Overview

Created a new Supabase Edge Function for rewriting **template snippets** with AI (GPT-4). This function is specifically designed for rewriting selected text within operational templates, with a focus on clarity, formality, and technical language.

## What Was Created

### 1. Supabase Edge Function
**Location:** `supabase/functions/rewrite-template/`

Files created:
- `index.ts` - Main function implementation
- `README.md` - Comprehensive documentation

### 2. Test Suite
**Location:** `src/tests/rewrite-template.test.ts`

- 5 test cases covering request/response structure
- Input validation
- Model configuration validation
- All tests passing ✅

## Technical Specifications

### API Endpoint
```
POST /functions/v1/rewrite-template
```

### Request Format
```json
{
  "input": "Text snippet to rewrite"
}
```

### Response Format (Success)
```json
{
  "result": "Rewritten text with technical clarity",
  "timestamp": "2025-10-14T19:31:04.546Z"
}
```

### Response Format (Error)
```json
{
  "error": "Error message",
  "timestamp": "2025-10-14T19:31:04.546Z"
}
```

### Configuration
- **Model:** GPT-4 (as specified in requirements)
- **Temperature:** 0.4 (formal, consistent, and professional results)
- **Max Retries:** 3 with exponential backoff
- **Timeout:** 30 seconds per request
- **CORS:** Enabled for all origins

### System Prompt
```
Você é um assistente técnico marítimo. Sua função é reescrever o trecho 
selecionado de forma mais clara, formal e técnica, mantendo o significado 
e adaptando para uso em templates operacionais.
```

## Key Differences: rewrite-template vs rewrite-document

| Feature | rewrite-template | rewrite-document |
|---------|-----------------|------------------|
| **Purpose** | Rewrite selected text snippets | Rewrite complete documents |
| **Use Case** | Template editing, selected text | Document improvement |
| **Model** | GPT-4 | GPT-4o-mini |
| **Temperature** | 0.4 | 0.7 |
| **Context** | Maritime/technical templates | Professional documents |
| **Max Tokens** | Default (shorter) | 2000 |
| **Request Key** | `input` | `content` |
| **Response Key** | `result` | `rewritten` |

## Integration Example

### Frontend Implementation
```typescript
import { supabase } from "@/integrations/supabase/client";

async function rewriteSelectedText(selectedText: string) {
  try {
    const { data, error } = await supabase.functions.invoke("rewrite-template", {
      body: { input: selectedText },
    });

    if (error) throw error;

    return data?.result;
  } catch (error) {
    console.error("[REWRITE_TEMPLATE_ERROR]", error);
    throw error;
  }
}
```

### Usage with TipTap Editor
```typescript
// In a TipTap editor component
const handleRewriteSelection = async () => {
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to);
  
  if (!selectedText) {
    toast({
      title: "Nenhum texto selecionado",
      description: "Selecione um trecho para reescrever",
      variant: "warning"
    });
    return;
  }

  setRewriting(true);
  try {
    const rewritten = await rewriteSelectedText(selectedText);
    
    // Replace selected text with rewritten version
    editor.chain()
      .focus()
      .deleteSelection()
      .insertContent(rewritten)
      .run();
    
    toast({
      title: "Trecho reescrito com sucesso",
      description: "O texto foi melhorado com IA"
    });
  } catch (error) {
    toast({
      title: "Erro ao reescrever",
      description: "Tente novamente",
      variant: "destructive"
    });
  } finally {
    setRewriting(false);
  }
};
```

## Use Cases

### Primary Use Cases
1. **Template Editor Integration**
   - User selects text in a template
   - Clicks "Rewrite with AI" button
   - Selected text is improved for clarity and formality

2. **Operational Templates**
   - Maritime safety procedures
   - Technical instructions
   - Formal communications

3. **Quick Text Improvements**
   - Improve a single paragraph
   - Formalize technical language
   - Clarify instructions

### Example Transformations

**Before:**
```
O tripulante deve verificar todos os equipamentos antes de sair
```

**After:**
```
O membro da tripulação deve realizar a verificação completa de todos 
os equipamentos operacionais antes de iniciar as atividades.
```

## Architecture

```
┌─────────────────┐
│  Frontend App   │
│   (React)       │
└────────┬────────┘
         │ POST /functions/v1/rewrite-template
         │ { input: "text..." }
         ▼
┌─────────────────┐
│  Supabase Edge  │
│    Function     │
└────────┬────────┘
         │ OpenAI API Request
         │ Model: GPT-4
         │ Temperature: 0.5
         ▼
┌─────────────────┐
│   OpenAI API    │
│   GPT-4 Model   │
└────────┬────────┘
         │ Response
         ▼
┌─────────────────┐
│  Frontend App   │
│  (Display)      │
└─────────────────┘
```

## Error Handling

### Retry Logic
- **Automatic retries:** 3 attempts
- **Exponential backoff:** 1s, 2s, 4s (with jitter)
- **Retry conditions:** HTTP 429, 5xx errors

### Error Logging
All errors are logged with the prefix `[REWRITE_TEMPLATE_ERROR]` for easy debugging and monitoring.

### User-Facing Errors
- Clear Portuguese error messages
- Descriptive error responses
- Proper HTTP status codes (500 for errors)

## Environment Variables

Required environment variable in Supabase:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Testing

### Test Coverage
```bash
npm run test
```

Test results:
- ✅ 5 tests in `src/tests/rewrite-template.test.ts`
- ✅ All 267 tests passing in the entire suite
- ✅ No linting errors

### Manual Testing
```bash
# Using curl
curl -X POST \
  https://your-project.supabase.co/functions/v1/rewrite-template \
  -H "Content-Type: application/json" \
  -d '{"input":"Verificar os equipamentos antes de começar"}'
```

## Performance Considerations

- **Response Time:** ~2-5 seconds (depends on OpenAI API)
- **Token Usage:** Optimized for short snippets (< 500 tokens)
- **Cost:** ~$0.03 per 1k tokens (GPT-4 input)
- **Concurrent Requests:** Limited by Supabase Edge Functions limits

## Future Enhancements

Potential improvements:
1. Add `max_tokens` parameter for better cost control
2. Support multiple languages (currently Portuguese)
3. Add context parameter for domain-specific rewrites
4. Cache frequent rewrites to reduce API calls
5. Add streaming response for real-time updates

## Deployment

### Prerequisites
1. Supabase project set up
2. OpenAI API key configured in Supabase secrets
3. Supabase CLI installed (for deployment)

### Deploy Command
```bash
# Deploy the function
supabase functions deploy rewrite-template

# Set environment variable
supabase secrets set OPENAI_API_KEY=your_key_here
```

## Module Status

As mentioned in the problem statement, the Templates module with AI is now complete:

| Component | Status |
|-----------|--------|
| TipTap editor | ✅ |
| Geração com IA (GPT-4) | ✅ |
| Salvamento no Supabase | ✅ |
| Exportação PDF | ✅ |
| Listagem com filtros | ✅ |
| Aplicar template via localStorage | ✅ |
| **Reescrever seleção com IA** | ✅ |
| API /generate e /rewrite | ✅ |

## Summary

✅ **Created:** Supabase Edge Function for template snippet rewriting  
✅ **Model:** GPT-4 with temperature 0.4  
✅ **Tests:** 5 new tests, all passing  
✅ **Documentation:** Comprehensive README with examples  
✅ **Error Handling:** Retry logic with exponential backoff  
✅ **CORS:** Enabled for frontend integration  

The API is ready to be integrated into the template editor for on-the-fly text improvements!
