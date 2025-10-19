# MMI Forecast IA - Visual Guide

## 📁 Project Structure

```
travel-hr-buddy/
│
├── src/
│   └── lib/
│       ├── ai/
│       │   └── openai-client.ts        ← Shared OpenAI client (21 lines)
│       │
│       └── mmi/
│           ├── forecast-ia.ts          ← Core forecast logic (62 lines)
│           ├── index.ts                ← Module exports (7 lines)
│           ├── examples.ts             ← Usage examples (186 lines)
│           └── README.md               ← Complete documentation
│
└── tests/
    └── forecast-ia.test.ts             ← Test suite (270 lines, 7 tests)
```

**Total Code**: 546 lines  
**Test Coverage**: 7/7 tests passing ✓

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         MMI Job Input                            │
│  {                                                               │
│    id: "job123"                                                  │
│    title: "Inspeção de bombas hidráulicas"                      │
│    system: "Hidráulico"                                          │
│    lastExecuted: "2025-09-01"                                    │
│    frequencyDays: 30                                             │
│    observations: "Falhas intermitentes"                          │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              generateForecastForJob(job)                         │
│                                                                  │
│  1. Build context prompt with job data                          │
│  2. Call GPT-4 API (temperature: 0.2)                           │
│  3. Parse JSON response                                         │
│  4. Return structured forecast                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Forecast Result                             │
│  {                                                               │
│    next_due_date: "2025-10-05"                                   │
│    risk_level: "alto"                                            │
│    reasoning: "Manutenção crítica com falhas recentes..."       │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Usage Flow

### 1. Simple Forecast
```typescript
import { generateForecastForJob } from "@/lib/mmi";

const forecast = await generateForecastForJob(jobData);
// → Returns prediction with date, risk, and reasoning
```

### 2. Create Service Order
```typescript
import { generateForecastForJob } from "@/lib/mmi";
import { supabase } from "@/integrations/supabase/client";

// Generate forecast
const forecast = await generateForecastForJob(jobData);

// Create OS from forecast
await supabase.from("mmi_service_orders").insert({
  job_id: jobData.id,
  scheduled_date: forecast.next_due_date,
  priority: forecast.risk_level,
  ai_reasoning: forecast.reasoning,
});
```

### 3. Batch Processing
```typescript
import { generateForecastForJob } from "@/lib/mmi";

const jobs = await fetchAllJobs();
const forecasts = await Promise.all(
  jobs.map(job => generateForecastForJob(job))
);
```

---

## 🧪 Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   forecast-ia.test.ts                        │
│                                                              │
│  Mock Setup:                                                │
│  ├── Mock OpenAI client                                     │
│  └── Mock GPT-4 responses                                   │
│                                                              │
│  Test Cases:                                                │
│  ├── ✓ Valid forecast generation                           │
│  ├── ✓ Job without history                                 │
│  ├── ✓ Observations in prompt                              │
│  ├── ✓ Model & temperature config                          │
│  ├── ✓ Risk level validation                               │
│  ├── ✓ Reasoning length check                              │
│  └── ✓ Complete data in prompt                             │
│                                                              │
│  Result: 7/7 tests passing ✓                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Integration Points

```
┌──────────────────────────────────────────────────────────────────┐
│                    MMI Forecast IA Module                         │
└───────────┬──────────────────────────────────────┬───────────────┘
            │                                      │
            ▼                                      ▼
┌──────────────────────┐              ┌──────────────────────┐
│  Service Orders (OS) │              │   MMI Dashboard      │
│                      │              │                      │
│  • Auto-create OS    │              │  • Display forecasts │
│  • Set priority      │              │  • Risk indicators   │
│  • Schedule dates    │              │  • Charts & graphs   │
└──────────────────────┘              └──────────────────────┘
            │                                      │
            ▼                                      ▼
┌──────────────────────┐              ┌──────────────────────┐
│   Alert System       │              │  Historical Data     │
│                      │              │                      │
│  • High-risk alerts  │              │  • Forecast accuracy │
│  • Email/SMS         │              │  • Trend analysis    │
│  • Dashboard notify  │              │  • ML improvements   │
└──────────────────────┘              └──────────────────────┘
```

---

## 🎨 Risk Level Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                      Risk Levels                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🟢 BAIXO    │ Normal scheduling                            │
│             │ Standard maintenance                          │
│             │ Low urgency                                   │
│                                                              │
│  🟡 MÉDIO    │ Monitor closely                              │
│             │ Schedule soon                                 │
│             │ Medium urgency                                │
│                                                              │
│  🔴 ALTO     │ Urgent action required                       │
│             │ High risk of failure                          │
│             │ Immediate attention                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Example Output

### Input:
```json
{
  "id": "job123",
  "title": "Inspeção de bombas hidráulicas",
  "system": "Hidráulico",
  "lastExecuted": "2025-09-01",
  "frequencyDays": 30,
  "observations": "Ocorreram falhas intermitentes no alarme"
}
```

### GPT-4 Processing:
```
┌────────────────────────────────────────┐
│          GPT-4 Analysis               │
├────────────────────────────────────────┤
│ • Analyzes last execution date        │
│ • Considers frequency (30 days)       │
│ • Evaluates observations (failures)   │
│ • Calculates risk based on context    │
│ • Generates technical reasoning       │
│ • Suggests optimal next date          │
└────────────────────────────────────────┘
```

### Output:
```json
{
  "next_due_date": "2025-10-05",
  "risk_level": "alto",
  "reasoning": "Manutenção crítica com falhas recentes, execução urgente recomendada."
}
```

---

## 🚀 Quick Start

### 1. Installation
Already included in project - no installation needed!

### 2. Configure API Key
```bash
# .env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Use in Code
```typescript
import { generateForecastForJob } from "@/lib/mmi";

const forecast = await generateForecastForJob({
  id: "job123",
  title: "Manutenção preventiva",
  system: "Hidráulico",
  lastExecuted: "2025-09-01",
  frequencyDays: 30
});

console.log(forecast.next_due_date);  // "2025-10-05"
console.log(forecast.risk_level);     // "alto"
console.log(forecast.reasoning);      // Technical explanation
```

### 4. Run Tests
```bash
npm test tests/forecast-ia.test.ts
```

---

## 📚 Resources

- **Documentation**: `src/lib/mmi/README.md`
- **Examples**: `src/lib/mmi/examples.ts`
- **Tests**: `tests/forecast-ia.test.ts`
- **Summary**: `MMI_FORECAST_IA_IMPLEMENTATION_COMPLETE.md`

---

## ✅ Status

- ✅ Implementation Complete
- ✅ Tests Passing (7/7)
- ✅ Build Successful
- ✅ Documentation Complete
- ✅ Ready for Production

---

**Built with**: TypeScript, GPT-4, Vitest  
**License**: Project License  
**Author**: RodrigoSC89
