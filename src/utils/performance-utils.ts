/**
 * Performance Monitoring Utilities - PATCH 597
 * Runtime performance monitoring and optimization helpers
 */

// PATCH 597: Measure component render time
export function measureRender(componentName: string, callback: () => void): void {
  if (typeof performance === 'undefined' || import.meta.env.MODE !== 'development') {
    callback();
    return;
  }

  const start = performance.now();
  callback();
  const end = performance.now();
  
  const duration = end - start;
  
  if (duration > 16) { // Longer than one frame (60fps)
    console.warn(`⚠️ Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
  }
}

// PATCH 597: Debounce helper for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// PATCH 597: Throttle helper for continuous events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// PATCH 597: Lazy load images with intersection observer
export function lazyLoadImage(img: HTMLImageElement): void {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target as HTMLImageElement;
        if (image.dataset.src) {
          image.src = image.dataset.src;
          image.classList.add('loaded');
          observer.unobserve(image);
        }
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before entering viewport
    threshold: 0.01
  });

  observer.observe(img);
}

// PATCH 597: Memory usage monitoring
export function monitorMemory(): void {
  if (!('memory' in performance)) {
    console.warn('Memory monitoring not supported in this browser');
    return;
  }

  const memory = (performance as any).memory;
  const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
  const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
  const limitMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);
  
  console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
  
  // Warn if using more than 80% of available memory
  if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
    console.warn('⚠️ High memory usage detected!');
  }
}

// PATCH 597: FPS monitoring
export class FPSMonitor {
  private lastTime: number = performance.now();
  private frames: number = 0;
  private fps: number = 0;
  private rafId: number | null = null;

  start(): void {
    const measure = () => {
      const now = performance.now();
      this.frames++;
      
      if (now >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        this.frames = 0;
        this.lastTime = now;
        
        if (this.fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${this.fps}`);
        }
      }
      
      this.rafId = requestAnimationFrame(measure);
    };
    
    this.rafId = requestAnimationFrame(measure);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getFPS(): number {
    return this.fps;
  }
}

// PATCH 597: Long task detection
export function detectLongTasks(callback: (duration: number) => void): void {
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
          callback(entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // longtask might not be supported
    console.warn('Long task monitoring not supported');
  }
}

// PATCH 597: Web Vitals monitoring
export interface WebVitals {
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  LCP: number; // Largest Contentful Paint
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

export async function measureWebVitals(): Promise<Partial<WebVitals>> {
  const vitals: Partial<WebVitals> = {};

  if (typeof window === 'undefined') {
    return vitals;
  }

  try {
    const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import('web-vitals');

    onCLS((metric) => {
      vitals.CLS = metric.value;
      if (metric.value > 0.1) {
        console.warn(`⚠️ Poor CLS: ${metric.value.toFixed(3)}`);
      }
    });

    onFID((metric) => {
      vitals.FID = metric.value;
      if (metric.value > 100) {
        console.warn(`⚠️ Poor FID: ${metric.value.toFixed(0)}ms`);
      }
    });

    onLCP((metric) => {
      vitals.LCP = metric.value;
      if (metric.value > 2500) {
        console.warn(`⚠️ Poor LCP: ${metric.value.toFixed(0)}ms`);
      }
    });

    onFCP((metric) => {
      vitals.FCP = metric.value;
      if (metric.value > 1800) {
        console.warn(`⚠️ Poor FCP: ${metric.value.toFixed(0)}ms`);
      }
    });

    onTTFB((metric) => {
      vitals.TTFB = metric.value;
      if (metric.value > 600) {
        console.warn(`⚠️ Poor TTFB: ${metric.value.toFixed(0)}ms`);
      }
    });
  } catch (error) {
    console.warn('Web Vitals monitoring failed:', error);
  }

  return vitals;
}

// PATCH 597: Bundle analyzer helper
export function logBundleSize(): void {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  // Log script sizes
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  let totalSize = 0;

  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src) {
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;
          console.log(`📦 ${src}: ${(size / 1024).toFixed(2)}KB`);
        })
        .catch(() => {
          // Ignore errors for external scripts
        });
    }
  });

  setTimeout(() => {
    console.log(`📦 Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
  }, 1000);
}

// PATCH 597: React DevTools Profiler helper
export function createProfiler(id: string) {
  return {
    onRender: (
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      if (actualDuration > 16) {
        console.warn(
          `⚠️ Slow ${phase} in ${id}:`,
          `actual: ${actualDuration.toFixed(2)}ms,`,
          `base: ${baseDuration.toFixed(2)}ms`
        );
      }
    }
  };
}

// PATCH 597: Cleanup utility for effects
export function createCleanupTracker() {
  const cleanups = new Set<() => void>();

  return {
    add: (cleanup: () => void) => {
      cleanups.add(cleanup);
    },
    cleanup: () => {
      cleanups.forEach(fn => fn());
      cleanups.clear();
    }
  };
}

// PATCH 597: Image optimization helper
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality: number = 80
): string {
  // This would typically integrate with an image optimization service
  // For now, return the original URL
  // In production, you could use services like Cloudinary, imgix, etc.
  
  const url = new URL(src, window.location.origin);
  
  if (width) {
    url.searchParams.set('w', width.toString());
  }
  
  url.searchParams.set('q', quality.toString());
  url.searchParams.set('auto', 'format');
  
  return url.toString();
}

// PATCH 597: Preload critical resources
export function preloadCriticalResources(urls: string[]): void {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    // Determine resource type from URL
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.match(/\.(woff|woff2|ttf|otf)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      link.as = 'image';
    }
    
    link.href = url;
    document.head.appendChild(link);
  });
}

// Export all utilities
export default {
  measureRender,
  debounce,
  throttle,
  lazyLoadImage,
  monitorMemory,
  FPSMonitor,
  detectLongTasks,
  measureWebVitals,
  logBundleSize,
  createProfiler,
  createCleanupTracker,
  getOptimizedImageUrl,
  preloadCriticalResources
};
