# SGSO Effectiveness Monitoring - Quick Reference

## Quick Start

1. **Access**: Navigate to `/admin/sgso` → "Efetividade" tab
2. **View**: Choose between Overview, By Vessel, or Table view
3. **Analyze**: Review metrics and strategic insights

## Key Metrics

### Effectiveness Percentage
```
Effectiveness = 100 - (Repeated Incidents / Total Incidents × 100)
```

### Color Indicators
- 🟢 Green (≥90%): Excelente
- 🟡 Yellow (75-89%): Bom  
- 🟠 Orange (50-74%): Regular
- 🔴 Red (<50%): Crítico

## SGSO Categories

1. **Erro humano** - Human error related incidents
2. **Falha técnica** - Technical failures
3. **Comunicação** - Communication issues
4. **Falha organizacional** - Organizational failures

## API Endpoints

### Get Overall Effectiveness
```
GET /api/sgso/effectiveness
```

Response:
```json
[
  {
    "category": "Erro humano",
    "incidents_total": 12,
    "incidents_repeated": 3,
    "effectiveness_percent": 75,
    "avg_resolution_days": 4.2
  }
]
```

### Get By Vessel
```
GET /api/sgso/effectiveness?by_vessel=true
```

Response:
```json
[
  {
    "vessel": "DP Shuttle Tanker X",
    "category": "Falha técnica",
    "incidents_total": 5,
    "incidents_repeated": 1,
    "effectiveness_percent": 80,
    "avg_resolution_days": 3.2
  }
]
```

## Database Schema

### New Fields in `dp_incidents`

| Field | Type | Description |
|-------|------|-------------|
| `sgso_category` | TEXT | SGSO category classification |
| `action_plan_date` | TIMESTAMP | Action plan creation date |
| `resolved_at` | TIMESTAMP | Resolution completion date |
| `repeated` | BOOLEAN | Repeat incident flag |

### SQL Functions

**`calculate_sgso_effectiveness()`**
- Returns: category, incidents_total, incidents_repeated, effectiveness_percent, avg_resolution_days
- Groups by: sgso_category

**`calculate_sgso_effectiveness_by_vessel()`**
- Returns: vessel, category, incidents_total, incidents_repeated, effectiveness_percent, avg_resolution_days
- Groups by: vessel, sgso_category

## Component Usage

### Import
```typescript
import { SGSOEffectivenessChart } from "@/components/sgso/SGSOEffectivenessChart";
```

### Use
```tsx
<SGSOEffectivenessChart />
```

## File Structure

```
📁 Project Root
├── 📄 supabase/migrations/20251018000000_add_effectiveness_tracking_fields.sql
├── 📄 pages/api/sgso/effectiveness.ts
├── 📄 src/components/sgso/SGSOEffectivenessChart.tsx
├── 📄 src/components/sgso/index.ts (export added)
├── 📄 src/pages/admin/sgso.tsx (tab added)
└── 📄 src/tests/sgso-effectiveness-api.test.ts
```

## Common Tasks

### Update Incident with Effectiveness Data
```sql
UPDATE dp_incidents
SET 
  sgso_category = 'Falha técnica',
  action_plan_date = NOW(),
  resolved_at = NOW() + INTERVAL '5 days',
  repeated = false
WHERE id = 'incident-id';
```

### Query Effectiveness by Category
```sql
SELECT * FROM calculate_sgso_effectiveness();
```

### Query Effectiveness by Vessel
```sql
SELECT * FROM calculate_sgso_effectiveness_by_vessel()
WHERE vessel = 'DP Shuttle Tanker X';
```

## Testing

Run tests:
```bash
npm test -- src/tests/sgso-effectiveness-api.test.ts
```

Expected: 9/9 tests passing ✅

## Deployment Checklist

- [ ] Apply database migration
- [ ] Verify SQL functions created
- [ ] Test API endpoints
- [ ] Verify dashboard loads
- [ ] Check data displays correctly
- [ ] Test all three view modes

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No data showing | Check if incidents have sgso_category assigned |
| API error | Verify Supabase environment variables |
| Chart not rendering | Check Recharts installation |
| Empty state | Populate incidents with SGSO categories |

## Support & Documentation

- Full Guide: `SGSO_EFFECTIVENESS_GUIDE.md`
- Implementation: `src/components/sgso/SGSOEffectivenessChart.tsx`
- Tests: `src/tests/sgso-effectiveness-api.test.ts`
- Migration: `supabase/migrations/20251018000000_add_effectiveness_tracking_fields.sql`
