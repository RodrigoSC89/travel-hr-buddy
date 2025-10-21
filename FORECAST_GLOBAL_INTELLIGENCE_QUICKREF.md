# Forecast Global Intelligence - Quick Reference 🚀

## Quick Access

**URL**: `/forecast/global`

## Files Overview

```
📁 New Files
├── src/pages/ForecastGlobal.tsx
├── src/components/forecast/
│   ├── ForecastPanel.tsx
│   ├── ForecastMap.tsx
│   └── ForecastAIInsights.tsx
├── src/lib/mqtt/publisher.ts
└── public/models/forecast.onnx
```

## Component APIs

### ForecastPanel
Displays real-time weather metrics via MQTT.

**Props**: None (uses internal state)

**Data Structure**:
```typescript
{
  wind: number;      // knots
  wave: number;      // meters
  temp: number;      // celsius
  visibility: number; // kilometers
}
```

### ForecastMap
Embeds interactive global ocean map.

**Props**: None

**Source**: earth.nullschool.net

### ForecastAIInsights
Shows AI-powered risk predictions.

**Props**: None (uses internal ONNX model)

**Model Path**: `/models/forecast.onnx`

**Input**: `[wind, wave, temp, visibility]` (4 floats)

**Output**: Risk probability (0-1)

## MQTT Setup

### Environment Variables
```env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
VITE_MQTT_USERNAME=optional
VITE_MQTT_PASSWORD=optional
```

### Subscribe to Forecast Data
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

const client = subscribeForecast((data) => {
  console.log(data); // { wind, wave, temp, visibility }
});

// Cleanup
return () => client.end();
```

### Publish Forecast Data
```typescript
import { publishForecast } from "@/lib/mqtt/publisher";

publishForecast({
  wind: 15.2,
  wave: 2.8,
  temp: 26.5,
  visibility: 7.3
});
```

## ONNX Model

### Current Model
- Type: Linear Regression
- Input: 4 features (wind, wave, temp, visibility)
- Output: 1 value (risk probability 0-1)

### Replace Model
1. Train your model
2. Convert to ONNX format
3. Save as `public/models/forecast.onnx`
4. Ensure input/output match:
   - Input: `float32[1, 4]`
   - Output: `float32[1]`

### Python Example
```python
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

model = LinearRegression()
model.fit(X, y)

initial_type = [('input', FloatTensorType([None, 4]))]
onnx_model = convert_sklearn(model, initial_types=initial_type)

with open('forecast.onnx', 'wb') as f:
    f.write(onnx_model.SerializeToString())
```

## Testing

### Run Tests
```bash
# All forecast tests
npm test src/tests/pages/ForecastGlobal.test.tsx src/tests/components/forecast/

# Individual test files
npm test ForecastPanel.test.tsx
npm test ForecastAIInsights.test.tsx
```

### Test Coverage
- ✅ Page rendering (2 tests)
- ✅ MQTT integration (3 tests)
- ✅ ONNX inference (4 tests)
- **Total**: 9 tests, 100% passing

## Common Tasks

### Add New Metric
1. Update MQTT data structure
2. Add metric to `ForecastPanel.tsx`
3. Update tests
4. Update documentation

### Change Map Source
Edit `ForecastMap.tsx`:
```tsx
<iframe src="YOUR_MAP_URL" />
```

### Adjust AI Model
1. Train new model
2. Replace `forecast.onnx`
3. Update input processing in `ForecastAIInsights.tsx`

## Integration Points

### BridgeLink
Automatic sync via MQTT topic `nautilus/forecast/global`

### ControlHub
Central monitoring receives all forecast updates

## Troubleshooting

### MQTT Not Connecting
```typescript
// Check environment variable
console.log(import.meta.env.VITE_MQTT_URL);

// Check broker status
// Default: wss://broker.hivemq.com:8884/mqtt
```

### ONNX Model Error
```typescript
// Model not found
// Verify: public/models/forecast.onnx exists

// Wrong input shape
// Ensure: Float32Array of length 4
```

### Map Not Loading
```typescript
// Check iframe src
// Ensure: earth.nullschool.net is accessible
// Note: May require internet connection
```

## Performance Tips

1. **Lazy Loading**: Already implemented via `safeLazyImport`
2. **MQTT Cleanup**: Always call `client.end()` in cleanup
3. **ONNX Caching**: Model loads once per component mount
4. **Map Performance**: Iframe is isolated, minimal impact

## Accessibility Checklist

- [x] Semantic HTML (main, h1, etc.)
- [x] ARIA labels and roles
- [x] Keyboard navigation
- [x] Screen reader support
- [x] Color contrast compliance

## Build & Deploy

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Test
npm test

# Build
npm run build

# Deploy
npm run deploy:vercel
```

## Key Imports

```typescript
// Components
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loading } from "@/components/ui/Loading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Icons
import { Wind, Waves, Thermometer, Cloud, MapPin, Brain, AlertTriangle } from "lucide-react";

// Libraries
import mqtt from "mqtt";
import * as ort from "onnxruntime-web";

// Utils
import { subscribeForecast, publishForecast } from "@/lib/mqtt/publisher";
```

## Code Style

- Use `// @ts-nocheck` for components with MQTT/ONNX
- Follow existing patterns in the codebase
- Add tests for new features
- Document API changes

## Support

For issues or questions:
1. Check test files for usage examples
2. Review README documentation
3. Check MQTT broker logs
4. Verify ONNX model format

## Version

**Current**: 1.0.0  
**Last Updated**: 2025-10-21  
**Status**: ✅ Production Ready

## Quick Commands

```bash
# Navigate to page
# URL: http://localhost:5173/forecast/global

# Run all forecast tests
npm test forecast

# Check types
npm run type-check

# Build for production
npm run build
```

---

**Need Help?** Check FORECAST_GLOBAL_INTELLIGENCE_README.md for detailed documentation.
