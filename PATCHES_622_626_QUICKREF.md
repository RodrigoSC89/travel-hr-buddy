# PATCHES 622-626: Quick Reference Guide

## 🚀 Quick Start

### Using the New Dashboard

```typescript
// Import the modularized dashboard
import { ModularizedExecutiveDashboard } from "@/components/dashboard/modularized-executive-dashboard";

// Use in your page
export default function Dashboard() {
  return <ModularizedExecutiveDashboard />;
}
```

That's it! The dashboard now has:
- ✅ Lazy loading
- ✅ Performance monitoring
- ✅ Offline support
- ✅ Auto-healing

## 📊 Performance Monitoring

### Using usePerformanceLog Hook

```typescript
import { usePerformanceLog } from "@/hooks/performance/usePerformanceLog";

function MyComponent() {
  // Track component performance
  const { logEvent } = usePerformanceLog({
    componentName: "MyComponent",
    threshold: 3000, // Alert if > 3s
    onSlowRender: (time) => {
      console.warn(`Slow render: ${time}ms`);
    }
  });

  // Log specific events
  const handleClick = () => {
    logEvent("button_clicked");
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Telemetry Service

```typescript
import { telemetryService } from "@/core/telemetry";

// Log performance
telemetryService.logPerformance("Dashboard", "load_time", 1234);

// Log errors
telemetryService.logError("Dashboard", new Error("Failed to load"));

// Log user actions
telemetryService.logUserAction("Dashboard", "kpi_clicked", { kpi: "revenue" });
```

## 💾 Offline Support

### Using Offline Cache

```typescript
import { offlineCache } from "@/services/offlineCache";

// Store data
offlineCache.set("my_data", { value: 123 }, 3600000); // 1 hour TTL

// Retrieve data
const cached = offlineCache.get("my_data");

// Check stats
const stats = offlineCache.getStats();
console.log(`Cache has ${stats.count} entries (${stats.totalSize} bytes)`);

// Clear all
offlineCache.clearAll();
```

### Using useRealtimeSync Hook

```typescript
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

function MyComponent() {
  const { data, loading, error, syncState, retry } = useRealtimeSync({
    table: "metrics",
    cacheKey: "dashboard_metrics",
    select: "*",
    cacheTTL: 3600000 // 1 hour
  });

  if (loading) return <div>Loading...</div>;
  if (error && !syncState.isFromCache) return <div>Error!</div>;
  
  return (
    <>
      {syncState.isFromCache && (
        <div>Showing cached data. <button onClick={retry}>Retry</button></div>
      )}
      <div>{JSON.stringify(data)}</div>
    </>
  );
}
```

## 🎨 Layout Optimization

### Using LayoutGrid

```typescript
import { LayoutGrid } from "@/components/dashboard/LayoutGrid";

function MyDashboard() {
  return (
    <LayoutGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
      <Card>KPI 1</Card>
      <Card>KPI 2</Card>
      <Card>KPI 3</Card>
      <Card>KPI 4</Card>
    </LayoutGrid>
  );
}
```

## 🛡️ Error Handling

### Using KPIErrorBoundary

```typescript
import { KPIErrorBoundary } from "@/components/dashboard/kpis/KPIErrorBoundary";
import { Suspense } from "react";

function MyDashboard() {
  return (
    <KPIErrorBoundary kpiName="Revenue">
      <Suspense fallback={<LoadingState />}>
        <RevenueKPI />
      </Suspense>
    </KPIErrorBoundary>
  );
}
```

## 🔍 Watchdog Integration

### Using DashboardWatchdog

```typescript
import { DashboardWatchdog } from "@/components/dashboard/DashboardWatchdog";

function MyDashboard() {
  const handleHeal = () => {
    // Re-render logic
    window.location.reload();
  };

  return (
    <>
      <DashboardWatchdog onHeal={handleHeal} />
      {/* Your dashboard content */}
    </>
  );
}
```

## 📱 Offline Status Banner

### Using OfflineStatusBanner

```typescript
import { OfflineStatusBanner } from "@/components/dashboard/OfflineStatusBanner";

function MyDashboard() {
  const { syncState, retry } = useRealtimeSync({...});

  return (
    <>
      <OfflineStatusBanner
        isFromCache={syncState.isFromCache}
        lastSync={syncState.lastSync}
        onRetry={retry}
        retryCount={syncState.retryCount}
        maxRetries={5}
      />
      {/* Your content */}
    </>
  );
}
```

## 🧩 Creating New KPI Components

### Template for New KPI

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "lucide-react";
import { useEffect, useState } from "react";

export function MyKPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Fetch your data
        const result = await myDataSource.fetch();
        
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <p className="text-sm text-muted-foreground">Loading...</p>
            <div className="h-9 w-32 bg-gray-200 rounded mt-1"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">Failed to load</p>
        </CardContent>
      </Card>
    );
  }

  // Success state
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">My KPI</p>
            <p className="text-3xl font-bold">{data}</p>
          </div>
          <Icon className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Adding Lazy Loading

```typescript
// In your dashboard
const MyKPI = React.lazy(() => 
  import("./MyKPI").then(module => ({ default: module.MyKPI }))
);

// Usage
<KPIErrorBoundary kpiName="My KPI">
  <Suspense fallback={<LoadingFallback message="Loading My KPI..." />}>
    <MyKPI />
  </Suspense>
</KPIErrorBoundary>
```

## 🎯 Common Patterns

### Pattern 1: Data Fetching with Cache

```typescript
const fetchWithCache = async (key: string) => {
  // Try cache first
  const cached = offlineCache.get(key);
  if (cached) return cached;

  // Fetch fresh data
  const { data } = await supabase.from('table').select('*');
  
  // Update cache
  offlineCache.set(key, data);
  
  return data;
};
```

### Pattern 2: Performance Tracking

```typescript
function TrackedComponent() {
  usePerformanceLog({
    componentName: "TrackedComponent",
    threshold: 2000,
    onSlowRender: (time) => {
      telemetryService.logPerformance(
        "TrackedComponent",
        "slow_render",
        time
      );
    }
  });

  return <div>Content</div>;
}
```

### Pattern 3: Graceful Degradation

```typescript
function ResilientComponent() {
  const { data, syncState, retry } = useRealtimeSync({...});

  return (
    <>
      {syncState.isFromCache && <OfflineBanner onRetry={retry} />}
      {data ? <SuccessView data={data} /> : <EmptyView />}
    </>
  );
}
```

## 🔧 Configuration

### Performance Thresholds

```typescript
// Adjust warning threshold (default: 3000ms)
usePerformanceLog({
  componentName: "MyComponent",
  threshold: 5000 // Warn at 5s instead of 3s
});
```

### Cache TTL

```typescript
// Default: 1 hour (3600000ms)
offlineCache.set("key", data, 7200000); // 2 hours

// Short-lived cache
offlineCache.set("key", data, 60000); // 1 minute
```

### Retry Configuration

```typescript
useRealtimeSync({
  table: "metrics",
  cacheKey: "metrics",
  maxRetries: 10,     // Default: 5
  retryDelay: 2000    // Initial delay 2s (default: 1s)
});
```

## 🐛 Debugging

### Enable Verbose Logging

```typescript
// In browser console
localStorage.setItem('debug_performance', 'true');
localStorage.setItem('debug_cache', 'true');
localStorage.setItem('debug_watchdog', 'true');
```

### Check Cache Contents

```typescript
// In browser console
import { offlineCache } from "@/services/offlineCache";
console.log(offlineCache.getStats());
```

### View Performance Marks

```typescript
// In browser console
performance.getEntriesByType('measure').forEach(m => {
  console.log(`${m.name}: ${m.duration}ms`);
});
```

## 📊 Monitoring in Production

### Key Metrics to Watch

1. **Component Render Time**
   - Watch console for performance logs
   - Set up alerts for > 3s renders

2. **Cache Hit Rate**
   - Monitor cache usage stats
   - Adjust TTL if too many misses

3. **Offline Events**
   - Track how often offline mode activates
   - Monitor reconnection success rate

4. **Watchdog Triggers**
   - Check watchdog_logs table
   - Identify recurring issues

### Dashboard for Monitoring

```sql
-- Query watchdog logs
SELECT 
  component,
  COUNT(*) as incidents,
  AVG(CASE WHEN action = 'auto_heal_success' THEN 1 ELSE 0 END) as success_rate
FROM watchdog_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY component;
```

## 🆘 Troubleshooting

### Issue: KPI Not Loading

```typescript
// Check if lazy import path is correct
const MyKPI = React.lazy(() => 
  import("./kpis/MyKPI") // ✅ Correct path
);
```

### Issue: Cache Not Working

```typescript
// Verify localStorage is available
if (typeof window !== 'undefined' && window.localStorage) {
  // Safe to use cache
} else {
  // Use in-memory fallback
}
```

### Issue: Performance Logs Not Showing

```typescript
// Ensure hook is called at top level
function MyComponent() {
  usePerformanceLog({...}); // ✅ Correct
  
  // ❌ Wrong: Don't call in useEffect
  // useEffect(() => {
  //   usePerformanceLog({...});
  // }, []);
}
```

## 📞 Support

- **Documentation**: See PATCHES_622_626_IMPLEMENTATION.md
- **Examples**: Check src/tests/patches-622-626.test.ts
- **Architecture**: Review PATCHES_622_626_VISUAL_SUMMARY.md
- **Security**: Read PATCHES_622_626_SECURITY_SUMMARY.md

## ✅ Checklist for New Features

- [ ] Add lazy loading if appropriate
- [ ] Wrap in ErrorBoundary
- [ ] Add performance monitoring
- [ ] Implement offline cache if needed
- [ ] Test with slow network (DevTools throttling)
- [ ] Test offline mode
- [ ] Add loading states
- [ ] Add error states
- [ ] Write tests
- [ ] Update documentation

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: October 30, 2025  
**Status**: Production Ready
