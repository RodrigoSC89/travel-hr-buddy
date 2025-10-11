# Next.js API Route for Document Generation

This directory contains a Next.js-compatible API route implementation for document generation using OpenAI's GPT-4 model.

## Purpose

This is a **reference implementation** showing how the document generation feature could be implemented in a Next.js environment. The current project uses Vite with Supabase Edge Functions for backend functionality.

## Active Implementation

The currently active implementation for document generation is located at:
- **Backend**: `supabase/functions/generate-document/index.ts` (Supabase Edge Function)
- **Frontend**: `src/pages/admin/documents-ai.tsx` (React component)

## File: `generate-document.ts`

### API Endpoint
```
POST /api/generate-document
```

### Request Body
```json
{
  "prompt": "string - Description of the document to generate"
}
```

### Response
```json
{
  "content": "string - Generated document content"
}
```

### Error Response
```json
{
  "error": "string - Error message"
}
```

## Key Differences from Supabase Implementation

| Feature | Next.js API Route | Supabase Edge Function |
|---------|------------------|------------------------|
| **Runtime** | Node.js | Deno |
| **OpenAI SDK** | `openai` npm package | Direct fetch calls |
| **Model** | gpt-4 | gpt-4o-mini |
| **Temperature** | 0.5 | 0.7 |
| **Retry Logic** | None | Exponential backoff with 3 retries |
| **Max Tokens** | Not specified | 2000 |
| **System Prompt** | Simpler, focused on writing | More detailed, professional documents |

## Usage in Next.js

To use this API route in a Next.js application:

1. Ensure Next.js is installed and configured
2. Install the OpenAI package: `npm install openai`
3. Set the `OPENAI_API_KEY` environment variable
4. Call the endpoint from your frontend:

```typescript
const response = await fetch('/api/generate-document', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Your document description here',
  }),
});

const data = await response.json();
console.log(data.content);
```

## Migration Notes

If migrating this Vite project to Next.js:

1. Install Next.js and its dependencies
2. Migrate React components to Next.js pages structure
3. Replace Supabase Edge Functions with Next.js API routes
4. Update environment variables for Next.js conventions
5. Test all API endpoints thoroughly

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4 access

## Security Considerations

- API key should never be exposed to the client
- Consider implementing rate limiting
- Add authentication/authorization as needed
- Validate and sanitize all user inputs
- Implement proper error handling and logging

## Related Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
