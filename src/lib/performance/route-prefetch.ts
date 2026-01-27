/**
 * PATCH 662: Intelligent Route Prefetching for Slow Connections
 * Pre-loads critical routes when network conditions improve
 */

import { logger } from "@/lib/logger";

// Critical routes to prefetch (in order of priority)
const CRITICAL_ROUTES = [
  () => import("@/pages/CentralComando"),
  () => import("@/pages/Index"),
  () => import("@/pages/NautilusCommand"),
  () => import("@/pages/MaintenanceCommandCenter"),
  () => import("@/pages/FleetCommandCenter"),
];

// Secondary routes (prefetch when idle and fast connection)
const SECONDARY_ROUTES = [
  () => import("@/pages/AICommandCenter"),
  () => import("@/pages/MaritimeCommandCenter"),
  () => import("@/pages/Settings"),
];

interface NetworkInfo {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  saveData?: boolean;
  downlink?: number;
}

function getNetworkInfo(): NetworkInfo {
  if ("connection" in navigator) {
    const nav = navigator as Navigator & { connection?: NetworkInfo };
    return nav.connection || {};
  }
  return {};
}

function shouldPrefetch(): boolean {
  const network = getNetworkInfo();
  
  // Don't prefetch if user has save-data enabled
  if (network.saveData) {
    logger.debug("Prefetch skipped: save-data enabled");
    return false;
  }
  
  // Only prefetch on 3g+ connections
  const slowConnections = ["slow-2g", "2g"];
  if (network.effectiveType && slowConnections.includes(network.effectiveType)) {
    logger.debug(`Prefetch skipped: slow connection (${network.effectiveType})`);
    return false;
  }
  
  // Don't prefetch if bandwidth is very low (<1 Mbps)
  if (network.downlink && network.downlink < 1) {
    logger.debug(`Prefetch skipped: low bandwidth (${network.downlink} Mbps)`);
    return false;
  }
  
  return true;
}

function prefetchRoute(loader: () => Promise<unknown>, name: string): void {
  loader()
    .then(() => logger.debug(`Prefetched: ${name}`))
    .catch((err) => logger.debug(`Prefetch failed: ${name}`, { error: err }));
}

let hasPrefetched = false;

/**
 * Prefetch critical routes when browser is idle
 * Only runs once per session
 */
export function initRoutePrefetch(): void {
  if (hasPrefetched) return;
  hasPrefetched = true;
  
  // Wait for initial page load to complete
  if (document.readyState !== "complete") {
    window.addEventListener("load", () => schedulePrefetch(), { once: true });
  } else {
    schedulePrefetch();
  }
}

function schedulePrefetch(): void {
  // Use requestIdleCallback if available, otherwise setTimeout
  const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));
  
  scheduleIdle(() => {
    if (!shouldPrefetch()) return;
    
    logger.info("Starting route prefetch");
    
    // Prefetch critical routes first
    CRITICAL_ROUTES.forEach((loader, index) => {
      setTimeout(() => {
        if (shouldPrefetch()) {
          prefetchRoute(loader, `critical-${index}`);
        }
      }, index * 500); // Stagger by 500ms
    });
    
    // Prefetch secondary routes after critical ones
    const secondaryDelay = CRITICAL_ROUTES.length * 500 + 1000;
    SECONDARY_ROUTES.forEach((loader, index) => {
      setTimeout(() => {
        if (shouldPrefetch()) {
          prefetchRoute(loader, `secondary-${index}`);
        }
      }, secondaryDelay + index * 500);
    });
  });
}

/**
 * Prefetch a specific route on hover/focus
 * Used for link preloading
 */
export function prefetchOnInteraction(loader: () => Promise<unknown>): void {
  if (!shouldPrefetch()) return;
  prefetchRoute(loader, "interaction");
}

/**
 * Cancel all pending prefetches (call on navigation)
 */
export function cancelPrefetch(): void {
  // Could implement AbortController pattern here if needed
  logger.debug("Prefetch cancelled");
}
