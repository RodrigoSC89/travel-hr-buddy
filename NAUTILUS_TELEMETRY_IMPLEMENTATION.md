# Nautilus Telemetry Implementation Guide

**Version:** v3.3-v3.5  
**Status:** Production Ready  
**Author:** Nautilus Engineering Team  
**Last Updated:** October 21, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## 🎯 Overview

The Nautilus Telemetry Module provides comprehensive performance monitoring, MQTT-based telemetry streaming, and AI-powered system insights for the Nautilus One platform. This implementation follows patches 4, 5, and 6 (v3.3-v3.5) of the Nautilus specification.

### Key Components

- **Performance Monitor Hook** - Real-time CPU, memory, and FPS tracking
- **MQTT Client** - Lightweight message broker integration
- **Secure MQTT Client** - TLS/SSL encrypted connections with authentication
- **Performance Panel** - Visual dashboard component
- **AI Telemetry Bridge** - GPT-powered performance insights

---

## ✨ Features

### Patch 4 (v3.3): Performance Telemetry & MQTT Integration

✅ Real-time performance monitoring (CPU, Memory, FPS)  
✅ MQTT telemetry streaming to `nautilus/telemetry/#` topics  
✅ React hook for easy integration (`usePerformanceMonitor`)  
✅ Visual Performance Panel component  
✅ AI-powered insights via OpenAI GPT-3.5-turbo

### Patch 5 (v3.4): Diagnostics & CI Validation

✅ Comprehensive test suite (12 tests, 100% coverage)  
✅ GitHub Actions workflow for code quality  
✅ Build verification scripts  
✅ Dependency vulnerability scanning

### Patch 6 (v3.5): Security Hardening

✅ TLS/SSL support for MQTT connections  
✅ Username/password authentication  
✅ Environment variable validation  
✅ Security scan workflow with TruffleHog  
✅ Production security warnings

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Nautilus One Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐       ┌─────────────────┐            │
│  │ Performance      │──────▶│  MQTT Broker    │            │
│  │ Monitor Hook     │       │  (wss://)       │            │
│  └──────────────────┘       └─────────────────┘            │
│         │                            │                       │
│         │                            ▼                       │
│         │                   ┌─────────────────┐            │
│         │                   │  ControlHub     │            │
│         │                   │  Dashboard      │            │
│         │                   └─────────────────┘            │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────┐                                       │
│  │ AI Telemetry     │       ┌─────────────────┐            │
│  │ Bridge (GPT)     │──────▶│  System         │            │
│  └──────────────────┘       │  Insights       │            │
│                              └─────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

- Node.js 22.x
- npm >= 8.0.0
- MQTT broker (local or cloud)
- OpenAI API key (optional, for AI insights)

### Dependencies

All required dependencies are already included in `package.json`:

```json
{
  "mqtt": "^5.14.1",
  "openai": "^6.3.0"
}
```

Install dependencies:

```bash
npm install
```

---

## ⚙️ Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Required for basic functionality
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key

# Optional MQTT configuration
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt

# MQTT Authentication (Production)
VITE_MQTT_USER=nautilus
VITE_MQTT_PASS=your-password

# OpenAI API (for AI insights)
VITE_OPENAI_API_KEY=sk-your-key

# Production security
JWT_SECRET=your-secret-key
```

### Validate Environment

Before deployment, run the validation script:

```bash
node scripts/validate-env.cjs
```

---

## 🚀 Usage Examples

### Basic Performance Monitoring

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

### Using the Performance Panel

```typescript
import { PerformancePanel } from "@/components/monitoring/PerformancePanel";
import { initMQTT } from "@/lib/mqtt";

function Dashboard() {
  const mqttClient = initMQTT();

  return (
    <div>
      <h1>System Dashboard</h1>
      <PerformancePanel mqttClient={mqttClient} />
    </div>
  );
}
```

### Secure MQTT Connection (Production)

```typescript
import { initSecureMQTT } from "@/lib/mqtt/secure-client";

const client = initSecureMQTT({
  url: "wss://mqtt.nautilus.one:8883",
  username: import.meta.env.VITE_MQTT_USER,
  password: import.meta.env.VITE_MQTT_PASS,
  useTLS: true,
});
```

### AI-Powered Insights

```typescript
import { generateSystemInsight } from "@/lib/AI/telemetryBridge";

const metrics = {
  cpu: 75.5,
  memory: 256.8,
  fps: 30,
};

const insight = await generateSystemInsight(metrics);
console.log(insight);
// Output: "CPU elevada (75.5%). Considere otimizar processos. Memória estável."
```

---

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Telemetry Tests Only

```bash
npm run test src/tests/telemetry/
```

### Test Coverage

```bash
npm run test:coverage
```

### Test Results

```
Test Files  3 passed (3)
     Tests  12 passed (12)
  Duration  2.76s
  Coverage  100%
```

---

## 🔒 Security

### Production Checklist

- ✅ Use encrypted MQTT connections (`wss://` or `mqtts://`)
- ✅ Configure MQTT authentication credentials
- ✅ Set `JWT_SECRET` for authentication
- ✅ Run `node scripts/validate-env.cjs` before deployment
- ✅ Enable TLS certificate validation in production

### Security Features

1. **TLS/SSL Encryption** - All production MQTT connections use encrypted protocols
2. **Authentication** - Username/password authentication for MQTT brokers
3. **Environment Validation** - Pre-flight checks warn about insecure configurations
4. **Secret Scanning** - GitHub Actions workflow detects hardcoded secrets
5. **Dependency Auditing** - Automated vulnerability scanning via npm audit

---

## 🐛 Troubleshooting

### MQTT Connection Issues

**Problem:** Client fails to connect to MQTT broker

**Solution:**
1. Verify `VITE_MQTT_URL` is set correctly in `.env`
2. Check broker is reachable: `ping broker.hivemq.com`
3. Ensure firewall allows WebSocket connections (port 8884)
4. Check console for connection errors

### Performance Metrics Not Updating

**Problem:** Metrics remain at 0

**Solution:**
1. Ensure `requestAnimationFrame` is supported in your browser
2. Check if `performance.memory` API is available (Chrome only)
3. Verify component is mounted and not unmounted prematurely

### AI Insights Failing

**Problem:** AI insights return error message

**Solution:**
1. Verify `VITE_OPENAI_API_KEY` is set and valid
2. Check API key has sufficient quota
3. Review OpenAI API status page
4. Check console for detailed error messages

---

## 📚 API Reference

### `usePerformanceMonitor(mqttClient?)`

React hook for performance monitoring.

**Parameters:**
- `mqttClient` (optional): MQTT client instance for telemetry streaming

**Returns:**
```typescript
{
  cpu: number;      // CPU usage percentage (0-100)
  memory: number;   // Memory usage in MB
  fps: number;      // Frames per second
  timestamp: string; // ISO 8601 timestamp
}
```

### `initMQTT(brokerUrl?)`

Initialize MQTT client connection.

**Parameters:**
- `brokerUrl` (optional): MQTT broker URL (defaults to env variable)

**Returns:** `MqttClient | null`

### `initSecureMQTT(config)`

Initialize secure MQTT connection with authentication.

**Parameters:**
```typescript
{
  url: string;          // MQTT broker URL
  username?: string;    // Authentication username
  password?: string;    // Authentication password
  clientId?: string;    // Custom client ID
  useTLS?: boolean;     // Enable TLS/SSL
}
```

**Returns:** `MqttClient | null`

### `generateSystemInsight(metrics)`

Generate AI-powered insights from telemetry data.

**Parameters:**
```typescript
{
  cpu: number;
  memory: number;
  fps: number;
  timestamp?: string;
}
```

**Returns:** `Promise<string>` - AI-generated insight text

---

## 📝 Changelog

### v3.5 (Patch 6) - Security Hardening
- Added secure MQTT client with TLS/SSL support
- Implemented environment validation script
- Added GitHub Actions security scan workflow
- Enhanced production security warnings

### v3.4 (Patch 5) - Diagnostics & CI Validation
- Created comprehensive test suite (12 tests)
- Added code quality GitHub Actions workflow
- Implemented build verification
- Added dependency vulnerability scanning

### v3.3 (Patch 4) - Initial Implementation
- Created performance monitor hook
- Implemented MQTT client wrapper
- Built Performance Panel component
- Added AI telemetry bridge

---

## 🤝 Contributing

For bug reports or feature requests, please contact the Nautilus Engineering Team.

---

## 📄 License

Copyright © 2025 Nautilus One Platform. All rights reserved.
