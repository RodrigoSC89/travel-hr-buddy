/**
 * Route Prefetching - Preload critical routes on idle
 * Improves navigation speed by loading likely next pages
 */

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

  // Prefetch critical routes immediately on idle
  const loadCritical = () => {
    CRITICAL_ROUTES.forEach(loader => {
      loader().catch(() => { /* silent */ });
    });
  };

  // Prefetch secondary routes after a longer delay
  const loadSecondary = () => {
    SECONDARY_ROUTES.forEach(loader => {
      loader().catch(() => { /* silent */ });
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadCritical(), { timeout: 3000 });
    requestIdleCallback(() => loadSecondary(), { timeout: 8000 });
  } else {
    setTimeout(loadCritical, 2000);
    setTimeout(loadSecondary, 5000);
  }
}
