# DP Advisor Quick Reference

## 📋 Quick Start

### What is DP Advisor?
An AI-powered assistant that monitors Dynamic Positioning systems in real-time and provides optimization recommendations.

### Where to Find It
Navigate to: **DP Intelligence Center** → See the "DP Advisor — Otimização em Tempo Real" card

### Status Levels

| Level | Color | Meaning |
|-------|-------|---------|
| ✅ OK | Green | Sistema DP dentro dos limites |
| ⚠️ Risco | Yellow | Risco crescente — revisar thrust allocation e referência ativa |
| 🔴 Crítico | Red | Alerta de perda de posição! Verificar sensores de heading e standby thrusters |

## 🔧 Developer Reference

### Import the Engine
```typescript
import { runDPAdvisor } from "@/lib/ai/dp-advisor-engine";

const telemetry = {
  windSpeed: 15.5,
  currentSpeed: 2.3,
  mode: "AUTO",
  load: 75.0,
  generatorLoad: 65.0,
  positionError: 0.5
};

const advice = await runDPAdvisor(telemetry);
// Returns: { level: "OK", message: "..." }
```

### Import the Component
```typescript
import DPAdvisorPanel from "@/components/dp-intelligence/DPAdvisorPanel";

// Use in JSX
<DPAdvisorPanel />
```

### MQTT Integration
```typescript
import { publishEvent } from "@/lib/mqtt/publisher";

// Advice is automatically published to:
// Topic: nautilus/dp/advice
// Payload: { level: "OK|Risco|Crítico", message: "..." }
```

### Database Logging
```typescript
// Automatically logged to Supabase table: dp_advisor_logs
// Columns: id, timestamp, level, message, created_at
```

## 📊 Data Flow

```
Telemetry API → DP Advisor Engine → ONNX Model → Risk Classification
                                         ↓
                                    MQTT Publish
                                         ↓
                                  Supabase Logging
                                         ↓
                                    UI Display
```

## 🔌 API Endpoint Required

Create endpoint `/api/dp/telemetry` that returns:

```json
{
  "windSpeed": 15.5,
  "currentSpeed": 2.3,
  "mode": "AUTO",
  "load": 75.0,
  "generatorLoad": 65.0,
  "positionError": 0.5
}
```

## 🗄️ Supabase Setup

Run the migration:
```sql
-- File: supabase/migrations/20251021180000_create_dp_advisor_logs.sql
-- This creates the dp_advisor_logs table with proper indexes and RLS
```

Apply via Supabase CLI:
```bash
supabase migration up
```

Or apply manually in Supabase Dashboard → SQL Editor

## 🧪 Testing

### Check if Component Renders
```bash
npm run dev
# Navigate to: http://localhost:8080/dp-intelligence
```

### Verify Build
```bash
npm run build
# Should complete without errors
```

### Check MQTT Messages
Monitor the `nautilus/dp/advice` topic on your MQTT broker

### Check Database Logs
```sql
SELECT * FROM dp_advisor_logs ORDER BY timestamp DESC LIMIT 10;
```

## 🐛 Troubleshooting

### Component Not Showing
- Check browser console for errors
- Verify `/api/dp/telemetry` endpoint exists
- Check network tab for API calls

### No MQTT Messages
- Verify `VITE_MQTT_URL` environment variable
- Check MQTT broker connection
- Look for MQTT errors in browser console

### No Database Logs
- Verify Supabase connection
- Check RLS policies
- Ensure user is authenticated

### Build Errors
- Run `npm run build` to see detailed errors
- Check for TypeScript errors with `npm run type-check`
- Lint code with `npm run lint`

## 📈 Performance

- **Refresh Interval**: 30 seconds
- **Model Inference**: ~50ms (lightweight ONNX model)
- **MQTT Publish**: Near real-time
- **Database Insert**: Async, non-blocking

## 🔐 Security

- ✅ Row Level Security enabled on `dp_advisor_logs`
- ✅ Only authenticated users can read/insert
- ✅ MQTT uses secure WebSocket (wss://)
- ✅ Telemetry API should require authentication

## 📚 Related Standards

- **IMCA M103**: DP Vessel Design & Operations
- **IMCA M117**: DP Philosophy Guidelines
- **IMCA M166**: DP Operations Guidance
- **NORMAM 101**: Brazilian Maritime Regulations

## 🔗 Related Components

- `DPOverview` - Overall DP system status
- `DPRealtime` - Real-time DP telemetry
- `DPAIAnalyzer` - AI-powered incident analysis
- `DPIntelligenceDashboard` - DP incident statistics

## 📞 Support

For issues or questions:
1. Check the main implementation guide: `DP_ADVISOR_PATCH20_IMPLEMENTATION.md`
2. Review the code comments in source files
3. Check the repository issues on GitHub
