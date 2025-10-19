# MMI Forecast Pipeline - AI-Powered Maintenance Forecasting

## Overview

**Etapa 2 Complete:** This module provides a complete AI-powered maintenance forecast pipeline using GPT-4o for the MMI (Maritime Maintenance Intelligence) system. It generates intelligent predictions for maintenance jobs and automatically persists them to the Supabase database.

## Features

✅ **AI Forecast Generation** - GPT-4o powered predictions
✅ **Database Persistence** - Automatic save to Supabase
✅ **Complete Pipeline** - One-line forecast generation and storage
✅ **Type-Safe** - Full TypeScript support
✅ **Risk Assessment** - Intelligent risk level mapping
✅ **Comprehensive Testing** - 22 passing tests

## Installation

The module is already integrated into the project. No additional installation required.

## Quick Start

### Complete Pipeline (Recommended)

```typescript
import { runForecastPipeline } from "@/lib/mmi";

const job = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Manutenção preventiva - Sistema hidráulico",
  component: {
    name: "Sistema hidráulico do guindaste",
    asset: { name: "Guindaste A1", vessel: "FPSO Alpha" }
  },
  status: "pending",
  priority: "high",
  due_date: "2025-11-30"
};

// Generate AI forecast AND save to database in one call
const forecast = await runForecastPipeline(job);

console.log(forecast);
/*
Output:
{
  next_due_date: "2025-11-30",
  risk_level: "alto",
  reasoning: "Manutenção crítica com alta prioridade requer atenção imediata."
}
*/
```

### AI Generation Only

```typescript
import { generateForecastForJob } from "@/lib/mmi";

// Generate forecast without saving to database
const forecast = await generateForecastForJob(job);
console.log("Forecast:", forecast);
// Process forecast before saving, or save later
```

### Database Save Only

```typescript
import { saveForecastToDB } from "@/lib/mmi";

// Save a pre-generated forecast
await saveForecastToDB({
  job_id: job.id,
  system: job.component.name,
  next_due_date: forecast.next_due_date,
  risk_level: forecast.risk_level,
  reasoning: forecast.reasoning
});
```

### Batch Processing

```typescript
import { runForecastPipeline } from "@/lib/mmi";

async function generateForecastsForAllJobs(jobs: MMIJob[]) {
  const forecasts = await Promise.all(
    jobs.map(async (job) => {
      try {
        const forecast = await runForecastPipeline(job);
        return { job, forecast, success: true };
      } catch (error) {
        console.error(`Failed to generate forecast for job ${job.id}:`, error);
        return { job, forecast: null, success: false };
      }
    })
  );

  return forecasts;
}
```

### Query Saved Forecasts

```typescript
import { supabase } from "@/integrations/supabase/client";

// Get forecast for a specific job
const { data: forecast } = await supabase
  .from("mmi_forecasts")
  .select("*")
  .eq("job_id", jobId)
  .single();

// Get all high-risk forecasts
const { data: highRisk } = await supabase
  .from("mmi_forecasts")
  .select("*")
  .eq("risk_level", "alto")
  .order("next_due_date", { ascending: true });

// Get upcoming maintenance (next 7 days)
const today = new Date().toISOString().split("T")[0];
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

const { data: upcoming } = await supabase
  .from("mmi_forecasts")
  .select("*")
  .gte("next_due_date", today)
  .lte("next_due_date", nextWeek)
  .order("next_due_date", { ascending: true });
```

## API Reference

### `runForecastPipeline(job: MMIJob): Promise<ForecastResult>`

Runs the complete forecast pipeline: generates AI forecast and saves to database.

**Recommended for most use cases.**

#### Parameters

- `job: MMIJob` - The maintenance job data

```typescript
type MMIJob = {
  id: string;
  title: string;
  description?: string;
  component: {
    name: string;
    current_hours?: number;
    maintenance_interval_hours?: number;
    asset?: {
      name: string;
      vessel?: string;
    };
  };
  status: "pending" | "in_progress" | "completed" | "cancelled" | "postponed";
  priority: "critical" | "high" | "medium" | "low";
  due_date?: string;
  completed_date?: string;
  metadata?: Record<string, any>;
};
```

#### Returns

Returns a `Promise<ForecastResult>` with the forecast data:

```typescript
type ForecastResult = {
  next_due_date: string;   // ISO date string (YYYY-MM-DD)
  risk_level: "baixo" | "médio" | "alto"; // Risk assessment
  reasoning: string;       // Technical justification in Portuguese
};
```

---

### `generateForecastForJob(job: MMIJob): Promise<ForecastResult>`

Generates an AI forecast using GPT-4o without saving to database.

Use when you need to process the forecast before saving.

---

### `saveForecastToDB(forecast: ForecastData): Promise<void>`

Saves a forecast to the database.

Use when you have a pre-generated forecast to save.

```typescript
type ForecastData = {
  job_id: string;
  system: string;
  next_due_date: string;
  risk_level: "baixo" | "médio" | "alto";
  reasoning: string;
};
```

## Configuration

### Required Environment Variables

```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### AI Model Configuration

- **Model:** GPT-4o (`gpt-4o`)
- **Temperature:** 0.2 (for consistent, deterministic results)
- **Response Format:** JSON object
- **Language:** Portuguese (Brazilian)

### Database Configuration

- **Table:** `mmi_forecasts`
- **RLS:** Enabled
- **Foreign Keys:** `job_id` → `mmi_jobs(id)`

## Risk Level Classification

The system automatically maps job priority to risk level:

| Job Priority | Risk Level | Description |
|-------------|-----------|-------------|
| critical | alto | Immediate attention required |
| high | alto | High priority maintenance |
| medium | médio | Standard maintenance schedule |
| low | baixo | Low priority, routine checks |

## Error Handling

```typescript
import { runForecastPipeline } from "@/lib/mmi";

try {
  const forecast = await runForecastPipeline(job);
  console.log("Forecast saved successfully:", forecast);
} catch (error) {
  if (error.message.includes("API key")) {
    console.error("OpenAI API key not configured");
  } else if (error.message.includes("rate limit")) {
    console.error("Rate limit exceeded, try again later");
  } else if (error.message.includes("Failed to save")) {
    console.error("Database error:", error);
  } else {
    console.error("Failed to generate forecast:", error);
  }
}
```

### Automatic Fallback

If AI generation fails, the system provides an automatic fallback:
- Uses job priority to determine risk level
- Uses due_date or calculates 30 days from now
- Provides a basic reasoning based on job data

## Testing

### Test Suite

Tests are located in `src/tests/mmi-forecast-pipeline.test.ts`.

**Coverage:**
- ✅ 22 test cases (100% passing)
- Data structure validation
- Risk level mapping
- Integration scenarios
- Error handling
- Date and UUID format validation

Run tests:
```bash
# Run forecast pipeline tests
npm test -- src/tests/mmi-forecast-pipeline.test.ts

# Run all MMI tests
npm test -- tests/mmi.test.ts src/tests/mmi-forecast-pipeline.test.ts

# Run all tests
npm test
```

### Build Validation

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

## Database Schema

### mmi_forecasts Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | UUID | Foreign key to mmi_jobs |
| system | TEXT | System name |
| next_due_date | DATE | AI-predicted next maintenance date |
| risk_level | TEXT | Risk level (baixo/médio/alto) |
| reasoning | TEXT | Technical justification from AI |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Indexes

- `idx_mmi_forecasts_job_id` - Fast job lookups
- `idx_mmi_forecasts_next_due_date` - Upcoming maintenance queries
- `idx_mmi_forecasts_risk_level` - Risk-based filtering

## Integration Points

This module integrates with:

1. **MMI Jobs System** - Complete job structure with components and assets
2. **MMI Components** - Horímetro tracking and maintenance intervals
3. **OpenAI GPT-4o** - Intelligent predictions in Portuguese
4. **Supabase** - Persistent forecast storage with RLS
5. **Future: Service Orders** - Automatic OS generation (Etapa 3)

## Best Practices

1. **Use Pipeline**: Always use `runForecastPipeline()` for complete workflow
2. **Validate Input**: Ensure job has required fields (id, title, component.name)
3. **Error Handling**: Always wrap calls in try-catch blocks
4. **Batch Processing**: Use Promise.all for multiple jobs efficiently
5. **Query Optimization**: Use indexes when querying forecasts by date or risk
6. **Monitor Costs**: Track OpenAI API usage for budget control

## Documentation

- **Full Guide:** `ETAPA2_AI_FORECAST_PIPELINE_IMPLEMENTATION.md`
- **Quick Reference:** `ETAPA2_AI_FORECAST_PIPELINE_QUICKREF.md`
- **Visual Summary:** `ETAPA2_AI_FORECAST_PIPELINE_VISUAL.md`
- **Examples:** `src/lib/mmi/examples.ts`
- **Tests:** `src/tests/mmi-forecast-pipeline.test.ts`

## What's Next

**Etapa 3: Gerar OS automaticamente**
- Automatic work order generation based on forecasts
- Integration with mmi_os table
- Notification system for high-risk forecasts
- Workflow automation

---

**Status:** ✅ Production Ready (Etapa 2 Complete)
**Version:** 2.0.0
**Last Updated:** 2025-10-19
