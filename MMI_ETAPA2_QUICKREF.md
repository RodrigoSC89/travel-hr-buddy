# MMI Forecast Pipeline - Quick Reference (Etapa 2 - Salvar Previsão IA)

## 🎯 Purpose
Save AI-generated maintenance forecasts to Supabase database with job association and risk assessment.

## 📦 Database Schema

```sql
-- New columns added to mmi_forecasts
job_id UUID         -- References mmi_jobs(id)
system TEXT         -- System name
next_due_date DATE  -- AI-predicted next maintenance date
risk_level TEXT     -- 'baixo', 'médio', or 'alto'
reasoning TEXT      -- AI justification
```

## 🚀 Quick Start

### Option 1: Complete Pipeline (Recommended)
```typescript
import { runForecastPipeline } from "@/lib/mmi";

await runForecastPipeline(job);
// ✅ Generates forecast with AI + saves to DB
```

### Option 2: Step by Step
```typescript
import { generateForecastForJob, saveForecastToDB } from "@/lib/mmi";

const forecast = await generateForecastForJob(job);
await saveForecastToDB({
  job_id: job.id,
  system: job.component.name,
  ...forecast
});
```

## 📝 Type Definitions

```typescript
type Forecast = {
  job_id: string
  system: string
  next_due_date: string      // Format: YYYY-MM-DD
  risk_level: 'baixo' | 'médio' | 'alto'
  reasoning: string
}

interface ForecastResult {
  next_due_date: string
  risk_level: 'baixo' | 'médio' | 'alto'
  reasoning: string
}
```

## 🔧 Functions

### `generateForecastForJob(job: MMIJob): Promise<ForecastResult>`
- Calls GPT-4 to analyze maintenance job
- Returns: next_due_date, risk_level, reasoning
- Auto-fallback on API errors

### `saveForecastToDB(forecast: Forecast): Promise<void>`
- Saves forecast to mmi_forecasts table
- Throws error on database failures

### `runForecastPipeline(job: MMIJob): Promise<void>`
- Combines both functions above
- End-to-end forecast generation and storage

## 🔐 Environment Variables

```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## ✅ Files Created

```
src/lib/mmi/
├── forecast-ia.ts       # AI forecast generation
├── save-forecast.ts     # Database operations
├── forecast-pipeline.ts # Pipeline orchestration
├── index.ts            # Exports
└── examples.ts         # Usage examples

supabase/migrations/
└── 20251019214100_update_mmi_forecasts_etapa2.sql

docs/
└── ETAPA2_IMPLEMENTATION_GUIDE.md  # Full documentation
```

## 🧪 Testing

```bash
npm test -- src/tests/mmi-forecast-pipeline.test.ts
```

## 📊 Migration

```bash
# Apply the migration in Supabase dashboard or via CLI
supabase db push
```

## ⚠️ Error Handling

```typescript
try {
  await runForecastPipeline(job);
} catch (error) {
  if (error.message.includes('IA')) {
    // AI generation failed
  } else if (error.message.includes('salvar')) {
    // Database save failed
  }
}
```

## 🎨 Risk Level Mapping

| Priority | Risk Level |
|----------|-----------|
| critical | alto      |
| high     | alto      |
| medium   | médio     |
| low      | baixo     |

## 📅 Date Calculation

AI considers:
- Job due date
- Priority level
- Component history
- System criticality

Fallback: due_date + 30 days

## 🔗 Integration Points

1. **Input**: MMIJob from mmi_jobs table
2. **Processing**: GPT-4 analysis
3. **Output**: Forecast saved to mmi_forecasts
4. **Next**: Auto-generate work orders (Etapa 3)

## 💡 Best Practices

1. ✅ Use `runForecastPipeline()` for simplicity
2. ✅ Handle errors appropriately
3. ✅ Validate job data before processing
4. ✅ Monitor OpenAI API quota
5. ✅ Check database constraints

## 🔄 Flow Diagram

```
MMIJob Input
     ↓
generateForecastForJob()
     ↓
  GPT-4 API
     ↓
ForecastResult
     ↓
saveForecastToDB()
     ↓
  Supabase
     ↓
Success ✅
```

## 🏁 Status

✅ Etapa 2 Complete
🧭 Next: Etapa 3 - Auto-generate Work Orders

## 📚 Related Documentation

- **Full Guide:** [ETAPA2_IMPLEMENTATION_GUIDE.md](./ETAPA2_IMPLEMENTATION_GUIDE.md)
- **Examples:** `src/lib/mmi/examples.ts`
- **Tests:** `src/tests/mmi-forecast-pipeline.test.ts`

---

**Status:** ✅ Complete and Production Ready  
**Last Updated:** 2025-10-19  
**Version:** MMI Forecast v1.0.0
