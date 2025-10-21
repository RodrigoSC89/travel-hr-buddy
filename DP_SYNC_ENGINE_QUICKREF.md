# DP Synchronization Engine - Quick Reference

## 🚀 Quick Start

### Access the Feature
```
URL: /dp-sync-engine
```

### Force Manual Sync
Click the **"Forçar Sincronização"** button in the dashboard.

## 📂 File Structure

```
src/
├── pages/
│   └── DPSyncEngine.tsx              # Main page (route: /dp-sync-engine)
├── components/
│   └── dp/
│       ├── DPStatusBoard.tsx         # DP system status display
│       ├── DPSyncDashboard.tsx       # Sync control + AI prediction
│       └── DPAlertFeed.tsx           # Alert history feed
└── lib/
    └── mqtt/
        └── publisher.ts              # MQTT helper functions

public/
└── models/
    └── dp-predict.onnx               # AI prediction model

src/tests/
├── components/dp/
│   ├── DPStatusBoard.test.tsx
│   ├── DPSyncDashboard.test.tsx
│   └── DPAlertFeed.test.tsx
└── pages/
    └── DPSyncEngine.test.tsx
```

## 🔌 MQTT Topics

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `nautilus/bridge/status` | Subscribe | Bridge/DP system status |
| `nautilus/forecast/data` | Subscribe | Weather forecast data |
| `nautilus/dp/alert` | Publish | Critical alerts (risk ≥ 80%) |
| `nautilus/dp/manual-sync` | Publish | Manual sync trigger |

## 🧠 AI Model I/O

**Input** (float32[1,3]):
- `[0]` Wind speed (knots)
- `[1]` Wave height (meters)
- `[2]` Temperature (°C)

**Output** (float32[1]):
- Risk probability (0.0 - 1.0)

## 🎨 Components

### DPStatusBoard
```tsx
<DPStatusBoard />
```
**Displays**: Position, Status, Integrity (%)

### DPSyncDashboard
```tsx
<DPSyncDashboard />
```
**Features**: 
- Manual sync button
- Last sync timestamp
- AI risk prediction display

### DPAlertFeed
```tsx
<DPAlertFeed />
```
**Displays**: Last 10 critical alerts with timestamps

## 🧪 Testing

```bash
# All DP tests
npm run test -- src/tests/components/dp/ src/tests/pages/DPSyncEngine.test.tsx

# Specific component
npm run test -- src/tests/components/dp/DPStatusBoard.test.tsx
```

**Coverage**: 31/31 tests ✅

## ⚙️ Configuration

### Environment Variables
```bash
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

### Replace ONNX Model
1. Train your model with inputs: [wind, wave, temp]
2. Export to ONNX format
3. Replace `public/models/dp-predict.onnx`
4. Ensure model has:
   - Input layer: `input` (float32[1,3])
   - Output layer: `result` (float32[1])

## 📊 Risk Levels

| Risk % | Color | Action |
|--------|-------|--------|
| 0-79% | Green | Normal operation |
| 80-100% | Red | Critical alert triggered |

## 🛠️ Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Test
```bash
npm run test
```

## 📝 Common Tasks

### Adding New MQTT Topic
1. Add subscription function in `src/lib/mqtt/publisher.ts`
2. Use in component with `useEffect` hook
3. Return cleanup function: `() => client.end()`

### Modifying AI Prediction
1. Update model inputs in `DPSyncDashboard.tsx` line ~14
2. Adjust risk threshold (default 0.8) line ~18
3. Retrain and replace ONNX model

### Customizing Alert Feed
- Max alerts shown: `DPAlertFeed.tsx` line ~10 (default: 10)
- Alert display format: `DPAlertFeed.tsx` lines ~24-30

## 🔍 Troubleshooting

### MQTT Connection Issues
- Check `VITE_MQTT_URL` environment variable
- Verify WSS port (8884) is accessible
- Check browser console for connection errors

### AI Model Not Loading
- Verify `public/models/dp-predict.onnx` exists
- Check model format (ONNX v1.x compatible)
- Review browser console for ONNX errors

### Alerts Not Appearing
- Verify MQTT connection to `nautilus/dp/alert` topic
- Check risk threshold (≥ 0.8 triggers alert)
- Ensure forecast data is being received

## 📚 Related Documentation

- [Full Implementation Guide](./DP_SYNC_ENGINE_IMPLEMENTATION.md)
- [MQTT Publisher API](./src/lib/mqtt/publisher.ts)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-21  
**Status**: Production Ready ✅
