# AI Predictive Optimization - Quick Reference Guide

## 🎯 Overview

The AI Predictive Optimization system uses ONNX-based machine learning to predict operational failures 24-72 hours in advance, enabling proactive risk management in the Nautilus Control Hub.

## 🚀 Quick Start

### 1. Database Setup

Create the required Supabase table:

```sql
create table dp_telemetry (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null,
  system text,
  parameter text,
  value float
);

-- Create index for faster queries
create index idx_dp_telemetry_timestamp on dp_telemetry(timestamp desc);
```

### 2. Environment Configuration

Ensure your `.env` file includes:

```bash
VITE_MQTT_URL=ws://localhost:1883
VITE_MQTT_USER=nautilus
VITE_MQTT_PASS=your-secure-password
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
```

### 3. Access the Dashboard

Navigate to `/control-hub` to see the ForecastDashboard in action.

## 📊 Risk Levels

| Level | Threshold | Color | Action |
|-------|-----------|-------|--------|
| **OK** | < 40% | 🟢 Green | Normal operation |
| **Risco** | 40-70% | 🟡 Yellow | Verify ASOG procedures |
| **Crítico** | > 70% | 🔴 Red | Activate DP protocol |

## 🔧 Key Components

### Forecast Engine (`src/lib/ai/forecast-engine.ts`)
- Loads ONNX model from `/models/nautilus_forecast.onnx`
- Queries last 100 telemetry readings from Supabase
- Runs ML inference to predict failure probability
- Publishes MQTT alerts on `nautilus/forecast/alert` topic

### ForecastDashboard (`src/components/control-hub/ForecastDashboard.tsx`)
- Real-time risk percentage display
- Auto-refresh every 60 seconds
- Color-coded status indicators
- Graceful error handling

### ControlHub Integration (`src/pages/ControlHub.tsx`)
- 3-column grid layout
- Lazy-loaded components with Suspense
- Consistent UI with existing dashboards

## 📡 MQTT Topics

- **Publish**: `nautilus/forecast/alert` - Critical risk alerts
- **Payload**: 
  ```json
  {
    "level": "Crítico",
    "value": 0.85,
    "message": "Risco crítico - ativar protocolo DP",
    "timestamp": "2025-10-21T18:52:09.992Z"
  }
  ```

## 🧪 Testing

### Manual Test
1. Insert test telemetry data:
```sql
insert into dp_telemetry (timestamp, system, parameter, value)
values 
  (now(), 'DP', 'thruster_1', 0.85),
  (now() - interval '1 minute', 'DP', 'thruster_1', 0.82),
  (now() - interval '2 minutes', 'DP', 'thruster_1', 0.79);
```

2. Navigate to Control Hub
3. Verify ForecastDashboard displays data

### Expected Behavior
- **No Data**: Shows "Sem Dados" status
- **With Data**: Shows risk level and percentage
- **Critical Risk**: Displays pulsing alert banner

## ⚠️ Important Notes

1. **ONNX Model**: The included model is a placeholder. Train a production model using historical telemetry data.

2. **Database Schema**: Create `dp_telemetry` table before first use.

3. **MQTT Broker**: Configure a production MQTT broker URL for real deployments.

4. **Graceful Degradation**: System handles missing data/services without breaking the UI.

## 🔍 Troubleshooting

### "No telemetry data available"
- Check `dp_telemetry` table exists and contains data
- Verify Supabase connection in browser console

### "Error loading forecast"
- Check ONNX model file exists at `/models/nautilus_forecast.onnx`
- Verify model format is compatible with onnxruntime-web ^1.23.0

### MQTT alerts not publishing
- Verify MQTT broker is running and accessible
- Check `VITE_MQTT_URL` environment variable
- Review browser console for connection errors

## 📖 Additional Resources

- [AI Predictive Optimization README](./AI_PREDICTIVE_OPTIMIZATION_README.md) - Complete setup guide
- [Visual Summary](./AI_PREDICTIVE_OPTIMIZATION_VISUAL_SUMMARY.md) - Architecture diagrams
- [Implementation Guide](./AI_PREDICTIVE_OPTIMIZATION_IMPLEMENTATION.md) - Detailed walkthrough

## 🎯 Next Steps

1. ✅ Create `dp_telemetry` table in Supabase
2. ✅ Train production ONNX model with real data
3. ✅ Populate historical telemetry data
4. ✅ Configure production MQTT broker
5. ✅ Perform end-to-end integration testing
