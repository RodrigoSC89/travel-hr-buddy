# MMI Forecast IA - Quick Reference

## 🚀 Quick Start

```typescript
import { generateForecastForJob } from "@/lib/mmi/forecast-ia";

const forecast = await generateForecastForJob({
  id: "job123",
  title: "Inspeção de bombas hidráulicas",
  system: "Hidráulico",
  lastExecuted: "2025-09-01",
  frequencyDays: 30,
  observations: "Falhas intermitentes"
});

// Returns: { next_due_date, risk_level, reasoning }
```

## 📦 Types

```typescript
type MMIJob = {
  id: string;
  title: string;
  system: string;
  lastExecuted: string | null;
  frequencyDays: number;
  observations?: string;
};

type ForecastResult = {
  next_due_date: string;
  risk_level: "baixo" | "médio" | "alto";
  reasoning: string;
};
```

## 📂 Files

- **Core**: `src/lib/mmi/forecast-ia.ts`
- **Client**: `src/lib/ai/openai-client.ts`
- **Types**: `src/lib/mmi/index.ts`
- **Examples**: `src/lib/mmi/examples.ts`
- **Tests**: `tests/forecast-ia.test.ts`
- **Docs**: `src/lib/mmi/README.md`

## ⚙️ Configuration

```bash
# Required environment variable
VITE_OPENAI_API_KEY=your_api_key_here
```

## 🧪 Testing

```bash
npm test tests/forecast-ia.test.ts
```

## 📊 Risk Levels

- **baixo**: Normal scheduling
- **médio**: Monitor closely
- **alto**: Urgent action required

## 🔗 Integration Example

```typescript
// Generate forecast and create service order
const forecast = await generateForecastForJob(job);

await supabase.from("mmi_service_orders").insert({
  job_id: job.id,
  scheduled_date: forecast.next_due_date,
  priority: forecast.risk_level,
  ai_reasoning: forecast.reasoning,
});
```

## 📈 Status

✅ Implementation Complete  
✅ 7/7 Tests Passing  
✅ Build Successful  
✅ Documentation Complete  
✅ Ready for Production

## 📚 More Info

See `MMI_FORECAST_IA_IMPLEMENTATION_COMPLETE.md` for full details.
