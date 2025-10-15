# Jobs Forecast Supabase Edge Function

## Overview
AI-powered predictive maintenance function that analyzes job completion trends and generates forecasts for future workload peaks.

## Endpoint
`POST /functions/v1/jobs-forecast`

## Request Body
```json
{
  "trend": [
    {
      "month": "Janeiro",
      "jobsCompleted": 45
    },
    {
      "month": "Fevereiro", 
      "jobsCompleted": 52
    },
    {
      "month": "Março",
      "jobsCompleted": 38
    }
  ]
}
```

## Response
```json
{
  "forecast": "Com base nos dados fornecidos, prevê-se:\n\n**Previsão para os próximos 2 meses:**\n- Abril: Estimativa de 55-60 jobs finalizados\n- Maio: Pico esperado de 65-70 jobs\n\n**Ações técnicas preventivas recomendadas:**\n1. Aumentar equipe de manutenção em 15%\n2. Preparar estoque de peças críticas\n3. Implementar turnos extras em Maio..."
}
```

## Error Response
```json
{
  "error": "Erro ao gerar previsão com IA."
}
```

## Environment Variables Required
- `OPENAI_API_KEY` - OpenAI API key for GPT-4 access

## Features
- ✅ AI-powered predictive analysis using GPT-4
- ✅ Portuguese language maintenance context
- ✅ 2-month forecast generation
- ✅ Preventive action recommendations
- ✅ CORS support for web applications
- ✅ Comprehensive error handling
- ✅ Input validation

## Technology Stack
- Deno runtime
- OpenAI GPT-4 API
- Supabase Edge Functions

## Testing
Run the test suite with:
```bash
npm test -- src/tests/jobs-forecast.test.ts
```

All 30 tests passing ✓

## Usage Example
```typescript
const response = await fetch('YOUR_SUPABASE_URL/functions/v1/jobs-forecast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    trend: [
      { month: 'Janeiro', jobsCompleted: 45 },
      { month: 'Fevereiro', jobsCompleted: 52 },
      { month: 'Março', jobsCompleted: 38 }
    ]
  })
});

const { forecast } = await response.json();
console.log(forecast);
```

## Deployment
This function is automatically deployed with Supabase Edge Functions. Ensure the `OPENAI_API_KEY` is set in your Supabase project settings.

## Related Functions
- `mmi-jobs-similar` - Find similar maintenance jobs
- `mmi-job-postpone` - Postpone maintenance jobs
- `generate-predictions` - General predictive analytics
