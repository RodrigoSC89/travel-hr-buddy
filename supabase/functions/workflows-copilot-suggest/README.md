# Workflows Copilot Suggest

## Overview
This Supabase Edge Function provides AI-powered suggestions for workflow management based on OpenAI GPT-4. It analyzes workflow context, logs, failures, and delays to generate actionable recommendations.

## Endpoint
- **URL**: `/workflows-copilot-suggest`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request Body
```json
{
  "workflow": "string (required) - Description or identifier of the current workflow",
  "logs": "string (optional) - Relevant logs from the workflow",
  "falhas": "string (optional) - Recent failures in Portuguese",
  "atrasos": "string (optional) - Step delays in Portuguese"
}
```

## Response
The endpoint returns a streaming text response with AI-generated suggestions including:
- Tasks to be created
- Steps with deadlines to adjust
- Most suitable assignees
- Criticality level of each suggestion

The response is structured to be saved directly to the database.

## Features
- ✅ Receives workflow context, failures, delays, and logs
- ✅ Generates suggestions using GPT-4
- ✅ Responds via streaming for real-time feedback
- ✅ Ready for Supabase integration
- ✅ CORS enabled for cross-origin requests

## Environment Variables
- `OPENAI_API_KEY` - Required for OpenAI API access

## Example Usage

### Using JavaScript/TypeScript
```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/workflows-copilot-suggest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY',
  },
  body: JSON.stringify({
    workflow: 'Manutenção preventiva de equipamentos',
    logs: 'Última execução: 2025-01-10, Duração: 45min',
    falhas: 'Falha na etapa 3: timeout ao conectar com sensor',
    atrasos: 'Etapa 2 atrasada em 3 dias'
  })
});

// Handle streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  console.log(text); // Process each chunk
}
```

### Using curl
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/workflows-copilot-suggest' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "workflow": "Manutenção preventiva de equipamentos",
    "logs": "Última execução: 2025-01-10",
    "falhas": "Falha na etapa 3",
    "atrasos": "Etapa 2 atrasada em 3 dias"
  }'
```

## Error Handling
The function returns appropriate HTTP status codes:
- `200` - Success (streaming response)
- `400` - Bad request (missing required parameters)
- `500` - Internal server error

## Integration with Nautilus One
This function is part of the Workflows module in Nautilus One system and can be integrated with:
- Workflow management dashboards
- Audit and compliance systems
- Task creation and assignment systems
- Real-time monitoring interfaces
