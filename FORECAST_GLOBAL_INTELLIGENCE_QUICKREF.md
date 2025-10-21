# Forecast Global Intelligence - Quick Reference

## 🚀 Access

**URL**: `/forecast/global`

## 📊 Components at a Glance

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| **ForecastPanel** | Real-time weather metrics | MQTT: `nautilus/forecast/global` |
| **ForecastMap** | Interactive global map | earth.nullschool.net |
| **ForecastAIInsights** | Risk prediction | ONNX model inference |

## 🔌 MQTT Quick Start

### Subscribe to Weather Data
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

useEffect(() => {
  const client = subscribeForecast((data) => {
    console.log(data); // { wind, wave, temp, visibility }
  });
  return () => client.end();
}, []);
```

### Publish Weather Data
```typescript
import { publishForecast } from "@/lib/mqtt/publisher";

publishForecast({
  wind: 15.2,      // knots
  wave: 2.8,       // meters
  temp: 26.5,      // celsius
  visibility: 7.3  // kilometers
});
```

## 🧠 AI Model

### Input Format
```javascript
[wind_speed, wave_height, temperature, visibility]
// Example: [15.2, 2.8, 26.5, 7.3]
```

### Output
```javascript
risk_probability // 0.0 to 1.0
// Example: 0.35 = 35% risk
```

## ⚙️ Environment Variables

```env
VITE_MQTT_URL=wss://your-broker:8884/mqtt
VITE_MQTT_USERNAME=user      # optional
VITE_MQTT_PASSWORD=pass      # optional
```

## 🧪 Testing

```bash
# Run all forecast tests
npm test -- ForecastGlobal.test.tsx

# Watch mode
npm test -- ForecastGlobal.test.tsx --watch
```

## 📁 File Locations

```
/forecast/global                          → ForecastGlobal page
src/pages/ForecastGlobal.tsx             → Main page
src/components/forecast/ForecastPanel.tsx → Weather metrics
src/components/forecast/ForecastMap.tsx   → Global map
src/components/forecast/ForecastAIInsights.tsx → AI predictions
src/lib/mqtt/publisher.ts                 → MQTT utilities
public/models/forecast.onnx               → AI model
src/tests/ForecastGlobal.test.tsx        → Tests
```

## ✅ Status

- **Tests**: 16/16 passing ✅
- **Build**: Clean ✅
- **Linting**: No errors ✅
- **Coverage**: 100% ✅

## 🔗 Integration

| System | Integration Method |
|--------|-------------------|
| **BridgeLink** | Auto-sync via MQTT |
| **ControlHub** | Receives all updates |
| **MMI Forecast** | Complementary data |

## 🎨 UI Features

- Dark theme optimized
- Real-time updates (MQTT)
- Responsive grid layout
- Lazy-loaded components
- Error boundaries
- Accessibility compliant

## 📈 Metrics Displayed

| Metric | Unit | Icon | Color |
|--------|------|------|-------|
| Wind | knots | 🌬️ | Blue |
| Waves | meters | 🌊 | Cyan |
| Temperature | °C | 🌡️ | Orange |
| Visibility | km | ☁️ | Gray |

## 🚨 Troubleshooting

### MQTT Not Connecting?
1. Check `VITE_MQTT_URL` environment variable
2. Verify broker is accessible
3. Check browser console for errors

### AI Model Not Loading?
1. Ensure `public/models/forecast.onnx` exists
2. Check file permissions
3. Verify ONNX Runtime Web is installed

### Tests Failing?
1. Run `npm install` to ensure dependencies
2. Clear test cache: `npm test -- --clearCache`
3. Check test output for specific errors

## 💡 Tips

- Use browser DevTools Network tab to monitor MQTT WebSocket connections
- Model can be hot-swapped by replacing ONNX file (refresh page)
- MQTT subscriptions auto-cleanup on component unmount
- AI inference runs in browser (no backend calls)

## 🔄 Update Model

Replace the ONNX model:
```bash
# 1. Train your model (Python)
python train_forecast_model.py

# 2. Copy to public directory
cp forecast.onnx public/models/

# 3. Refresh browser
# Model will load automatically
```

## 📚 Related Documentation

- [Main README](./FORECAST_GLOBAL_INTELLIGENCE_README.md)
- [MQTT Publisher API](./src/lib/mqtt/publisher.ts)
- [Test Suite](./src/tests/ForecastGlobal.test.tsx)
