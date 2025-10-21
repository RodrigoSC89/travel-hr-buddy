# Forecast Global Quick Reference

## Quick Start

### Using the Forecast Page
Navigate to `/forecast` to see the new modular Forecast Global interface with:
- AI Inference Engine
- Performance Metrics
- Interactive Maritime Map

### Importing Components

```typescript
// Import individual components
import ForecastAI from "@/components/forecast/ForecastAI";
import ForecastMetrics from "@/components/forecast/ForecastMetrics";
import ForecastMap from "@/components/forecast/ForecastMap";

// Use in your page
<ForecastAI />
<ForecastMetrics />
<ForecastMap />
```

### Using MQTT Functions

```typescript
import { publishEvent, subscribeForecast } from "@/lib/mqtt/publisher";

// Publish a forecast update
publishEvent("nautilus/forecast/update", { 
  forecast: 0.85,
  timestamp: new Date().toISOString()
}, 1); // QoS level 1

// Subscribe to forecast updates
const unsubscribe = subscribeForecast((data) => {
  console.log("Received forecast:", data);
});

// Cleanup when done
unsubscribe();
```

## Component API

### ForecastAI

**Purpose**: Local AI inference engine using ONNX Runtime

**Features**:
- Automatic model loading from `/public/models/nautilus_forecast.onnx`
- Offline fallback when model unavailable
- MQTT publishing on inference results
- Accessible status updates

**Props**: None (standalone component)

**Example**:
```tsx
import ForecastAI from "@/components/forecast/ForecastAI";

export default function MyPage() {
  return (
    <div>
      <h1>My Custom Page</h1>
      <ForecastAI />
    </div>
  );
}
```

### ForecastMetrics

**Purpose**: Display performance metrics with accessible progress bars

**Metrics Shown**:
- Model Reliability: 93%
- Real-time Accuracy: 88%
- Global Coverage: 97%

**Props**: None (uses hardcoded metrics)

**Example**:
```tsx
import ForecastMetrics from "@/components/forecast/ForecastMetrics";

<ForecastMetrics />
```

### ForecastMap

**Purpose**: Interactive maritime weather visualization

**Features**:
- Embedded Windy.com map
- Framer Motion fade-in animation
- Lazy loading with loading state

**Props**: None (uses default Windy.com configuration)

**Example**:
```tsx
import ForecastMap from "@/components/forecast/ForecastMap";

<ForecastMap />
```

## MQTT Publisher API

### publishEvent()

Publish an event to the MQTT broker with configurable QoS.

**Signature**:
```typescript
publishEvent(
  topic: string,
  payload: Record<string, unknown>,
  qos?: 0 | 1 | 2  // Default: 1
): void
```

**Parameters**:
- `topic`: MQTT topic (e.g., "nautilus/forecast/update")
- `payload`: JSON object to publish
- `qos`: Quality of Service level (0, 1, or 2)
  - 0: At most once (fire and forget)
  - 1: At least once (default, recommended)
  - 2: Exactly once (highest reliability)

**Example**:
```typescript
publishEvent("nautilus/forecast/update", 
  { forecast: 0.95, confidence: 0.88 }, 
  1
);
```

### subscribeForecast()

Subscribe to forecast updates on the `nautilus/forecast/update` topic.

**Signature**:
```typescript
subscribeForecast(
  callback: (data: Record<string, unknown>) => void
): () => void
```

**Parameters**:
- `callback`: Function to call when a message is received

**Returns**: Unsubscribe function for cleanup

**Example**:
```typescript
// Subscribe
const unsubscribe = subscribeForecast((data) => {
  console.log("Forecast update:", data);
  // Handle the forecast data
});

// Later, cleanup
useEffect(() => {
  const unsubscribe = subscribeForecast(handleForecast);
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

### subscribeDP()

Subscribe to DP telemetry updates (existing functionality).

**Signature**:
```typescript
subscribeDP(
  callback: (data: Record<string, unknown>) => void
): mqtt.MqttClient
```

**Parameters**:
- `callback`: Function to call when a message is received

**Returns**: MQTT client instance for manual management

## Environment Variables

### VITE_MQTT_URL

Configure the MQTT broker URL.

**Default**: `wss://broker.hivemq.com:8884/mqtt` (public broker)

**Production Setup**:
```bash
# .env.production
VITE_MQTT_URL=wss://your-production-broker.com:8884/mqtt
```

## File Locations

```
src/
├── components/
│   └── forecast/
│       ├── ForecastAI.tsx       # AI inference engine
│       ├── ForecastMetrics.tsx  # Performance metrics
│       └── ForecastMap.tsx      # Maritime visualization
│
├── lib/
│   └── mqtt/
│       ├── publisher.ts         # MQTT functions
│       └── secure-client.ts     # (existing)
│
├── pages/
│   └── Forecast.tsx             # Main forecast page
│
└── utils/
    └── safeLazyImport.tsx       # Lazy loading utility

public/
└── models/
    └── nautilus_forecast.onnx   # (optional) ONNX model
```

## Common Tasks

### Add ONNX Model

1. Train or obtain an ONNX model
2. Place it at `/public/models/nautilus_forecast.onnx`
3. Model will be automatically loaded by ForecastAI component

**Model Input**: Float32 array [weather_condition, sea_state, pressure, wind_speed]
**Model Output**: Float32 forecast value (0-1)

### Customize Metrics

Edit `src/components/forecast/ForecastMetrics.tsx`:

```typescript
const metrics = [
  {
    id: "metric-custom",
    label: "Custom Metric",
    value: 95,
    icon: YourIcon,
    color: "text-red-500",
  },
  // ... add more metrics
];
```

### Change Map Provider

Edit `src/components/forecast/ForecastMap.tsx`:

```tsx
<iframe
  src="YOUR_MAP_PROVIDER_URL"
  title="Maritime forecast map"
  // ... other props
/>
```

## Troubleshooting

### Model Not Loading

**Symptom**: Component shows "Modo Offline"

**Solutions**:
1. Check if `/public/models/nautilus_forecast.onnx` exists
2. Verify model format is compatible with onnxruntime-web@1.23.0
3. Check browser console for detailed error messages
4. Use offline mode (works without model)

### MQTT Connection Issues

**Symptom**: No messages being received/sent

**Solutions**:
1. Check `VITE_MQTT_URL` environment variable
2. Verify broker is accessible (firewall, CORS)
3. Check browser console for connection errors
4. Test with public broker: `wss://broker.hivemq.com:8884/mqtt`

### Component Not Rendering

**Symptom**: Blank screen or loading forever

**Solutions**:
1. Check for JavaScript errors in browser console
2. Verify all imports are correct
3. Ensure Suspense boundary is in place
4. Check if safeLazyImport is working

### TypeScript Errors

**Symptom**: Type errors when importing components

**Solutions**:
1. Run `npm run type-check` to see detailed errors
2. Ensure all dependencies are installed: `npm install`
3. Clear TypeScript cache: `rm -rf node_modules/.cache`

## Performance Optimization

### Lazy Loading

All forecast components use lazy loading by default via `safeLazyImport`:

```typescript
const ForecastAI = safeLazyImport(
  () => import("@/components/forecast/ForecastAI"), 
  "ForecastAI"
);
```

### Bundle Splitting

Components are automatically split into separate chunks:
- `ForecastAI.tsx` → `ForecastAI-[hash].js`
- `ForecastMetrics.tsx` → `ForecastMetrics-[hash].js`
- `ForecastMap.tsx` → `ForecastMap-[hash].js`

### Preloading

To preload components before navigation:

```typescript
// In your router configuration
{
  path: '/forecast',
  lazy: () => import('./pages/Forecast'),
  loader: async () => {
    // Preload components
    await Promise.all([
      import('./components/forecast/ForecastAI'),
      import('./components/forecast/ForecastMetrics'),
      import('./components/forecast/ForecastMap')
    ]);
    return null;
  }
}
```

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import ForecastAI from '@/components/forecast/ForecastAI';

test('renders ForecastAI component', () => {
  render(<ForecastAI />);
  expect(screen.getByText(/Forecast AI Engine/i)).toBeInTheDocument();
});
```

### Integration Tests

```typescript
import { publishEvent, subscribeForecast } from '@/lib/mqtt/publisher';

test('MQTT publish and subscribe', (done) => {
  const testData = { forecast: 0.85 };
  
  const unsubscribe = subscribeForecast((data) => {
    expect(data).toEqual(testData);
    unsubscribe();
    done();
  });
  
  publishEvent('nautilus/forecast/update', testData);
});
```

## Accessibility

All components are WCAG 2.1 Level AA compliant:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA attributes
- ✅ Color contrast
- ✅ Focus indicators
- ✅ Live regions for status updates

### Testing Accessibility

```bash
# Run accessibility tests
npm run test:axe

# Manual testing
# 1. Navigate with Tab key
# 2. Use screen reader (NVDA, JAWS, VoiceOver)
# 3. Check color contrast (Chrome DevTools)
```

## Need Help?

- 📚 Full documentation: `FORECAST_GLOBAL_PATCH_10_IMPLEMENTATION.md`
- 🔍 Comparison guide: `FORECAST_GLOBAL_BEFORE_AFTER.md`
- 🐛 Report issues: GitHub Issues
- 💬 Questions: Contact support team
