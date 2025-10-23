# Troubleshooting Guide - Nautilus One Travel HR Buddy

**Version**: 1.0  
**Last Updated**: 2025-01-24

---

## 📚 Table of Contents

1. [Common Issues](#common-issues)
2. [Performance Problems](#performance-problems)
3. [Authentication Issues](#authentication-issues)
4. [Build Errors](#build-errors)
5. [Testing Issues](#testing-issues)
6. [Monitoring Issues](#monitoring-issues)

---

## Common Issues

### Application Won't Start

**Symptoms:**
- Dev server fails to start
- White screen on load
- "Cannot find module" errors

**Solutions:**

```bash
# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Clear Vite cache
rm -rf node_modules/.vite

# 3. Check Node version
node --version  # Should be 18+

# 4. Verify environment variables
cat .env
# Ensure all VITE_ prefixed variables are set
```

### Blank Page After Build

**Symptoms:**
- App works in dev but not production
- Console shows "Failed to load resource"

**Solutions:**

```bash
# 1. Check base path in vite.config.ts
export default defineConfig({
  base: '/',  # Should match deployment path
});

# 2. Verify asset paths
# Assets should use relative paths or import statements

# 3. Check console for errors
# Open browser DevTools -> Console

# 4. Verify build output
npm run preview  # Test production build locally
```

---

## Performance Problems

### Slow Initial Load

**Symptoms:**
- Long time to first paint
- Large bundle size
- Slow network requests

**Diagnosis:**

```bash
# 1. Analyze bundle size
npm run build
# Check dist/ folder size

# 2. Run Lighthouse audit
npm run test:performance

# 3. Check network tab
# Look for large resources
```

**Solutions:**

```typescript
// 1. Implement code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 2. Optimize images
// Use WebP format, lazy loading

// 3. Remove unused dependencies
npm run analyze-bundle

// 4. Enable compression
// Configure hosting provider for gzip/brotli
```

### High Memory Usage

**Symptoms:**
- Browser tab crashes
- Slow performance over time
- Memory leak warnings

**Diagnosis:**

```typescript
// Use Chrome DevTools -> Memory
// 1. Take heap snapshot
// 2. Look for detached DOM nodes
// 3. Check for retained listeners

// Check with performance monitor
const { memory } = performanceMonitor.getSnapshot();
console.log('Memory usage:', memory);
```

**Solutions:**

```typescript
// 1. Cleanup subscriptions
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();  // Cleanup!
}, []);

// 2. Remove event listeners
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// 3. Cancel pending requests
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => controller.abort();
}, []);
```

### Slow Rendering

**Symptoms:**
- Laggy interactions
- Dropped frames
- Slow component updates

**Solutions:**

```typescript
// 1. Use React.memo for expensive components
const ExpensiveComponent = memo(({ data }) => {
  // Component logic
}, (prev, next) => {
  return prev.data.id === next.data.id;  // Custom comparison
});

// 2. Optimize re-renders
// Use useCallback for functions
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// 3. Use useMemo for expensive calculations
const result = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// 4. Implement virtualization for long lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## Authentication Issues

### "Session Expired" Errors

**Symptoms:**
- Frequent logout
- API returns 401
- Session lost on refresh

**Solutions:**

```typescript
// 1. Check token expiration
const { data: session } = await supabase.auth.getSession();
console.log('Expires at:', new Date(session.expires_at * 1000));

// 2. Implement refresh token logic
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});

// 3. Verify storage
// Check localStorage/cookies for auth tokens
console.log(localStorage.getItem('supabase.auth.token'));
```

### Login Fails Silently

**Symptoms:**
- No error message
- Form submits but nothing happens
- Console shows errors

**Diagnosis:**

```typescript
// Add detailed logging
async function handleLogin(email, password) {
  console.log('Attempting login for:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('Login response:', { data, error });
    
    if (error) {
      console.error('Login error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Caught error:', error);
    errorTracker.captureError(error, { action: 'login' });
  }
}
```

---

## Build Errors

### TypeScript Errors

**Common Errors:**

```typescript
// Error: Type 'X' is not assignable to type 'Y'
// Solution: Add proper type annotations

interface Props {
  data: DataType;  // Define explicit type
}

// Error: Cannot find module
// Solution: Check tsconfig paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Import Errors

```bash
# Error: Cannot find module '@/components/...'
# Solution: Verify vite.config.ts

resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  }
}

# Error: Module not found after adding dependency
# Solution: Restart dev server
# Stop server, reinstall, restart
```

### Build Size Too Large

**Diagnosis:**

```bash
# Analyze what's in the bundle
npm run build -- --analyze

# Check specific dependencies
npm list --depth=0
```

**Solutions:**

```typescript
// 1. Remove unused dependencies
npm uninstall unused-package

// 2. Use dynamic imports
const Module = await import('./heavy-module');

// 3. Tree-shake libraries
// Use named imports instead of default
import { specific } from 'library';  // ✅
import Library from 'library';       // ❌
```

---

## Testing Issues

### Tests Failing Randomly

**Symptoms:**
- Tests pass sometimes, fail others
- "Race condition" errors
- Timeout errors

**Solutions:**

```typescript
// 1. Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// 2. Cleanup between tests
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

// 3. Use fake timers for time-dependent code
vi.useFakeTimers();
// ... test code
vi.useRealTimers();

// 4. Increase timeout for slow tests
it('slow test', async () => {
  // test
}, 10000);  // 10 second timeout
```

### Mock Not Working

```typescript
// Problem: Mock not applied
// Solution: Mock before import

// ✅ Correct order
vi.mock('@/lib/api');
import { fetchData } from '@/lib/api';

// ❌ Wrong order
import { fetchData } from '@/lib/api';
vi.mock('@/lib/api');  // Too late!
```

---

## Monitoring Issues

### Metrics Not Appearing

**Symptoms:**
- Dashboard shows no data
- Web Vitals not recorded
- Errors not tracked

**Diagnosis:**

```typescript
// 1. Verify initialization
console.log('Performance monitor initialized:', 
  typeof performanceMonitor.initialize === 'function');

// 2. Check browser support
console.log('PerformanceObserver supported:', 
  'PerformanceObserver' in window);

// 3. Verify subscriptions
performanceMonitor.subscribe((metric) => {
  console.log('Metric received:', metric);
});
```

**Solutions:**

```typescript
// 1. Ensure monitoring is initialized
// In main.tsx or App.tsx
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import { errorTracker } from '@/lib/monitoring/error-tracker';

performanceMonitor.initialize();
errorTracker.initialize();

// 2. Check for errors in console
// Look for monitoring initialization errors

// 3. Verify feature detection
if ('PerformanceObserver' in window) {
  performanceMonitor.initialize();
} else {
  console.warn('Performance monitoring not supported');
}
```

### Sentry Not Capturing Errors

**Symptoms:**
- Errors not appearing in Sentry
- No events in Sentry dashboard

**Solutions:**

```bash
# 1. Verify DSN
echo $VITE_SENTRY_DSN

# 2. Check Sentry initialization
# Look for initialization log in console

# 3. Test error capture
throw new Error('Test Sentry');

# 4. Verify environment
# Sentry only active in production by default
```

---

## Debug Checklist

When encountering an issue:

```markdown
## Investigation Steps
- [ ] Check browser console for errors
- [ ] Verify network tab for failed requests
- [ ] Review application logs
- [ ] Check monitoring dashboard
- [ ] Verify environment variables
- [ ] Test in different browser
- [ ] Check for recent changes
- [ ] Review error tracking (Sentry)

## Information to Gather
- [ ] Error message (exact text)
- [ ] Steps to reproduce
- [ ] Browser and version
- [ ] Console logs
- [ ] Network requests
- [ ] Current route/page
- [ ] User actions leading to error
```

---

## Getting Help

### Logs to Collect

```bash
# Browser console logs
# Right-click -> Save as...

# Application logs
npm run logs

# Build logs
npm run build > build.log 2>&1

# Test logs
npm test > test.log 2>&1
```

### Where to Ask

1. **Internal Team** - Slack channel
2. **Lovable Community** - Discord server
3. **GitHub Issues** - For bugs
4. **Stack Overflow** - Technical questions

### Information to Include

```markdown
## Bug Report Template

**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: 
- Browser:
- Node version:
- App version:

**Logs:**
```
Paste relevant logs here
```

**Screenshots:**
Add screenshots if applicable
```

---

**Last Updated**: 2025-01-24  
**Maintainer**: Nautilus One Team
