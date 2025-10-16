# PainelMetricasRisco Component

## Overview
The `PainelMetricasRisco` component displays risk metrics by audit in a bar chart format, showing critical failures (falhas críticas) for each audit.

## Location
- **Component**: `src/components/admin/PainelMetricasRisco.tsx`
- **Demo Page**: `src/pages/admin/metricas-risco.tsx`
- **Route**: `/admin/metricas-risco`

## Features
- 📊 Bar chart visualization of risk metrics
- 🔴 Critical failures count (falhas_criticas) per audit
- 📈 Responsive design using Recharts library
- 🎨 Clean UI with shadcn/ui Card component

## API Endpoint
**Endpoint**: `/api/admin/metrics`
- **Method**: GET
- **Response**: Array of risk metrics

```typescript
interface MetricData {
  auditoria_id: string;
  falhas_criticas: number;
}
```

## Implementation Details

### Component Structure
```tsx
- PainelMetricasRisco
  ├── Title: "📊 Métricas de Risco por Auditoria"
  ├── Card
  │   └── BarChart
  │       ├── XAxis (auditoria_id, rotated -45°)
  │       ├── YAxis (no decimals)
  │       ├── Tooltip
  │       └── Bar (falhas_criticas, red color #dc2626)
```

### Data Flow
1. Component mounts and triggers `useEffect`
2. Fetches data from `/api/admin/metrics`
3. Updates state with response data
4. Chart renders with updated data

## Usage

### Import and Use
```tsx
import { PainelMetricasRisco } from "@/components/admin/PainelMetricasRisco";

function MyPage() {
  return <PainelMetricasRisco />;
}
```

### Standalone Page
Access the demo page at: `/admin/metricas-risco`

## API Implementation
The API endpoint (`pages/api/admin/metrics.ts`) queries the `auditorias_imca` table from Supabase and generates metrics data including:
- Audit ID (combination of ship name and ID)
- Critical failures count

## Testing
Tests are located in:
- `src/tests/painel-metricas-risco.test.tsx` - Component tests
- `src/tests/admin-metrics-api.test.ts` - API structure tests

Run tests with:
```bash
npm test -- src/tests/painel-metricas-risco.test.tsx
npm test -- src/tests/admin-metrics-api.test.ts
```

## Dependencies
- React 18.3+
- Recharts 2.15+
- shadcn/ui Card component
- @supabase/supabase-js

## Chart Configuration
- **Width**: 100% (responsive)
- **Height**: 400px
- **Bottom Margin**: 100px (to accommodate rotated labels)
- **Bar Color**: #dc2626 (red, indicating critical failures)
- **X-Axis**: 45° rotation, small font (10px)
- **Y-Axis**: No decimal values

## Future Enhancements
- Add loading state indicator
- Error handling with toast notifications
- Filter options (date range, audit type)
- Export to PDF/CSV functionality
- Real-time data updates
