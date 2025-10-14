# Generate Template Edge Function

Supabase Edge Function for generating professional document templates using OpenAI's GPT-4o-mini model.

## Overview

This Edge Function provides AI-powered template generation with robust error handling, retry logic, and timeout management. It's designed for creating structured corporate document templates with placeholders for customization.

## Features

- ✅ **GPT-4o-mini Integration**: Uses OpenAI's efficient model for template generation
- ✅ **Robust Error Handling**: Comprehensive error handling with detailed error messages
- ✅ **Exponential Backoff with Jitter**: Smart retry logic that prevents thundering herd
- ✅ **Timeout Management**: 30-second timeout per request to prevent hanging
- ✅ **Rate Limit Handling**: Automatic retry for 429 (rate limit) responses
- ✅ **Server Error Retry**: Automatic retry for 5xx server errors
- ✅ **CORS Support**: Cross-origin requests enabled for frontend integration

## Configuration

### Retry Settings
- **Max Retries**: 3 attempts
- **Initial Retry Delay**: 1 second
- **Max Retry Delay**: 10 seconds
- **Request Timeout**: 30 seconds

### Environment Variables
Required:
- `OPENAI_API_KEY`: Your OpenAI API key

## API Specification

### Endpoint
```
POST /functions/v1/generate-template
```

### Request Body
```json
{
  "title": "Inspeção de Dynamic Positioning - PSV"
}
```

### Response (Success)
```json
{
  "content": "# Template content with {{placeholders}}...",
  "timestamp": "2025-10-14T19:30:00.000Z"
}
```

### Response (Error)
```json
{
  "error": "Error message describing what went wrong",
  "timestamp": "2025-10-14T19:30:00.000Z"
}
```

## Usage Example

### JavaScript/TypeScript
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('generate-template', {
  body: { title: 'Rotina de Máquinas - OSV' }
});

if (!error) {
  console.log('Generated template:', data.content);
}
```

### cURL
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-template' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"title": "Rotina de Máquinas - OSV"}'
```

## Error Handling

The function handles the following error scenarios:

1. **Missing Title**: Returns 400 error if title is not provided
2. **Missing API Key**: Returns 400 error if OPENAI_API_KEY is not configured
3. **Rate Limiting (429)**: Automatically retries with exponential backoff
4. **Server Errors (5xx)**: Automatically retries with exponential backoff
5. **Timeout**: Aborts request after 30 seconds and may retry
6. **Invalid Response**: Validates OpenAI response format

## Retry Logic

The function implements sophisticated retry logic:

```
Attempt 1: Immediate
Attempt 2: ~1.0-1.3 seconds later
Attempt 3: ~2.0-2.6 seconds later
Attempt 4: ~4.0-5.2 seconds later
Total max time: ~40 seconds (with 3 retries)
```

**Jitter**: Random variation (±30%) prevents synchronized retries across multiple clients.

## Performance

- **Average Response Time**: 2-5 seconds (GPT-4o-mini API)
- **Maximum Response Time**: 30 seconds (timeout)
- **Maximum Total Time**: ~40 seconds (with 3 retries)
- **Token Limit**: 1,500 tokens per request

## System Prompt

The function uses a specialized system prompt that instructs the AI to:
- Create professional corporate document templates
- Include placeholders in `{{variable}}` format
- Structure content with clear sections
- Use professional Portuguese language
- Format appropriately for business use

## Common Use Cases

1. **Maritime Operations**
   - DP inspections
   - Machine routines
   - Safety checklists

2. **HR Documents**
   - Performance reviews
   - Embarkation terms
   - STCW certificates

3. **Operational Reports**
   - Offshore operations
   - Incident reports
   - Maintenance logs

## Deployment

1. **Set environment variable in Supabase:**
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...your-key-here
   ```

2. **Deploy the function:**
   ```bash
   supabase functions deploy generate-template
   ```

3. **Test the function:**
   ```bash
   supabase functions invoke generate-template --data '{"title":"Test Template"}'
   ```

## Integration

The generated templates can be:
- Loaded into TipTap editor for rich text editing
- Saved to Supabase `reservation_templates` table
- Exported as PDF using existing export functionality
- Used in Template Manager component for reuse

## Troubleshooting

### Function returns 400 error
- Check that `title` is provided in request body
- Verify `OPENAI_API_KEY` is set in Supabase secrets

### Function times out
- Normal for first request (cold start)
- Retry logic will handle transient failures
- Check OpenAI API status if persistent

### Rate limit errors
- Function automatically retries with backoff
- Consider upgrading OpenAI plan if frequent
- Monitor usage in OpenAI dashboard

## Monitoring

The function logs:
- Request attempts with attempt numbers
- Retry delays and reasons
- Generated content preview (first 100 chars)
- All errors with full details

View logs:
```bash
supabase functions logs generate-template
```

## Version History

- **v2.0.0** (Current): Added robust retry logic, timeout handling, and exponential backoff
- **v1.0.0**: Initial implementation with basic OpenAI integration

## Related Functions

- `generate-document`: Similar function for full document generation
- `assistant-query`: AI assistant for general queries
- `summarize-document`: Document summarization
