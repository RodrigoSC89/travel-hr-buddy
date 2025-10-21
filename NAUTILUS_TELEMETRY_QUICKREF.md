# Performance Telemetry Quick Reference

## Installation & Setup

```bash
# 1. Environment variables (.env)
VITE_OPENAI_API_KEY=sk-your-key
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
VITE_MQTT_USER=nautilus           # Production only
VITE_MQTT_PASS=your-password      # Production only
JWT_SECRET=your-secret-key        # Production only

# 2. Validate environment
node scripts/validate-env.cjs

# 3. Run tests
npm run test src/tests/telemetry/
```

## Quick Start

### Option 1: Use Performance Panel Component

```tsx
import { PerformancePanel } from "@/components/monitoring/PerformancePanel";
import { initMQTT } from "@/lib/mqtt";

function Dashboard() {
  const mqttClient = initMQTT();
  return <PerformancePanel mqttClient={mqttClient} />;
}
```

### Option 2: Use Hook Directly

```tsx
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";
import { initMQTT } from "@/lib/mqtt";

function MyComponent() {
  const mqttClient = initMQTT();
  const metrics = usePerformanceMonitor(mqttClient);

  return (
    <div>
      <p>CPU: {metrics.cpu.toFixed(1)}%</p>
      <p>Memory: {metrics.memory} MB</p>
      <p>FPS: {metrics.fps}</p>
    </div>
  );
}
```

### Option 3: AI Analysis

```tsx
import { analyzePerformanceMetrics } from "@/lib/AI/telemetryBridge";

async function analyze(metrics) {
  const insights = await analyzePerformanceMetrics(metrics);
  console.log("Summary:", insights.summary);
  console.log("Recommendations:", insights.recommendations);
}
```

## API Reference

### `usePerformanceMonitor(mqttClient?)`
Returns: `{ cpu, memory, fps, timestamp }`

### `initMQTT(brokerUrl?)`
Returns: MQTT client instance

### `initSecureMQTT(config?)`
Returns: Secure MQTT client with TLS/SSL

### `analyzePerformanceMetrics(metrics)`
Returns: `Promise<AIInsight>`

### `generatePerformanceReport(metricsHistory)`
Returns: `Promise<string>`

## MQTT Topics

- `nautilus/telemetry/performance` - Performance metrics
- `nautilus/events` - General events

## Security Checklist

- [ ] Use `wss://` or `mqtts://` in production
- [ ] Set MQTT authentication credentials
- [ ] Configure JWT_SECRET
- [ ] Run environment validation
- [ ] Review security scan results

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MQTT won't connect | Check VITE_MQTT_URL and network |
| AI analysis fails | Verify VITE_OPENAI_API_KEY |
| Metrics show zero | Check browser performance API support |
| Security warnings | Use encrypted protocols and auth |

## Testing

```bash
# Run telemetry tests
npm run test src/tests/telemetry/

# Expected: 35 tests passed
```

## Files Structure

```
src/
├── lib/
│   ├── telemetry/
│   │   └── performance-monitor.ts    # Performance monitoring hook
│   ├── mqtt/
│   │   ├── index.ts                  # MQTT client wrapper
│   │   └── secure-client.ts          # Secure MQTT with TLS/SSL
│   └── AI/
│       └── telemetryBridge.ts        # AI insights integration
├── components/
│   └── monitoring/
│       └── PerformancePanel.tsx      # Visual dashboard
└── tests/
    └── telemetry/
        ├── performance-monitor.test.ts
        ├── mqtt-client.test.ts
        └── ai-bridge.test.ts

scripts/
└── validate-env.cjs                  # Environment validation

.github/
└── workflows/
    └── security-scan.yml             # Automated security scanning
```

## Performance Impact

- CPU overhead: < 0.1% idle
- Bundle size: +10.5 KB (~3.5 KB gzipped)
- Measurement interval: 1 second
- Memory: ~10 KB per measurement

## Environment Validation

```bash
node scripts/validate-env.cjs
```

Output:
- ✅ Required variables present
- ⚠️ Missing optional variables
- 🔒 Production security checks
- 🔍 Git ignore validation

## Best Practices

1. Always use secure connections in production
2. Don't analyze metrics on every update
3. Cache historical data before AI analysis
4. Handle disconnections gracefully
5. Test in your environment before deploying

## Documentation

- Full guide: `NAUTILUS_TELEMETRY_IMPLEMENTATION.md`
- This quick ref: `NAUTILUS_TELEMETRY_QUICKREF.md`
- PR summary: `PR_1269_IMPLEMENTATION_SUMMARY.md`

## Version

Nautilus One v3.3-v3.5
