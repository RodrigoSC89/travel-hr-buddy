# Migration Guide: setInterval → useOptimizedPolling

**PATCH 651.0 - Performance Optimization**

## Why Migrate?

The new `useOptimizedPolling` hook provides:

✅ **Automatic pausing** when page is hidden or offline  
✅ **Centralized management** of all polling operations  
✅ **Performance tracking** and metrics  
✅ **Automatic cleanup** on component unmount  
✅ **Prevents memory leaks** from forgotten intervals  

## Before (❌ Old Pattern)

```tsx
import { useEffect, useState } from "react";

function DashboardStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Load initial data
    loadStats();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const data = await fetchStats();
    setStats(data);
  };

  return <div>{/* ... */}</div>;
}
```

### Problems:
- ❌ Continues polling when page is hidden (wastes resources)
- ❌ Continues polling when offline (generates errors)
- ❌ No centralized control
- ❌ Hard to debug multiple intervals
- ❌ Manual cleanup required

## After (✅ New Pattern)

```tsx
import { useState } from "react";
import { useOptimizedPolling } from "@/hooks/use-optimized-polling";

function DashboardStats() {
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    const data = await fetchStats();
    setStats(data);
  };

  // Optimized polling
  useOptimizedPolling({
    id: "dashboard-stats",
    callback: loadStats,
    interval: 30000, // 30 seconds
    immediate: true, // Run on mount
    enabled: true, // Can be conditional
  });

  return <div>{/* ... */}</div>;
}
```

### Benefits:
- ✅ Automatic pausing when page hidden
- ✅ Automatic pausing when offline
- ✅ Centralized management
- ✅ Performance tracking built-in
- ✅ Automatic cleanup

## Migration Steps

### 1. Find all setInterval usage

```bash
grep -r "setInterval" src/components/
```

### 2. Replace with useOptimizedPolling

For each interval found:

```tsx
// OLD
const interval = setInterval(() => {
  fetchData();
}, 5000);

// Cleanup
return () => clearInterval(interval);

// NEW
useOptimizedPolling({
  id: "component-name-data",
  callback: fetchData,
  interval: 5000,
  immediate: true,
});
```

### 3. Update dependencies

If your polling depends on props/state:

```tsx
// OLD
useEffect(() => {
  if (!enabled) return;
  
  const interval = setInterval(() => {
    fetchData(userId);
  }, 5000);

  return () => clearInterval(interval);
}, [enabled, userId]);

// NEW
useOptimizedPolling({
  id: "user-data",
  callback: () => fetchData(userId),
  interval: 5000,
  enabled: enabled,
  deps: [userId], // Restart polling when userId changes
});
```

## Common Patterns

### Pattern 1: Real-time Dashboard Updates

```tsx
function RealtimeDashboard() {
  const [metrics, setMetrics] = useState([]);

  useOptimizedPolling({
    id: "realtime-dashboard",
    callback: async () => {
      const data = await fetchMetrics();
      setMetrics(data);
    },
    interval: 10000, // 10 seconds
    immediate: true,
  });

  return <div>{/* ... */}</div>;
}
```

### Pattern 2: Conditional Polling

```tsx
function VesselStatus({ vesselId, isActive }) {
  useOptimizedPolling({
    id: `vessel-status-${vesselId}`,
    callback: () => fetchVesselStatus(vesselId),
    interval: 15000,
    enabled: isActive, // Only poll when vessel is active
    deps: [vesselId], // Restart if vessel changes
  });
}
```

### Pattern 3: Manual Refresh

```tsx
import { runPollNow } from "@/hooks/use-optimized-polling";

function DashboardWithRefresh() {
  useOptimizedPolling({
    id: "dashboard-data",
    callback: fetchData,
    interval: 30000,
  });

  const handleRefresh = async () => {
    await runPollNow("dashboard-data");
  };

  return (
    <div>
      <Button onClick={handleRefresh}>Refresh Now</Button>
    </div>
  );
}
```

## Debugging

Check active polls in console:

```js
// Get all polling stats
window.__NAUTILUS_POLLING__.getStats()

// Force run a poll
await window.__NAUTILUS_POLLING__.runNow("dashboard-stats")

// Stop a specific poll
window.__NAUTILUS_POLLING__.stop("dashboard-stats")
```

## Recommended Intervals

- **Real-time alerts**: 5-10 seconds
- **Dashboard metrics**: 15-30 seconds
- **Status updates**: 30-60 seconds
- **Background sync**: 2-5 minutes

## Performance Impact

Before optimization (multiple setInterval):
- ❌ 15+ unmanaged intervals running simultaneously
- ❌ Continues when page hidden (wastes CPU/battery)
- ❌ Generates errors when offline

After optimization (useOptimizedPolling):
- ✅ All intervals centrally managed
- ✅ Auto-pauses when page hidden (saves ~70% resources)
- ✅ Auto-pauses when offline (prevents errors)
- ✅ Performance tracking and monitoring

## Migration Checklist

- [ ] Identify all `setInterval` in codebase
- [ ] Replace with `useOptimizedPolling`
- [ ] Add unique IDs for each poll
- [ ] Set appropriate intervals
- [ ] Add `deps` array if needed
- [ ] Test pause behavior (hide page)
- [ ] Test offline behavior
- [ ] Remove old cleanup code
- [ ] Check console for debug info

## Next Steps

After migrating polling:
1. Consider using WebSockets for true real-time data
2. Implement exponential backoff for failed polls
3. Add user preference for polling intervals
4. Monitor polling performance in production
