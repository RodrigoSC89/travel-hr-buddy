# MMI Forecast IA - Intelligent Forecasting with GPT-4

## Overview

This module provides AI-powered maintenance forecasting using GPT-4 for the MMI (Maritime Maintenance Intelligence) system. It generates intelligent predictions for maintenance jobs, including next due dates, risk levels, and technical reasoning.

## Installation

The module is already integrated into the project. No additional installation required.

## Usage

### Basic Example

```typescript
import { generateForecastForJob } from "@/lib/mmi/forecast-ia";

const forecast = await generateForecastForJob({
  id: "job123",
  title: "Inspeção de bombas hidráulicas",
  system: "Hidráulico",
  lastExecuted: "2025-09-01",
  frequencyDays: 30,
  observations: "Ocorreram falhas intermitentes no alarme"
});

console.log(forecast);
/*
Output:
{
  next_due_date: "2025-10-05",
  risk_level: "alto",
  reasoning: "Manutenção crítica com falhas recentes, execução urgente recomendada."
}
*/
```

### With Service Orders Integration

```typescript
import { generateForecastForJob } from "@/lib/mmi/forecast-ia";
import { supabase } from "@/integrations/supabase/client";

async function createServiceOrderWithForecast(jobId: string) {
  // 1. Fetch job data from database
  const { data: job } = await supabase
    .from("mmi_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (!job) {
    throw new Error("Job not found");
  }

  // 2. Generate AI forecast
  const forecast = await generateForecastForJob({
    id: job.id,
    title: job.description,
    system: job.system,
    lastExecuted: job.last_executed_at,
    frequencyDays: job.frequency_days,
    observations: job.observations,
  });

  // 3. Create service order with forecast data
  const { data: order } = await supabase
    .from("mmi_service_orders")
    .insert({
      job_id: job.id,
      scheduled_date: forecast.next_due_date,
      priority: forecast.risk_level,
      ai_reasoning: forecast.reasoning,
      status: "pending",
    })
    .select()
    .single();

  return { order, forecast };
}
```

### Batch Processing

```typescript
import { generateForecastForJob } from "@/lib/mmi/forecast-ia";

async function generateForecastsForAllJobs(jobs: MMIJob[]) {
  const forecasts = await Promise.all(
    jobs.map(async (job) => {
      try {
        const forecast = await generateForecastForJob(job);
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

### Custom Risk Assessment

```typescript
import { generateForecastForJob } from "@/lib/mmi/forecast-ia";

async function assessMaintenanceRisk(jobId: string) {
  const job = await fetchJobData(jobId); // Your job fetching logic
  
  const forecast = await generateForecastForJob(job);

  // Map AI risk levels to your internal priority system
  const priorityMap = {
    "baixo": 1,
    "médio": 2,
    "alto": 3,
  };

  return {
    ...forecast,
    numericPriority: priorityMap[forecast.risk_level],
    shouldAlert: forecast.risk_level === "alto",
    daysUntilDue: calculateDaysUntilDue(forecast.next_due_date),
  };
}

function calculateDaysUntilDue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

## API Reference

### `generateForecastForJob(job: MMIJob): Promise<ForecastResult>`

Generates an intelligent forecast for a maintenance job using GPT-4.

#### Parameters

- `job: MMIJob` - The maintenance job data

```typescript
type MMIJob = {
  id: string;              // Unique job identifier
  title: string;           // Job title/description
  system: string;          // System name (e.g., "Hidráulico", "Elétrico")
  lastExecuted: string | null; // ISO date string of last execution (or null)
  frequencyDays: number;   // Expected frequency in days
  observations?: string;   // Optional observations or notes
};
```

#### Returns

Returns a `Promise<ForecastResult>` with the forecast data:

```typescript
type ForecastResult = {
  next_due_date: string;   // ISO date string for next due date
  risk_level: "baixo" | "médio" | "alto"; // Risk assessment
  reasoning: string;       // Technical justification (max ~300 chars)
};
```

## Configuration

The module uses the OpenAI client from `@/lib/ai/openai-client`, which requires:

- Environment variable: `VITE_OPENAI_API_KEY`
- Model: GPT-4
- Temperature: 0.2 (for consistent, deterministic results)

## Error Handling

```typescript
import { generateForecastForJob } from "@/lib/mmi/forecast-ia";

try {
  const forecast = await generateForecastForJob(job);
  // Use forecast data
} catch (error) {
  if (error.message.includes("API key")) {
    console.error("OpenAI API key not configured");
  } else if (error.message.includes("rate limit")) {
    console.error("Rate limit exceeded, try again later");
  } else {
    console.error("Failed to generate forecast:", error);
  }
}
```

## Testing

Tests are located in `tests/forecast-ia.test.ts`.

Run tests:
```bash
npm test tests/forecast-ia.test.ts
```

## Integration Points

This module integrates with:

1. **MMI Jobs System** - Processes maintenance job data
2. **Service Orders (OS)** - Can be used to automatically create service orders
3. **OpenAI GPT-4** - Uses AI for intelligent predictions
4. **Supabase** - Can store forecast results for historical tracking

## Best Practices

1. **Cache Results**: Store forecast results in database to avoid repeated API calls
2. **Rate Limiting**: Implement rate limiting for batch operations
3. **Error Recovery**: Always handle API errors gracefully with fallback logic
4. **Validation**: Validate job data before sending to GPT-4
5. **Monitoring**: Log forecast accuracy over time to improve prompts

## Future Enhancements

Potential improvements for future versions:

- Historical forecast accuracy tracking
- Multi-language support
- Custom risk level definitions per system
- Integration with IoT sensor data
- Automated service order creation based on high-risk forecasts
