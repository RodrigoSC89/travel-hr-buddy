# SGSO Effectiveness Monitoring - Implementation Guide

## Overview

This implementation adds comprehensive SGSO (Sistema de Gestão de Segurança Operacional) effectiveness monitoring to track the success of safety action plans and provide data-driven insights for continuous improvement.

## Features

### 📉 Incident Recurrence Tracking
- Monitors repeated incidents by SGSO category
- Categories: Erro humano, Falha técnica, Comunicação, Falha organizacional
- Calculates effectiveness percentage: `100 - (repeated incidents / total incidents × 100)`
- Visual indicators with color-coded alerts:
  - Green (≥90%): Excelente
  - Yellow (75-89%): Bom
  - Orange (50-74%): Regular
  - Red (<50%): Crítico

### ⏱️ Resolution Time Analysis
- Tracks average resolution time in days from incident creation to closure
- Helps identify bottlenecks in the action plan process
- Enables optimization of operational routines

### 🚢 Vessel Benchmarking
- Compares effectiveness across different vessels
- Identifies best practices for knowledge sharing
- Highlights vessels needing additional support

### 📊 Interactive Dashboard
- Three view modes:
  1. **General Overview**: Overall effectiveness by category
  2. **By Vessel**: Vessel-specific performance comparison
  3. **Detailed Table**: Complete data with all metrics
- Interactive bar charts using Recharts
- Summary cards showing total incidents, recurrences, and overall effectiveness
- Strategic insights section for QSMS improvement guidance

## Technical Architecture

### Database Layer

#### Migration: `20251018000000_add_effectiveness_tracking_fields.sql`

New columns added to `dp_incidents` table:
- `sgso_category` (TEXT): SGSO category classification
- `action_plan_date` (TIMESTAMP): Action plan creation date
- `resolved_at` (TIMESTAMP): Resolution completion date
- `repeated` (BOOLEAN): Repeat incident flag

#### PostgreSQL Functions

**`calculate_sgso_effectiveness()`**
- Returns overall effectiveness data by category
- Aggregates: total incidents, repeated incidents, effectiveness %, avg resolution days

**`calculate_sgso_effectiveness_by_vessel()`**
- Provides vessel-specific breakdown
- Same metrics as above but grouped by vessel and category

### Backend API

**Endpoint**: `GET /api/sgso/effectiveness`

Query Parameters:
- `by_vessel=true`: Returns vessel-specific metrics (optional)

Response Types:
```typescript
interface EffectivenessData {
  category: string;
  incidents_total: number;
  incidents_repeated: number;
  effectiveness_percent: number;
  avg_resolution_days: number;
}

interface EffectivenessDataByVessel extends EffectivenessData {
  vessel: string;
}
```

### Frontend Component

**Component**: `SGSOEffectivenessChart`

Location: `src/components/sgso/SGSOEffectivenessChart.tsx`

Features:
- 400+ lines of React/TypeScript
- Recharts integration for interactive visualizations
- Responsive design (desktop, tablet, mobile)
- Loading states and error handling
- Empty state messages
- Custom tooltips with detailed information
- Color-coded effectiveness indicators

### Admin Integration

**Page**: `/admin/sgso`

New "Efetividade" tab added with:
- Full effectiveness monitoring dashboard
- Strategic insights section
- Seamless integration with existing SGSO tabs
- Consistent UI/UX design

## Usage

### Accessing the Dashboard

1. Navigate to `/admin/sgso`
2. Click on the "Efetividade" tab
3. View the effectiveness metrics

### View Modes

#### Overview Tab
- Shows effectiveness by SGSO category
- Bar chart with color-coded bars
- Strategic insights with recommendations

#### By Vessel Tab
- Select a vessel from the dropdown
- View vessel-specific effectiveness metrics
- Compare performance across categories

#### Table Tab
- Detailed table with all metrics
- Sortable columns
- Status badges for quick assessment

### Interpreting the Metrics

**Effectiveness Percentage**
- 90-100%: Excellent - Action plans are working well
- 75-89%: Good - Minor improvements needed
- 50-74%: Regular - Requires attention
- <50%: Critical - Immediate action required

**Average Resolution Days**
- Lower is better
- Indicates efficiency of action plan execution
- Use for process optimization

## Example Output

### Summary Cards
```
┌─────────────────────────┐
│ Total de Incidências    │
│        25               │
│ Todas as categorias     │
└─────────────────────────┘

┌─────────────────────────┐
│ Reincidências           │
│         5               │
│ 20% do total            │
└─────────────────────────┘

┌─────────────────────────┐
│ Efetividade Média       │
│       82.5%             │
│ Média de todas          │
└─────────────────────────┘
```

### Detailed Metrics Table

| Categoria              | Incidências | Repetidas | Efetividade | Média de Resolução | Status    |
|------------------------|-------------|-----------|-------------|--------------------|-----------|
| Erro humano            | 12          | 3         | 75%         | 4.2 dias          | Bom       |
| Falha técnica          | 9           | 1         | 88.9%       | 2.7 dias          | Bom       |
| Comunicação            | 6           | 0         | 100%        | 1.3 dias          | Excelente |
| Falha organizacional   | 8           | 2         | 75%         | 6.1 dias          | Bom       |

## Business Value

| Metric | Benefit |
|--------|---------|
| 💡 Efetividade por tipo | Identify which action plans work effectively |
| ⏱️ Tempo médio de resposta | Optimize operational routines and response times |
| 🚢 Efetividade por navio | Internal benchmarking between vessels |
| 📍 Insights para melhoria | Strategic direction for QSMS continuous improvement |

## Compliance

This implementation supports:
- ✅ ANP Resolução 43/2007
- ✅ IMCA Audit Requirements
- ✅ ISO Safety Management Standards
- ✅ Continuous Improvement (QSMS)

## Testing

### Test Suite: `src/tests/sgso-effectiveness-api.test.ts`

9 comprehensive tests covering:
- API structure validation
- Data type validation
- Calculation logic
- Edge cases
- Category validation
- Range validation

All tests passing (9/9) ✅

## Deployment Notes

1. **Apply Database Migration**
   ```bash
   supabase migration up
   ```

2. **Verify SQL Functions**
   - Check that `calculate_sgso_effectiveness()` exists
   - Check that `calculate_sgso_effectiveness_by_vessel()` exists

3. **Populate Initial Data** (optional)
   - Update existing incidents with SGSO categories
   - Set action_plan_date and resolved_at fields

4. **Access Dashboard**
   - Navigate to `/admin/sgso`
   - Click "Efetividade" tab

## Configuration

No additional configuration required. The system uses existing Supabase configuration from environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### No Data Showing
- Ensure incidents have `sgso_category` assigned
- Check that database migration was applied
- Verify API endpoint is accessible

### Error Fetching Data
- Check Supabase connection
- Verify environment variables are set
- Check browser console for detailed error messages

### Charts Not Rendering
- Ensure Recharts is installed: `npm install recharts`
- Check browser compatibility
- Verify data structure matches expected format

## Future Enhancements

Potential additions for future versions:
- Export effectiveness reports to PDF
- Email notifications for low effectiveness categories
- Trend analysis over time
- Predictive analytics for incident prevention
- Integration with external BI tools

## Support

For issues or questions:
1. Check this documentation
2. Review test suite for usage examples
3. Check implementation in `src/components/sgso/SGSOEffectivenessChart.tsx`
4. Contact QSMS team for assistance
