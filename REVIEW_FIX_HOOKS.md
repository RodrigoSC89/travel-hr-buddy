# REVIEW_FIX_HOOKS.md - Definitive React Hooks Fix

## Error Analyzed
```
Uncaught TypeError: Cannot read properties of null (reading 'useState')
at AuthProvider (src/contexts/AuthContext.tsx:65:35)
at Toaster (src/components/ui/toaster.tsx:26:24)
at useToast (src/hooks/use-toast.ts:121:37)
```

## Root Cause Identified

The error was caused by **multiple React instances** being loaded simultaneously:

1. **Two Vite cache directories were active**: `.vite-cache` and `.vite-cache-v2`
   - Console showed React loading from both: `chunk-UVNPGZG7.js` and `chunk-BU5BEHXL.js`
   - This created two separate React instances with separate internal state

2. **Inconsistent React import patterns**:
   - `use-toast.ts` used `import * as React from "react"` (namespace import)
   - Other files used `import React, { useState } from "react"` (default + named)
   - This caused different files to resolve React from different bundles

3. **Toaster inside lazy-loaded component**:
   - `Toaster` was rendered inside `GlobalBrainProvider` which was lazy-loaded
   - When `Suspense` boundary resolved, it loaded React from a different chunk
   - This caused the hooks to execute with a null dispatcher

## Applied Fixes

### 1. Standardized React imports (use-toast.ts)
```typescript
// BEFORE (problematic)
import * as React from "react";
React.useState(...);
React.useEffect(...);

// AFTER (fixed)
import { useState, useEffect, ReactNode } from "react";
useState(...);
useEffect(...);
```

### 2. Moved Toasters outside lazy boundary (App.tsx)
```typescript
// BEFORE (Toasters inside lazy GlobalBrainProvider)
<GlobalBrainProvider>
  <Routes>...</Routes>
  <Toaster />
  <SonnerToaster />
</GlobalBrainProvider>

// AFTER (Toasters outside lazy components)
<GlobalBrainProvider>
  <Routes>...</Routes>
</GlobalBrainProvider>
<Toaster />
<SonnerToaster />
```

### 3. Added explicit React import to Toaster component
```typescript
import React from "react";
export function Toaster(): React.ReactElement {
```

### 4. Force fresh Vite cache (vite.config.ts)
```typescript
cacheDir: ".vite-cache-v3",  // Changed from v2 to force rebuild
optimizeDeps: {
  force: true,
  esbuildOptions: {
    target: "esnext",
    resolveExtensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
}
```

## Prevention Rules

1. **Never use `import * as React`** - Always use named imports
2. **Context providers must NOT be lazy loaded**
3. **Global UI components (Toaster, etc.) must be outside Suspense boundaries**
4. **When changing cache, increment version number** to force full rebuild
5. **All React-related packages must be in `resolve.dedupe`** array

## Validation Steps

1. Hard refresh the page (Ctrl+Shift+R)
2. Check console for any React hook errors
3. Navigate to `/`, `/auth`, `/dashboard`
4. Reload each page and verify no errors
5. Verify Toaster works (trigger a toast action)

## Files Modified
- `src/hooks/use-toast.ts` - Standardized imports
- `src/components/ui/toaster.tsx` - Added React import
- `src/App.tsx` - Moved Toasters outside lazy boundary
- `vite.config.ts` - Force new cache directory
