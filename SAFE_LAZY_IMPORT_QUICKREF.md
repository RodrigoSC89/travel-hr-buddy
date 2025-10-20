# 🚀 Safe Lazy Import - Quick Reference

## TL;DR

Solves "Failed to fetch dynamically imported module" errors in production by wrapping `React.lazy()` with error handling.

## Installation

Already included in the project at `src/utils/safeLazyImport.tsx`

## Quick Start

```tsx
// Before ❌
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

// After ✅
import { safeLazyImport } from "@/utils/safeLazyImport";
const Dashboard = safeLazyImport(() => import("@/pages/Dashboard"), "Dashboard");
```

## What It Does

✅ Catches import failures  
✅ Shows loading state  
✅ Displays friendly error message  
✅ Logs errors to console  
✅ Prevents blank screens  

## When to Use

- All lazy-loaded routes
- All dynamically imported pages
- Any `React.lazy()` usage in production code

## Coverage in This Project

All routes in `src/App.tsx` now use `safeLazyImport`:

- ✅ Dashboard
- ✅ Maritime
- ✅ Optimization
- ✅ ChecklistsInteligentes
- ✅ PEODP
- ✅ PEOTRAM
- ✅ All admin pages
- ✅ All document pages
- ✅ All other lazy-loaded components

## Error States

| State | What User Sees |
|-------|---------------|
| Loading | ⏳ Carregando [Module]... |
| Error | ⚠️ Falha ao carregar o módulo [Module] |
| Success | Normal component |

## Testing

```bash
npm run test -- src/tests/safeLazyImport.test.tsx
```

## Build Verification

```bash
npm run build
```

Should complete without errors and generate proper chunks.

## Example Output

### Console (on error)
```
❌ Erro ao carregar módulo Dashboard: [Error details]
```

### UI (on error)
```
⚠️
Falha ao carregar o módulo Dashboard
Tente atualizar a página ou contate o suporte técnico.
```

## Common Use Cases

### Route Definition
```tsx
const MyPage = safeLazyImport(() => import("@/pages/MyPage"), "My Page");

<Route path="/my-page" element={<MyPage />} />
```

### Conditional Rendering
```tsx
const AdminPanel = safeLazyImport(() => import("@/admin/Panel"), "Admin Panel");

{isAdmin && <AdminPanel />}
```

### With Props
```tsx
const UserProfile = safeLazyImport(
  () => import("@/pages/UserProfile"),
  "User Profile"
);

<UserProfile userId={123} />
```

## Vite Configuration

Already configured in `vite.config.ts`:
- ✅ Path alias `@` for `src/`
- ✅ Proper chunk splitting
- ✅ Optimized for production

## Files Modified

- ✅ `src/utils/safeLazyImport.tsx` - Core utility
- ✅ `src/App.tsx` - Updated all lazy imports
- ✅ `src/tests/safeLazyImport.test.tsx` - Test suite
- ✅ `vite.config.ts` - Already optimized

## Migration Guide

For any new lazy-loaded component:

1. Import the utility:
   ```tsx
   import { safeLazyImport } from "@/utils/safeLazyImport";
   ```

2. Replace `React.lazy`:
   ```tsx
   // Old
   const MyComponent = React.lazy(() => import("./MyComponent"));
   
   // New
   const MyComponent = safeLazyImport(
     () => import("@/MyComponent"),
     "My Component"
   );
   ```

3. Use normally in JSX:
   ```tsx
   <MyComponent />
   ```

## Benefits

| Feature | Impact |
|---------|--------|
| Error Handling | No more blank screens |
| Loading States | Better UX during load |
| Console Logging | Easier debugging |
| Type Safety | Fewer runtime errors |
| Display Names | Better React DevTools |

## Status

✅ Implemented  
✅ Tested  
✅ Documented  
✅ Production Ready  

## See Also

- [Full Documentation](./SAFE_LAZY_IMPORT.md)
- [React.lazy() Docs](https://react.dev/reference/react/lazy)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
