# MMI Jobs Postpone API

## Endpoint

`POST /mmi-jobs-postpone`

## Description

Analyzes whether a maintenance job can be postponed based on various operational factors using GPT-4 AI analysis.

## Features

- ✅ AI-powered risk assessment using GPT-4
- ✅ Analyzes multiple factors: usage hours, historical data, stock availability, mission status
- ✅ Automatic retry logic with exponential backoff
- ✅ CORS support
- ✅ Comprehensive error handling

## Request

### Method
`POST`

### Headers
- `Content-Type: application/json`
- `Authorization: Bearer <SUPABASE_ANON_KEY>` (optional, depending on RLS policies)

### Body
```json
{
  "id": "job-123"
}
```

### Parameters
- `id` (string, required): The job ID to analyze

## Response

### Success Response (200)
```json
{
  "message": "✅ Pode postergar com risco baixo",
  "timestamp": "2025-10-14T21:51:11.057Z",
  "jobId": "job-123"
}
```

or

```json
{
  "message": "❌ Não é recomendável postergar",
  "timestamp": "2025-10-14T21:51:11.057Z",
  "jobId": "job-123"
}
```

### Error Response (500)
```json
{
  "error": "Error message",
  "timestamp": "2025-10-14T21:51:11.057Z"
}
```

### Error Response (405)
```json
{
  "error": "Method not allowed. Use POST.",
  "timestamp": "2025-10-14T21:51:11.057Z"
}
```

## Analysis Factors

The AI evaluates the following factors to determine if postponement is safe:

1. **Usage Hours**: Current usage vs. historical average
2. **Stock Availability**: Whether replacement parts are in stock
3. **Mission Status**: Whether a critical mission is active
4. **Maintenance History**: Past maintenance patterns and failures
5. **Component Criticality**: Importance of the component to operations

## Mock Data

Currently, the endpoint uses mock data for demonstration purposes:

```typescript
{
  id: jobId,
  title: 'Troca de filtro hidráulico',
  component: 'Bomba hidráulica popa',
  usage_hours: 241,
  avg_usage: 260,
  stock: true,
  mission_active: true,
  history: '3 trocas nos últimos 90 dias'
}
```

In production, this data would be retrieved from Supabase based on the job ID.

## Usage Example

### Using fetch
```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/mmi-jobs-postpone', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
  },
  body: JSON.stringify({
    id: 'job-123'
  })
});

const data = await response.json();
console.log(data.message); // ✅ Pode postergar com risco baixo or ❌ Não é recomendável postergar
```

### Using curl
```bash
curl -X POST https://your-project.supabase.co/functions/v1/mmi-jobs-postpone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"id": "job-123"}'
```

## Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4 access

## Error Handling

The function includes robust error handling:
- Automatic retry with exponential backoff (up to 3 retries)
- 30-second request timeout
- Handles rate limiting (429) and server errors (5xx)
- Validates all required inputs
- Returns descriptive error messages

## Deployment

This function is deployed as a Supabase Edge Function using Deno runtime.

To deploy:
```bash
supabase functions deploy mmi-jobs-postpone
```

## Notes

- Uses GPT-4 model with temperature 0.2 for consistent, deterministic responses
- Response format is controlled via system prompt for predictable output
- Function follows the established patterns in the codebase for consistency
- CORS is enabled for cross-origin requests
