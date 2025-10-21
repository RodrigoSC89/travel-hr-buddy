# AI Maintenance Orchestrator - Quick Reference

## Quick Start
1. Navigate to `/control-hub` to view the MaintenanceDashboard
2. Dashboard auto-refreshes every 60 seconds
3. Monitor color-coded risk indicators

## Risk Levels
| Level | Risk Score | Color | Action |
|-------|-----------|-------|--------|
| Normal ✅ | < 0.3 | Green | Equipment operating normally |
| Atenção ⚠️ | 0.3 - 0.7 | Yellow | Inspection recommended |
| Crítico 🔧 | ≥ 0.7 | Red | Preventive repair required (IMCA M254) |

## API Usage

### Run Maintenance Analysis
```typescript
import { runMaintenanceOrchestrator } from '@/lib/ai/maintenance-orchestrator';

const result = await runMaintenanceOrchestrator({
  generator_load: 75,      // 0-100%
  position_error: 1.2,     // meters
  vibration: 3.5,          // mm/s
  temperature: 55,         // °C
  power_fluctuation: 5,    // %
});

console.log(result.risk_level);  // 'Normal' | 'Atenção' | 'Crítico'
console.log(result.message);     // Descriptive message
```

## MQTT Topics
- **Alerts**: `nautilus/maintenance/alert`
- **Payload**: `{ level, score, message, timestamp }`

## Database

### Query Recent Logs
```sql
SELECT * FROM maintenance_logs 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Filter by Risk Level
```sql
SELECT * FROM maintenance_logs 
WHERE level = 'Crítico'
ORDER BY timestamp DESC;
```

## Integration Points

### Telemetry Endpoints (To Be Implemented)
- `/api/dp/telemetry` - DP system telemetry
- `/api/control/telemetry` - Control system telemetry

### Component Integration
```tsx
import MaintenanceDashboard from '@/components/maintenance/MaintenanceDashboard';

<MaintenanceDashboard />
```

## Compliance Standards
- IMCA M109: Predictive maintenance monitoring
- IMCA M140: Equipment failure prevention
- IMCA M254: Preventive repair procedures
- ISM Code: Safety management systems
- NORMAM 101: Vessel equipment standards

## Files
- **Core**: `src/lib/ai/maintenance-orchestrator.ts`
- **UI**: `src/components/maintenance/MaintenanceDashboard.tsx`
- **Model**: `public/models/nautilus_maintenance_predictor.onnx`
- **Migration**: `supabase/migrations/20251021180000_create_maintenance_logs.sql`
- **Integration**: `src/pages/ControlHub.tsx`

## Support
For issues or questions, check the full implementation guide: `AI_MAINTENANCE_ORCHESTRATOR_IMPLEMENTATION.md`
