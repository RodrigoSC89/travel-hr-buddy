# MMI Forecast API - Quick Reference

## 🎯 Endpoint
```
POST /api/mmi/forecast
Content-Type: application/json
Response: text/event-stream
```

## 📥 Request
```json
{
  "vessel_name": "FPSO Alpha",
  "system_name": "Sistema hidráulico do guindaste",
  "last_maintenance_dates": [
    "12/04/2025 - troca de óleo",
    "20/06/2025 - verificação de pressão"
  ],
  "current_hourmeter": 870
}
```

## 📤 Response (Streaming SSE)
```
data: {"content":"📌 Próxima intervenção: Substituição do filtro de óleo hidráulico"}\n\n
data: {"content":"📅 Justificativa: Baseado no acúmulo de 870h..."}\n\n
data: {"content":"⚠️ Impacto: Aumento de temperatura..."}\n\n
data: {"content":"📈 Prioridade: Alta"}\n\n
data: {"content":"🔁 Frequência sugerida: a cada 400h"}\n\n
data: [DONE]\n\n
```

## 🔧 Environment
```bash
OPENAI_API_KEY=sk-proj-...
# OR
VITE_OPENAI_API_KEY=sk-proj-...
```

## 🧪 Testing
```bash
# Unit tests
npm run test -- src/tests/mmi-forecast-api.test.ts

# Manual test
npm run dev  # Terminal 1
node scripts/test-mmi-forecast.js  # Terminal 2

# cURL test
curl -X POST http://localhost:5173/api/mmi/forecast \
  -H "Content-Type: application/json" \
  -d '{"vessel_name":"FPSO Alpha","system_name":"Sistema hidráulico","last_maintenance_dates":["12/04/2025 - troca de óleo"],"current_hourmeter":870}'
```

## 📊 Status
- ✅ Implementation: Complete
- ✅ Tests: 13/13 passing
- ✅ Build: Successful
- ✅ Linting: Clean
- ✅ Documentation: Complete

## 📁 Files
```
pages/api/mmi/forecast/route.ts        # Main endpoint
src/tests/mmi-forecast-api.test.ts     # Tests
scripts/test-mmi-forecast.js           # Manual test
MMI_FORECAST_API_README.md             # Full docs
MMI_FORECAST_IMPLEMENTATION_SUMMARY.md # Summary
MMI_FORECAST_VISUAL_SUMMARY.md         # Visual guide
```

## ⚠️ Error Responses
| Code | Description |
|------|-------------|
| 400 | Missing required fields |
| 405 | Method not allowed (not POST) |
| 500 | OpenAI API error or server error |

## 💻 Frontend Integration
```javascript
// Fetch with streaming
const response = await fetch('/api/mmi/forecast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vessel_name: 'FPSO Alpha',
    system_name: 'Sistema hidráulico do guindaste',
    last_maintenance_dates: ['12/04/2025 - troca de óleo'],
    current_hourmeter: 870
  })
});

// Read stream
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

## 🎓 Expected Output Format
```
📌 Próxima intervenção: [action]
📅 Justificativa: [reason]
⚠️ Impacto: [impact]
📈 Prioridade: [priority]
🔁 Frequência sugerida: [frequency]
```

## 🚀 Tech Stack
- Next.js Pages Router
- OpenAI GPT-4
- TypeScript (strict mode)
- Server-Sent Events (SSE)
- Vitest (testing)

---
**Ready to use!** 🎉
