/**
 * Route Prefetching - Adaptive for maritime low-bandwidth
 * Only prefetch on good connections; on slow/satellite, skip entirely
 */
import { connectionAdaptive } from '@/lib/performance/connection-adaptive';

const CRITICAL_ROUTES = [
  () => import("@/pages/mega-hubs/CommandMegaHub"),
  () => import("@/pages/mega-hubs/OpsMegaHub"),
];

const SECONDARY_ROUTES = [
  () => import("@/pages/mega-hubs/ComplianceMegaHub"),
  () => import("@/pages/mega-hubs/MaintenanceMegaHub"),
  () => import("@/pages/mega-hubs/AIMegaHub"),
  () => import("@/pages/mega-hubs/TrackingMegaHub"),
  () => import("@/pages/mega-hubs/WorkbenchMegaHub"),
];

let prefetched = false;

export function prefetchCriticalRoutes() {
  if (prefetched) return;
  prefetched = true;

  const quality = connectionAdaptive.getQuality();

  // On slow/offline connections, don't prefetch anything - save bandwidth
  if (quality === 'slow' || quality === 'offline') {
    return;
  }

  // On moderate connections, only prefetch critical routes after long delay
  const criticalDelay = quality === 'moderate' ? 10000 : 3000;
  const loadCritical = () => {
    // Load one at a time to avoid bandwidth spikes
    CRITICAL_ROUTES.reduce<Promise<void>>((chain, loader) => 
      chain.then(() => { loader().catch(() => {}); }), 
      Promise.resolve()
    );
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadCritical(), { timeout: criticalDelay });
    // Only prefetch secondary on fast connections
    if (quality === 'fast') {
      requestIdleCallback(() => {
        SECONDARY_ROUTES.reduce<Promise<void>>((chain, loader) => 
          chain.then(() => { loader().catch(() => {}); }), 
          Promise.resolve()
        );
      }, { timeout: 15000 });
    }
  } else {
    setTimeout(loadCritical, criticalDelay);
  }
}
