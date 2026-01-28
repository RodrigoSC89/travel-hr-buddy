/**
 * Performance Init - Entry point for all performance optimizations
 * PATCH 880: Initialize all performance systems on startup
 */

import { ultraStartupOptimizer } from "./ultra-startup-optimizer";
import { lighthouseOptimizer } from "./lighthouse-optimizer";
import { initCriticalCSS } from "./critical-css-inliner";
import { logger } from "@/lib/logger";

let isInitialized = false;

/**
 * Initialize all performance optimizations
 * Call this once at app startup
 */
export async function initPerformance(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  const startTime = performance.now();

  try {
    // 1. Critical path optimizations (synchronous)
    initCriticalCSS();
    
    // 2. Startup optimizer (already auto-initializes)
    await ultraStartupOptimizer.init();
    
    // 3. Lighthouse optimizations (DOM ready)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        lighthouseOptimizer.init();
      });
    } else {
      lighthouseOptimizer.init();
    }

    // 4. Schedule non-critical optimizations
    scheduleNonCriticalOptimizations();

    const duration = performance.now() - startTime;
    logger.info("[Performance] Initialized", { duration: `${duration.toFixed(2)}ms` });
  } catch (error) {
    logger.error("[Performance] Initialization error", error);
  }
}

/**
 * Schedule non-critical optimizations for idle time
 */
function scheduleNonCriticalOptimizations(): void {
  const idleCallback = "requestIdleCallback" in window
    ? (window as any).requestIdleCallback
    : (fn: () => void) => setTimeout(fn, 1);

  idleCallback(() => {
    // Preload route chunks for common navigation
    preloadCommonRoutes();
    
    // Setup performance observers
    setupPerformanceObservers();
  }, { timeout: 5000 });
}

/**
 * Preload chunks for commonly accessed routes
 */
function preloadCommonRoutes(): void {
  const routes = [
    "/central-comando",
    "/crew",
    "/fleet-command",
  ];

  routes.forEach((route) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = route;
    document.head.appendChild(link);
  });
}

/**
 * Setup performance observers for monitoring
 */
function setupPerformanceObservers(): void {
  if (!("PerformanceObserver" in window)) return;

  try {
    // Long Task Observer - detect blocking operations
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          logger.warn("[Performance] Long task detected", {
            duration: `${entry.duration.toFixed(2)}ms`,
            name: entry.name,
          });
        }
      });
    }).observe({ type: "longtask", buffered: true });

    // Layout Shift Observer - detect CLS issues
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.hadRecentInput) return; // Ignore user-initiated shifts
        
        if (entry.value > 0.01) {
          logger.warn("[Performance] Layout shift detected", {
            value: entry.value.toFixed(4),
          });
        }
      });
    }).observe({ type: "layout-shift", buffered: true });
  } catch {
    // Observers not supported
  }
}

/**
 * Report final performance metrics
 */
export function reportPerformance(): void {
  const metrics = ultraStartupOptimizer.reportMetrics();
  const lighthouseReport = lighthouseOptimizer.getPerformanceReport();

  logger.info("[Performance] Final Report", {
    startup: metrics,
    lighthouse: lighthouseReport,
  });
}

// Auto-initialize
if (typeof window !== "undefined") {
  initPerformance();
}

export { ultraStartupOptimizer, lighthouseOptimizer };
