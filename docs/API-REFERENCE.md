# API Reference - Nautilus One Travel HR Buddy

**Version**: 1.0  
**Last Updated**: 2025-01-24

---

## 📚 Table of Contents

1. [Monitoring APIs](#monitoring-apis)
2. [Hooks](#hooks)
3. [Components](#components)
4. [Services](#services)
5. [Utilities](#utilities)

---

## Monitoring APIs

### Performance Monitor

#### `performanceMonitor.initialize()`

Initialize performance monitoring with Web Vitals tracking.

```typescript
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';

performanceMonitor.initialize();
```

#### `performanceMonitor.subscribe(callback)`

Subscribe to performance metric updates.

**Parameters:**
- `callback: (metric: WebVitalMetric) => void` - Callback function

**Returns:** `() => void` - Unsubscribe function

```typescript
const unsubscribe = performanceMonitor.subscribe((metric) => {
  console.log(`${metric.name}: ${metric.value}ms`);
});

// Later...
unsubscribe();
```

#### `performanceMonitor.getSnapshot()`

Get current performance snapshot.

**Returns:** `PerformanceSnapshot`

```typescript
const snapshot = performanceMonitor.getSnapshot();
console.log(snapshot.webVitals);
console.log(snapshot.resources);
console.log(snapshot.memory);
```

#### Types

```typescript
interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceSnapshot {
  webVitals: Record<string, WebVitalMetric>;
  resources: ResourceTiming[];
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    limit: number;
  };
  navigation: {
    loadTime: number;
    domContentLoaded: number;
    domInteractive: number;
  };
}
```

---

### Error Tracker

#### `errorTracker.initialize()`

Initialize error tracking with global handlers.

```typescript
import { errorTracker } from '@/lib/monitoring/error-tracker';

errorTracker.initialize();
```

#### `errorTracker.captureError(error, context?)`

Manually capture an error.

**Parameters:**
- `error: Error | string` - Error to capture
- `context?: ErrorContext` - Additional context

**Returns:** `string` - Error ID

```typescript
try {
  await riskyOperation();
} catch (error) {
  const errorId = errorTracker.captureError(error, {
    component: 'UserProfile',
    action: 'update',
    userId: user.id
  });
}
```

#### `errorTracker.getStats()`

Get error statistics.

**Returns:** Error statistics object

```typescript
const stats = errorTracker.getStats();
console.log(stats.total);
console.log(stats.byCategory);
console.log(stats.bySeverity);
```

#### `errorTracker.subscribe(callback)`

Subscribe to new errors.

**Parameters:**
- `callback: (error: TrackedError) => void` - Callback function

**Returns:** `() => void` - Unsubscribe function

```typescript
const unsubscribe = errorTracker.subscribe((error) => {
  if (error.severity === 'critical') {
    alertAdmins(error);
  }
});
```

#### Types

```typescript
type ErrorCategory = 'network' | 'runtime' | 'syntax' | 'resource' | 'unknown';
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

interface TrackedError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  stack?: string;
  context: ErrorContext;
  timestamp: number;
  count: number;
}
```

---

### User Analytics

#### `userAnalytics.initialize(userId?)`

Initialize user analytics tracking.

**Parameters:**
- `userId?: string` - Optional user ID

```typescript
import { userAnalytics } from '@/lib/monitoring/user-analytics';

userAnalytics.initialize(user?.id);
```

#### `userAnalytics.trackEvent(name, category, properties?)`

Track a custom event.

**Parameters:**
- `name: string` - Event name
- `category: string` - Event category
- `properties?: Record<string, any>` - Additional properties

```typescript
userAnalytics.trackEvent('button_click', 'engagement', {
  button: 'submit',
  form: 'contact'
});
```

#### `userAnalytics.trackPageView(path, title)`

Track a page view.

**Parameters:**
- `path: string` - Page path
- `title: string` - Page title

```typescript
useEffect(() => {
  userAnalytics.trackPageView(location.pathname, document.title);
}, [location]);
```

#### `userAnalytics.trackFeatureUsage(feature, action, metadata?)`

Track feature usage.

**Parameters:**
- `feature: string` - Feature name
- `action: string` - Action performed
- `metadata?: Record<string, any>` - Additional metadata

```typescript
userAnalytics.trackFeatureUsage('export', 'download', {
  format: 'pdf',
  size: 'A4'
});
```

#### `userAnalytics.getSummary()`

Get analytics summary.

**Returns:** Analytics summary object

```typescript
const summary = userAnalytics.getSummary();
console.log(summary.session);
console.log(summary.events);
console.log(summary.engagement);
```

#### Types

```typescript
interface UserEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface SessionInfo {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  duration: number;
}
```

---

## Hooks

### usePerformanceMonitoring

Track component-level performance.

```typescript
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

function MyComponent() {
  const { metrics, componentStats, markPerformance } = 
    usePerformanceMonitoring('MyComponent');

  useEffect(() => {
    const endMark = markPerformance('data-fetch');
    
    fetchData().then(() => {
      endMark(); // Logs performance
    });
  }, []);

  return (
    <div>
      Render count: {componentStats.renderCount}
      Avg render time: {componentStats.avgRenderTime}ms
    </div>
  );
}
```

**Returns:**
```typescript
{
  metrics: Record<string, WebVitalMetric>;
  componentStats: ComponentPerformance;
  markPerformance: (label: string) => () => void;
}
```

---

## Components

### RealTimeMonitoringDashboard

Real-time monitoring dashboard with tabs for performance, errors, and analytics.

```typescript
import RealTimeMonitoringDashboard from '@/components/monitoring/RealTimeMonitoringDashboard';

<RealTimeMonitoringDashboard />
```

**Features:**
- Live Web Vitals display
- Error tracking and statistics
- User analytics visualization
- Auto-refresh every 5 seconds

---

## Services

### Logger

Centralized logging utility with Sentry integration.

```typescript
import { logger } from '@/lib/logger';

// Info logging (dev only)
logger.info('Operation completed', { userId: '123' });

// Debug logging (dev only)
logger.debug('Debug information', { data: [] });

// Warning (always logged)
logger.warn('Potential issue', { code: 'WARN_001' });

// Error (always logged + sent to Sentry)
logger.error('Operation failed', error, { userId: '123' });
```

---

## Utilities

### safeLazyImport

Safe lazy import with fallback for code splitting.

```typescript
import { safeLazyImport } from '@/utils/safeLazyImport';

const Component = safeLazyImport(
  () => import('./Component'),
  'Component'
);
```

---

## Testing Utilities

### renderWithProviders

Render component with all necessary providers.

```typescript
import { renderWithProviders } from '@/tests/shared/test-utils';

renderWithProviders(<Component />);
```

### createMockUser

Create mock user for testing.

```typescript
import { createMockUser } from '@/tests/shared/test-utils';

const user = createMockUser({ role: 'admin' });
```

### createMockSession

Create mock authentication session.

```typescript
import { createMockSession } from '@/tests/shared/test-utils';

const session = createMockSession({ email: 'test@example.com' });
```

---

## Performance Budgets

### Web Vitals Targets

```typescript
const PERFORMANCE_BUDGETS = {
  LCP: { good: 2500, poor: 4000 },  // ms
  FID: { good: 100, poor: 300 },    // ms
  CLS: { good: 0.1, poor: 0.25 },   // score
  TTFB: { good: 600, poor: 1500 },  // ms
  FCP: { good: 1800, poor: 3000 }   // ms
};
```

### Component Performance

```typescript
const RENDER_BUDGET = 16; // ms (60fps)
const INTERACTION_BUDGET = 100; // ms (perceivable delay)
```

---

## Error Codes

### Error Categories

- `NETWORK_ERROR` - Network/fetch failures
- `RUNTIME_ERROR` - JavaScript runtime errors
- `SYNTAX_ERROR` - Parsing/syntax errors
- `RESOURCE_ERROR` - Resource loading failures
- `UNKNOWN_ERROR` - Uncategorized errors

### Severity Levels

- `critical` - Requires immediate attention
- `high` - Significant impact on functionality
- `medium` - Notable but not breaking
- `low` - Minor issues

---

**Last Updated**: 2025-01-24  
**Maintainer**: Nautilus One Team
