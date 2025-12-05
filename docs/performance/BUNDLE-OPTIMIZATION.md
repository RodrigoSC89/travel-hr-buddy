# 📦 Bundle Optimization Guide

## Overview

This guide covers bundle size optimization strategies for Nautilus One.

## Current Bundle Analysis

| Chunk | Size | Strategy |
|-------|------|----------|
| React Core | ~45KB | Shared |
| UI Components | ~80KB | Lazy loaded |
| Routes | ~15KB each | Code split |
| Vendor | ~100KB | Tree shaken |

## Optimization Strategies

### 1. Route-Based Code Splitting

```typescript
// ✅ Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
```

### 2. Component Lazy Loading

```typescript
// ✅ Heavy components
const Chart = lazy(() => import('./components/Chart'));
const Editor = lazy(() => import('./components/Editor'));
```

### 3. Tree Shaking

```typescript
// ✅ Import only what you need
import { Button } from '@/components/ui/button';

// ❌ Avoid barrel imports for large libraries
import * as _ from 'lodash';
```

### 4. Dynamic Imports

```typescript
// ✅ Load on demand
const loadPDF = () => import('jspdf');

const generatePDF = async () => {
  const { jsPDF } = await loadPDF();
  // use jsPDF
};
```

## Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

## Bundle Size Targets

| Metric | Target | Priority |
|--------|--------|----------|
| Initial JS | < 200KB | Critical |
| Initial CSS | < 50KB | High |
| Total (lazy) | < 1MB | Medium |

## Analysis Tools

```bash
# Analyze bundle
npm run build -- --analyze

# Visualize
npx vite-bundle-visualizer
```
