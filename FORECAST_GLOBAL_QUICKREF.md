# Forecast Global - Quick Reference Guide

## 🚀 Quick Start

### Page Location
```
/forecast
```

### Key Components
```typescript
import ForecastPage from "@/pages/Forecast";
import ForecastAI from "@/components/forecast/ForecastAI";
import ForecastMetrics from "@/components/forecast/ForecastMetrics";
import ForecastMap from "@/components/forecast/ForecastMap";
```

## 📊 Components Overview

### ForecastAI
**Purpose:** Local AI inference using ONNX Runtime

**Features:**
- ONNX model loading from `/models/nautilus_forecast.onnx`
- Offline fallback mode
- MQTT event publishing
- Real-time status updates

**ARIA Attributes:**
- `role="status"` on status messages
- `aria-live="polite"` for dynamic updates
- `aria-hidden="true"` on decorative icons

### ForecastMetrics
**Purpose:** Display performance metrics with progress bars

**Metrics:**
- Model reliability: 93%
- Real-time accuracy: 88%
- Global coverage: 97%

**ARIA Attributes:**
- `aria-labelledby` on progress bars
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on Progress components
- `aria-label` on percentage values

### ForecastMap
**Purpose:** Maritime prediction map with smooth animations

**Features:**
- Framer Motion fade-in animation (1s duration)
- Lazy-loaded iframe
- Loading state during initialization

**ARIA Attributes:**
- `aria-label` on container
- `title` attribute on iframe
- Loading state message

## 🔌 MQTT Integration

### Publisher
```typescript
import { publishEvent } from "@/lib/mqtt/publisher";

// Publish forecast update
publishEvent("nautilus/forecast/update", { forecast: 0.85 });
```

### Subscriber
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

// Subscribe to forecast updates
const client = subscribeForecast((msg) => {
  console.log("Forecast update:", msg.forecast);
});

// Cleanup
client.end();
```

### Environment Variables
```bash
VITE_MQTT_URL=wss://your-broker.com:8883/mqtt
```

## 🧠 AI Model Integration

### Model Loader
```typescript
import { loadForecastModel } from "@/lib/ai/modelLoader";

const session = await loadForecastModel("/models/nautilus_forecast.onnx");
```

### Expected Model Format
- **Input:** Float32Array[1, 4]
- **Output:** Float32 prediction value
- **Format:** ONNX

### Sample Inference
```typescript
import * as ort from "onnxruntime-web";

const session = await ort.InferenceSession.create("/models/nautilus_forecast.onnx");
const input = new ort.Tensor("float32", new Float32Array([1, 0.75, 1013, 3.2]), [1, 4]);
const results = await session.run({ input });
const prediction = results.output.data[0];
```

## 🎨 Styling

### CSS Variables
```css
--nautilus-bg-alt: Background color for page
--nautilus-accent: Accent color for borders
--nautilus-bg: Card background color
--nautilus-primary: Primary color for icons
--nautilus-border: Border color
```

### Tailwind Classes
- Container: `p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen`
- Cards: `border border-[var(--nautilus-accent)] shadow-lg`
- Text: `text-3xl font-bold`

## ♿ Accessibility Features

### WCAG 2.1 Compliance
- ✅ Semantic HTML (h1, main, section)
- ✅ ARIA roles and labels
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Live regions for dynamic content
- ✅ Focus management

### Testing
```bash
npm test -- src/tests/pages/forecast-global.test.tsx
```

## 🔧 Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Lint
```bash
npm run lint
```

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| onnxruntime-web | 1.23.0 | AI inference |
| mqtt | 5.14.1 | MQTT client |
| framer-motion | 11.15.0 | Animations |
| @radix-ui/react-progress | 1.1.7 | Progress bars |

## 🐛 Troubleshooting

### Issue: ONNX model not loading
**Solution:** Ensure model file exists at `/public/models/nautilus_forecast.onnx`

### Issue: MQTT connection failed
**Solution:** Check `VITE_MQTT_URL` environment variable

### Issue: Components not rendering
**Solution:** Check browser console for import errors, ensure safeLazyImport is working

### Issue: Accessibility warnings
**Solution:** Verify all interactive elements have proper ARIA attributes

## 📚 Additional Resources

- [ONNX Runtime Web Docs](https://onnxruntime.ai/docs/tutorials/web/)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎯 Next Steps

1. Deploy ONNX model to `/public/models/nautilus_forecast.onnx`
2. Configure MQTT broker URL in production
3. Test forecast updates in production environment
4. Monitor performance and accuracy metrics
5. Gather user feedback for improvements
