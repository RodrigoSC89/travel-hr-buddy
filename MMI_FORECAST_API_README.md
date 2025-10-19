# MMI Forecast API Endpoint

## Overview
Endpoint for generating AI-powered maintenance forecasts using OpenAI GPT-4. The endpoint analyzes vessel maintenance data and provides technical recommendations with streaming responses.

## Endpoint Details

**URL:** `/api/mmi/forecast`  
**Method:** `POST`  
**Content-Type:** `application/json`  
**Response Type:** `text/event-stream` (Server-Sent Events)

## Request Body

```typescript
{
  vessel_name: string;          // Name of the vessel (e.g., "FPSO Alpha")
  system_name: string;          // System being maintained (e.g., "Sistema hidráulico do guindaste")
  last_maintenance_dates: string[];  // Array of maintenance history entries
  current_hourmeter: number;    // Current hourmeter reading in hours
}
```

### Example Request

```javascript
const response = await fetch('/api/mmi/forecast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    vessel_name: 'FPSO Alpha',
    system_name: 'Sistema hidráulico do guindaste',
    last_maintenance_dates: [
      '12/04/2025 - troca de óleo',
      '20/06/2025 - verificação de pressão'
    ],
    current_hourmeter: 870
  })
});
```

## Response Format

The endpoint returns a streaming response using Server-Sent Events (SSE). Each chunk contains:

```typescript
data: {"content": "text chunk"}\n\n
```

The stream ends with:
```
data: [DONE]\n\n
```

### Expected Response Content

The AI generates a structured technical report containing:

1. **Próxima intervenção recomendada**: Next recommended maintenance action
2. **Por que ela é necessária**: Justification for the maintenance
3. **Impacto de não executá-la**: Impact of not performing the maintenance
4. **Prioridade sugerida**: Priority level (Alta/Média/Baixa)
5. **Frequência sugerida**: Recommended maintenance frequency

### Example Response Content

```
📌 Próxima intervenção: Substituição do filtro de óleo hidráulico
📅 Justificativa: Baseado no acúmulo de 870h e na última troca há 500h, há risco de saturação.
⚠️ Impacto: Aumento de temperatura e falhas no acionamento do guindaste.
📈 Prioridade: Alta
🔁 Frequência sugerida: a cada 400h
```

## Frontend Integration

### Using EventSource (Recommended)

```javascript
const eventSource = new EventSource('/api/mmi/forecast');

eventSource.onmessage = (event) => {
  if (event.data === '[DONE]') {
    eventSource.close();
    return;
  }
  
  const { content } = JSON.parse(event.data);
  // Handle streamed content
  console.log(content);
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
```

### Using Fetch with Stream Reader

```javascript
const response = await fetch('/api/mmi/forecast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    vessel_name: 'FPSO Alpha',
    system_name: 'Sistema hidráulico do guindaste',
    last_maintenance_dates: ['12/04/2025 - troca de óleo'],
    current_hourmeter: 870
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      const parsed = JSON.parse(data);
      console.log(parsed.content);
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: vessel_name, system_name, last_maintenance_dates, current_hourmeter"
}
```

### 405 Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate forecast",
  "details": "Error message details"
}
```

## Environment Variables

The endpoint requires the following environment variables:

```env
OPENAI_API_KEY=sk-proj-...
# OR
VITE_OPENAI_API_KEY=sk-proj-...
```

## Testing

### Unit Tests
Run the validation tests:
```bash
npm run test -- src/tests/mmi-forecast-api.test.ts
```

### Manual Testing with cURL

```bash
curl -X POST http://localhost:5173/api/mmi/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "vessel_name": "FPSO Alpha",
    "system_name": "Sistema hidráulico do guindaste",
    "last_maintenance_dates": ["12/04/2025 - troca de óleo", "20/06/2025 - verificação de pressão"],
    "current_hourmeter": 870
  }'
```

## Implementation Notes

- Uses OpenAI GPT-4 model for high-quality technical analysis
- Implements streaming responses for better UX
- Portuguese language prompts and responses for offshore maintenance context
- Validates all required fields before processing
- Handles errors gracefully with detailed error messages
- Compatible with Next.js Pages Router pattern

## Dependencies

- `openai`: ^6.3.0 - OpenAI API client
- `next`: ^15.5.5 - Next.js framework
- `ai`: Latest - AI streaming utilities (optional, currently using manual streaming)

## Related Files

- **Implementation**: `/pages/api/mmi/forecast/route.ts`
- **Tests**: `/src/tests/mmi-forecast-api.test.ts`
- **Similar Endpoint**: `/pages/api/ai/forecast-risks.ts` (for reference)
