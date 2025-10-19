# Etapa 2: AI Forecast Pipeline - Quick Reference

## 🎯 Quick Start

### One-Line Pipeline

```typescript
import { runForecastPipeline } from "@/lib/mmi";

// Generate AI forecast AND save to database in one call
const forecast = await runForecastPipeline(job);
```

## 📦 What You Get

### 3 Core Functions

1. **`generateForecastForJob(job)`** - AI forecast only
2. **`saveForecastToDB(forecast)`** - Database save only
3. **`runForecastPipeline(job)`** - Complete pipeline (AI + DB)

## 🔧 Job Structure

```typescript
const job: MMIJob = {
  id: "uuid-here",
  title: "Manutenção do sistema",
  component: {
    name: "Sistema hidráulico",
    current_hours: 1200,
    maintenance_interval_hours: 500,
    asset: {
      name: "Guindaste A1",
      vessel: "FPSO Alpha"
    }
  },
  status: "pending",
  priority: "high",
  due_date: "2025-11-30"
};
```

## 📊 Forecast Result

```typescript
const forecast: ForecastResult = {
  next_due_date: "2025-11-30",      // ISO date
  risk_level: "alto",               // baixo | médio | alto
  reasoning: "Justificativa..."     // Portuguese text
};
```

## 🎨 Risk Level Mapping

| Priority | → | Risk Level |
|----------|---|------------|
| critical | → | alto |
| high | → | alto |
| medium | → | médio |
| low | → | baixo |

## 💾 Database Save

```typescript
import { saveForecastToDB } from "@/lib/mmi";

await saveForecastToDB({
  job_id: "uuid",
  system: "Sistema hidráulico",
  next_due_date: "2025-11-30",
  risk_level: "alto",
  reasoning: "Justificativa técnica"
});
```

## 🚀 Usage Patterns

### Pattern 1: Complete Pipeline (Recommended)

```typescript
const forecast = await runForecastPipeline(job);
console.log("Forecast saved:", forecast);
```

### Pattern 2: Generate Only

```typescript
import { generateForecastForJob } from "@/lib/mmi";

const forecast = await generateForecastForJob(job);
// Do something with forecast, save later
```

### Pattern 3: Batch Processing

```typescript
const forecasts = await Promise.all(
  jobs.map(job => runForecastPipeline(job))
);
```

### Pattern 4: Error Handling

```typescript
try {
  const forecast = await runForecastPipeline(job);
  console.log("Success:", forecast);
} catch (error) {
  console.error("Failed:", error.message);
}
```

## 🧪 Testing

```bash
# Run forecast pipeline tests
npm test -- src/tests/mmi-forecast-pipeline.test.ts

# All tests
npm test

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## 📁 File Locations

| Purpose | File |
|---------|------|
| AI Generation | `src/lib/mmi/forecast-ia.ts` |
| Database Save | `src/lib/mmi/save-forecast.ts` |
| Pipeline | `src/lib/mmi/forecast-pipeline.ts` |
| Exports | `src/lib/mmi/index.ts` |
| Examples | `src/lib/mmi/examples.ts` |
| Tests | `src/tests/mmi-forecast-pipeline.test.ts` |
| Migration | `supabase/migrations/20251019214100_update_mmi_forecasts_etapa2.sql` |

## 🔑 Environment Variables

```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## 📊 Database Schema

### mmi_forecasts (Updated)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | FK to mmi_jobs |
| system | TEXT | System name |
| next_due_date | DATE | AI-predicted date |
| risk_level | TEXT | baixo/médio/alto |
| reasoning | TEXT | Technical justification |
| created_at | TIMESTAMPTZ | Auto-generated |

## 🎯 Common Tasks

### Create a Forecast

```typescript
import { runForecastPipeline } from "@/lib/mmi";

const job = { /* job data */ };
const forecast = await runForecastPipeline(job);
```

### Query Forecasts

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data } = await supabase
  .from("mmi_forecasts")
  .select("*")
  .eq("job_id", jobId);
```

### Filter by Risk

```typescript
const { data } = await supabase
  .from("mmi_forecasts")
  .select("*")
  .eq("risk_level", "alto")
  .order("next_due_date", { ascending: true });
```

### Upcoming Maintenance

```typescript
const { data } = await supabase
  .from("mmi_forecasts")
  .select("*")
  .gte("next_due_date", today)
  .lte("next_due_date", nextWeek)
  .order("next_due_date", { ascending: true });
```

## 🛠️ Troubleshooting

### OpenAI API Error

**Problem:** "OpenAI API key not configured"
**Solution:** Set `VITE_OPENAI_API_KEY` in `.env`

### Supabase Error

**Problem:** "Failed to save forecast"
**Solution:** Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Type Error

**Problem:** Job structure doesn't match MMIJob
**Solution:** Ensure `component.name` is present (minimum required)

### Risk Level Error

**Problem:** Invalid risk level value
**Solution:** Use only "baixo", "médio", or "alto"

## ✅ Validation Checklist

- [ ] Job has `id`, `title`, `component.name`
- [ ] Job has valid `status` (pending/in_progress/completed/cancelled/postponed)
- [ ] Job has valid `priority` (critical/high/medium/low)
- [ ] OpenAI API key configured
- [ ] Supabase credentials configured
- [ ] Migration applied to database

## 📚 Related Documentation

- Full Implementation: `ETAPA2_AI_FORECAST_PIPELINE_IMPLEMENTATION.md`
- Examples: `src/lib/mmi/examples.ts`
- Tests: `src/tests/mmi-forecast-pipeline.test.ts`

---

**Status:** ✅ Production Ready
**Version:** 2.0.0
**Last Updated:** 2025-10-19
