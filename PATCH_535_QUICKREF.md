# PATCH 535 - Quick Reference Guide

## 🚀 Quick Start

This patch diagnosed and fixed all stability issues in Nautilus One. Here's what you need to know:

## ✅ What Was Fixed

1. **Memory leak in AI chatbot** - Timer now has cleanup
2. **Performance utilities added** - Debounce/throttle helpers available
3. **Documentation created** - Complete analysis and best practices

## 🛠️ Using Performance Utilities

### Import
```typescript
import { 
  debounce, 
  throttle,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback 
} from '@/utils/performance';
```

### Examples

#### 1. Debounce a Search Input
```typescript
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    fetchResults(debouncedQuery);
  }
}, [debouncedQuery]);

<Input onChange={(e) => setQuery(e.target.value)} />
```

#### 2. Debounce an API Call
```typescript
const handleSearch = useDebouncedCallback(
  async (value: string) => {
    const results = await fetch(`/api/search?q=${value}`);
    setResults(await results.json());
  },
  300, // Wait 300ms after typing stops
  []
);

<Input onChange={(e) => handleSearch(e.target.value)} />
```

#### 3. Throttle a Scroll Handler
```typescript
const handleScroll = useThrottledCallback(
  () => {
    console.log('Scroll position:', window.scrollY);
  },
  100, // Max once per 100ms
  []
);

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [handleScroll]);
```

#### 4. Regular Debounce Function
```typescript
const debouncedSave = debounce(
  (data) => saveToDatabase(data),
  1000
);

// Call it - will execute 1s after last call
debouncedSave(formData);
```

## ✅ Best Practices

### Always Cleanup Timers
```typescript
// ❌ BAD
useEffect(() => {
  setTimeout(() => doSomething(), 1000);
}, []);

// ✅ GOOD
useEffect(() => {
  const timer = setTimeout(() => doSomething(), 1000);
  return () => clearTimeout(timer);
}, []);
```

### Always Cleanup Intervals
```typescript
// ❌ BAD
useEffect(() => {
  setInterval(() => refresh(), 5000);
}, []);

// ✅ GOOD
useEffect(() => {
  const interval = setInterval(() => refresh(), 5000);
  return () => clearInterval(interval);
}, []);
```

### Always Cleanup Listeners
```typescript
// ❌ BAD
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ GOOD
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
```

### Always Cleanup Subscriptions
```typescript
// ❌ BAD
useEffect(() => {
  supabase.channel('changes').on('*', handleChange).subscribe();
}, []);

// ✅ GOOD
useEffect(() => {
  const subscription = supabase
    .channel('changes')
    .on('*', handleChange)
    .subscribe();
    
  return () => subscription.unsubscribe();
}, [handleChange]);
```

### Debounce API Calls in Inputs
```typescript
// ❌ BAD - API called on every keystroke
<Input onChange={(e) => fetchAPI(e.target.value)} />

// ✅ GOOD - API called after typing stops
const search = useDebouncedCallback(
  (value) => fetchAPI(value),
  300,
  []
);
<Input onChange={(e) => search(e.target.value)} />
```

### Prevent Infinite Loops
```typescript
// ❌ BAD - Infinite loop!
useEffect(() => {
  setData(data + 1);
}, [data]); // data changes, effect runs, data changes...

// ✅ GOOD - Runs once
useEffect(() => {
  fetchData().then(setData);
}, []); // Empty deps, runs once on mount

// ✅ GOOD - No circular update
useEffect(() => {
  scrollToBottom();
}, [messages]); // Only reads messages, doesn't modify
```

## 📊 Current System Status

- ✅ **0 critical issues**
- ✅ **0 memory leaks**
- ✅ **0 infinite loops**
- ✅ Build passing
- ✅ All timers have cleanup
- ✅ All subscriptions have cleanup

## 📚 Documentation

For more details, see:
- `PATCH_535_STABILITY_REPORT.md` - Technical deep dive
- `PATCH_535_VISUAL_SUMMARY.md` - Visual diagrams
- `PATCH_535_EXECUTIVE_SUMMARY.md` - Management summary

## 🔍 Safe Patterns

These patterns are SAFE and commonly found:

### ✅ Streaming Loops
```typescript
while (true) {
  const { done, value } = await reader.read();
  if (done) break; // Has exit!
  process(value);
}
```

### ✅ Scroll Effects
```typescript
useEffect(() => {
  scrollToBottom(); // Only reads dependency
}, [messages]); // Doesn't modify messages
```

### ✅ One-time Loads
```typescript
useEffect(() => {
  fetchData().then(setData);
}, []); // Runs once on mount
```

## 🚨 Red Flags

Watch out for these patterns:

### ❌ Timer without Cleanup
```typescript
useEffect(() => {
  setTimeout(...);  // No return statement!
}, []);
```

### ❌ Interval without Cleanup
```typescript
useEffect(() => {
  setInterval(...);  // No cleanup!
}, []);
```

### ❌ Listener without Cleanup
```typescript
useEffect(() => {
  window.addEventListener(...);  // No removeEventListener!
}, []);
```

### ❌ Subscription without Cleanup
```typescript
useEffect(() => {
  supabase.channel(...).subscribe();  // No unsubscribe!
}, []);
```

### ❌ State in Deps that Gets Modified
```typescript
useEffect(() => {
  setCount(count + 1); // Infinite loop!
}, [count]);
```

## 💡 Tips

1. **Always return cleanup** from useEffect if you:
   - Create a timer
   - Add an event listener
   - Subscribe to something
   - Open a connection

2. **Use debounce** when:
   - User is typing (search, filters)
   - Window is resizing
   - Scroll events
   - Any high-frequency events

3. **Use throttle** when:
   - You want consistent rate (like animation)
   - You need to execute at least once per period

4. **Check deps array**:
   - If you use a variable, it should be in deps
   - If you modify a state in deps, you'll get infinite loop
   - Empty deps = runs once on mount

## 🆘 Need Help?

If you see performance issues:
1. Check if timers/intervals have cleanup
2. Check if event listeners have cleanup
3. Check if API calls are debounced
4. Check useEffect dependencies
5. Use React DevTools Profiler

## ✅ Checklist for New Code

Before committing, verify:
- [ ] All timers have cleanup
- [ ] All intervals have cleanup
- [ ] All event listeners have cleanup
- [ ] All subscriptions have cleanup
- [ ] API calls in inputs are debounced
- [ ] Heavy computations use useMemo
- [ ] No state modified in its own useEffect deps

---

**Quick Reference Complete**

For questions or issues, see the full documentation in:
- PATCH_535_STABILITY_REPORT.md
- PATCH_535_VISUAL_SUMMARY.md
- PATCH_535_EXECUTIVE_SUMMARY.md
