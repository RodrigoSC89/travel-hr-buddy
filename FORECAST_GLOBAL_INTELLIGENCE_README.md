# Forecast Global Intelligence 🌊🧠

## Overview

The **Forecast Global Intelligence** module provides real-time meteorological and oceanographic data analysis with AI-powered predictive insights for maritime operations.

## Features

### 1. Real-Time Weather Monitoring 🌤️
- Wind speed (knots)
- Wave height (meters)
- Temperature (°C)
- Visibility (kilometers)
- Live MQTT data streaming

### 2. Global Ocean Map Visualization 🗺️
- Interactive global wind and ocean current visualization
- Powered by earth.nullschool.net
- Real-time atmospheric and oceanic conditions

### 3. AI-Powered Risk Prediction 🤖
- ONNX Runtime Web integration
- Operational instability probability analysis
- Based on multi-parameter environmental data
- Extensible for custom ML models

## Architecture

```
src/
├── pages/
│   └── ForecastGlobal.tsx          # Main page with lazy loading
├── components/
│   └── forecast/
│       ├── ForecastPanel.tsx        # Weather metrics display
│       ├── ForecastMap.tsx          # Global ocean map
│       └── ForecastAIInsights.tsx   # AI predictions
└── lib/
    └── mqtt/
        └── publisher.ts             # MQTT subscription utilities
```

## Usage

### Accessing the Module

Navigate to `/forecast/global` in the application to access the Forecast Global Intelligence dashboard.

### MQTT Configuration

Set up MQTT connection in your environment variables:

```env
VITE_MQTT_URL=wss://your-mqtt-broker:8884/mqtt
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
```

### MQTT Topics

- **Subscribe**: `nautilus/forecast/global`
- **Publish**: `nautilus/forecast/global`

### Data Format

```json
{
  "wind": 12.5,      // Wind speed in knots
  "wave": 2.3,       // Wave height in meters
  "temp": 27.8,      // Temperature in Celsius
  "visibility": 8.2  // Visibility in kilometers
}
```

## AI Model Integration

### ONNX Model

The module uses ONNX Runtime Web for client-side AI inference. The default model is a lightweight linear regression model located at:

```
public/models/forecast.onnx
```

### Model Input

The model expects 4 float32 parameters:
1. Wind speed (knots)
2. Wave height (meters)
3. Temperature (°C)
4. Visibility (km)

### Model Output

Returns a probability value (0-1) representing the risk of operational instability.

### Replacing the Model

To use a custom trained model:

1. Train your model using scikit-learn, PyTorch, or TensorFlow
2. Convert to ONNX format
3. Replace `public/models/forecast.onnx`
4. Ensure input/output specifications match

Example using scikit-learn:

```python
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Train your model
model = YourModel()
model.fit(X_train, y_train)

# Convert to ONNX
initial_type = [('input', FloatTensorType([None, 4]))]
onnx_model = convert_sklearn(model, initial_types=initial_type)

# Save
with open('forecast.onnx', 'wb') as f:
    f.write(onnx_model.SerializeToString())
```

## Testing

Run tests for the Forecast Global Intelligence module:

```bash
npm test src/tests/pages/ForecastGlobal.test.tsx
npm test src/tests/components/forecast/
```

### Test Coverage

- ✅ Page rendering and accessibility
- ✅ MQTT subscription and data display
- ✅ ONNX inference and prediction display
- ✅ Metric formatting and UI components

## Integration with BridgeLink and ControlHub

The Forecast Global Intelligence module automatically synchronizes with:

- **BridgeLink**: Real-time vessel bridge communication
- **ControlHub**: Central monitoring and control system

Data flows are managed through MQTT pub/sub patterns ensuring consistent state across all systems.

## Accessibility

The module follows WCAG 2.1 Level AA standards:

- Proper heading hierarchy
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## Performance

- **Lazy Loading**: Components load on-demand using safeLazyImport
- **Suspense Boundaries**: Graceful fallback during loading
- **Error Handling**: Comprehensive error boundaries
- **Offline Support**: MQTT reconnection with exponential backoff

## Future Enhancements

- [ ] Historical data analysis and trends
- [ ] Multi-location forecast comparison
- [ ] Advanced LSTM neural network models
- [ ] Push notifications for weather alerts
- [ ] Integration with real sensor networks
- [ ] Custom alert thresholds

## API Reference

### subscribeForecast(callback)

Subscribe to forecast data stream.

**Parameters:**
- `callback`: Function that receives forecast data objects

**Returns:**
- MQTT client instance with `.end()` method

**Example:**
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

const client = subscribeForecast((data) => {
  console.log("Forecast data:", data);
});

// Cleanup
useEffect(() => {
  return () => client.end();
}, []);
```

### publishForecast(data)

Publish forecast data to the global topic.

**Parameters:**
- `data`: Forecast data object

**Example:**
```typescript
import { publishForecast } from "@/lib/mqtt/publisher";

publishForecast({
  wind: 15.2,
  wave: 2.8,
  temp: 26.5,
  visibility: 7.3
});
```

## Contributing

When contributing to this module:

1. Follow existing code patterns
2. Add tests for new features
3. Update this README for API changes
4. Ensure accessibility standards
5. Document MQTT topic changes

## License

Part of the Nautilus Travel HR Buddy system.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-21  
**Maintainer**: Nautilus Development Team
