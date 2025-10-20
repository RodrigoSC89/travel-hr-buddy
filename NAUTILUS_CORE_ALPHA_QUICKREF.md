# Nautilus Core Alpha - Quick Reference Guide

## 🚀 Quick Start

### Import Components

```typescript
// Safe Lazy Import
import { safeLazyImport } from "@/utils/safeLazyImport";

// Event System
import { BridgeLink } from "@/core/BridgeLink";

// AI Stub
import { NautilusAI } from "@/ai/nautilus-core";
```

## 📖 API Reference

### safeLazyImport

```typescript
safeLazyImport(
  importer: () => Promise<any>,
  name: string
) => React.ComponentType
```

**Parameters**:
- `importer`: Function that returns a dynamic import promise
- `name`: Display name for the component (used in loading/error messages)

**Returns**: Lazy-loaded React component with error handling

**Example**:
```typescript
const MyComponent = safeLazyImport(
  () => import("./components/MyComponent"),
  "MyComponent"
);

// Use it like any other component
<MyComponent prop1="value" />
```

### BridgeLink

#### emit()
```typescript
BridgeLink.emit(event: string, data?: any): void
```

Emits a custom event that can be listened to by any module.

**Example**:
```typescript
BridgeLink.emit("nautilus:event", {
  message: "User action completed",
  timestamp: Date.now()
});
```

#### on()
```typescript
BridgeLink.on(
  event: string,
  callback: (data: any) => void
) => () => void
```

Subscribes to an event. Returns an unsubscribe function.

**Example**:
```typescript
const unsubscribe = BridgeLink.on("nautilus:event", (data) => {
  console.log("Event received:", data);
});

// Later, cleanup
unsubscribe();
```

### NautilusAI

#### analyze()
```typescript
NautilusAI.analyze(context: string): Promise<string>
```

Analyzes a context string and returns a simulated AI response.

**Example**:
```typescript
const result = await NautilusAI.analyze(
  "Analyze maintenance efficiency for Vessel A"
);
console.log(result); // Returns simulated analysis
```

## 🎯 Common Use Cases

### 1. Lazy Load a Heavy Component

```typescript
// Instead of:
import HeavyComponent from "./HeavyComponent";

// Use:
const HeavyComponent = safeLazyImport(
  () => import("./HeavyComponent"),
  "HeavyComponent"
);
```

### 2. Module Communication

```typescript
// In Module A - Emit event
const handleDataUpdate = () => {
  BridgeLink.emit("data:updated", {
    module: "ModuleA",
    action: "refresh"
  });
};

// In Module B - Listen to event
useEffect(() => {
  const unsubscribe = BridgeLink.on("data:updated", (data) => {
    if (data.action === "refresh") {
      refreshData();
    }
  });
  return unsubscribe;
}, []);
```

### 3. AI-Powered Features

```typescript
const analyzeDocument = async (document: string) => {
  const analysis = await NautilusAI.analyze(document);
  
  // Notify other modules
  BridgeLink.emit("nautilus:event", {
    message: `AI Analysis: ${analysis}`
  });
  
  return analysis;
};
```

### 4. Monitor All Events (ControlHub)

```typescript
import ControlHub from "@/pages/ControlHub";

// Simply render the component
<ControlHub />

// It automatically listens to all "nautilus:event" events
```

## 🔍 Debugging Tips

### Enable Debug Logging

BridgeLink automatically logs events using `console.debug`:
```
📡 Emitindo evento: nautilus:event { message: "..." }
```

NautilusAI logs context analysis:
```
🧠 [NautilusAI] Contexto recebido: ...
```

### Monitor Events in Real-Time

1. Navigate to `/control-hub` (or render `<ControlHub />`)
2. Watch events appear in real-time
3. Each event shows timestamp and message

### Test Event Flow

```typescript
// Emit test events
BridgeLink.emit("nautilus:event", {
  message: "Test event 1"
});

setTimeout(() => {
  BridgeLink.emit("nautilus:event", {
    message: "Test event 2"
  });
}, 1000);
```

## ⚠️ Best Practices

### 1. Always Clean Up Event Listeners

```typescript
// ✅ Good - cleanup on unmount
useEffect(() => {
  const unsubscribe = BridgeLink.on("event", handler);
  return () => unsubscribe();
}, []);

// ❌ Bad - memory leak
useEffect(() => {
  BridgeLink.on("event", handler);
  // Missing cleanup!
}, []);
```

### 2. Use Meaningful Event Names

```typescript
// ✅ Good - descriptive namespace
BridgeLink.emit("mmi:job:completed", data);
BridgeLink.emit("dp:incident:created", data);

// ❌ Bad - too generic
BridgeLink.emit("update", data);
BridgeLink.emit("event", data);
```

### 3. Provide Context in AI Calls

```typescript
// ✅ Good - specific context
await NautilusAI.analyze(
  "Analyze maintenance job #123 for vessel Atlantis"
);

// ⚠️ Less effective - vague context
await NautilusAI.analyze("analyze this");
```

### 4. Handle Lazy Load Errors Gracefully

safeLazyImport automatically handles errors, but you can add additional error boundaries:

```typescript
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <LazyComponent />
</ErrorBoundary>
```

## 📊 Event Schema Recommendations

For better type safety, define event schemas:

```typescript
// types/events.ts
export interface NautilusEvent {
  message: string;
  module?: string;
  severity?: "info" | "warning" | "error";
  timestamp?: number;
}

// Usage
BridgeLink.emit("nautilus:event", {
  message: "Operation completed",
  module: "MMI",
  severity: "info",
  timestamp: Date.now()
} as NautilusEvent);
```

## 🧪 Testing Your Integration

```typescript
// test-integration.test.ts
import { describe, it, expect, vi } from "vitest";
import { BridgeLink } from "@/core/BridgeLink";

describe("My Module Integration", () => {
  it("should emit events on action", () => {
    const callback = vi.fn();
    const unsubscribe = BridgeLink.on("my:event", callback);
    
    // Trigger your action
    myModule.doSomething();
    
    expect(callback).toHaveBeenCalled();
    unsubscribe();
  });
});
```

## 🔗 Related Files

- Implementation: `src/utils/safeLazyImport.tsx`
- Communication: `src/core/BridgeLink.ts`
- Monitoring: `src/pages/ControlHub.tsx`
- AI Stub: `src/ai/nautilus-core.ts`
- Demo: `src/pages/NautilusCoreDemo.tsx`
- Tests: `src/tests/bridgelink.test.ts`, `src/tests/nautilus-ai.test.ts`, etc.

## 📞 Support

For issues or questions:
1. Check the comprehensive tests in `src/tests/`
2. View the demo page at `/nautilus-core-demo`
3. Review the implementation guide: `NAUTILUS_CORE_ALPHA_IMPLEMENTATION.md`

---

**Version**: Alpha 1.0  
**Last Updated**: 2025-10-20  
**Status**: Production Ready ✅
