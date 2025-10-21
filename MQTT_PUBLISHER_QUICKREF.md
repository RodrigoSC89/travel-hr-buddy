# MQTT Publisher Quick Reference

## Overview
Quick reference for the MQTT publisher module after duplicate function declaration fixes.

## Key Changes in This PR
1. ✅ `subscribeTopic` now returns client for cleanup
2. ✅ `subscribeBridgeStatus` uses `nautilus/bridgelink/status` (was `nautilus/bridge/status`)
3. ✅ Fixed test mock hoisting issues

## Usage Pattern

### Basic Subscription
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

useEffect(() => {
  const client = subscribeForecast((data) => {
    console.log("Received:", data);
  });
  
  return () => client.end(); // Always cleanup!
}, []);
```

### Publishing
```typescript
import { publishForecast, publishEvent } from "@/lib/mqtt/publisher";

// Publish to specific topic
publishForecast({ wind: 15.2, wave: 2.8, temp: 26.5 });

// Publish to any topic
publishEvent("nautilus/custom/topic", { data: "value" });
```

## Available Functions

### Subscribe Functions (all return client)
```typescript
subscribeDP(callback)                 // nautilus/dp
subscribeForecast(callback)           // nautilus/forecast
subscribeForecastData(callback)       // nautilus/forecast/data
subscribeForecastGlobal(callback)     // nautilus/forecast/global
subscribeSystemAlerts(callback)       // nautilus/alerts
subscribeDPAlerts(callback)           // nautilus/dp/alert
subscribeBridgeStatus(callback)       // nautilus/bridgelink/status ⚠️
subscribeBridgeLinkStatus(callback)   // nautilus/bridgelink/status
subscribeControlHub(callback)         // nautilus/controlhub/telemetry
subscribeSystemStatus(callback)       // nautilus/system/status
```

### Publish Functions
```typescript
publishEvent(topic, payload)          // Any topic
publishForecast(payload)              // nautilus/forecast/global
```

## Test Mocking

```typescript
// Mock the entire module
vi.mock("@/lib/mqtt/publisher", () => ({
  subscribeForecast: vi.fn((callback) => {
    // Simulate data
    setTimeout(() => callback({ wind: 15.2 }), 0);
    // Must return object with end()
    return { end: vi.fn() };
  }),
}));
```

## Components Using MQTT
- **DPRealtime**: `subscribeDP`
- **ForecastPanel**: `subscribeForecast`
- **ControlHubPanel**: `subscribeForecast`, `subscribeDP`
- **DPStatusBoard**: `subscribeBridgeStatus` ⚠️ Updated topic
- **BridgeLinkStatus**: `subscribeBridgeLinkStatus`
- **DPAlertFeed**: `subscribeDPAlerts`
- **SystemResilienceMonitor**: `subscribeSystemStatus`
- **DPSyncDashboard**: `publishEvent`, `subscribeForecast`

## Migration Checklist
- [ ] Update all subscribe calls to capture returned client
- [ ] Add cleanup in useEffect return
- [ ] If using `subscribeBridgeStatus`, verify backend publishes to `nautilus/bridgelink/status`
- [ ] Update test mocks to return `{ end: vi.fn() }`

## Validation
```bash
# Type check
npm run type-check

# Build
npm run build

# Run tests
npm run test -- src/tests/ForecastGlobal.test.tsx
npm run test -- src/tests/components/dp/DPStatusBoard.test.tsx
```

## Common Patterns

### Multiple Subscriptions
```typescript
useEffect(() => {
  const clients = [
    subscribeDP(handleDP),
    subscribeForecast(handleForecast),
    subscribeSystemAlerts(handleAlerts),
  ];
  
  return () => clients.forEach(c => c.end());
}, []);
```

### Conditional Subscription
```typescript
useEffect(() => {
  if (!enabled) return;
  
  const client = subscribeForecast(handleData);
  return () => client.end();
}, [enabled]);
```

## Troubleshooting

### "Cannot access before initialization" error
**Cause:** Mock defined outside vi.mock factory
**Fix:** Move mock definition inside vi.mock

### Memory leaks in tests
**Cause:** Not calling client.end() in cleanup
**Fix:** Always return cleanup function from useEffect

### Wrong topic subscribed
**Cause:** Using wrong subscribe function
**Fix:** Check MQTT_PUBLISHER_FIX_DOCUMENTATION.md topic table

## Status
✅ TypeScript: PASS
✅ Build: PASS  
✅ Tests: PASS (45+ tests)
✅ Breaking Changes: NONE
