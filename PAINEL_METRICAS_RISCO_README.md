# PainelMetricasRisco Component

## Overview
The `PainelMetricasRisco` component displays comprehensive risk metrics visualization for audits, featuring vessel filtering and temporal evolution tracking. This component is now integrated into the SGSO Dashboard for operational safety management.

## Locations
- **Admin Component**: `src/components/admin/PainelMetricasRisco.tsx` (legacy)
- **SGSO Component**: `src/components/sgso/PainelMetricasRisco.tsx` (enhanced)
- **Integration**: `src/components/sgso/SgsoDashboard.tsx` (Métricas tab)
- **Demo Page**: `src/pages/admin/metricas-risco.tsx`
- **Route**: `/admin/metricas-risco`

## New Features (SGSO Integration)
- 📊 **Dual Chart Visualization**
  - Bar chart showing critical failures per audit
  - Line chart displaying temporal evolution of failures
- 🚢 **Vessel Filter**: Dropdown selector to filter metrics by specific vessels or view all data
- 📈 **Temporal Evolution**: Monthly aggregated trend analysis of critical failures
- 🔴 **Critical Failures Tracking**: Real-time data from auditorias_imca table
- 🎨 **Enhanced UI**: Cards with headers and responsive design

## API Endpoint
**Endpoint**: `/api/admin/metrics`
- **Method**: GET
- **Response**: Array of risk metrics with vessel information

```typescript
interface MetricData {
  auditoria_id: string;
  embarcacao: string;
  falhas_criticas: number;
  data_auditoria: string;
}
```

## Data Source
The API now fetches real data from the `auditorias_imca` Supabase table:
- Extracts vessel names from `metadata.vessel_name` or `nome_navio`
- Counts critical failures from the `findings.critical` JSONB field
- Returns formatted data optimized for chart rendering and temporal analysis

## Implementation Details

### Component Structure (SGSO Version)
```tsx
- PainelMetricasRisco
  ├── Header with Title and Vessel Filter
  ├── Card: "Falhas Críticas por Auditoria"
  │   └── BarChart (Critical Failures per Audit)
  └── Card: "Evolução Temporal de Falhas Críticas"
      └── LineChart (Monthly aggregated trends)
```

### Data Flow
1. Component mounts and triggers `useEffect`
2. Fetches data from `/api/admin/metrics`
3. Extracts unique vessel names for filter dropdown
4. Calculates temporal evolution (monthly aggregation)
5. Updates charts when filter selection changes
6. Renders both bar and line charts with filtered data

## Usage

### SGSO Dashboard Integration
Navigate to the SGSO page (`/sgso`), click on the "Métricas" tab to view the enhanced risk metrics panel alongside compliance metrics.

### Import and Use
```tsx
import { PainelMetricasRisco } from "@/components/sgso";

function SgsoDashboard() {
  return (
    <TabsContent value="metrics">
      <div className="space-y-6">
        <ComplianceMetrics />
        <PainelMetricasRisco />
      </div>
    </TabsContent>
  );
}
```

### Standalone Page (Legacy)
Access the demo page at: `/admin/metricas-risco`

## Chart Configurations

### Bar Chart (Critical Failures by Audit)
- **Width**: 100% (responsive)
- **Height**: 400px
- **Bottom Margin**: 100px (to accommodate rotated labels)
- **Bar Color**: #dc2626 (red, indicating critical failures)
- **X-Axis**: 45° rotation, small font (10px)
- **Y-Axis**: No decimal values
- **Features**: CartesianGrid, Legend, Tooltip

### Line Chart (Temporal Evolution)
- **Width**: 100% (responsive)
- **Height**: 300px
- **Line Color**: #dc2626 (red)
- **Line Type**: Monotone
- **Stroke Width**: 2px
- **Dots**: Visible with 4px radius
- **Features**: CartesianGrid, Legend, Tooltip
- **X-Axis**: Monthly labels (YYYY-MM format), 45° rotation

## Vessel Filter
- **Component**: shadcn/ui Select
- **Default**: "Todos" (All vessels)
- **Dynamic Options**: Populated from fetched audit data
- **Behavior**: Filters both bar chart and line chart data

## Dependencies
- React 18.3+
- Recharts 2.15+
- shadcn/ui components (Card, Select, Label)
- @supabase/supabase-js
- Next.js API Routes

## API Implementation Details
The enhanced API endpoint (`pages/api/admin/metrics.ts`) now:
1. Queries `auditorias_imca` table with `findings` and `metadata` JSONB fields
2. Extracts vessel name from `metadata.vessel_name` or falls back to `nome_navio`
3. Extracts critical failures count from `findings.critical` (defaults to 0 if not present)
4. Returns structured data including vessel name and audit date for temporal analysis
5. Handles errors gracefully with proper HTTP status codes

## Business Value
This implementation enables:
- **Data-driven decisions** through clear risk visualization
- **Proactive risk management** via temporal trend analysis
- **Vessel-specific tracking** for targeted safety improvements
- **Compliance tracking** for ANP regulations
- **Pattern recognition** through historical data visualization
- **BI system integration** with structured API data

## Future Enhancements
- Add date range filter for temporal analysis
- Export charts to PDF/CSV functionality
- Real-time data updates via websockets
- Drill-down capability to view audit details
- Comparison mode to compare multiple vessels
- Alert threshold configuration
- Predictive analytics integration
