/**
 * Startup Optimizer
 * Ensures fastest possible initial load
 */

import { Logger } from "@/lib/utils/logger";

class StartupOptimizer {
  private startTime = performance.now();
  private milestones: Map<string, number> = new Map();
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.recordMilestone('init');
    this.optimizeInitialLoad();
    this.setupPerformanceObserver();
  }

  private optimizeInitialLoad() {
    // Defer non-critical resources
    this.deferNonCriticalCSS();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize images in viewport
    this.optimizeViewportImages();
    
    this.recordMilestone('optimizations-applied');
  }

  private deferNonCriticalCSS() {
    // Find all stylesheets that aren't critical
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach((link) => {
      const href = link.getAttribute('href') || '';
      // Keep critical styles, defer others
      if (!href.includes('index') && !href.includes('critical')) {
        link.setAttribute('media', 'print');
        link.setAttribute('onload', "this.media='all'");
      }
    });
  }

  private preloadCriticalResources() {
    // Preload Supabase connection
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      this.addPreconnect(supabaseUrl);
    }

    // Preload fonts
    this.addPreconnect('https://fonts.googleapis.com');
    this.addPreconnect('https://fonts.gstatic.com');
  }

  private addPreconnect(url: string) {
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  private optimizeViewportImages() {
    // Set loading="eager" for above-the-fold images
    requestIdleCallback(() => {
      const images = document.querySelectorAll('img[data-critical="true"]');
      images.forEach((img) => {
        img.setAttribute('loading', 'eager');
        img.setAttribute('decoding', 'sync');
      });
    }, { timeout: 100 });
  }

  private setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Observe LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMilestone('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // Observe FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMilestone('fcp', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch {
      // Ignore observer errors
    }
  }

  recordMilestone(name: string, time?: number) {
    const elapsed = time || (performance.now() - this.startTime);
    this.milestones.set(name, elapsed);
    
    if (import.meta.env.DEV) {
      Logger.debug(`Milestone: ${name}`, { elapsed: `${elapsed.toFixed(2)}ms` }, "StartupOptimizer");
    }
  }

  getMilestones(): Record<string, number> {
    return Object.fromEntries(this.milestones);
  }

  getLoadTime(): number {
    return performance.now() - this.startTime;
  }

  // Report to analytics
  reportMetrics() {
    const metrics = {
      totalLoadTime: this.getLoadTime(),
      milestones: this.getMilestones(),
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (performance as any).memory?.usedJSHeapSize || 0,
    };

    Logger.info("Startup metrics", metrics, "StartupOptimizer");
    return metrics;
  }
}

export const startupOptimizer = new StartupOptimizer();

// Initialize immediately
if (typeof window !== 'undefined') {
  startupOptimizer.init();
}

// Polyfill for requestIdleCallback
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  (window as any).requestIdleCallback = (cb: IdleRequestCallback, options?: IdleRequestOptions) => {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, options?.timeout || 1);
  };
}
