# NAUTI ONE — Performance Baseline

## Current Architecture

### Code Splitting
- **Strategy**: Lazy loading per route via `React.lazy()` + `Suspense`
- **Entry points**: 150+ lazy-loaded pages in App.tsx
- **Hub splitting**: 7 mega-hubs loaded independently

### Libraries Installed for Performance
- `react-virtual` (v3.13) — Table virtualization
- `react-intersection-observer` (v10) — Lazy image loading
- `framer-motion` (v11) — Optimized animations
- `web-vitals` (v5) — Core Web Vitals measurement
- `vite-plugin-compression` — Gzip/Brotli compression

### Caching
- React Query: `staleTime: 5 min`, `retry: 1`
- Service Worker: PWA caching for offline support
- IndexedDB (Dexie): Offline data storage

## Baseline Measurements (To Be Collected)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP | < 2.5s | TBD | ⏳ |
| FID/INP | < 200ms | TBD | ⏳ |
| CLS | < 0.1 | TBD | ⏳ |
| TTI | < 3.5s | TBD | ⏳ |
| Bundle Size (gzip) | < 500KB initial | TBD | ⏳ |

## Optimizations Applied

### ✅ Already Implemented
1. Code splitting by route (150+ lazy chunks)
2. React Query caching (5 min stale)
3. PWA Service Worker
4. Image optimization component (`OptimizedImage`)
5. Bandwidth-aware loading (`ConnectionAwareImage`)
6. Skeleton loading states
7. Error boundaries (prevent full-page crashes)

### 🔄 Created in Phase 2
1. Shared `LoadingState` component (table/cards/detail variants)
2. Shared `EmptyState` component
3. Performance tracking via Sentry metrics
4. `instrumentQuery()` for timing all DB calls

### 📋 Recommended Next Steps
1. Run Lighthouse on `/command`, `/ops`, `/compliance`
2. Measure heaviest routes (dashboards with charts)
3. Virtualize tables with 100+ rows
4. Debounce search inputs (already in some modules)
5. Prefetch hub routes on sidebar hover
