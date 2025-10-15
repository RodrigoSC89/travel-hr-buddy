# Forecast Mock API

## Overview

This module provides a mock API endpoint for testing the maintenance forecast functionality using OpenAI's GPT-4 model. It simulates predictive maintenance analysis without requiring access to the production database.

## Files

### `/pages/api/dev/test-forecast-with-mock.ts`

API endpoint that:
- Uses mock maintenance job data
- Analyzes job trends by component
- Generates AI-powered forecasts for the next 2 months
- Identifies critical components requiring attention

**Endpoint:** `/api/dev/test-forecast-with-mock`

**Method:** GET (or any)

**Response:**
```json
{
  "forecast": "AI-generated forecast text in Portuguese..."
}
```

### `/lib/dev/mocks/jobsForecastMock.ts`

Mock data file containing:
- Sample maintenance job records
- 22 jobs across 7 different components
- Realistic patterns including:
  - High-frequency maintenance (Engine)
  - Increasing failure patterns (Electrical System)
  - Stable components (Propulsion, Navigation)
  - Sporadic maintenance (Fuel System)

## Usage

### Requirements

- OpenAI API key set in `OPENAI_API_KEY` environment variable
- Node.js environment with OpenAI SDK installed

### Running the Endpoint

Since this is a Vite-based React application, the Next.js-style API routes won't work automatically. To use this endpoint in development:

1. **Option 1:** Implement a custom API server (e.g., Express) that imports and executes the handler
2. **Option 2:** Convert to a Supabase Edge Function
3. **Option 3:** Use during testing by importing the mock data and processing logic directly

### Example Implementation

```typescript
import { mockJobs } from '@/lib/dev/mocks/jobsForecastMock';

// Process mock data
const trendByComponent: Record<string, string[]> = {};
mockJobs.forEach(job => {
  const month = job.completed_at.slice(0, 7);
  if (!trendByComponent[job.component_id]) {
    trendByComponent[job.component_id] = [];
  }
  trendByComponent[job.component_id].push(month);
});

console.log('Trend by component:', trendByComponent);
```

## Mock Data Structure

Each job record contains:
- `id`: Unique job identifier
- `component_id`: Component identifier (e.g., "ENG-001")
- `component_name`: Human-readable component name
- `completed_at`: ISO 8601 timestamp
- `status`: Job status (always "completed" in mock data)
- `priority`: Priority level (low, medium, high, critical)

## Components in Mock Data

1. **ENG-001** - Motor Principal A (5 jobs, high frequency)
2. **HYD-001** - Sistema Hidráulico (3 jobs, moderate)
3. **COOL-001** - Sistema de Resfriamento (2 jobs, regular)
4. **ELEC-001** - Sistema Elétrico (6 jobs, increasing pattern - CRITICAL)
5. **PROP-001** - Sistema de Propulsão (2 jobs, stable)
6. **NAV-001** - Sistema de Navegação (2 jobs, low frequency)
7. **FUEL-001** - Sistema de Combustível (2 jobs, sporadic)

## AI Prompt

The endpoint uses a Portuguese-language prompt that:
- Identifies the AI as an embedded maintenance AI
- Provides trend data organized by component and month
- Requests a 2-month forecast
- Asks to highlight critical components

## Testing

The mock data is ideal for:
- Local development without database access
- Testing AI forecast generation
- Validating trend analysis algorithms
- UI/UX testing with realistic data patterns
- Demonstrating predictive maintenance capabilities

## Notes

- The endpoint uses GPT-4 model with temperature 0.4 for consistent, focused responses
- All dates in mock data are from August-October 2024
- The electrical system (ELEC-001) is designed to show an increasing failure pattern
- Responses are in Portuguese to match the Nautilus One system language
