# AI Predictive Optimization - Visual Summary (Patch 19)

## 📊 Overview

This patch adds AI-powered predictive optimization to the Nautilus Control Hub, enabling 24-72 hour advance failure prediction using ONNX models and real-time telemetry.

---

## 🎨 UI Changes

### Before (Patch 12)
```
┌─────────────────────────────────────────────────────────────┐
│  ⚓ Control Hub – Observability & AI Insights               │
│  Monitoramento em tempo real com MQTT, alertas...          │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│  ControlHubPanel        │  SystemAlerts                     │
│  - Potência Total       │  - Alert 1                        │
│  - Heading              │  - Alert 2                        │
│  - Previsão Oceânica    │  - Alert 3                        │
│  - Thrusters Ativos     │                                   │
│                         │                                   │
├─────────────────────────┴───────────────────────────────────┤
│                                                             │
│  AIInsightReporter                                          │
│  - AI Insights and Analytics                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### After (Patch 19)
```
┌─────────────────────────────────────────────────────────────┐
│  ⚓ Control Hub – Observability & AI Insights               │
│  Monitoramento em tempo real com MQTT, alertas...          │
├───────────────┬──────────────────┬──────────────────────────┤
│               │                  │                          │
│ ControlHub    │ SystemAlerts     │ 🆕 ForecastDashboard    │
│ Panel         │                  │                          │
│ - Power       │ - Alert 1        │ 📊 Forecast Global      │
│ - Heading     │ - Alert 2        │    AI Predictive        │
│ - Forecast    │ - Alert 3        │    Optimization         │
│ - Thrusters   │                  │                          │
│               │                  │    ⚙️ 45.3%             │
│               │                  │    ⚠️ Risco detectado   │
│               │                  │       verifique ASOG    │
├───────────────┴──────────────────┴──────────────────────────┤
│                                                             │
│  AIInsightReporter                                          │
│  - AI Insights and Analytics                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Change**: Grid changed from **2 columns** to **3 columns** to accommodate the new ForecastDashboard.

---

## 🆕 New Components

### 1. ForecastDashboard Component
**Location**: `src/components/controlhub/ForecastDashboard.tsx`

**Features**:
- 📊 Real-time risk percentage display
- 🎨 Color-coded status indicators:
  - 🟢 Green (< 40%): "Operação estável"
  - 🟡 Yellow (40-70%): "Risco detectado — verifique ASOG"
  - 🔴 Red (> 70%): "Alerta crítico — acionar protocolo DP"
- ⏱️ Auto-refresh every 60 seconds
- 🔄 Immediate load on mount

**Visual States**:
```
┌─────────────────────────────┐
│ 📊 Forecast Global          │
│    AI Predictive Optimize   │
├─────────────────────────────┤
│         ⚙️                  │
│        45.3%                │
│   ⚠️ Risco detectado        │
│   verifique ASOG            │
└─────────────────────────────┘
```

### 2. Forecast Engine Module
**Location**: `src/lib/ai/forecast-engine.ts`

**Capabilities**:
```
┌─────────────────────────────────────────┐
│  Forecast Engine Flow                   │
├─────────────────────────────────────────┤
│                                         │
│  1. 📥 Fetch Telemetry                  │
│     └─ Last 100 readings from Supabase │
│                                         │
│  2. 🧠 ONNX Model Inference             │
│     └─ Load nautilus_forecast.onnx     │
│     └─ Generate probability prediction │
│                                         │
│  3. 🎯 Risk Classification              │
│     ├─ < 40%  → ✅ OK                   │
│     ├─ 40-70% → ⚠️ Risco                │
│     └─ > 70%  → 🚨 Crítico              │
│                                         │
│  4. 📡 MQTT Alert (if not OK)           │
│     └─ Publish to nautilus/forecast/alert│
│                                         │
└─────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### New Table: `dp_telemetry`

```sql
┌────────────────────────────────────────┐
│  dp_telemetry                          │
├────────────────────────────────────────┤
│  📋 id           uuid (PK)             │
│  🕐 timestamp    timestamptz           │
│  ⚙️ system       text                  │
│  📊 parameter    text                  │
│  🔢 value        float                 │
└────────────────────────────────────────┘

Indexes:
  - idx_dp_telemetry_timestamp (DESC)

RLS Policies:
  - Read: Public (or customize)
  - Insert: Authenticated users only
```

---

## 📡 MQTT Integration

### Alert Channel
**Topic**: `nautilus/forecast/alert`

**Payload Example**:
```json
{
  "level": "Risco",
  "value": 0.523
}
```

**Trigger Conditions**:
- Level is "Risco" (40-70%)
- Level is "Crítico" (> 70%)
- **NOT** triggered when level is "OK"

---

## 🧠 AI Model Details

### ONNX Model
**Location**: `public/models/nautilus_forecast.onnx`
**Status**: ⚠️ Placeholder (4 lines of text)

**Production Requirements**:
- Input: `[1, n]` float32 tensor (n = number of telemetry readings)
- Output: `{ probabilities: [value] }` float32
- Expected size: ~4.2 MB
- Training data: Historical DP logs, ASOG, FMEA, Power Trend, Gyro Drift

---

## 🔧 Configuration

### Environment Variables
Already configured in `.env.example`:
```bash
# MQTT
VITE_MQTT_URL=ws://localhost:1883
VITE_MQTT_USER=nautilus
VITE_MQTT_PASS=your-secure-password

# Supabase (existing)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

---

## 📦 Dependencies

### Already Installed
✅ `onnxruntime-web`: ^1.23.0
✅ `mqtt`: ^5.14.1
✅ `@supabase/supabase-js`: ^2.57.4

**No new dependencies required!**

---

## 🔄 Code Changes Summary

### Files Modified
1. ✏️ `src/pages/ControlHub.tsx`
   - Changed grid from `lg:grid-cols-2` to `lg:grid-cols-3`
   - Added ForecastDashboard import and usage
   - Updated version to 1.3.0 (Patch 19)

### Files Created
2. 🆕 `src/lib/ai/forecast-engine.ts`
   - AI forecast analysis function
   - Risk classification logic
   - MQTT alert publishing

3. 🆕 `src/components/controlhub/ForecastDashboard.tsx`
   - React component for forecast visualization
   - Auto-refresh mechanism
   - Multi-state display logic

4. 🆕 `public/models/nautilus_forecast.onnx`
   - Placeholder for production ONNX model

5. 🆕 `AI_PREDICTIVE_OPTIMIZATION_README.md`
   - Complete documentation
   - Setup instructions
   - Troubleshooting guide

---

## ✅ Validation Checklist

- [x] AI forecast engine created
- [x] ForecastDashboard component created
- [x] ControlHub page updated with 3-column grid
- [x] ONNX model placeholder added
- [x] Supabase schema documented
- [x] Environment variables documented
- [x] README with setup instructions
- [x] All TypeScript files use @ts-nocheck (per spec)
- [x] No new dependencies needed
- [x] Follows existing code patterns

---

## 🚀 Next Steps

To make this fully functional:

1. **Create Supabase Table**
   - Run SQL script from README
   - Configure RLS policies

2. **Add Test Data**
   ```sql
   INSERT INTO dp_telemetry (timestamp, system, parameter, value)
   VALUES 
     (now(), 'DP', 'power', 5.2),
     (now(), 'DP', 'heading', 180.5),
     (now(), 'DP', 'thruster_1', 0.8);
   ```

3. **Replace ONNX Model**
   - Train model with real data
   - Export to ONNX format
   - Replace placeholder file

4. **Configure MQTT**
   - Set up production broker
   - Update VITE_MQTT_URL
   - Test alert publishing

5. **Test Integration**
   - Verify data flow
   - Monitor MQTT messages
   - Validate risk classifications

---

## 📈 Expected Results

Once configured with real data and model:
- ✅ Automatic failure predictions 24-72h in advance
- ✅ Real-time MQTT alerts
- ✅ Visual risk indicators in Control Hub
- ✅ Integration with Resilience module
- ✅ Global forecast with risk percentage and trend

---

**Version**: Patch 19 - AI Predictive Optimization
**Date**: 2025-10-21
**Status**: ✅ Implementation Complete (Awaiting data & model)
