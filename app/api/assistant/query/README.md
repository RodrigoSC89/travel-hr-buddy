# AI Assistant Query API Route

This directory contains a Next.js-compatible API route implementation for the AI Assistant Query feature.

## Purpose

This is a **reference implementation** showing how the assistant query feature could be implemented in a Next.js environment. The current project uses Vite with Supabase Edge Functions for backend functionality.

## Active Implementation

The currently active implementation for AI chat/assistant is located at:
- **Backend**: `supabase/functions/ai-chat/index.ts` (Supabase Edge Function)
- **Frontend**: `src/pages/admin/assistant.tsx` (React component)

## File: `route.ts`

### API Endpoint
```
POST /api/assistant/query
```

### Request Body
```json
{
  "question": "string - User question or command"
}
```

### Response
```json
{
  "answer": "string - AI-generated response"
}
```

### Error Response
```json
{
  "answer": "❌ Pergunta inválida"
}
```

## Features

The AI Assistant can help with:
- Creating new checklists
- Summarizing documents
- Showing system status
- Searching for pending tasks
- Listing recent documents
- Generating PDF summaries
- Redirecting to internal panel routes

## Key Differences from Supabase Implementation

| Feature | Next.js API Route | Supabase Edge Function |
|---------|------------------|------------------------|
| **Runtime** | Node.js | Deno |
| **OpenAI SDK** | `openai` npm package | Direct fetch calls |
| **Model** | gpt-4 | gpt-4o-mini |
| **Temperature** | 0.4 | 0.7 |
| **Retry Logic** | None | Exponential backoff with 3 retries |
| **Context** | Nautilus One system commands | General corporate assistant |

## Usage in Next.js

To use this API route in a Next.js application:

1. Ensure Next.js is installed and configured
2. Install the OpenAI package: `npm install openai`
3. Set the `OPENAI_API_KEY` environment variable
4. Call the endpoint from your frontend:

```typescript
const response = await fetch('/api/assistant/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'Crie um checklist para inspeção técnica',
  }),
});

const data = await response.json();
console.log(data.answer);
```

## Example Commands

- "Crie um checklist para inspeção técnica"
- "Quantas tarefas pendentes tenho hoje?"
- "Resuma o último documento gerado"
- "Qual o status do sistema?"
- "Liste os documentos recentes"
- "Gerar PDF com resumo de atividades"

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4 access

## Security Considerations

- API key should never be exposed to the client
- Consider implementing rate limiting
- Add authentication/authorization as needed
- Validate and sanitize all user inputs
- Implement proper error handling and logging

## Migration Notes

If migrating this Vite project to Next.js:

1. Install Next.js and its dependencies
2. Migrate React components to Next.js pages structure
3. Replace Supabase Edge Functions with Next.js API routes
4. Update environment variables for Next.js conventions
5. Test all API endpoints thoroughly

## Related Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
