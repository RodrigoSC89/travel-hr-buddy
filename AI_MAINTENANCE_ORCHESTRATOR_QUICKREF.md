# AI Maintenance Orchestrator - Quick Reference

## 🚀 Quick Start

### View the Dashboard
1. Navigate to `/control-hub`
2. Look for "Maintenance Orchestrator — Previsão de Falhas" card
3. Observe real-time status updates (auto-refresh every 60s)

### Status Indicators
- ✅ **Green (Normal)**: Equipment operating within parameters
- ⚠️ **Yellow (Atenção)**: Wear trend identified, inspection recommended
- 🔧 **Red (Crítico)**: Imminent failure detected, preventive repair required

## 📁 File Locations

| Component | Path |
|-----------|------|
| Orchestrator | `src/lib/ai/maintenance-orchestrator.ts` |
| Dashboard | `src/components/maintenance/MaintenanceDashboard.tsx` |
| ONNX Model | `public/models/nautilus_maintenance_predictor.onnx` |
| Migration | `supabase/migrations/20251021180000_create_maintenance_logs.sql` |
| Integration | `src/pages/ControlHub.tsx` (line 18, 48) |

## 🔧 Key Functions

### `runMaintenanceOrchestrator(dpData, controlData)`
- **Inputs**: 
  - `dpData`: { generatorLoad, positionError }
  - `controlData`: { vibration, temperature, powerFluctuation }
- **Returns**: { level: string, message: string }
- **Side Effects**: 
  - Logs to Supabase `maintenance_logs` table
  - Publishes MQTT alert to `nautilus/maintenance/alert`

### `classifyRisk(value)`
- **Input**: Risk score (0.0 - 1.0)
- **Output**: Classification object
- **Thresholds**:
  - < 0.3 → Normal
  - 0.3-0.7 → Atenção
  - ≥ 0.7 → Crítico

## 🗄️ Database

### Table: `maintenance_logs`
```sql
CREATE TABLE maintenance_logs (
  id uuid PRIMARY KEY,
  timestamp timestamptz NOT NULL,
  level text CHECK (level IN ('Normal', 'Atenção', 'Crítico')),
  message text NOT NULL,
  created_at timestamptz NOT NULL
);
```

### Query Examples
```sql
-- Recent alerts
SELECT * FROM maintenance_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- Critical events
SELECT * FROM maintenance_logs 
WHERE level = 'Crítico' 
ORDER BY timestamp DESC;
```

## 📡 MQTT Topics

### Published
- **Topic**: `nautilus/maintenance/alert`
- **Payload**: `{ "level": "string", "message": "string" }`
- **QoS**: 0 (At most once)

## 🔐 Environment Variables

```bash
VITE_MQTT_URL=wss://broker.emqx.io:8084/mqtt
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_KEY
```

## 🧪 Testing Commands

```bash
# Type check
npm run type-check

# Build
npm run build

# Development server
npm run dev

# Deploy database migration
supabase db push
```

## 📊 Monitoring

### Dashboard Updates
- **Frequency**: Every 60 seconds
- **Endpoint**: Mock data (replace with real APIs)
- **UI Update**: Real-time via React state

### Logs
- **Browser Console**: Check for MQTT/Supabase errors
- **Supabase Dashboard**: View maintenance_logs table
- **MQTT Client**: Subscribe to `nautilus/maintenance/alert`

## 🛠️ Troubleshooting

### Dashboard not showing
1. Check if MaintenanceDashboard import is in ControlHub.tsx
2. Verify Suspense wrapper is present
3. Check browser console for errors

### ONNX model not loading
1. Verify file exists at `public/models/nautilus_maintenance_predictor.onnx`
2. Check browser Network tab for 404 errors
3. Ensure Vite serves files from public directory

### MQTT connection failed
1. Verify `VITE_MQTT_URL` in .env
2. Check if MQTT broker is accessible
3. Verify WebSocket support in browser

### Supabase insert failed
1. Check RLS policies on maintenance_logs table
2. Verify user authentication
3. Check Supabase logs for errors

## 📋 Compliance Checklist

- ✅ IMCA M109: Predictive maintenance monitoring
- ✅ IMCA M140: Equipment failure prevention
- ✅ IMCA M254: Preventive repair procedures
- ✅ ISM Code: Safety management systems
- ✅ NORMAM 101: Vessel equipment standards

## 🔄 Next Steps

1. **Implement Real APIs**
   - Create `/api/dp/telemetry` endpoint
   - Create `/api/control/telemetry` endpoint

2. **Train Production Model**
   - Collect historical failure data
   - Train ONNX model with real parameters
   - Deploy trained model to production

3. **Configure Production MQTT**
   - Set up secure MQTT broker
   - Configure authentication
   - Update VITE_MQTT_URL

4. **Enable Notifications**
   - Email alerts for critical events
   - SMS notifications for operators
   - Integration with existing systems

## 📞 Support

- Documentation: See `AI_MAINTENANCE_ORCHESTRATOR_IMPLEMENTATION.md`
- Issues: Check browser console and Supabase logs
- Questions: Review inline code comments
