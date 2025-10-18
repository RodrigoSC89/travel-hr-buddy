# SGSO Effectiveness Monitoring Implementation Guide

## Overview

This implementation adds comprehensive effectiveness monitoring for SGSO (Sistema de Gestão de Segurança Operacional) action plans, allowing organizations to track the success of their safety initiatives and identify areas for improvement.

## Features

### 📊 Core Metrics Tracked

1. **📉 Redução de Reincidência** - Tracks repeated incidents by category
2. **⏱️ Tempo Médio de Resolução** - Monitors average resolution time (opening → closing)
3. **🧠 Taxa de Correção por Categoria** - Shows success rates for each incident category
4. **🚢 Efetividade por Embarcação** - Compares effectiveness across vessels

## Implementation Details

### Database Schema

The implementation extends the existing `safety_incidents` table with the following fields:

```sql
-- Added columns
sgso_category TEXT              -- Category: Erro humano, Falha técnica, etc.
action_plan_date TIMESTAMP      -- When the action plan was created
resolved_at TIMESTAMP           -- When the incident was fully resolved
repeated BOOLEAN                -- Whether this is a repeat incident
```

### SQL Functions

Two database functions were created to calculate effectiveness metrics:

#### 1. `calculate_sgso_effectiveness()`
Returns overall effectiveness metrics grouped by category:
- Total incidents per category
- Number of repeated incidents
- Effectiveness percentage (100 - reincidence rate)
- Average resolution time in days

#### 2. `calculate_sgso_effectiveness_by_vessel()`
Returns the same metrics but grouped by vessel and category, enabling:
- Vessel-to-vessel comparisons
- Identification of vessels needing additional support
- Benchmarking internal best practices

### API Endpoints

**GET** `/api/sgso/effectiveness`
- Returns overall effectiveness data by category

**GET** `/api/sgso/effectiveness?by_vessel=true`
- Returns effectiveness data grouped by vessel and category

**Response Structure:**
```json
{
  "category": "Erro humano",
  "incidents_total": 12,
  "incidents_repeated": 3,
  "effectiveness_percent": 75.00,
  "avg_resolution_days": 4.2
}
```

### Frontend Component

**SGSOEffectivenessChart** (`src/components/sgso/SGSOEffectivenessChart.tsx`)

Features:
- **Three Views:**
  - General Overview: Bar chart showing overall effectiveness by category
  - By Vessel: Separate charts for each vessel
  - Table View: Detailed data table with all metrics

- **Color-Coded Effectiveness:**
  - 🟢 Green (≥90%): Excellent
  - 🟡 Yellow (75-89%): Good
  - 🟠 Orange (50-74%): Moderate
  - 🔴 Red (<50%): Critical

- **Summary Cards:**
  - Total Resolved Incidents
  - Total Repeated Incidents
  - Overall Effectiveness Percentage

### Admin Page Integration

The effectiveness monitoring is integrated into the Admin SGSO page (`src/pages/admin/sgso.tsx`) as a new tab called "Efetividade".

The tab includes:
1. The effectiveness chart component
2. Strategic insights section with guidance on:
   - Effectiveness by type
   - Average response time optimization
   - Vessel-specific performance
   - Reincidence monitoring

## Usage

### Accessing the Dashboard

1. Navigate to `/admin/sgso`
2. Click on the "Efetividade" tab
3. View charts, metrics, and insights

### Understanding the Metrics

**Effectiveness Percentage:**
```
Effectiveness = 100 - (Repeated Incidents / Total Incidents × 100)
```

Example: If you have 12 incidents and 3 are repeated:
- Effectiveness = 100 - (3/12 × 100) = 75%

**Average Resolution Days:**
```
Avg Resolution = Average(resolved_at - created_at) in days
```

Only calculated for incidents with a `resolved_at` date.

### Data Requirements

For the dashboard to display meaningful data, the `safety_incidents` table needs:
- Incidents with `status` = 'resolved' or 'closed'
- Populated fields:
  - `sgso_category` - Required for grouping
  - `created_at` - Automatically set
  - `resolved_at` - Set when incident is resolved
  - `repeated` - Boolean flag for repeated incidents
  - `vessel_id` - Optional, for vessel-specific metrics

## Example Use Cases

### 1. Identify Problematic Categories
If "Erro humano" shows 50% effectiveness (high reincidence), this indicates:
- Action plans may not be addressing root causes
- Additional training might be needed
- Procedures may need revision

### 2. Optimize Response Times
If the average resolution time is increasing:
- Review resource allocation
- Streamline investigation processes
- Implement faster action plan approvals

### 3. Benchmark Vessels
If one vessel has significantly better effectiveness:
- Study their processes and procedures
- Share best practices with other vessels
- Recognize and reward high-performing teams

### 4. Track Improvement Over Time
Monitor effectiveness percentages month-over-month to:
- Validate that changes are working
- Identify trends (improving or declining)
- Report to stakeholders on safety initiatives

## Data Entry Best Practices

1. **Categorize Consistently:** Use standard SGSO categories:
   - Erro humano (Human Error)
   - Falha técnica (Technical Failure)
   - Comunicação (Communication)
   - Falha organizacional (Organizational Failure)

2. **Mark Repeated Incidents:** When an incident is similar to a previous one:
   - Set `repeated = true`
   - Reference the original incident
   - Document what changed since the first occurrence

3. **Record Resolution Dates:** Always set `resolved_at` when:
   - Action plans are completed
   - Corrective measures are verified
   - Incident can be formally closed

4. **Action Plan Dates:** Record `action_plan_date` when:
   - The action plan is formally approved
   - Work begins on corrective actions
   - This helps track time-to-action

## Technical Notes

### Performance Optimization
- Indexes created on:
  - `sgso_category`
  - `resolved_at`
  - `repeated`
  - `vessel_id` (already existed)

### Security
- RLS (Row Level Security) policies apply
- Functions use `SECURITY DEFINER`
- Only authenticated users can access the data

### Testing
- Comprehensive test suite in `src/tests/sgso-effectiveness-api.test.ts`
- Tests cover:
  - API endpoint behavior
  - Data structure validation
  - Calculation logic
  - Error handling

## Future Enhancements

Potential additions to consider:
1. **Trend Analysis:** Compare effectiveness month-over-month
2. **Alerts:** Notify when effectiveness drops below threshold
3. **Export:** Generate PDF reports with charts
4. **Predictive Analytics:** Forecast areas likely to have issues
5. **Integration:** Connect with external BI tools

## Support

For questions or issues with the effectiveness monitoring:
1. Check the test suite for usage examples
2. Review the SQL migration for schema details
3. Examine the API endpoint for data structures
4. Refer to the component code for UI behavior

## Compliance

This implementation supports:
- ✅ ANP Resolução 43/2007 compliance
- ✅ IMCA audit requirements
- ✅ ISO safety management standards
- ✅ Continuous improvement initiatives (QSMS)

## License

Part of the Travel HR Buddy project.
