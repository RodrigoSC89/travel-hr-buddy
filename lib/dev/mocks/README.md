# Mock Data for Development

This directory contains mock data files for testing and prototyping features locally.

## Jobs Forecast Mock Data

### File: `jobsForecastMock.ts`

Mock data for testing job completion forecasting endpoints and dashboard visualizations.

#### Structure

```typescript
{
  component_id: string;  // Component identifier (e.g., "GEN-BB", "HID-P-01")
  completed_at: string;  // ISO date string (e.g., "2025-05-10")
}
```

#### Components Included

- **🔌 GEN-BB** (Gerador de Boreste) - 5 jobs
- **💧 HID-P-01** (Bomba hidráulica da popa) - 3 jobs
- **📡 RAD-PR-02** (Radar de Proa) - 2 jobs
- **🧭 DP-SYS-01** (Sistema de Posicionamento Dinâmico) - 4 jobs

Total: 14 mock jobs spanning from April to August 2025

#### Usage

```typescript
import { mockJobs } from "@/lib/dev/mocks/jobsForecastMock";

// Use in your component or test
console.log(mockJobs);

// Filter by component
const genBBJobs = mockJobs.filter(job => job.component_id === "GEN-BB");

// Group by month
const jobsByMonth = mockJobs.reduce((acc, job) => {
  const month = job.completed_at.substring(0, 7); // "2025-05"
  acc[month] = (acc[month] || 0) + 1;
  return acc;
}, {});

// Use with forecast endpoint
const response = await supabase.functions.invoke("bi-jobs-forecast", {
  body: { 
    trend: Object.entries(jobsByMonth).map(([date, jobs]) => ({
      date,
      jobs
    }))
  }
});
```

#### Integration Examples

##### With JobsForecastReport Component

```typescript
import { mockJobs } from "@/lib/dev/mocks/jobsForecastMock";
import JobsForecastReport from "@/components/bi/JobsForecastReport";

// Transform mock data to trend format
const trendData = mockJobs.reduce((acc, job) => {
  const month = job.completed_at.substring(0, 7);
  const existing = acc.find(item => item.date === month);
  if (existing) {
    existing.jobs++;
  } else {
    acc.push({ date: month, jobs: 1 });
  }
  return acc;
}, []);

// Use in component
<JobsForecastReport trend={trendData} />
```

##### With Dashboard Prototyping

```typescript
import { mockJobs } from "@/lib/dev/mocks/jobsForecastMock";

function JobsStatsPreview() {
  const componentStats = mockJobs.reduce((acc, job) => {
    acc[job.component_id] = (acc[job.component_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2>Jobs por Componente</h2>
      {Object.entries(componentStats).map(([component, count]) => (
        <div key={component}>
          {component}: {count} jobs
        </div>
      ))}
    </div>
  );
}
```

##### Testing Edge Functions Locally

```typescript
import { mockJobs } from "@/lib/dev/mocks/jobsForecastMock";

// Test bi-jobs-forecast endpoint
async function testForecastEndpoint() {
  const trendData = transformToTrendData(mockJobs);
  
  const { data, error } = await supabase.functions.invoke("bi-jobs-forecast", {
    body: { trend: trendData }
  });
  
  console.log("Forecast:", data?.forecast);
}
```

## Adding New Mock Data

To add more mock data files:

1. Create a new `.ts` file in this directory
2. Export your mock data with proper TypeScript types
3. Document the structure and usage in this README
4. Follow the project's linting rules (use double quotes, etc.)

## Notes

- Mock data is only for development and testing purposes
- Do not use mock data in production builds
- Keep mock data realistic to better simulate real-world scenarios
- Update mock data as data structures evolve
