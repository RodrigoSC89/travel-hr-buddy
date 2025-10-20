# Nautilus Core Alpha - Integration Examples

## Quick Start Guide

### 1. Using BridgeLink in Your Module

```typescript
import { BridgeLink } from "@/core/BridgeLink";

// In any component
export function MyModule() {
  useEffect(() => {
    // Subscribe to events
    const unsubscribe = BridgeLink.on("nautilus:event", (event) => {
      console.log("Event received:", event.data);
    });

    // Emit an event when something happens
    BridgeLink.emit("nautilus:event", {
      message: "MyModule: Action completed",
      source: "MyModule",
      timestamp: new Date().toISOString()
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  return <div>My Module Content</div>;
}
```

### 2. Monitoring Events in ControlHub

Simply navigate to `/control-hub` in your browser to see all events in real-time.

### 3. Using NautilusAI for Analysis

```typescript
import { NautilusAI } from "@/ai/nautilus-core";

async function analyzeData() {
  const result = await NautilusAI.analyze("Analyze maintenance logs for anomalies");
  
  console.log(result.analysis);
  console.log(`Confidence: ${result.confidence * 100}%`);
  console.log(`Recommendations:`, result.recommendations);
}
```

### 4. Using safeLazyImport

```typescript
import { safeLazyImport } from "@/utils/safeLazyImport";

// Replace React.lazy with safeLazyImport
const MyComponent = safeLazyImport(() => import("./MyComponent"));
```

## Module Communication Flow

```
┌─────────────────┐
│  MMI Module     │──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │    ┌──────────────────┐
│ DP Intelligence │──┼───→│   BridgeLink     │
└─────────────────┘  │    │   Event Bus      │
                     │    └──────────────────┘
┌─────────────────┐  │              │
│  FMEA Module    │──┘              │
└─────────────────┘                 │
                                    ↓
                          ┌──────────────────┐
                          │   ControlHub     │
                          │  (Monitoring)    │
                          └──────────────────┘
```

## Event Naming Convention

Use the format: `module:action`

Examples:
- `mmi:task-completed`
- `dp:analysis-started`
- `fmea:risk-detected`
- `nautilus:event` (general events)

## Best Practices

1. **Always cleanup subscriptions** using the unsubscribe function
2. **Include source information** in event data for debugging
3. **Use descriptive event names** following the convention
4. **Monitor events** via ControlHub during development
5. **Test with safeLazyImport** to ensure resilient loading

## Testing Your Integration

```typescript
import { BridgeLink } from "@/core/BridgeLink";

// In browser console
BridgeLink.emit("nautilus:event", {
  message: "Test from console",
  source: "Developer"
});

// Navigate to /control-hub to see the event appear
```

## Next Steps

1. Start using BridgeLink in your existing modules
2. Monitor events in ControlHub
3. Replace React.lazy with safeLazyImport
4. Prepare for ONNX/LLM integration phase

## Support

For questions or issues, check the main README: `NAUTILUS_CORE_ALPHA_README.md`
