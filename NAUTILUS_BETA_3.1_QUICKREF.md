# Nautilus Beta 3.1 - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# .env or .env.local
VITE_MQTT_URL=ws://localhost:1883
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Control Hub
Navigate to `/control-hub` to see the telemetry console

---

## 📦 Module Imports

### BridgeLink Event Bus
```typescript
import { BridgeLink } from "@/core/BridgeLink";
// or
import { BridgeLink } from "@/core";
```

### MQTT Client
```typescript
import { MQTTClient } from "@/core/MQTTClient";
// or
import { MQTTClient } from "@/core";
```

### AI Inference
```typescript
import { nautilusInference } from "@/ai/nautilus-inference";
// or
import { nautilusInference } from "@/ai";
```

---

## 🔌 BridgeLink API

### Subscribe to Events
```typescript
const unsubscribe = BridgeLink.on("event-type", (event) => {
  console.log(event.data);
});
```

### Emit Events
```typescript
BridgeLink.emit("event-type", "SourceModule", { data: "value" });
```

### Get Event History
```typescript
const history = BridgeLink.getHistory(10); // Last 10 events
```

### Clear History
```typescript
BridgeLink.clearHistory();
```

### Get Statistics
```typescript
const stats = BridgeLink.getStats();
// { totalEvents, eventTypes, activeListeners, listenersByType }
```

### Event Types
```typescript
type EventType =
  | "mmi:forecast:update"
  | "mmi:job:created"
  | "dp:incident:reported"
  | "dp:intelligence:alert"
  | "fmea:risk:identified"
  | "asog:procedure:activated"
  | "wsog:checklist:completed"
  | "ai:analysis:complete"
  | "system:module:loaded"
  | "telemetry:log"
  | "nautilus:event";
```

---

## 📡 MQTT Client API

### Connect
```typescript
MQTTClient.connect({
  url: "ws://localhost:1883",
  topics: ["nautilus/events"],
  reconnectInterval: 5000
});
```

### Send Message
```typescript
MQTTClient.send("topic/name", { key: "value" });
MQTTClient.send("topic/name", "string message");
```

### Subscribe to Topic
```typescript
MQTTClient.subscribe("new/topic");
```

### Unsubscribe
```typescript
MQTTClient.unsubscribe("topic/name");
```

### Check Connection
```typescript
const connected = MQTTClient.isConnected();
```

### Get Status
```typescript
const status = MQTTClient.getStatus();
// { connected, connecting, url, topics }
```

### Disconnect
```typescript
MQTTClient.disconnect();
```

---

## 🧠 AI Inference API

### Load Model
```typescript
await nautilusInference.loadModel("/models/nautilus-mini.onnx");
```

### Analyze Text
```typescript
const result = await nautilusInference.analyze("text");
// { text, confidence, category?, timestamp }
```

### Contextual Analysis
```typescript
const analysis = await nautilusInference.analyzeContext("text");
// { summary, sentiment, keywords, categories, risks, dpEvents, fmeaPatterns }
```

### Check Model Status
```typescript
const loaded = nautilusInference.isModelLoaded();
```

### Get Model Info
```typescript
const info = nautilusInference.getModelInfo();
// { loaded, url, inputs, outputs }
```

### Unload Model
```typescript
await nautilusInference.unloadModel();
```

---

## ⚛️ React Hook Example

```typescript
import { useEffect, useState } from "react";
import { BridgeLink, MQTTClient } from "@/core";

export function useTelemetry() {
  const [events, setEvents] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    MQTTClient.connect();

    const unsubscribe = BridgeLink.on("nautilus:event" as any, (event) => {
      setEvents(prev => [...prev, event.data.message].slice(-50));
    });

    const interval = setInterval(() => {
      setConnected(MQTTClient.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      MQTTClient.disconnect();
    };
  }, []);

  return { events, connected };
}
```

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Specific Tests
```bash
npm run test -- src/tests/mqtt-client.test.ts
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage
```bash
npm run test:coverage
```

---

## 🏗️ Build

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Preview Build
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### MQTT Not Connecting
1. Check `VITE_MQTT_URL` is set
2. Verify broker is running
3. Check browser console
4. Try `ws://` protocol

### Build Out of Memory
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Model Won't Load
1. Check model path
2. Verify model in public directory
3. Check ONNX format
4. Review browser console

### Events Not Showing
1. Check MQTT connection
2. Verify BridgeLink subscription
3. Check console for errors
4. Test with manual emit

---

## 📊 Event Flow

```
External System → MQTT Broker → MQTTClient → BridgeLink → Components
                                                    ↓
                                            Event History
```

---

## 🔧 Configuration Files

### package.json
```json
{
  "dependencies": {
    "onnxruntime-web": "^1.20.1",
    "mqtt": "^5.14.1"
  }
}
```

### .env.example
```bash
VITE_MQTT_URL=ws://localhost:1883
```

---

## 📁 File Locations

| Component | Path |
|-----------|------|
| BridgeLink | `src/core/BridgeLink.ts` |
| MQTT Client | `src/core/MQTTClient.ts` |
| AI Inference | `src/ai/nautilus-inference.ts` |
| Control Hub | `src/modules/control-hub/ControlHubPanel.tsx` |
| Tests | `src/tests/` |

---

## 🎯 Common Patterns

### Pattern 1: Subscribe & Send
```typescript
// Subscribe to responses
BridgeLink.on("response:event", (event) => {
  console.log("Response:", event.data);
});

// Send request
MQTTClient.send("request/topic", { action: "getData" });
```

### Pattern 2: AI Analysis Pipeline
```typescript
// Load model once
await nautilusInference.loadModel("/models/nautilus-mini.onnx");

// Analyze incoming events
BridgeLink.on("nautilus:event" as any, async (event) => {
  const analysis = await nautilusInference.analyzeContext(event.data.message);
  
  if (analysis.risks?.some(r => r.severity === "critical")) {
    MQTTClient.send("alerts/critical", analysis);
  }
});
```

### Pattern 3: State Sync
```typescript
const [state, setState] = useState({});

useEffect(() => {
  const unsub = BridgeLink.on("state:update", (event) => {
    setState(event.data);
  });
  return unsub;
}, []);
```

---

## ⚙️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MQTT_URL` | MQTT broker URL | `ws://localhost:1883` |

---

## 📚 Related Documentation

- [Full README](./NAUTILUS_BETA_3.1_README.md)
- [Visual Summary](./NAUTILUS_BETA_3.1_VISUAL_SUMMARY.md)
- [API Documentation](./docs/api/)

---

## 🚦 Status Codes

### MQTT Connection
- 🟢 Connected
- 🔴 Disconnected
- 🟡 Connecting

### Event Severity
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

---

## 💡 Best Practices

1. **Always unsubscribe** from events in cleanup
2. **Limit event history** to prevent memory issues
3. **Handle disconnections** gracefully
4. **Validate messages** before processing
5. **Use TypeScript** for type safety
6. **Test edge cases** thoroughly
7. **Monitor performance** regularly

---

## 🎓 Learning Resources

### Code Examples
- Check test files for usage patterns
- Review ControlHubPanel.tsx for integration
- See module exports in index.ts files

### API Reference
- BridgeLink: `src/core/BridgeLink.ts`
- MQTT: `src/core/MQTTClient.ts`
- AI: `src/ai/nautilus-inference.ts`

### Tests
- BridgeLink: `src/tests/bridgelink-event-bus.test.ts`
- MQTT: `src/tests/mqtt-client.test.ts`
- AI: `src/tests/nautilus-inference.test.ts`

---

## 📞 Support

**Issues?** Check:
1. This quick reference
2. Full README
3. Test files for examples
4. GitHub issues
5. Development team

---

## 📝 Version Info

- **Version**: Beta 3.1
- **Release Date**: 2025-10-21
- **Tests**: 57/57 passing
- **Build**: Successful

---

## ✅ Checklist

Before deploying:
- [ ] Environment variables configured
- [ ] MQTT broker accessible
- [ ] Tests passing
- [ ] Build successful
- [ ] Documentation reviewed
- [ ] Security configured
