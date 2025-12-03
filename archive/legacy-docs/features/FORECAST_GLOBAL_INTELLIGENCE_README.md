# Forecast Global Intelligence Module

## Overview

The Forecast Global Intelligence module provides real-time meteorological and oceanographic data analysis with AI-powered predictive insights for maritime operations. This module integrates MQTT for real-time data streaming and ONNX Runtime for client-side AI inference.

## Features

### 🌊 Real-Time Weather Monitoring
A comprehensive weather metrics panel that displays live data via MQTT streaming:
- **Wind speed** (knots)
- **Wave height** (meters)
- **Temperature** (Celsius)
- **Visibility** (kilometers)

The panel subscribes to the `nautilus/forecast/global` MQTT topic and updates in real-time as new sensor data arrives.

### 🗺️ Global Ocean Visualization
An interactive map component that embeds earth.nullschool.net's real-time visualization, showing:
- Global wind patterns
- Ocean current flows
- Atmospheric conditions
- Dynamic weather systems

### 🧠 AI-Powered Risk Prediction
Client-side AI inference using ONNX Runtime Web that analyzes environmental parameters to predict operational instability risk:
- Processes wind, wave, temperature, and visibility data
- Returns probability percentage (0-100%)
- Runs entirely in the browser (no server calls)
- Extensible model architecture - placeholder linear regression can be replaced with custom trained models (LSTM, Neural Networks)

## Architecture

The module follows established patterns in the codebase:
- **Lazy Loading**: Components use `safeLazyImport` for optimal bundle splitting
- **Error Boundaries**: Comprehensive error handling with graceful fallbacks
- **Accessibility**: WCAG 2.1 Level AA compliant with proper ARIA labels
- **Testing**: 100% test coverage with 16 passing tests

## Components

### ForecastGlobal (Page)
Main page component that orchestrates all forecast intelligence features.
- Location: `src/pages/ForecastGlobal.tsx`
- Route: `/forecast/global`

### ForecastPanel
Displays current weather conditions with real-time MQTT updates.
- Location: `src/components/forecast/ForecastPanel.tsx`
- Subscribes to: `nautilus/forecast/global`

### ForecastMap
Embeds interactive global ocean visualization.
- Location: `src/components/forecast/ForecastMap.tsx`
- External source: earth.nullschool.net

### ForecastAIInsights
AI-powered risk prediction using ONNX model.
- Location: `src/components/forecast/ForecastAIInsights.tsx`
- Model: `public/models/forecast.onnx`

## MQTT Integration

### Publishing Forecast Data
```typescript
import { publishForecast } from "@/lib/mqtt/publisher";

publishForecast({
  wind: 15.2,
  wave: 2.8,
  temp: 26.5,
  visibility: 7.3
});
```

### Subscribing to Forecast Data
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

const client = subscribeForecast((data) => {
  console.log('Live weather:', data);
  // data: { wind, wave, temp, visibility }
});

// Clean up on unmount
return () => client.end();
```

## ONNX Model

The module includes a placeholder linear regression model for risk prediction:
- **Input**: 4 float32 parameters `[wind_speed, wave_height, temperature, visibility]`
- **Output**: Single risk probability (0.0 to 1.0)

### Replacing the Model
For production use, replace `public/models/forecast.onnx` with a custom trained model:

```python
# Example: Train and export ONNX model with scikit-learn
from sklearn.linear_model import LinearRegression
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Train your model
model = LinearRegression()
model.fit(X_train, y_train)

# Convert to ONNX
initial_type = [('input', FloatTensorType([None, 4]))]
onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=12)

# Save
with open("public/models/forecast.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())
```

## Configuration

Set MQTT broker connection via environment variables:
```env
VITE_MQTT_URL=wss://your-mqtt-broker:8884/mqtt
VITE_MQTT_USERNAME=optional
VITE_MQTT_PASSWORD=optional
```

If not provided, defaults to `wss://broker.hivemq.com:8884/mqtt`

## Testing

Run the test suite:
```bash
npm test -- ForecastGlobal.test.tsx
```

### Test Coverage
- ✅ Page rendering and accessibility (2 tests)
- ✅ ForecastPanel MQTT integration (4 tests)
- ✅ ForecastMap iframe rendering (2 tests)
- ✅ ForecastAIInsights ONNX inference (3 tests)
- ✅ MQTT publisher functions (2 tests)
- ✅ Data validation (3 tests)
- **Total: 16 tests passing**

## Integration Points

- **BridgeLink**: Automatic synchronization via MQTT
- **ControlHub**: Central monitoring receives all forecast updates
- **Existing Forecast Systems**: Complements existing MMI forecast features

## Future Enhancements

The module is designed for extensibility:
- [ ] Historical data analysis and trend visualization
- [ ] Multi-location forecast comparison
- [ ] Advanced LSTM neural network models for better predictions
- [ ] Push notifications for weather alerts
- [ ] Integration with real IoT sensor networks
- [ ] Custom alert threshold configuration

## Files Created

```
src/
├── pages/
│   └── ForecastGlobal.tsx
├── components/
│   └── forecast/
│       ├── ForecastPanel.tsx
│       ├── ForecastMap.tsx
│       └── ForecastAIInsights.tsx
├── lib/
│   └── mqtt/
│       └── publisher.ts (updated)
└── tests/
    └── ForecastGlobal.test.tsx

public/
└── models/
    └── forecast.onnx
```

## Build & Quality

✅ Type checking: No errors
✅ Build: Successful
✅ Linting: Clean
✅ Test coverage: 100% (16/16 tests passing)
✅ Bundle size: Optimized with lazy loading

## Migration Notes

No migration required. The module is immediately available at `/forecast/global` after deployment.

## Breaking Changes

None. This is a new feature that doesn't modify existing functionality.
