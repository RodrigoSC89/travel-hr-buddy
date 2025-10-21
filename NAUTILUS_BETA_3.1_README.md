# Nautilus Beta 3.1 - Complete Implementation Guide

## 📋 Overview

Nautilus Beta 3.1 implements a complete embedded AI inference system and MQTT connectivity for real-time telemetry and event synchronization. This release transforms the Control Hub into a global telemetry console with hybrid BridgeLink + MQTT event monitoring.

## ✅ Implementation Status - COMPLETE

All planned features have been successfully implemented and tested:

### Core Components

#### 1. BridgeLink Event Bus (`src/core/BridgeLink.ts`)
✅ **Status**: Fully operational  
✅ **Tests**: 13/13 passing

**Features:**
- Inter-module communication system
- Event subscription and emission
- Error-safe callback execution
- Unsubscribe functionality
- Event history management (500 events max)
- Statistics and monitoring
- Type-safe event types

**Usage:**
```typescript
import { BridgeLink } from "@/core/BridgeLink";

// Subscribe to events
const unsubscribe = BridgeLink.on("nautilus:event", (event) => {
  console.log(event.data);
});

// Emit events
BridgeLink.emit("nautilus:event", "SourceModule", { 
  message: "Event data" 
});

// Cleanup
unsubscribe();
```

#### 2. MQTT Client (`src/core/MQTTClient.ts`)
✅ **Status**: Fully operational  
✅ **Tests**: 24/24 passing

**Features:**
- MQTT broker connectivity (WebSocket/TCP)
- Auto-reconnect on disconnect (every 5 seconds)
- Bidirectional communication
- Integration with BridgeLink event bus
- Topic subscription/unsubscription
- Event emission through BridgeLink
- Connection status monitoring

**Usage:**
```typescript
import { MQTTClient } from "@/core/MQTTClient";

// Connect to broker
MQTTClient.connect({
  url: "ws://localhost:1883",
  topics: ["nautilus/events", "nautilus/telemetry"]
});

// Send message
MQTTClient.send("nautilus/events", { 
  type: "dp_event",
  data: "DP system operational" 
});

// Subscribe to additional topic
MQTTClient.subscribe("nautilus/logs");

// Check connection status
const status = MQTTClient.getStatus();
console.log(`Connected: ${status.connected}`);

// Disconnect
MQTTClient.disconnect();
```

#### 3. NautilusAI Inference (`src/ai/nautilus-inference.ts`)
✅ **Status**: Fully operational  
✅ **Tests**: 20/20 passing

**Features:**
- ONNX Runtime Web integration
- Local offline AI inference
- Text analysis capabilities
- Contextual log analysis
- DP and FMEA event detection
- Risk pattern recognition
- Sentiment analysis
- Keyword extraction
- Category detection

**Usage:**
```typescript
import { nautilusInference } from "@/ai/nautilus-inference";

// Load ONNX model
await nautilusInference.loadModel("/models/nautilus-mini.onnx");

// Simple analysis
const result = await nautilusInference.analyze("Text to analyze");
console.log(`Confidence: ${result.confidence}`);

// Contextual analysis
const analysis = await nautilusInference.analyzeContext(
  "DP system thruster failure detected"
);
console.log(analysis.summary);
console.log(analysis.categories); // ["DP System", "FMEA"]
console.log(analysis.risks); // Risk patterns detected
console.log(analysis.dpEvents); // DP events detected
console.log(analysis.fmeaPatterns); // FMEA patterns detected

// Unload model
await nautilusInference.unloadModel();
```

#### 4. ControlHub Integration (`src/modules/control-hub/ControlHubPanel.tsx`)
✅ **Status**: Fully operational

**Features:**
- MQTT connection on mount
- Real-time telemetry console
- Event log display (last 50 events)
- MQTT connection status indicator (🟢/🔴)
- BridgeLink event subscription
- Terminal-style UI (dark theme with green text)
- Auto-scroll with event buffer
- Timestamp prefix for each event

**Visual Changes:**
```
┌─────────────────────────────────────────┐
│ 🌐 Console de Telemetria Global        │
│ Eventos em tempo real (BridgeLink+MQTT)│
│ Status MQTT: 🟢 Conectado              │
│ ┌─────────────────────────────────────┐│
│ │ [2025-10-21T03:17:52.616Z]          ││
│ │ [MQTT] DP system operating normally ││
│ │ [2025-10-21T03:17:53.123Z]          ││
│ │ [MQTT] Thruster allocation updated  ││
│ │ [2025-10-21T03:17:54.456Z]          ││
│ │ [MQTT] Position accuracy: 2.5m      ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## 📦 Dependencies Added

```json
{
  "dependencies": {
    "onnxruntime-web": "^1.20.1",
    "mqtt": "^5.14.1"
  }
}
```

## 🧪 Testing

All 57 tests passing:

### Test Coverage
- **BridgeLink**: 13 tests
  - Event registration and triggering
  - Unsubscribe functionality
  - Multiple listeners
  - Event history management
  - History size limiting
  - Statistics tracking
  - Error handling
  - Event isolation
  
- **MQTTClient**: 24 tests
  - Connection management
  - Topic subscription/unsubscription
  - Message sending
  - Status monitoring
  - Error handling
  - Reconnection logic
  - Multiple topics support
  
- **NautilusInference**: 20 tests
  - Model loading/unloading
  - Text analysis
  - Contextual analysis
  - Keyword extraction
  - Category detection
  - Sentiment analysis
  - DP event detection
  - FMEA pattern detection
  - Risk detection

### Running Tests

```bash
# Run all new tests
npm run test -- src/tests/bridgelink-event-bus.test.ts src/tests/mqtt-client.test.ts src/tests/nautilus-inference.test.ts

# Run specific test file
npm run test -- src/tests/mqtt-client.test.ts

# Watch mode
npm run test:watch
```

## 🔧 Configuration

### Environment Variables

Add to `.env` or `.env.local`:

```bash
# MQTT Broker URL
VITE_MQTT_URL=ws://localhost:1883

# Examples:
# Local development: ws://localhost:1883
# Cloud broker: wss://mqtt.your-domain.com:8883
# Mosquitto: ws://mosquitto.local:1883
```

### MQTT Broker Setup (Optional)

For local development, you can use Mosquitto:

```bash
# Install Mosquitto
sudo apt-get install mosquitto mosquitto-clients

# Start broker
mosquitto -v

# Test with client
mosquitto_pub -h localhost -t nautilus/events -m "Test message"
```

## 📁 Files Created

### New Files
- `src/core/MQTTClient.ts` - MQTT client implementation
- `src/core/index.ts` - Core module exports
- `src/ai/nautilus-inference.ts` - AI inference engine
- `src/ai/index.ts` - AI module exports
- `src/tests/bridgelink-event-bus.test.ts` - BridgeLink tests
- `src/tests/mqtt-client.test.ts` - MQTT client tests
- `src/tests/nautilus-inference.test.ts` - AI inference tests

### Modified Files
- `src/modules/control-hub/ControlHubPanel.tsx` - Added telemetry console
- `.env.example` - Added MQTT URL configuration
- `package.json` - Added onnxruntime-web dependency
- `package-lock.json` - Updated lockfile

## 🚀 Build Status

✅ **Build**: Successful (no errors)  
✅ **Tests**: 57/57 passing  
✅ **Lint**: Clean (no new errors)

Build command:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## 🎯 Integration Examples

### Complete Example: DP Monitoring System

```typescript
import { BridgeLink } from "@/core/BridgeLink";
import { MQTTClient } from "@/core/MQTTClient";
import { nautilusInference } from "@/ai/nautilus-inference";

// Setup
async function setupMonitoring() {
  // Connect MQTT
  MQTTClient.connect({
    url: process.env.VITE_MQTT_URL,
    topics: ["nautilus/dp", "nautilus/telemetry"]
  });

  // Load AI model
  await nautilusInference.loadModel("/models/nautilus-mini.onnx");

  // Subscribe to events
  BridgeLink.on("nautilus:event" as any, async (event) => {
    const data = event.data as { message: string };
    
    // Analyze with AI
    const analysis = await nautilusInference.analyzeContext(data.message);
    
    // Log analysis results
    console.log("AI Analysis:", analysis.summary);
    
    // Check for critical risks
    if (analysis.risks?.some(r => r.severity === "critical")) {
      console.error("🚨 Critical risk detected!");
      MQTTClient.send("nautilus/alerts", {
        type: "critical_alert",
        analysis
      });
    }
  });
}

// Cleanup
function cleanup() {
  MQTTClient.disconnect();
  nautilusInference.unloadModel();
}
```

### React Component Example

```typescript
import { useEffect, useState } from "react";
import { BridgeLink } from "@/core/BridgeLink";
import { MQTTClient } from "@/core/MQTTClient";

export function TelemetryMonitor() {
  const [events, setEvents] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect MQTT
    MQTTClient.connect();

    // Subscribe to events
    const unsubscribe = BridgeLink.on("nautilus:event" as any, (event) => {
      setEvents(prev => [...prev, event.data.message].slice(-50));
    });

    // Monitor connection
    const interval = setInterval(() => {
      setConnected(MQTTClient.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      MQTTClient.disconnect();
    };
  }, []);

  return (
    <div>
      <div>Status: {connected ? "🟢" : "🔴"}</div>
      <div>
        {events.map((msg, i) => <div key={i}>{msg}</div>)}
      </div>
    </div>
  );
}
```

## 🔒 Security Considerations

1. **MQTT Authentication**: Configure broker with username/password
2. **TLS/SSL**: Use `wss://` for encrypted connections
3. **Topic Permissions**: Restrict topic access on broker
4. **Input Validation**: Validate all MQTT messages before processing
5. **Rate Limiting**: Implement rate limiting for event processing

## 📊 Performance Notes

- **Event History**: Limited to 500 events to prevent memory issues
- **Telemetry Console**: Displays last 50 events for optimal performance
- **MQTT Reconnect**: 5-second interval to avoid overwhelming the broker
- **AI Inference**: Runs in Web Worker when available for non-blocking operation

## 🔄 Next Steps (Beta 3.2+)

Planned features for future releases:

- [ ] JWT authentication between modules
- [ ] IndexedDB for offline log storage
- [ ] IMCA M 117 / NORMAM 101 audit logs
- [ ] Nautilus-mini model (~80MB) embedding
- [ ] TLS/SSL for MQTT connections
- [ ] MQTT payload compression
- [ ] Log persistence and replay
- [ ] WebRTC peer-to-peer communication
- [ ] Real-time collaboration features

## 📝 Changelog

### Beta 3.1 (2025-10-21)

**Added:**
- MQTT client with auto-reconnect
- AI inference engine with ONNX Runtime
- Telemetry console in Control Hub
- 57 comprehensive tests
- Export barrel modules for core and AI

**Changed:**
- ControlHub now displays real-time MQTT events
- Added connection status indicators
- Enhanced event logging with timestamps

**Dependencies:**
- Added onnxruntime-web ^1.20.1

## 🐛 Troubleshooting

### MQTT Connection Issues

**Problem**: Cannot connect to MQTT broker  
**Solution**: 
1. Check `VITE_MQTT_URL` is set correctly
2. Verify broker is running: `telnet localhost 1883`
3. Check browser console for connection errors
4. Try WebSocket protocol: `ws://` instead of `mqtt://`

### Build Out of Memory

**Problem**: Build fails with heap out of memory  
**Solution**: Use increased memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Model Loading Fails

**Problem**: ONNX model fails to load  
**Solution**:
1. Check model path is correct
2. Ensure model is in public directory
3. Verify ONNX format is compatible
4. Check browser console for errors

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review test files for usage examples
3. Check GitHub issues
4. Contact development team

## 📄 License

Copyright © 2025 Nautilus Travel HR. All rights reserved.
