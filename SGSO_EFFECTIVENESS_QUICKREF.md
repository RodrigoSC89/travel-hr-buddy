# SGSO Effectiveness Monitoring - Quick Reference

## Quick Access

### URL
```
/admin/sgso → "Efetividade" tab
```

### API Endpoint
```typescript
GET /api/sgso/effectiveness
GET /api/sgso/effectiveness?by_vessel=true
```

## Developer Quick Start

### 1. Database Fields
```sql
-- New fields in dp_incidents table
sgso_category TEXT CHECK (sgso_category IN (
  'Erro humano',
  'Falha técnica', 
  'Comunicação',
  'Falha organizacional'
))
action_plan_date TIMESTAMP WITH TIME ZONE
resolved_at TIMESTAMP WITH TIME ZONE
repeated BOOLEAN DEFAULT false
```

### 2. API Response Types
```typescript
// Overall effectiveness
interface SGSOEffectivenessData {
  categoria: string;
  total_incidencias: number;
  incidencias_repetidas: number;
  efetividade: number;
  tempo_medio_resolucao: number | null;
}

// By vessel
interface SGSOEffectivenessByVesselData {
  embarcacao: string;
  categoria: string;
  total_incidencias: number;
  incidencias_repetidas: number;
  efetividade: number;
  tempo_medio_resolucao: number | null;
}
```

### 3. Using the Component
```tsx
import { SGSOEffectivenessChart } from '@/components/sgso';

function MyPage() {
  return <SGSOEffectivenessChart />;
}
```

## Database Functions

### Calculate Overall Effectiveness
```sql
SELECT * FROM calculate_sgso_effectiveness();
```

Returns:
- categoria
- total_incidencias
- incidencias_repetidas
- efetividade (percentage)
- tempo_medio_resolucao (days)

### Calculate By Vessel
```sql
SELECT * FROM calculate_sgso_effectiveness_by_vessel();
```

Returns same fields plus `embarcacao`.

## API Usage Examples

### Fetch Overall Data
```typescript
const response = await fetch('/api/sgso/effectiveness');
const data = await response.json();
// data: SGSOEffectivenessData[]
```

### Fetch Vessel Data
```typescript
const response = await fetch('/api/sgso/effectiveness?by_vessel=true');
const data = await response.json();
// data: SGSOEffectivenessByVesselData[]
```

### Error Handling
```typescript
try {
  const response = await fetch('/api/sgso/effectiveness');
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
}
```

## Populating Data

### Set SGSO Category
```sql
UPDATE dp_incidents 
SET sgso_category = 'Erro humano'
WHERE id = 'incident-id';
```

### Set Action Plan Date
```sql
UPDATE dp_incidents 
SET action_plan_date = NOW()
WHERE id = 'incident-id';
```

### Mark as Resolved
```sql
UPDATE dp_incidents 
SET resolved_at = NOW()
WHERE id = 'incident-id';
```

### Flag as Repeated
```sql
UPDATE dp_incidents 
SET repeated = true
WHERE id = 'incident-id';
```

## Effectiveness Calculation

### Formula
```
Effectiveness = 100 - (repeated_incidents / total_incidents × 100)
```

### Examples
```
Total: 10, Repeated: 0  → 100% (Excelente)
Total: 10, Repeated: 1  → 90%  (Excelente)
Total: 10, Repeated: 2  → 80%  (Bom)
Total: 10, Repeated: 3  → 70%  (Regular)
Total: 10, Repeated: 6  → 40%  (Crítico)
```

## Color Thresholds

```typescript
function getEffectivenessColor(efetividade: number): string {
  if (efetividade >= 90) return '#10b981'; // Green
  if (efetividade >= 75) return '#f59e0b'; // Yellow
  if (efetividade >= 50) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

function getEffectivenessLabel(efetividade: number): string {
  if (efetividade >= 90) return 'Excelente';
  if (efetividade >= 75) return 'Bom';
  if (efetividade >= 50) return 'Regular';
  return 'Crítico';
}
```

## Component Props

### SGSOEffectivenessChart
```tsx
// No props required - fetches data automatically
<SGSOEffectivenessChart />
```

Component features:
- Automatic data fetching
- Loading states
- Error handling
- Three view modes
- Responsive design

## Testing

### Run Tests
```bash
npm test -- src/tests/sgso-effectiveness-api.test.ts
```

### Test Coverage
- 16 tests covering API functionality
- HTTP method validation
- Data retrieval
- Error handling
- Calculation logic

## Common Tasks

### Add New Incident with Effectiveness Tracking
```sql
INSERT INTO dp_incidents (
  vessel,
  incident_date,
  severity,
  title,
  description,
  sgso_category,
  action_plan_date,
  repeated
) VALUES (
  'DP Vessel Name',
  NOW(),
  'Alta',
  'Incident Title',
  'Description',
  'Erro humano',
  NOW(),
  false
);
```

### Update Incident to Resolved
```sql
UPDATE dp_incidents 
SET 
  resolved_at = NOW(),
  status = 'resolved'
WHERE id = 'incident-id';
```

### Query Effectiveness by Category
```sql
SELECT 
  categoria,
  efetividade,
  tempo_medio_resolucao
FROM calculate_sgso_effectiveness()
WHERE efetividade < 75
ORDER BY efetividade ASC;
```

### Find Vessels with Low Effectiveness
```sql
SELECT 
  embarcacao,
  categoria,
  efetividade
FROM calculate_sgso_effectiveness_by_vessel()
WHERE efetividade < 75
ORDER BY efetividade ASC;
```

## Troubleshooting

### No Data Showing
1. Check if incidents have `sgso_category` set
2. Verify database migration ran successfully
3. Check API endpoint is accessible
4. Review browser console for errors

### Incorrect Calculations
1. Verify `repeated` flag is set correctly
2. Check `action_plan_date` and `resolved_at` are populated
3. Run SQL functions manually to test
4. Check for null values in date fields

### API Errors
1. Check Supabase connection
2. Verify service role key is set
3. Check function exists in database
4. Review server logs for errors

## Performance Tips

### Optimize Queries
```sql
-- Use indexes (already created)
CREATE INDEX idx_dp_incidents_sgso_category ON dp_incidents(sgso_category);
CREATE INDEX idx_dp_incidents_resolved_at ON dp_incidents(resolved_at);
```

### Cache API Responses
```typescript
// Use React Query or SWR for caching
import { useQuery } from '@tanstack/react-query';

function useEffectivenessData() {
  return useQuery({
    queryKey: ['sgso-effectiveness'],
    queryFn: async () => {
      const res = await fetch('/api/sgso/effectiveness');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## File Locations

```
Database:
  supabase/migrations/20251018180000_add_effectiveness_tracking_fields.sql

API:
  pages/api/sgso/effectiveness.ts

Components:
  src/components/sgso/SGSOEffectivenessChart.tsx
  src/components/sgso/index.ts

Pages:
  src/pages/admin/sgso.tsx

Tests:
  src/tests/sgso-effectiveness-api.test.ts

Documentation:
  SGSO_EFFECTIVENESS_IMPLEMENTATION_COMPLETE.md
  SGSO_EFFECTIVENESS_VISUAL_SUMMARY.md
  SGSO_EFFECTIVENESS_QUICKREF.md
```

## Key Numbers

- **4** new database fields
- **2** PostgreSQL functions
- **4** performance indexes
- **3** view modes in UI
- **4** effectiveness levels (Green/Yellow/Orange/Red)
- **16** comprehensive tests
- **1,693** total tests passing
- **~1,770** lines of code added

## Support

### Getting Help
1. Check error messages in browser console
2. Review server logs for API errors
3. Test SQL functions directly in Supabase
4. Verify environment variables are set
5. Check documentation files for details

### Useful SQL Queries
```sql
-- Check data availability
SELECT sgso_category, COUNT(*) 
FROM dp_incidents 
WHERE sgso_category IS NOT NULL 
GROUP BY sgso_category;

-- Test effectiveness function
SELECT * FROM calculate_sgso_effectiveness();

-- Check recent incidents
SELECT id, vessel, sgso_category, action_plan_date, resolved_at, repeated
FROM dp_incidents
WHERE sgso_category IS NOT NULL
ORDER BY incident_date DESC
LIMIT 10;
```

## Next Steps

1. Apply database migration
2. Populate SGSO categories for existing incidents
3. Deploy application
4. Train users on new dashboard
5. Monitor effectiveness trends
6. Use insights for continuous improvement

---

**Quick Reference Version:** 1.0  
**Last Updated:** 2025-10-18  
**Status:** Production Ready
