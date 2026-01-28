/**
 * Ultra Performance Init - PROMPT 1 & 2
 * Complete performance optimization system
 */

import { logger } from "@/lib/logger";

// Performance metrics
interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  loadTime: number;
}

class UltraPerformanceSystem {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private initialized = false;

  /**
   * Initialize performance monitoring and optimizations
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Resource Hints
    this.injectResourceHints();
    
    // 2. Critical CSS inline
    this.optimizeCriticalPath();
    
    // 3. Image lazy loading
    this.setupImageObserver();
    
    // 4. Web Vitals monitoring
    this.setupWebVitals();
    
    // 5. Memory optimization
    this.setupMemoryOptimization();
    
    // 6. Connection-aware optimizations
    this.setupConnectionAware();
    
    // 7. Prefetch critical routes
    this.prefetchCriticalRoutes();

    logger.info("Ultra Performance System initialized");
  }

  /**
   * Inject resource hints for critical assets
   */
  private injectResourceHints(): void {
    const hints = [
      // Preconnect to critical origins
      { rel: "preconnect", href: "https://vnbptmixvwropvanyhdb.supabase.co" },
      { rel: "dns-prefetch", href: "https://vnbptmixvwropvanyhdb.supabase.co" },
      // Preload critical fonts
      { rel: "preload", href: "/fonts/inter-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    ];

    hints.forEach(hint => {
      if (!document.querySelector(`link[href="${hint.href}"]`)) {
        const link = document.createElement("link");
        Object.entries(hint).forEach(([key, value]) => {
          if (value) link.setAttribute(key, value);
        });
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Optimize critical rendering path
   */
  private optimizeCriticalPath(): void {
    // Add loading optimization CSS
    const style = document.createElement("style");
    style.id = "critical-performance-css";
    style.textContent = `
      /* Prevent layout shift */
      img, video, iframe { aspect-ratio: attr(width) / attr(height); }
      
      /* Smooth font loading */
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      
      /* GPU acceleration for animations */
      .animate-spin, .animate-pulse, [data-animate] {
        will-change: transform;
        transform: translateZ(0);
      }
      
      /* Reduce motion for users who prefer it */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    
    if (!document.getElementById("critical-performance-css")) {
      document.head.insertBefore(style, document.head.firstChild);
    }
  }

  /**
   * Setup intersection observer for image lazy loading
   */
  private setupImageObserver(): void {
    if (!("IntersectionObserver" in window)) return;

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      },
      { rootMargin: "100px" }
    );

    // Observe all images with data-src
    document.querySelectorAll("img[data-src]").forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitals(): void {
    // First Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          this.metrics.fcp = entry.startTime;
          logger.debug(`FCP: ${entry.startTime.toFixed(2)}ms`);
        }
      }
    });
    
    try {
      paintObserver.observe({ entryTypes: ["paint"] });
      this.observers.push(paintObserver);
    } catch {}

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      logger.debug(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    });
    
    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.push(lcpObserver);
    } catch {}

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0] as PerformanceEventTiming;
      this.metrics.fid = firstInput.processingStart - firstInput.startTime;
      logger.debug(`FID: ${this.metrics.fid.toFixed(2)}ms`);
    });
    
    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
      this.observers.push(fidObserver);
    } catch {}

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const layoutShift = entry as unknown as { hadRecentInput: boolean; value: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
          this.metrics.cls = clsValue;
        }
      }
    });
    
    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
      this.observers.push(clsObserver);
    } catch {}

    // TTFB
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry) {
      this.metrics.ttfb = navEntry.responseStart;
      this.metrics.loadTime = navEntry.loadEventEnd - navEntry.startTime;
    }
  }

  /**
   * Setup memory optimization
   */
  private setupMemoryOptimization(): void {
    // Cleanup when page hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.performMemoryCleanup();
      }
    });

    // Periodic cleanup for long sessions
    setInterval(() => {
      if (this.isHighMemoryUsage()) {
        this.performMemoryCleanup();
      }
    }, 60000); // Every minute
  }

  private isHighMemoryUsage(): boolean {
    const perf = performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };
    if (perf.memory) {
      return perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit > 0.7;
    }
    return false;
  }

  private performMemoryCleanup(): void {
    // Clear image caches
    const images = document.querySelectorAll("img");
    images.forEach(img => {
      if (!img.getBoundingClientRect().top) {
        img.src = "";
      }
    });

    // Suggest GC
    if (typeof window !== "undefined" && "gc" in window) {
      try {
        (window as unknown as { gc: () => void }).gc();
      } catch {}
    }
  }

  /**
   * Setup connection-aware optimizations
   */
  private setupConnectionAware(): void {
    interface NetworkInformation {
      effectiveType: string;
      saveData: boolean;
      addEventListener?: (type: string, listener: () => void) => void;
    }
    
    const nav = navigator as Navigator & { connection?: NetworkInformation };
    const connection = nav.connection;
    
    if (connection) {
      const updateForConnection = () => {
        const effectiveType = connection.effectiveType;
        const saveData = connection.saveData;

        document.documentElement.dataset.connectionType = effectiveType;
        document.documentElement.dataset.saveData = String(saveData);

        // Disable animations on slow connections
        if (effectiveType === "slow-2g" || effectiveType === "2g" || saveData) {
          document.documentElement.classList.add("reduce-motion");
        } else {
          document.documentElement.classList.remove("reduce-motion");
        }
      };

      updateForConnection();
      if (connection.addEventListener) {
        connection.addEventListener("change", updateForConnection);
      }
    }
  }

  /**
   * Prefetch critical routes
   */
  private prefetchCriticalRoutes(): void {
    const criticalRoutes = [
      "/central-comando",
      "/fleet-command",
      "/maintenance-command",
    ];

    // Use requestIdleCallback to prefetch when browser is idle
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        criticalRoutes.forEach(route => {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = route;
          document.head.appendChild(link);
        });
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get performance score (0-100)
   */
  getScore(): number {
    const { fcp, lcp, fid, cls, ttfb } = this.metrics;
    let score = 100;

    // FCP scoring (good < 1800ms)
    if (fcp) {
      if (fcp > 3000) score -= 20;
      else if (fcp > 1800) score -= 10;
    }

    // LCP scoring (good < 2500ms)
    if (lcp) {
      if (lcp > 4000) score -= 25;
      else if (lcp > 2500) score -= 15;
    }

    // FID scoring (good < 100ms)
    if (fid) {
      if (fid > 300) score -= 20;
      else if (fid > 100) score -= 10;
    }

    // CLS scoring (good < 0.1)
    if (cls) {
      if (cls > 0.25) score -= 20;
      else if (cls > 0.1) score -= 10;
    }

    // TTFB scoring (good < 800ms)
    if (ttfb) {
      if (ttfb > 1800) score -= 15;
      else if (ttfb > 800) score -= 5;
    }

    return Math.max(0, score);
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.initialized = false;
  }
}

export const ultraPerformance = new UltraPerformanceSystem();
