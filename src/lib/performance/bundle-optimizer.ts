/**
 * Bundle Optimizer - Runtime performance monitoring and optimization
 * Adaptive resource loading based on network quality
 */

import { logger } from "@/lib/logger";

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  bundleSize: number;
  cacheHitRate: number;
}

interface NetworkInfo {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  downlink: number;
  rtt: number;
  saveData: boolean;
}

class BundleOptimizer {
  private metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    bundleSize: 0,
    cacheHitRate: 0,
  };

  /**
   * Get current network info for adaptive loading
   */
  getNetworkInfo(): NetworkInfo {
    const nav = navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } };
    const conn = nav.connection;
    return {
      effectiveType: (conn?.effectiveType as NetworkInfo["effectiveType"]) || "4g",
      downlink: conn?.downlink || 10,
      rtt: conn?.rtt || 50,
      saveData: conn?.saveData || false,
    };
  }

  /**
   * Determine image quality based on network
   */
  getAdaptiveImageQuality(): "low" | "medium" | "high" {
    const network = this.getNetworkInfo();
    if (network.saveData || network.effectiveType === "slow-2g" || network.effectiveType === "2g") {
      return "low";
    }
    if (network.effectiveType === "3g" || network.downlink < 2) {
      return "medium";
    }
    return "high";
  }

  /**
   * Should defer non-critical resources
   */
  shouldDeferResources(): boolean {
    const network = this.getNetworkInfo();
    return network.effectiveType === "slow-2g" || network.effectiveType === "2g" || network.saveData;
  }

  /**
   * Preload critical resources with priority hints
   */
  preloadResource(url: string, as: "script" | "style" | "font" | "image") {
    if (typeof document === "undefined") return;
    
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = as;
    if (as === "font") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }

  /**
   * Monitor Core Web Vitals
   */
  observeWebVitals() {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    try {
      // LCP
      const lcpObserver = new PerformanceObserver((entries) => {
        const lastEntry = entries.getEntries().at(-1);
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          logger.debug(`[Perf] LCP: ${this.metrics.lcp.toFixed(0)}ms`);
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as PerformanceEntry & { value?: number }).value || 0;
          }
        }
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });

      // TTFB
      const navObserver = new PerformanceObserver((entries) => {
        const navEntry = entries.getEntries()[0] as PerformanceNavigationTiming;
        if (navEntry) {
          this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
          logger.debug(`[Perf] TTFB: ${this.metrics.ttfb.toFixed(0)}ms`);
        }
      });
      navObserver.observe({ type: "navigation", buffered: true });
    } catch (e) {
      logger.warn("[Perf] WebVitals observation failed", e);
    }
  }

  /**
   * Calculate cache hit rate from performance entries
   */
  calculateCacheHitRate(): number {
    if (typeof performance === "undefined") return 0;
    
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    if (resources.length === 0) return 0;

    const cached = resources.filter(r => r.transferSize === 0).length;
    return Math.round((cached / resources.length) * 100);
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): PerformanceMetrics {
    this.metrics.cacheHitRate = this.calculateCacheHitRate();
    return { ...this.metrics };
  }
}

export const bundleOptimizer = new BundleOptimizer();

// Auto-start Web Vitals monitoring
if (typeof window !== "undefined") {
  bundleOptimizer.observeWebVitals();
}
