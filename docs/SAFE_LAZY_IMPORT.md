# Safe Lazy Import Utility

## 📋 Overview

The `safeLazyImport` utility is a robust wrapper around React's `lazy()` function that provides comprehensive error handling and fallback UI for dynamically imported modules. This prevents the common "Failed to fetch dynamically imported module" error that can occur in production deployments.

## 🎯 Problem Solved

When deploying Single Page Applications (SPAs), especially with Vite, dynamic imports can fail due to:
- Network issues
- Outdated cached chunks after deployment
- CDN synchronization delays
- Module resolution errors

Without proper error handling, these failures result in blank screens or application crashes.

## ✨ Features

- **Automatic Error Handling**: Catches import failures and displays a user-friendly error message
- **Loading States**: Shows a loading indicator while the module is being fetched
- **Type-Safe**: Full TypeScript support with proper type inference
- **Display Names**: Automatically sets display names for better debugging
- **Suspense Integration**: Built-in Suspense wrapper for seamless integration

## 📦 Usage

### Basic Example

```tsx
import { safeLazyImport } from "@/utils/safeLazyImport";

// Instead of:
// const Dashboard = React.lazy(() => import("./pages/Dashboard"));

// Use:
const Dashboard = safeLazyImport(() => import("./pages/Dashboard"), "Dashboard");
```

### In Routing

```tsx
import { safeLazyImport } from "@/utils/safeLazyImport";

const Dashboard = safeLazyImport(() => import("@/pages/Dashboard"), "Dashboard");
const Settings = safeLazyImport(() => import("@/pages/Settings"), "Settings");
const Analytics = safeLazyImport(() => import("@/pages/Analytics"), "Analytics");

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}
```

## 🔧 API

### `safeLazyImport(importer, name)`

#### Parameters

- **importer**: `() => Promise<{ default: React.ComponentType<unknown> }>`
  - A function that returns a promise resolving to a module with a default export
  - Typically an ES module dynamic import: `() => import("./MyComponent")`

- **name**: `string`
  - A human-readable name for the component
  - Used in loading messages, error messages, and display names
  - Example: "Dashboard", "User Settings", "Analytics Page"

#### Returns

- A React component that can be used directly in JSX
- The component includes built-in Suspense wrapper
- Automatically displays loading and error states

## 🎨 UI States

### Loading State
```
⏳ Carregando [Component Name]...
```
Displayed in a centered container while the module is being loaded.

### Error State
```
⚠️
Falha ao carregar o módulo [Component Name]
Tente atualizar a página ou contate o suporte técnico.
```
Displayed when the module fails to load, with styling to indicate an error.

### Success State
The actual component content is rendered normally once loaded.

## 🧪 Testing

The utility includes comprehensive tests:

```bash
npm run test -- src/tests/safeLazyImport.test.tsx
```

Test coverage includes:
- ✅ Successful module loading
- ✅ Loading state display
- ✅ Error handling and fallback UI
- ✅ Props passing to loaded components

## 🚀 Benefits

1. **Improved User Experience**: Users see helpful messages instead of blank screens
2. **Better Debugging**: Console errors are logged with module names
3. **Production Resilience**: Handles deployment edge cases gracefully
4. **Developer Friendly**: Simple API, drop-in replacement for React.lazy
5. **Type Safety**: Full TypeScript support prevents runtime errors

## 📝 Best Practices

### ✅ Do

```tsx
// Use descriptive names
const UserDashboard = safeLazyImport(
  () => import("@/pages/UserDashboard"), 
  "User Dashboard"
);

// Use with path aliases for consistency
const Settings = safeLazyImport(
  () => import("@/pages/Settings"),
  "Settings"
);
```

### ❌ Don't

```tsx
// Don't use generic names
const Component = safeLazyImport(
  () => import("./SomeComponent"),
  "Component"
);

// Don't use relative paths when aliases are available
const Dashboard = safeLazyImport(
  () => import("../../../pages/Dashboard"),
  "Dashboard"
);
```

## 🔍 Troubleshooting

### Module Still Fails to Load

If a module consistently fails to load:
1. Check browser console for detailed error messages
2. Verify the import path is correct
3. Ensure the module file exists
4. Check Vite build output for chunk generation errors

### Display Name Not Showing in DevTools

The component should automatically have a display name like `SafeLazy(ComponentName)`. If not:
1. Verify you're using the latest version
2. Check React DevTools settings
3. Ensure the name parameter is provided

## 🔗 Related

- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)

## 📄 License

This utility is part of the Nautilus One project and follows the project's license.
