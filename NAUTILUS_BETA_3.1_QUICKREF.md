# Nautilus Beta 3.1 - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Add to .env
VITE_MQTT_URL=ws://localhost:1883
```

### 3. Use the Modules

#### BridgeLink Event Bus
```typescript
import { BridgeLink } from "@/core/BridgeLink";

// Subscribe
const unsub = BridgeLink.on("nautilus:event", (data) => {
  console.log(data);
});

// Emit
BridgeLink.emit("nautilus:event", { message: "Hello" });

// Cleanup
unsub();
```

#### MQTT Client
```typescript
import { MQTTClient } from "@/core/MQTTClient";

// Connect
MQTTClient.connect();

// Send
MQTTClient.send("nautilus/events", { type: "test" });

// Subscribe to additional topics
MQTTClient.subscribe("custom/topic");
```

#### NautilusAI
```typescript
import { nautilusInference } from "@/ai/nautilus-inference";

// Load model
await nautilusInference.loadModel("/models/nautilus-mini.onnx");

// Analyze
const result = await nautilusInference.analyze("Text to analyze");

// Analyze context
const analysis = await nautilusInference.analyzeContext([
  "Log entry 1",
  "Log entry 2"
]);
```

## 📚 API Reference

### BridgeLink

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on(event, callback)` | event: string, callback: Function | unsubscribe: Function | Subscribe to event |
| `emit(event, data)` | event: string, data: any | void | Emit event |
| `getSubscriberCount(event)` | event: string | number | Get subscriber count |
| `getRegisteredEvents()` | - | string[] | Get all events |
| `removeAllListeners(event)` | event: string | void | Remove all listeners |
| `clear()` | - | void | Clear all subscribers |

### MQTTClient

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `connect(url?)` | url?: string | void | Connect to broker |
| `send(event, payload)` | event: string, payload: any | void | Publish message |
| `subscribe(topics)` | topics: string \| string[] | void | Subscribe to topics |
| `unsubscribe(topics)` | topics: string \| string[] | void | Unsubscribe from topics |
| `disconnect()` | - | void | Disconnect |
| `getConnectionStatus()` | - | boolean | Check if connected |
| `getClient()` | - | MqttClient \| null | Get client instance |

### NautilusInference

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `loadModel(url)` | url: string | Promise\<void\> | Load ONNX model |
| `analyze(text)` | text: string | Promise\<string\> | Analyze text |
| `analyzeContext(logs)` | logs: string[] | Promise\<Analysis\> | Analyze log context |
| `isModelLoaded()` | - | boolean | Check if model loaded |
| `getModelInfo()` | - | ModelInfo | Get model information |
| `unload()` | - | Promise\<void\> | Unload model |

## 🎯 Common Patterns

### React Component Integration
```typescript
function MyComponent() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    // Setup
    MQTTClient.connect();
    const unsub = BridgeLink.on("nautilus:event", (data) => {
      setEvents(prev => [...prev, data].slice(-50));
    });
    
    // Cleanup
    return () => {
      unsub();
      MQTTClient.disconnect();
    };
  }, []);
  
  return <div>{/* Render events */}</div>;
}
```

### Send DP Telemetry
```typescript
MQTTClient.send("nautilus/dp/telemetry", {
  timestamp: new Date().toISOString(),
  position: { lat: -22.9068, lon: -43.1729 },
  accuracy: 2.5,
  thrusters: [
    { id: 1, status: "ok", power: 75 }
  ]
});
```

### Analyze System Logs
```typescript
const logs = [
  "DP system operating normally",
  "Thruster 1 status: OK",
  "Warning: Position drift detected"
];

const analysis = await nautilusInference.analyzeContext(logs);
console.log(analysis.insights); // ["⚡ Warning conditions present"]
console.log(analysis.risks);    // ["✅ No significant risks identified"]
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific module tests
npm test src/tests/bridgelink-event-bus.test.ts
npm test src/tests/mqtt-client.test.ts
npm test src/tests/nautilus-inference.test.ts

# Run with coverage
npm run test:coverage
```

## 🏗️ Build

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🐛 Debugging

### Enable MQTT Logs
```typescript
// In browser console
localStorage.setItem('debug', 'mqtt*');
```

### Check BridgeLink Events
```typescript
// In browser console
BridgeLink.getRegisteredEvents();
BridgeLink.getSubscriberCount("nautilus:event");
```

### Verify AI Model
```typescript
// In browser console
import { nautilusInference } from "@/ai/nautilus-inference";
console.log(nautilusInference.getModelInfo());
```

## 📦 File Structure

```
src/
├── core/
│   ├── BridgeLink.ts          # Event bus
│   ├── MQTTClient.ts          # MQTT client
│   └── index.ts               # Exports
├── ai/
│   ├── nautilus-inference.ts  # AI inference
│   └── index.ts               # Exports
├── modules/
│   └── control-hub/
│       └── ControlHubPanel.tsx # Updated UI
└── tests/
    ├── bridgelink-event-bus.test.ts
    ├── mqtt-client.test.ts
    └── nautilus-inference.test.ts
```

## 🔧 Environment Variables

```bash
# Required
VITE_MQTT_URL=ws://localhost:1883

# Optional (inherited from existing)
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_OPENAI_API_KEY=...
```

## 📊 Events Reference

### MQTT Events (via BridgeLink)
- `mqtt:connected` - MQTT broker connected
- `mqtt:disconnected` - MQTT broker disconnected
- `mqtt:reconnecting` - Attempting to reconnect
- `mqtt:error` - MQTT error occurred
- `mqtt:offline` - Client is offline
- `nautilus:event` - Message from `nautilus/events` topic

### Custom Events (via BridgeLink)
- `dp:event` - DP system events
- `asog:event` - ASOG compliance events
- `fmea:event` - FMEA analysis events

## 🎨 UI Components

### ControlHub Telemetry Console
- Location: `/control-hub` route
- Features: Real-time event log, MQTT status indicator
- Max Events: 50 (auto-trim)
- Refresh: Every 30 seconds (plus real-time events)

## 🔐 Security Notes

- MQTT credentials should be configured server-side
- Use WSS (secure WebSocket) in production
- JWT authentication coming in Beta 3.2
- Log sanitization for sensitive data recommended

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| MQTT won't connect | Check `VITE_MQTT_URL` and broker availability |
| No events showing | Verify BridgeLink subscription and MQTT connection |
| Model won't load | Check ONNX file path and CORS settings |
| Tests failing | Run `npm install` and check Node version (22.x) |

## 📖 Further Reading

- [NAUTILUS_BETA_3.1_README.md](./NAUTILUS_BETA_3.1_README.md) - Complete documentation
- [NAUTILUS_BETA_3.1_VISUAL_SUMMARY.md](./NAUTILUS_BETA_3.1_VISUAL_SUMMARY.md) - Visual guide
- [CONTROL_HUB_README.md](./CONTROL_HUB_README.md) - ControlHub guide

## ⚡ Performance Tips

- Keep event buffer size reasonable (default: 50)
- Use `useCallback` for event handlers
- Unsubscribe from events when component unmounts
- Consider debouncing high-frequency events

## 🎯 Next Steps

1. Deploy MQTT broker (Mosquitto recommended)
2. Configure production MQTT URL with TLS
3. Prepare ONNX model file (Nautilus-mini)
4. Test in production environment
5. Monitor telemetry console for real events

---

**Version**: Beta 3.1  
**Last Updated**: Q1 2025  
**Status**: ✅ Production Ready
