# Nautilus Telemetry Quick Reference

## 🚀 Quick Start

### 1. Configure Environment

```bash
# .env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
VITE_MQTT_USER=nautilus
VITE_MQTT_PASS=your-password
VITE_OPENAI_API_KEY=sk-your-key
JWT_SECRET=your-secret-key-min-32-characters
```

### 2. Validate Configuration

```bash
node scripts/validate-env.cjs
```

### 3. Use Performance Panel

```tsx
import { PerformancePanel } from "@/components/monitoring/PerformancePanel";
import { initMQTT } from "@/lib/mqtt";

function Dashboard() {
  const mqttClient = initMQTT();
  return <PerformancePanel mqttClient={mqttClient} />;
}
```

## 📦 Imports

```typescript
// Performance monitoring
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

// MQTT clients
import { initMQTT } from "@/lib/mqtt";
import { initSecureMQTT } from "@/lib/mqtt/secure-client";

// AI analysis
import { analyzePerformanceMetrics, generatePerformanceReport } from "@/lib/AI/telemetryBridge";

// UI component
import { PerformancePanel } from "@/components/monitoring/PerformancePanel";
```

## 🔧 Common Patterns

### Pattern 1: Basic Monitoring

```tsx
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";

function MyComponent() {
  const metrics = usePerformanceMonitor();
  return <div>CPU: {metrics.cpu}%</div>;
}
```

### Pattern 2: With MQTT Publishing

```tsx
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";
import { initMQTT } from "@/lib/mqtt";

function MyComponent() {
  const mqttClient = initMQTT();
  const metrics = usePerformanceMonitor(mqttClient);
  return <div>CPU: {metrics.cpu}%</div>;
}
```

### Pattern 3: With AI Analysis

```tsx
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";
import { analyzePerformanceMetrics } from "@/lib/AI/telemetryBridge";
import { useEffect, useState } from "react";

function SmartMonitor() {
  const metrics = usePerformanceMonitor();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const analyze = async () => {
      const result = await analyzePerformanceMetrics(metrics);
      setInsights(result);
    };
    const timer = setTimeout(analyze, 5000); // Analyze every 5 seconds
    return () => clearTimeout(timer);
  }, [metrics]);

  return (
    <div>
      <p>CPU: {metrics.cpu}%</p>
      {insights && <p>{insights.summary}</p>}
    </div>
  );
}
```

### Pattern 4: Custom MQTT Publishing

```tsx
import { initMQTT } from "@/lib/mqtt";

function publishCustomMetric() {
  const client = initMQTT();
  
  if (client) {
    client.publish("nautilus/custom/metric", JSON.stringify({
      timestamp: new Date().toISOString(),
      value: 42
    }), { qos: 0 });
  }
}
```

## 🧪 Testing

```bash
# All telemetry tests
npm test -- src/tests/telemetry/

# Specific test
npm test -- src/tests/telemetry/performance-monitor.test.ts

# With coverage
npm run test:coverage
```

## 🔐 Security Checklist

- [ ] Use `wss://` or `mqtts://` in production
- [ ] Set `VITE_MQTT_USER` and `VITE_MQTT_PASS`
- [ ] Set `JWT_SECRET` (min 32 chars)
- [ ] Run `node scripts/validate-env.cjs` before deploy
- [ ] Verify `.env` is in `.gitignore`

## 📊 Metrics Reference

| Metric | Range | Unit | API Required |
|--------|-------|------|--------------|
| CPU | 0-100 | % | `requestAnimationFrame` |
| Memory | 0+ | MB | `performance.memory` (Chrome) |
| FPS | 0-60+ | frames/sec | `requestAnimationFrame` |

## 🎨 Status Colors

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| CPU | <60% | 60-80% | >80% |
| Memory | <512MB | 512-1024MB | >1024MB |
| FPS | >45 | 30-45 | <30 |

## 📡 MQTT Topics

| Topic | Purpose |
|-------|---------|
| `nautilus/telemetry/performance` | Real-time performance metrics |
| `nautilus/telemetry/system` | System status updates |
| `nautilus/dp/telemetry` | DP module telemetry |

## 🐛 Quick Fixes

### MQTT not connecting?
```bash
# Check URL format
wss://broker.hivemq.com:8884/mqtt  # ✅ Good
ws://broker.hivemq.com              # ⚠️ Missing port/path
```

### Memory showing 0?
```javascript
// Check browser support
if ((performance as any).memory) {
  console.log("Memory API available");
} else {
  console.log("Memory API not available (Firefox/Safari)");
}
```

### AI insights not working?
```bash
# Verify API key
echo $VITE_OPENAI_API_KEY
# Should output: sk-...
```

## 💡 Tips

1. **Performance Impact**: Hook updates every 1 second (configurable)
2. **Graceful Degradation**: All features work without MQTT or OpenAI
3. **Singleton Pattern**: MQTT clients are reused across calls
4. **Zero Breaking Changes**: Everything is optional and backward compatible

## 📚 Related Files

- Implementation: `NAUTILUS_TELEMETRY_IMPLEMENTATION.md`
- PR Summary: `PR_1269_IMPLEMENTATION_SUMMARY.md`
- Visual Guide: `VISUAL_SUMMARY.md`

## 🔗 Quick Links

```bash
# Build
npm run build

# Type check
npm run type-check

# Validate environment
node scripts/validate-env.cjs

# Run all tests
npm test
```
