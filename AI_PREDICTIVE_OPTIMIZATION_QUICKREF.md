# AI Predictive Optimization - Quick Reference (Patch 19)

## 🚀 Quick Start

### 1. Database Setup (5 minutes)
```sql
-- Create telemetry table in Supabase
create table dp_telemetry (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null,
  system text,
  parameter text,
  value float
);

create index idx_dp_telemetry_timestamp on dp_telemetry(timestamp desc);
alter table dp_telemetry enable row level security;

-- Allow read for all users
create policy "Enable read access for all users" on dp_telemetry
  for select using (true);

-- Allow insert for authenticated users
create policy "Enable insert for authenticated users only" on dp_telemetry
  for insert with check (auth.role() = 'authenticated');
```

### 2. Environment Variables (Already configured!)
```bash
# .env file (already in .env.example)
VITE_MQTT_URL=ws://localhost:1883
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

### 3. Test Data (Optional)
```sql
-- Insert sample telemetry data
INSERT INTO dp_telemetry (timestamp, system, parameter, value)
SELECT 
  now() - interval '1 minute' * n,
  'DP',
  'power',
  random() * 10
FROM generate_series(1, 100) n;
```

---

## 📂 File Structure

```
travel-hr-buddy/
├── src/
│   ├── lib/
│   │   └── ai/
│   │       └── forecast-engine.ts          ← AI prediction logic
│   ├── components/
│   │   └── controlhub/
│   │       └── ForecastDashboard.tsx       ← UI component
│   └── pages/
│       └── ControlHub.tsx                   ← Updated to 3-column grid
├── public/
│   └── models/
│       └── nautilus_forecast.onnx          ← Model placeholder
└── AI_PREDICTIVE_OPTIMIZATION_README.md    ← Full documentation
```

---

## 🎨 UI Component

### ForecastDashboard States

| State | Color | Icon | Message |
|-------|-------|------|---------|
| OK (< 40%) | 🟢 Green | ⚙️ | "Operação estável" |
| Risco (40-70%) | 🟡 Yellow | ⚙️ | "Risco detectado — verifique ASOG" |
| Crítico (> 70%) | 🔴 Red | ⚙️ | "Alerta crítico — acionar protocolo DP" |
| Sem Dados | ⚪ Gray | ⚙️ | "Aguardando dados de telemetria" |
| Carregando | ⚪ Gray | ⚙️ | "Carregando previsões..." |
| Erro | ⚪ Gray | ⚙️ | "Erro ao carregar previsões" |

---

## 🔧 API Reference

### `runForecastAnalysis()`
**Location**: `src/lib/ai/forecast-engine.ts`

**Returns**: 
```typescript
{
  level: "OK" | "Risco" | "Crítico" | "Sem Dados",
  value: number  // 0.0 to 1.0
}
```

**Process**:
1. Fetch last 100 telemetry records from Supabase
2. Load ONNX model from `/models/nautilus_forecast.onnx`
3. Run inference
4. Classify risk level
5. Publish MQTT alert if risk level ≠ "OK"
6. Return risk object

**MQTT Alert**:
- **Topic**: `nautilus/forecast/alert`
- **Payload**: `{ "level": "Risco", "value": 0.523 }`
- **Condition**: Only when level is "Risco" or "Crítico"

---

## 🧪 Testing

### 1. Test Supabase Connection
```javascript
// Browser console
import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.from("dp_telemetry").select("*").limit(5);
console.log(data);
```

### 2. Test MQTT Connection
```javascript
// Browser console
import mqtt from "mqtt";
const client = mqtt.connect("ws://localhost:1883");
client.on("connect", () => console.log("✅ MQTT Connected"));
```

### 3. Test Forecast Engine
```javascript
// Browser console
import { runForecastAnalysis } from "@/lib/ai/forecast-engine";
const result = await runForecastAnalysis();
console.log(result);
```

---

## 🐛 Troubleshooting

### Issue: "No data" message
**Cause**: Empty `dp_telemetry` table
**Solution**: Insert test data (see Quick Start #3)

### Issue: ONNX model error
**Cause**: Placeholder file isn't a real ONNX model
**Solution**: 
- For testing: Catch and handle error gracefully (already implemented)
- For production: Replace with trained model

### Issue: MQTT not connecting
**Cause**: Wrong broker URL or broker not running
**Solution**: 
- Check `VITE_MQTT_URL` in `.env`
- Use public broker: `wss://broker.emqx.io:8084/mqtt`
- Or run local broker: `docker run -p 1883:1883 eclipse-mosquitto`

### Issue: Component not showing
**Cause**: Build error or lazy load failure
**Solution**: 
- Check browser console for errors
- Verify all imports are correct
- Check that Suspense fallback isn't stuck

---

## 📊 Data Flow

```
┌─────────────┐
│  Supabase   │
│ dp_telemetry│
└──────┬──────┘
       │ SELECT last 100
       ↓
┌─────────────────┐
│ Forecast Engine │
│  (ONNX Model)   │
└──────┬──────────┘
       │ Prediction
       ↓
┌─────────────────┐      ┌──────────┐
│ Risk Classifier │ ───→ │   MQTT   │ nautilus/forecast/alert
└──────┬──────────┘      └──────────┘
       │ Risk Object
       ↓
┌─────────────────┐
│ ForecastDashboard│
│   (React UI)    │
└─────────────────┘
```

---

## ⚡ Performance

- **Update Frequency**: 60 seconds
- **Telemetry Query**: Last 100 records (optimized with index)
- **Model Inference**: Runs client-side (no server needed)
- **MQTT Publish**: Only on risk detection (not every update)

---

## 🔒 Security

### Supabase RLS
- ✅ Read access: Public (or customize per requirements)
- ✅ Write access: Authenticated users only

### MQTT
- ⚠️ Production: Use authenticated broker
- ⚠️ Add username/password via `VITE_MQTT_USER` and `VITE_MQTT_PASS`

---

## 📝 Code Snippets

### Manual Test Alert
```javascript
// Manually publish test alert
import mqtt from "mqtt";
const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
client.on("connect", () => {
  client.publish("nautilus/forecast/alert", JSON.stringify({
    level: "Crítico",
    value: 0.85
  }));
  console.log("✅ Alert published!");
});
```

### Subscribe to Alerts
```javascript
// Listen for alerts
import mqtt from "mqtt";
const client = mqtt.connect(import.meta.env.VITE_MQTT_URL);
client.on("connect", () => {
  client.subscribe("nautilus/forecast/alert");
  console.log("✅ Subscribed to alerts");
});
client.on("message", (topic, message) => {
  const alert = JSON.parse(message.toString());
  console.log("🚨 Alert received:", alert);
});
```

---

## 🎯 Success Criteria

- [x] ForecastDashboard renders in Control Hub
- [x] Grid shows 3 columns on desktop
- [x] Component loads data on mount
- [x] Updates every 60 seconds
- [x] Shows color-coded risk levels
- [ ] ONNX model returns valid predictions (needs real model)
- [ ] MQTT alerts publish successfully (needs broker)
- [ ] Telemetry data populated (needs data)

---

## 📚 Related Documentation

- 📄 [AI_PREDICTIVE_OPTIMIZATION_README.md](./AI_PREDICTIVE_OPTIMIZATION_README.md) - Full setup guide
- 📊 [AI_PREDICTIVE_OPTIMIZATION_VISUAL_SUMMARY.md](./AI_PREDICTIVE_OPTIMIZATION_VISUAL_SUMMARY.md) - Visual documentation
- 🔧 [CONTROL_HUB_README.md](./CONTROL_HUB_README.md) - Control Hub overview

---

**Version**: Patch 19
**Status**: ✅ Code Complete
**Last Updated**: 2025-10-21
