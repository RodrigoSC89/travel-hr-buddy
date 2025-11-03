# PATCH 607 - PreviewWrapper Usage Examples

## Basic Usage

### Simple Preview Component
```tsx
import { PreviewWrapper } from "@/components/wrappers/PreviewWrapper";

export function MyPreviewComponent() {
  return (
    <PreviewWrapper>
      <div>
        <h1>My Preview Content</h1>
        <p>This content is safely wrapped</p>
      </div>
    </PreviewWrapper>
  );
}
```

### With Custom Fallback Size
```tsx
import { PreviewWrapper } from "@/components/wrappers/PreviewWrapper";

export function FullScreenPreview() {
  return (
    <PreviewWrapper fallbackClassName="h-screen w-full">
      <MyFullScreenComponent />
    </PreviewWrapper>
  );
}
```

## Advanced Usage

### Preview with Data Loading
```tsx
import { PreviewWrapper } from "@/components/wrappers/PreviewWrapper";
import { Suspense } from "react";

// Heavy component that might crash
const HeavyDataComponent = React.lazy(() => import("./HeavyDataComponent"));

export function DataPreview() {
  return (
    <PreviewWrapper fallbackClassName="h-96 w-full rounded-lg">
      <Suspense fallback={<div>Loading data...</div>}>
        <HeavyDataComponent />
      </Suspense>
    </PreviewWrapper>
  );
}
```

### Preview with Polling/Intervals
```tsx
import { PreviewWrapper } from "@/components/wrappers/PreviewWrapper";
import { useEffect, useState } from "react";

function LiveDataPreview() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // ✅ CORRETO: Com cleanup
    const intervalId = setInterval(() => {
      fetchData().then(setData);
    }, 5000);

    return () => clearInterval(intervalId); // IMPORTANTE!
  }, []);

  return (
    <div>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}

export function LivePreview() {
  return (
    <PreviewWrapper>
      <LiveDataPreview />
    </PreviewWrapper>
  );
}
```

## Common Patterns

### Pattern 1: useEffect with setInterval
```tsx
// ❌ INCORRETO - Sem cleanup
useEffect(() => {
  setInterval(() => {
    console.log('Running...');
  }, 1000);
}, []);

// ✅ CORRETO - Com cleanup
useEffect(() => {
  const intervalId = setInterval(() => {
    console.log('Running...');
  }, 1000);
  
  return () => clearInterval(intervalId);
}, []);
```

### Pattern 2: useEffect with setTimeout
```tsx
// ❌ INCORRETO - Sem cleanup
useEffect(() => {
  setTimeout(() => {
    doSomething();
  }, 1000);
}, []);

// ✅ CORRETO - Com cleanup
useEffect(() => {
  const timeoutId = setTimeout(() => {
    doSomething();
  }, 1000);
  
  return () => clearTimeout(timeoutId);
}, []);
```

### Pattern 3: Multiple Intervals
```tsx
// ✅ CORRETO - Múltiplos intervals com cleanup
useEffect(() => {
  const interval1 = setInterval(() => updateData1(), 1000);
  const interval2 = setInterval(() => updateData2(), 5000);
  
  return () => {
    clearInterval(interval1);
    clearInterval(interval2);
  };
}, []);
```

## Integration with Existing Components

### Before (Without PreviewWrapper)
```tsx
export function Dashboard() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    setInterval(() => {
      fetchData().then(setData);
    }, 1000);
  }, []); // ⚠️ Memory leak!
  
  return <div>{/* content */}</div>;
}
```

### After (With PreviewWrapper and Cleanup)
```tsx
import { PreviewWrapper } from "@/components/wrappers/PreviewWrapper";

function DashboardContent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData().then(setData);
    }, 1000);
    
    return () => clearInterval(intervalId); // ✅ Fixed!
  }, []);
  
  return <div>{/* content */}</div>;
}

export function Dashboard() {
  return (
    <PreviewWrapper>
      <DashboardContent />
    </PreviewWrapper>
  );
}
```

## Testing

### Unit Test Example
```tsx
import { describe, it, expect, vi } from 'vitest';

describe('MyComponent with interval', () => {
  it('cleans up interval on unmount', () => {
    const callback = vi.fn();
    
    const { unmount } = render(<MyComponent callback={callback} />);
    
    vi.advanceTimersByTime(3000);
    const callsBefore = callback.mock.calls.length;
    
    unmount();
    
    vi.advanceTimersByTime(3000);
    const callsAfter = callback.mock.calls.length;
    
    expect(callsAfter).toBe(callsBefore); // Should not increase
  });
});
```

## Checklist for New Components

Before deploying a new component to preview:

- [ ] Wrapped with `<PreviewWrapper>`
- [ ] All `useEffect` with timers have cleanup functions
- [ ] Large data sets are paginated or virtualized
- [ ] ErrorBoundary is configured
- [ ] Tested locally with hot reload (to verify cleanup)
- [ ] Tested with E2E preview tests

## Migration Guide

### Step 1: Identify Components with Intervals
```bash
# Find all files with setInterval
grep -r "setInterval" src/pages --include="*.tsx"
```

### Step 2: Add Cleanup
For each file found:
1. Store interval ID in a variable
2. Add cleanup function in useEffect return

### Step 3: Wrap with PreviewWrapper
Add PreviewWrapper around the component:
```tsx
import { PreviewWrapper } from "@/components/wrappers/PreviewWrapper";

export default function MyPage() {
  return (
    <PreviewWrapper>
      <MyPageContent />
    </PreviewWrapper>
  );
}
```

### Step 4: Test
```bash
# Run unit tests
npm run test:unit

# Run E2E preview tests
npm run test:e2e -- e2e/preview_prevention.cy.ts
```

## Troubleshooting

### Problem: Component still crashes
**Solution**: Check browser console for error details. Ensure ErrorBoundary is properly configured.

### Problem: Infinite re-renders
**Solution**: Check useEffect dependencies. Missing dependencies can cause infinite loops.

### Problem: Memory leaks
**Solution**: Ensure all intervals, timeouts, and subscriptions have cleanup functions.

### Problem: Skeleton never disappears
**Solution**: Check that lazy-loaded components resolve correctly. Verify network requests.

## Best Practices

1. **Always clean up side effects**
   - setInterval → clearInterval
   - setTimeout → clearTimeout
   - addEventListener → removeEventListener
   - subscriptions → unsubscribe

2. **Use PreviewWrapper for all preview routes**
   - Prevents crashes from breaking the entire app
   - Provides consistent loading experience

3. **Paginate large datasets**
   - Don't render 1000+ items at once
   - Use virtualization (react-window) for long lists

4. **Test cleanup locally**
   - Enable React StrictMode
   - Use hot reload to verify cleanup
   - Check browser console for warnings

5. **Monitor performance**
   - Use React DevTools Profiler
   - Check for memory leaks in Chrome DevTools
   - Profile with Lighthouse

## Resources

- [React useEffect Documentation](https://react.dev/reference/react/useEffect)
- [ErrorBoundary Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [react-window for virtualization](https://github.com/bvaughn/react-window)
