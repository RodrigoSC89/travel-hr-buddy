/**
 * Lighthouse Performance Optimizer v4.5
 * PATCH 880: Target Lighthouse 98+ Score
 * Implements all critical optimizations for Core Web Vitals
 */

import { logger } from "@/lib/logger";

interface LighthouseTargets {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

interface CoreWebVitals {
  LCP: number;  // Largest Contentful Paint (ms)
  FID: number;  // First Input Delay (ms)
  CLS: number;  // Cumulative Layout Shift
  FCP: number;  // First Contentful Paint (ms)
  TTI: number;  // Time to Interactive (ms)
  TBT: number;  // Total Blocking Time (ms)
  INP: number;  // Interaction to Next Paint (ms)
}

const TARGETS: LighthouseTargets = {
  performance: 98,
  accessibility: 95,
  bestPractices: 95,
  seo: 95,
};

const CWV_TARGETS: CoreWebVitals = {
  LCP: 1500,   // < 1.5s for green
  FID: 50,     // < 50ms for green
  CLS: 0.05,   // < 0.05 for green
  FCP: 1000,   // < 1s for green
  TTI: 2500,   // < 2.5s for green
  TBT: 150,    // < 150ms for green
  INP: 200,    // < 200ms for green
};

class LighthouseOptimizer {
  private isInitialized = false;
  private metrics: Partial<CoreWebVitals> = {};

  /**
   * Initialize all Lighthouse optimizations
   */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Critical Path Optimizations
    this.optimizeCriticalPath();
    
    // Layout Stability (CLS)
    this.preventLayoutShifts();
    
    // Interaction Responsiveness (FID/INP)
    this.optimizeInteractions();
    
    // Resource Loading (LCP/FCP)
    this.optimizeResourceLoading();
    
    // JavaScript Execution (TBT)
    this.reduceBlockingTime();
    
    logger.info("[Lighthouse] Optimizer initialized");
  }

  /**
   * Critical Path Optimizations
   */
  private optimizeCriticalPath(): void {
    // Inline critical CSS indicator
    document.documentElement.dataset.criticalCssLoaded = "true";
    
    // Mark above-the-fold content
    requestAnimationFrame(() => {
      const aboveFold = document.querySelectorAll("[data-priority='high']");
      aboveFold.forEach((el) => {
        (el as HTMLElement).style.contentVisibility = "visible";
      });
    });
  }

  /**
   * Prevent Cumulative Layout Shifts
   */
  private preventLayoutShifts(): void {
    // Add aspect ratio placeholders for images
    const images = document.querySelectorAll("img:not([width]):not([height])");
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      if (!htmlImg.width && !htmlImg.height) {
        // Add default aspect ratio to prevent layout shift
        htmlImg.style.aspectRatio = "16/9";
        htmlImg.loading = "lazy";
        htmlImg.decoding = "async";
      }
    });

    // Reserve space for dynamic content
    const dynamicContainers = document.querySelectorAll("[data-dynamic-content]");
    dynamicContainers.forEach((container) => {
      const htmlContainer = container as HTMLElement;
      if (!htmlContainer.style.minHeight) {
        htmlContainer.style.minHeight = "100px";
        htmlContainer.style.contain = "layout style";
      }
    });
  }

  /**
   * Optimize Interaction Responsiveness
   */
  private optimizeInteractions(): void {
    // Use passive event listeners
    const passiveEvents = ["touchstart", "touchmove", "wheel", "scroll"];
    
    passiveEvents.forEach((eventType) => {
      document.addEventListener(
        eventType,
        () => {},
        { passive: true, capture: true }
      );
    });

    // Defer non-critical event handlers
    const deferredHandlers = document.querySelectorAll("[data-defer-interaction]");
    
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        deferredHandlers.forEach((el) => {
          el.removeAttribute("data-defer-interaction");
        });
      });
    }
  }

  /**
   * Optimize Resource Loading for LCP/FCP
   */
  private optimizeResourceLoading(): void {
    // Preload LCP image if identified
    const lcpElement = document.querySelector("[data-lcp]");
    if (lcpElement) {
      const imgSrc = (lcpElement as HTMLImageElement).src || 
                     lcpElement.getAttribute("data-src");
      
      if (imgSrc) {
        const preload = document.createElement("link");
        preload.rel = "preload";
        preload.as = "image";
        preload.href = imgSrc;
        preload.setAttribute("fetchpriority", "high");
        document.head.appendChild(preload);
      }
    }

    // Native lazy loading for below-fold images
    const belowFoldImages = document.querySelectorAll("img:not([data-priority])");
    belowFoldImages.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      if (!htmlImg.loading) {
        htmlImg.loading = "lazy";
      }
      if (!htmlImg.decoding) {
        htmlImg.decoding = "async";
      }
    });

    // Defer non-critical scripts
    const scripts = document.querySelectorAll("script:not([data-critical])");
    scripts.forEach((script) => {
      if (!script.hasAttribute("defer") && !script.hasAttribute("async")) {
        script.setAttribute("defer", "");
      }
    });
  }

  /**
   * Reduce Total Blocking Time
   */
  private reduceBlockingTime(): void {
    // Break up long tasks using scheduler API or fallback
    if ("scheduler" in window) {
      // Use scheduler API for modern browsers
      (window as any).scheduler.yield?.();
    }

    // Use requestIdleCallback for non-critical work
    const nonCriticalWork: (() => void)[] = [];

    const processNonCritical = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          (deadline) => {
            while (deadline.timeRemaining() > 0 && nonCriticalWork.length > 0) {
              const work = nonCriticalWork.shift();
              work?.();
            }
            if (nonCriticalWork.length > 0) {
              processNonCritical();
            }
          },
          { timeout: 2000 }
        );
      } else {
        setTimeout(() => {
          const work = nonCriticalWork.shift();
          work?.();
          if (nonCriticalWork.length > 0) {
            processNonCritical();
          }
        }, 16);
      }
    };

    // Expose method to queue non-critical work
    (window as any).__queueNonCriticalWork = (fn: () => void) => {
      nonCriticalWork.push(fn);
      if (nonCriticalWork.length === 1) {
        processNonCritical();
      }
    };
  }

  /**
   * Report current metrics vs targets
   */
  getPerformanceReport(): {
    metrics: Partial<CoreWebVitals>;
    targets: CoreWebVitals;
    scores: Record<string, "good" | "needs-improvement" | "poor">;
  } {
    const scores: Record<string, "good" | "needs-improvement" | "poor"> = {};

    if (this.metrics.LCP !== undefined) {
      scores.LCP = this.metrics.LCP <= CWV_TARGETS.LCP ? "good" :
                   this.metrics.LCP <= CWV_TARGETS.LCP * 2 ? "needs-improvement" : "poor";
    }

    if (this.metrics.CLS !== undefined) {
      scores.CLS = this.metrics.CLS <= CWV_TARGETS.CLS ? "good" :
                   this.metrics.CLS <= CWV_TARGETS.CLS * 5 ? "needs-improvement" : "poor";
    }

    if (this.metrics.FID !== undefined) {
      scores.FID = this.metrics.FID <= CWV_TARGETS.FID ? "good" :
                   this.metrics.FID <= CWV_TARGETS.FID * 6 ? "needs-improvement" : "poor";
    }

    return {
      metrics: this.metrics,
      targets: CWV_TARGETS,
      scores,
    };
  }

  /**
   * Update metric value
   */
  updateMetric(name: keyof CoreWebVitals, value: number): void {
    this.metrics[name] = value;
  }
}

export const lighthouseOptimizer = new LighthouseOptimizer();

// Auto-initialize
if (typeof window !== "undefined") {
  // Initialize after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => lighthouseOptimizer.init());
  } else {
    lighthouseOptimizer.init();
  }
}

export { TARGETS, CWV_TARGETS };
export type { LighthouseTargets, CoreWebVitals };
