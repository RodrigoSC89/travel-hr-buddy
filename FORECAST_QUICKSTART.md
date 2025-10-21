# Forecast Global Module - Quick Reference

## 🚀 Quick Start

### Using the Components

```typescript
// Import lazy-loaded components
import { safeLazyImport } from "@/lib/safeLazyImport";

const ForecastAI = safeLazyImport(() => import("@/components/forecast/ForecastAI"));
const ForecastMetrics = safeLazyImport(() => import("@/components/forecast/ForecastMetrics"));
const ForecastMap = safeLazyImport(() => import("@/components/forecast/ForecastMap"));

// Use in your page
<Suspense fallback={<div>Loading...</div>}>
  <ForecastAI />
  <ForecastMetrics />
  <ForecastMap />
</Suspense>
```

### MQTT Publisher with QoS

```typescript
import { publishEvent, publishForecast } from "@/lib/mqtt/publisher";

// Publish with custom QoS
publishEvent("topic/name", { data: "value" }, 2); // QoS 2: Exactly once

// Publish forecast with QoS
publishForecast({ forecast: 0.85, timestamp: new Date().toISOString() }, 1);
```

## 📦 Components

### ForecastAI
**Path**: `src/components/forecast/ForecastAI.tsx`

**Features**:
- ONNX Runtime Web inference
- Automatic MQTT publishing
- Offline fallback
- WCAG 2.1 Level AA compliant

**Props**: None (self-contained)

**MQTT Topic**: `nautilus/forecast/update`

### ForecastMetrics
**Path**: `src/components/forecast/ForecastMetrics.tsx`

**Features**:
- 3 performance metrics
- WCAG-compliant progress bars
- Color-coded indicators

**Props**: None (displays static metrics)

### ForecastMap
**Path**: `src/components/forecast/ForecastMap.tsx`

**Features**:
- Interactive global map
- Framer Motion animations
- Lazy loading

**Props**: None (uses earth.nullschool.net)

## 🔧 MQTT QoS Levels

| QoS | Level | Description | Use Case |
|-----|-------|-------------|----------|
| 0 | At most once | Fire and forget | Non-critical updates |
| 1 | At least once | Guaranteed delivery | Most use cases (default) |
| 2 | Exactly once | No duplicates | Critical transactions |

## ♿ WCAG Compliance

All components meet WCAG 2.1 Level AA:

### Required ARIA Attributes

**Progress Bars**:
```tsx
<div
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Description"
  aria-describedby="desc-id"
/>
```

**Live Regions**:
```tsx
<div aria-live="polite" aria-atomic="true">
  Status message
</div>
```

**Decorative Icons**:
```tsx
<Icon aria-hidden="true" />
```

## 🧪 Testing

### Run Tests
```bash
npm run test src/tests/mqtt-publisher-qos.test.ts
```

### Type Check
```bash
npm run type-check
```

### Build
```bash
npm run build
```

## 📝 File Structure

```
src/
├── components/forecast/
│   ├── ForecastAI.tsx          (190 lines)
│   ├── ForecastMetrics.tsx     (94 lines)
│   ├── ForecastMap.tsx         (45 lines)
│   └── ...
├── lib/mqtt/
│   └── publisher.ts            (Enhanced with QoS)
├── pages/
│   └── Forecast.tsx            (51 lines, refactored)
└── tests/
    └── mqtt-publisher-qos.test.ts (67 lines)
```

## ⚙️ Configuration

### Environment Variables

```env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

### ONNX Model

Place model at: `/public/models/nautilus_forecast.onnx`

Model input shape: `[1, 4]` (pressure, temperature, wind_speed, wave_height)

## 🐛 Troubleshooting

### Model Not Loading
- Check model path: `/public/models/nautilus_forecast.onnx`
- Component will fallback to offline mode automatically

### MQTT Connection Issues
- Verify `VITE_MQTT_URL` environment variable
- Check broker accessibility
- Review console logs for connection errors

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

## 📊 Performance

- **Initial Load**: ~450KB (before lazy loading)
- **ForecastAI**: ~6.6KB
- **ForecastMetrics**: ~2.6KB
- **ForecastMap**: ~1.3KB

## 🔗 Related Documentation

- [Implementation Summary](./FORECAST_IMPLEMENTATION_SUMMARY.md)
- [WCAG Compliance Report](./FORECAST_WCAG_COMPLIANCE_REPORT.md)

## 📞 Support

For issues or questions:
1. Check the implementation summary
2. Review test files for usage examples
3. Verify WCAG compliance report for accessibility

---
**Version**: 1.0.0  
**Last Updated**: 2025-10-21  
**Status**: ✅ Production Ready
