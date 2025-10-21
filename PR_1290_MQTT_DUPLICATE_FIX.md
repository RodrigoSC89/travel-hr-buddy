# PR #1290: Fix Duplicate MQTT Function Declarations

## Overview
This PR resolves build failures caused by duplicate MQTT function declarations in `src/lib/mqtt/publisher.ts`. The file had accumulated multiple function declarations with identical names over time, causing TypeScript compilation errors that prevented the build from completing.

## Problem Statement
The `src/lib/mqtt/publisher.ts` file contained:
- **3 instances** of `subscribeForecast` subscribing to different MQTT topics
- **2 instances** of `subscribeAlerts` subscribing to different topics  
- **2 instances** of `subscribeBridgeStatus` subscribing to different topics

This caused **8 build errors**:
```
ERROR: Multiple exports with the same name "subscribeBridgeStatus"
ERROR: The symbol "subscribeBridgeStatus" has already been declared
ERROR: Multiple exports with the same name "subscribeForecast"
ERROR: The symbol "subscribeForecast" has already been declared
ERROR: Multiple exports with the same name "subscribeAlerts"
ERROR: The symbol "subscribeAlerts" has already been declared
```

## Solution
Cleaned up the MQTT publisher module by removing duplicate function declarations while preserving all functionality used by existing components.

### Removed Duplicates
1. **subscribeBridgeStatus** (line 178) - Duplicate subscribing to "nautilus/bridge/status"
2. **subscribeForecast** (line 212) - Duplicate subscribing to "nautilus/forecast/data"
3. **subscribeAlerts** (line 246) - Duplicate subscribing to "nautilus/dp/alert"
4. **subscribeForecast** (line 301) - Duplicate subscribing to "nautilus/forecast/global"

### Kept Functions (7 total)
All functions are unique and used by components:

1. **publishEvent(topic, payload)**
   - Generic MQTT publish to any topic
   - Used by: `DPSyncDashboard.tsx`

2. **subscribeDP(callback)**
   - Subscribes to: `nautilus/dp`
   - Used by: `DPRealtime.tsx`, `ControlHubPanel.tsx`

3. **subscribeForecast(callback)**
   - Subscribes to: `nautilus/forecast`
   - Used by: `ForecastPanel.tsx`, `ControlHubPanel.tsx`, `DPSyncDashboard.tsx`

4. **subscribeAlerts(callback)**
   - Subscribes to: `nautilus/alerts`
   - Used by: `SystemAlerts.tsx`, `DPAlertFeed.tsx`

5. **subscribeBridgeStatus(callback)**
   - Subscribes to: `nautilus/bridgelink/status`
   - Used by: `BridgeLinkStatus.tsx`, `DPStatusBoard.tsx`

6. **subscribeSystemStatus(callback)**
   - Subscribes to: `nautilus/system/status`
   - Used by: `SystemResilienceMonitor.tsx`

7. **publishForecast(data)**
   - Publishes to: `nautilus/forecast/global`
   - Used for publishing forecast data

## Impact Analysis

### Files Changed
- `src/lib/mqtt/publisher.ts` - Removed duplicates (331 lines → 194 lines, -137 lines)

### Backward Compatibility
✅ **Zero breaking changes** - All existing components continue to work correctly:
- `ControlHubPanel.tsx` uses `subscribeForecast` and `subscribeDP`
- `SystemAlerts.tsx` uses `subscribeAlerts`
- `DPAlertFeed.tsx` uses `subscribeAlerts`
- `BridgeLinkStatus.tsx` uses `subscribeBridgeStatus`
- `DPStatusBoard.tsx` uses `subscribeBridgeStatus`
- `ForecastPanel.tsx` uses `subscribeForecast`
- `DPRealtime.tsx` uses `subscribeDP`
- `DPSyncDashboard.tsx` uses `publishEvent` and `subscribeForecast`
- `SystemResilienceMonitor.tsx` uses `subscribeSystemStatus`

All imports remain valid and functional.

## Validation

### Build Success
```bash
✓ built in 1m 6s
```

### TypeScript Compilation
```bash
✓ 0 errors
```

### ESLint
```bash
✓ 0 errors or warnings
```

### Component Verification
All components that import MQTT functions verified:
- ✅ Import statements unchanged
- ✅ Function signatures preserved
- ✅ MQTT topics correct for each function
- ✅ No breaking changes

## Technical Details

### Before
```typescript
// Line 66: subscribeForecast → "nautilus/forecast"
// Line 212: subscribeForecast → "nautilus/forecast/data" (DUPLICATE - REMOVED)
// Line 301: subscribeForecast → "nautilus/forecast/global" (DUPLICATE - REMOVED)

// Line 100: subscribeAlerts → "nautilus/alerts"
// Line 246: subscribeAlerts → "nautilus/dp/alert" (DUPLICATE - REMOVED)

// Line 134: subscribeBridgeStatus → "nautilus/bridgelink/status"
// Line 178: subscribeBridgeStatus → "nautilus/bridge/status" (DUPLICATE - REMOVED)
```

### After
```typescript
// Line 66: subscribeForecast → "nautilus/forecast" (KEPT)
// Line 100: subscribeAlerts → "nautilus/alerts" (KEPT)
// Line 134: subscribeBridgeStatus → "nautilus/bridgelink/status" (KEPT)
```

## Testing
- ✅ Build passes without errors
- ✅ TypeScript compilation successful
- ✅ All function exports verified unique
- ✅ No linting errors
- ✅ Component imports verified working

## Conclusion
This PR successfully resolves the merge conflicts from PR #1280 by eliminating duplicate MQTT function declarations. The solution is minimal, focused, and maintains full backward compatibility with zero breaking changes.

**Status**: ✅ Ready for merge
