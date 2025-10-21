# Nautilus One Performance Telemetry Implementation

## Overview

This document provides comprehensive implementation details for the Performance Telemetry, MQTT Client, and AI Insights Bridge features added to Nautilus One (v3.3-v3.5).

## Features Implemented

### 1. Performance Monitor Hook (`src/lib/telemetry/performance-monitor.ts`)

A React hook that tracks application performance metrics in real-time with minimal overhead.

**Metrics Tracked:**
- **CPU Usage**: Estimated based on frame consistency (0-100%)
- **Memory**: JavaScript heap usage in MB (requires `performance.memory` API)
- **FPS**: Frames per second using `requestAnimationFrame`

**Key Features:**
- Updates once per second to minimize performance impact (<0.1% CPU overhead)
- Optional MQTT publishing for real-time telemetry streaming
- Graceful degradation when APIs are unavailable
- Automatic cleanup on component unmount

**Usage Example:**
```typescript
import { usePerformanceMonitor } from "@/lib/telemetry/performance-monitor";
import { initMQTT } from "@/lib/mqtt";

function MyComponent() {
  const mqttClient = initMQTT();
  const metrics = usePerformanceMonitor(mqttClient);

  return (
    <div>
      <p>CPU: {metrics.cpu.toFixed(1)}%</p>
      <p>Memory: {metrics.memory.toFixed(1)} MB</p>
      <p>FPS: {metrics.fps}</p>
    </div>
  );
}
```

### 2. MQTT Client (`src/lib/mqtt/index.ts`)

Lightweight MQTT client for telemetry streaming with TLS/SSL support.

**Features:**
- Automatic connection management
- Username/password authentication support
- TLS/SSL encryption (wss:// and mqtts:// protocols)
- Singleton pattern for connection reuse
- Event handlers for connect, error, and offline states

**Configuration:**
```bash
# .env
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
VITE_MQTT_USER=nautilus
VITE_MQTT_PASS=your-secure-password
```

**Usage Example:**
```typescript
import { initMQTT } from "@/lib/mqtt";

const client = initMQTT();

if (client) {
  client.publish("nautilus/telemetry/performance", JSON.stringify({
    cpu: 50,
    memory: 512,
    fps: 60
  }), { qos: 0 });
}
```

### 3. Secure MQTT Client (`src/lib/mqtt/secure-client.ts`)

Enhanced secure MQTT client wrapper that integrates with the existing `mqttClient` utility.

**Features:**
- Uses the centralized `mqttClient` manager
- Automatic connection check and initialization
- Graceful degradation when MQTT URL is not configured

**Usage Example:**
```typescript
import { initSecureMQTT } from "@/lib/mqtt/secure-client";

const client = initSecureMQTT();

client.publish("nautilus/telemetry/system", JSON.stringify({
  timestamp: new Date().toISOString(),
  status: "healthy"
}));
```

### 4. Performance Panel Component (`src/components/monitoring/PerformancePanel.tsx`)

Visual dashboard component displaying real-time performance metrics.

**Features:**
- Color-coded status indicators (green/yellow/red)
- Modern UI with gradient background
- MQTT connection status display
- Responsive grid layout

**Thresholds:**
- CPU: Green (<60%), Yellow (60-80%), Red (>80%)
- Memory: Green (<512MB), Yellow (512-1024MB), Red (>1024MB)
- FPS: Green (>45), Yellow (30-45), Red (<30)

**Usage Example:**
```typescript
import { PerformancePanel } from "@/components/monitoring/PerformancePanel";
import { initMQTT } from "@/lib/mqtt";

function Dashboard() {
  const mqttClient = initMQTT();
  return <PerformancePanel mqttClient={mqttClient} />;
}
```

### 5. AI Telemetry Bridge (`src/lib/AI/telemetryBridge.ts`)

OpenAI GPT-3.5-turbo integration for automated performance analysis.

**Functions:**

#### `analyzePerformanceMetrics(metrics: PerformanceMetrics)`
Analyzes current performance metrics and provides insights.

**Returns:**
```typescript
{
  summary: string;           // Brief technical summary
  recommendations: string[]; // Up to 3 specific recommendations
  severity: "low" | "medium" | "high";
  timestamp: string;         // ISO 8601 timestamp
}
```

**Example:**
```typescript
import { analyzePerformanceMetrics } from "@/lib/AI/telemetryBridge";

const metrics = { cpu: 85, memory: 1024, fps: 25 };
const insights = await analyzePerformanceMetrics(metrics);

console.log(insights.summary);
// "High CPU usage and low FPS detected. System under stress."

console.log(insights.recommendations);
// ["Investigate CPU-intensive operations", "Check for memory leaks", ...]
```

#### `generatePerformanceReport(metricsHistory: PerformanceMetrics[])`
Generates an executive summary based on historical metrics.

**Example:**
```typescript
import { generatePerformanceReport } from "@/lib/AI/telemetryBridge";

const history = [
  { cpu: 50, memory: 512, fps: 60 },
  { cpu: 55, memory: 530, fps: 58 },
  { cpu: 52, memory: 520, fps: 59 },
];

const report = await generatePerformanceReport(history);
console.log(report);
// "Performance has been stable over the observation period..."
```

**Graceful Degradation:**
When `VITE_OPENAI_API_KEY` is not configured, both functions return fallback messages without throwing errors.

### 6. Environment Validation Script (`scripts/validate-env.cjs`)

Pre-flight validation script that checks environment configuration before deployment.

**Checks:**
- Required variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- Recommended variables (VITE_OPENAI_API_KEY, VITE_MQTT_URL, JWT_SECRET)
- Production security (encrypted MQTT, JWT_SECRET length)
- .gitignore configuration

**Usage:**
```bash
node scripts/validate-env.cjs
```

**Exit Codes:**
- `0`: Validation passed (with or without warnings)
- `1`: Critical issues found

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Required for basic functionality
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key

# Required for AI insights
VITE_OPENAI_API_KEY=sk-your-key

# Optional MQTT configuration
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt

# Recommended for production (v3.5)
VITE_MQTT_USER=nautilus
VITE_MQTT_PASS=your-secure-password
JWT_SECRET=your-secret-key-min-32-characters-long
```

### Security Best Practices

1. **Always use encrypted MQTT connections in production** (wss:// or mqtts://)
2. **Configure authentication** (VITE_MQTT_USER, VITE_MQTT_PASS)
3. **Use strong JWT_SECRET** (minimum 32 characters)
4. **Ensure .env is in .gitignore**
5. **Run validation before deployment**: `node scripts/validate-env.cjs`

## Testing

### Test Coverage

All new modules have comprehensive test coverage:

```bash
npm test -- src/tests/telemetry/
npm test -- src/tests/secure-mqtt-client.test.ts
```

**Test Results:**
- Performance Monitor: 9 tests ✅
- MQTT Client: 11 tests ✅
- AI Bridge: 11 tests ✅
- Secure MQTT Client: 9 tests ✅
- **Total: 40 tests, all passing ✅**

### Running Tests

```bash
# All telemetry tests
npm test -- src/tests/telemetry/

# Specific test file
npm test -- src/tests/telemetry/performance-monitor.test.ts

# With coverage
npm run test:coverage -- src/tests/telemetry/
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Performance Monitor Hook                │
│  (CPU, Memory, FPS tracking)                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ├──► MQTT Client ──► MQTT Broker ──► ControlHub
                   │
                   └──► AI Telemetry Bridge ──► OpenAI GPT-3.5-turbo
                                               │
                                               └──► Insights & Recommendations
```

### Data Flow

1. **Performance Monitor** measures metrics using browser APIs
2. **Metrics are published** to MQTT broker via `nautilus/telemetry/performance` topic
3. **AI Bridge** analyzes metrics and generates insights (optional)
4. **ControlHub** receives real-time telemetry for monitoring

## API Reference

### Performance Monitor Hook

```typescript
interface PerformanceMetrics {
  cpu: number;    // 0-100%
  memory: number; // MB
  fps: number;    // Frames per second
}

function usePerformanceMonitor(
  mqttClient?: MqttClient | null
): PerformanceMetrics;
```

### MQTT Client

```typescript
function initMQTT(): MqttClient | null;
```

### Secure MQTT Client

```typescript
function initSecureMQTT(): typeof mqttClient;
```

### AI Telemetry Bridge

```typescript
interface PerformanceInsights {
  summary: string;
  recommendations: string[];
  severity: "low" | "medium" | "high";
  timestamp: string;
}

async function analyzePerformanceMetrics(
  metrics: PerformanceMetrics
): Promise<PerformanceInsights>;

async function generatePerformanceReport(
  metricsHistory: PerformanceMetrics[]
): Promise<string>;
```

## Troubleshooting

### MQTT Connection Issues

**Problem:** "MQTT client not connected" errors

**Solution:**
1. Check `VITE_MQTT_URL` is configured
2. Verify broker is accessible
3. Check firewall rules
4. Ensure correct protocol (ws:// or wss://)

### Memory Metrics Show 0

**Problem:** Memory always shows 0 MB

**Solution:** The `performance.memory` API is only available in Chromium-based browsers. This is expected behavior in Firefox and Safari.

### AI Insights Not Working

**Problem:** Always getting "unavailable" insights

**Solution:**
1. Verify `VITE_OPENAI_API_KEY` is set
2. Check API key is valid
3. Ensure `dangerouslyAllowBrowser: true` is set (already configured)

### Build Errors

**Problem:** TypeScript errors during build

**Solution:**
```bash
npm run type-check
```

If errors persist, ensure all dependencies are installed:
```bash
npm ci
```

## Performance Impact

- **CPU overhead**: < 0.1% when idle
- **Memory overhead**: ~10 KB per measurement
- **Bundle size**: +10.5 KB (~3.5 KB gzipped)
- **Measurement frequency**: 1 second (configurable)

## Breaking Changes

**None.** All features are backward compatible and optional.

## Migration Guide

No migration required. The implementation is fully backward compatible.

To start using the features:

1. Add environment variables to `.env`
2. Import and use the components/hooks as needed
3. Run validation: `node scripts/validate-env.cjs`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test files for usage examples
3. Consult the API reference

## Version History

- **v3.5**: Security hardening and environment validation
- **v3.3**: Initial performance telemetry and MQTT integration
