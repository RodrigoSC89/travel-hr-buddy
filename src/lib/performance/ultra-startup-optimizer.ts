/**
 * Ultra Startup Optimizer v4.2
 * PATCH 867: Maximum performance for slow connections (2G/Satellite)
 * Consolidates all startup optimizations into a single initialization point
 */

import { logger } from "@/lib/logger";

interface StartupMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  tti: number;
  totalLoadTime: number;
  connectionType: string;
  memoryUsed: number;
}

class UltraStartupOptimizer {
  private isInitialized = false;
  private startTime = typeof performance !== 'undefined' ? performance.now() : 0;
  private metrics: Partial<StartupMetrics> = {};
  private criticalResourcesLoaded = false;

  /**
   * Initialize all startup optimizations
   * Call this as early as possible in the app lifecycle
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.metrics.connectionType = this.detectConnectionType();
    
    // Priority 1: Critical optimizations (blocking)
    this.applyImmediateOptimizations();
    
    // Priority 2: Non-blocking optimizations (async)
    this.scheduleNonBlockingOptimizations();
    
    // Priority 3: Background tasks (idle)
    this.scheduleIdleTasks();
    
    logger.info("UltraStartupOptimizer initialized", { 
      connectionType: this.metrics.connectionType 
    });
  }

  /**
   * Immediate optimizations that must run synchronously
   */
  private applyImmediateOptimizations(): void {
    // 1. Preconnect to critical origins
    this.addResourceHints();
    
    // 2. Apply low-bandwidth mode if needed
    this.applyBandwidthOptimizations();
    
    // 3. Disable animations for slow connections
    this.optimizeAnimations();
    
    // 4. Set optimal image loading strategy
    this.optimizeImageLoading();
  }

  /**
   * Non-blocking optimizations that can run async
   */
  private scheduleNonBlockingOptimizations(): void {
    // Use microtask to not block main thread
    queueMicrotask(() => {
      this.setupPerformanceObservers();
      this.prefetchCriticalRoutes();
    });
  }

  /**
   * Background tasks that run when browser is idle
   */
  private scheduleIdleTasks(): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.cleanupOldCaches();
        this.preloadSecondaryResources();
      }, { timeout: 5000 });
    }
  }

  /**
   * Detect connection type with fallback
   */
  private detectConnectionType(): string {
    const connection = (navigator as any).connection;
    
    if (connection) {
      // Check downlink speed (Mbps)
      if (connection.downlink !== undefined) {
        if (connection.downlink < 0.5) return 'slow-2g';
        if (connection.downlink < 2) return '2g';
        if (connection.downlink < 5) return '3g';
      }
      
      return connection.effectiveType || '4g';
    }
    
    return '4g'; // Default to 4G
  }

  /**
   * Add preconnect/prefetch hints for critical resources
   */
  private addResourceHints(): void {
    const hints = [
      { rel: 'preconnect', href: import.meta.env.VITE_SUPABASE_URL, crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://ai.gateway.lovable.dev' },
    ];

    hints.forEach(({ rel, href, crossOrigin }) => {
      if (!href || document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
      
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
    });
  }

  /**
   * Apply bandwidth-based optimizations
   */
  private applyBandwidthOptimizations(): void {
    const isLowBandwidth = ['2g', 'slow-2g'].includes(this.metrics.connectionType || '4g');
    
    if (isLowBandwidth) {
      document.documentElement.classList.add('low-bandwidth');
      document.documentElement.style.setProperty('--image-quality', '50');
      document.documentElement.style.setProperty('--prefetch-enabled', 'false');
    } else {
      document.documentElement.classList.remove('low-bandwidth');
      document.documentElement.style.setProperty('--image-quality', '85');
      document.documentElement.style.setProperty('--prefetch-enabled', 'true');
    }
  }

  /**
   * Optimize animations based on connection and user preferences
   */
  private optimizeAnimations(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowBandwidth = ['2g', 'slow-2g'].includes(this.metrics.connectionType || '4g');
    
    if (prefersReducedMotion || isLowBandwidth) {
      document.documentElement.classList.add('reduce-motion');
      document.documentElement.style.setProperty('--transition-duration', '0ms');
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    }
  }

  /**
   * Optimize image loading strategy
   */
  private optimizeImageLoading(): void {
    // Set global loading strategy based on connection
    const isLowBandwidth = ['2g', 'slow-2g'].includes(this.metrics.connectionType || '4g');
    
    // Add data attribute for CSS-based optimizations
    document.documentElement.dataset.imageLoading = isLowBandwidth ? 'lazy' : 'eager';
    
    // Configure intersection observer threshold
    document.documentElement.style.setProperty(
      '--lazy-threshold',
      isLowBandwidth ? '0px' : '200px'
    );
  }

  /**
   * Setup performance observers for metrics
   */
  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      // LCP Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // FCP Observer
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
          }
        });
      }).observe({ type: 'paint', buffered: true });

      // TTFB from navigation timing
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      }
    } catch {
      // Ignore observer errors on unsupported browsers
    }
  }

  /**
   * Prefetch critical routes for faster navigation
   */
  private prefetchCriticalRoutes(): void {
    if (this.metrics.connectionType === '2g' || this.metrics.connectionType === 'slow-2g') {
      return; // Skip prefetching on slow connections
    }

    const criticalRoutes = [
      '/central-comando',
      '/crew',
      '/fleet-command',
    ];

    criticalRoutes.forEach((route) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      link.as = 'document';
      document.head.appendChild(link);
    });
  }

  /**
   * Cleanup old caches during idle time
   */
  private async cleanupOldCaches(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      const currentVersion = 'v4.2';
      
      await Promise.all(
        cacheNames
          .filter(name => !name.includes(currentVersion))
          .map(name => caches.delete(name))
      );
    } catch {
      // Ignore cache cleanup errors
    }
  }

  /**
   * Preload secondary resources during idle time
   */
  private preloadSecondaryResources(): void {
    if (this.criticalResourcesLoaded) return;
    this.criticalResourcesLoaded = true;

    // Preload common icons/images that will be needed
    const resources = [
      '/favicon.ico',
    ];

    resources.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<StartupMetrics> {
    return {
      ...this.metrics,
      totalLoadTime: performance.now() - this.startTime,
      memoryUsed: (performance as any).memory?.usedJSHeapSize || 0,
    };
  }

  /**
   * Mark Time to Interactive
   */
  markTTI(): void {
    this.metrics.tti = performance.now() - this.startTime;
    logger.debug("TTI marked", { tti: `${this.metrics.tti?.toFixed(2)}ms` });
  }

  /**
   * Report metrics (call after page is fully loaded)
   */
  reportMetrics(): StartupMetrics {
    const metrics = this.getMetrics() as StartupMetrics;
    
    logger.info("Startup Performance Report", {
      ttfb: `${metrics.ttfb?.toFixed(2)}ms`,
      fcp: `${metrics.fcp?.toFixed(2)}ms`,
      lcp: `${metrics.lcp?.toFixed(2)}ms`,
      tti: `${metrics.tti?.toFixed(2)}ms`,
      total: `${metrics.totalLoadTime?.toFixed(2)}ms`,
      connection: metrics.connectionType,
      memory: `${(metrics.memoryUsed / 1024 / 1024).toFixed(2)}MB`,
    });

    return metrics;
  }
}

// Singleton instance
export const ultraStartupOptimizer = new UltraStartupOptimizer();

// Auto-initialize as early as possible
if (typeof window !== 'undefined') {
  ultraStartupOptimizer.init();
}

// Export hook for React components
export function useStartupMetrics() {
  return ultraStartupOptimizer.getMetrics();
}
