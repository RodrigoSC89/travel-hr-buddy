/**
 * Critical Path Optimizer
 * Optimizes loading sequence for fastest time to interactive
 * PATCH: Performance Optimization for 2Mb connections
 */

import { logger } from '@/lib/logger';

// Resource types and their priorities
type ResourceType = 'script' | 'style' | 'image' | 'font' | 'data' | 'prefetch';

interface Resource {
  url: string;
  type: ResourceType;
  priority: 'critical' | 'high' | 'low' | 'idle';
  loaded?: boolean;
}

// Critical path resources (must load first)
const CRITICAL_RESOURCES: Resource[] = [
  // Critical CSS inlined in HTML, so no need here
];

// Deferred resources (load after interactive)
const DEFERRED_RESOURCES: Resource[] = [];

/**
 * Preload a critical resource
 */
export const preloadResource = (
  url: string,
  type: 'script' | 'style' | 'font' | 'image'
): HTMLLinkElement => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'font':
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
    case 'image':
      link.as = 'image';
      break;
  }
  
  document.head.appendChild(link);
  return link;
};

/**
 * Prefetch a resource for later use
 */
export const prefetchResource = (url: string): HTMLLinkElement => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
  return link;
};

/**
 * Preconnect to a domain
 */
export const preconnect = (origin: string, crossOrigin = false): void => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
};

/**
 * DNS prefetch for a domain
 */
export const dnsPrefetch = (origin: string): void => {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = origin;
  document.head.appendChild(link);
};

/**
 * Load script dynamically with priority
 */
export const loadScript = (
  url: string,
  async = true,
  defer = false
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = async;
    script.defer = defer;
    
    script.onload = () => {
      logger.debug(`[CriticalPath] Script loaded: ${url}`);
      resolve();
    };
    
    script.onerror = () => {
      logger.error(`[CriticalPath] Script failed: ${url}`);
      reject(new Error(`Failed to load script: ${url}`));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Lazy load images when visible
 */
export const setupLazyImages = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
              logger.debug(`[CriticalPath] Lazy loaded image: ${src}`);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before visible
        threshold: 0.01,
      }
    );

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('img[data-src]').forEach((img) => {
      const imgEl = img as HTMLImageElement;
      if (imgEl.dataset.src) {
        imgEl.src = imgEl.dataset.src;
        imgEl.removeAttribute('data-src');
      }
    });
  }
};

/**
 * Defer non-critical work using requestIdleCallback
 */
export const deferWork = (
  callback: () => void,
  timeout = 2000
): void => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 100);
  }
};

/**
 * Schedule work for when browser is idle
 */
export const scheduleIdleWork = <T>(
  tasks: Array<() => T>,
  onComplete?: (results: T[]) => void
): void => {
  const results: T[] = [];
  let index = 0;

  const processNext = (deadline: IdleDeadline): void => {
    while (index < tasks.length && deadline.timeRemaining() > 0) {
      results.push(tasks[index]());
      index++;
    }

    if (index < tasks.length) {
      (window as any).requestIdleCallback(processNext);
    } else if (onComplete) {
      onComplete(results);
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(processNext);
  } else {
    // Fallback: execute all synchronously
    tasks.forEach((task) => results.push(task()));
    if (onComplete) onComplete(results);
  }
};

/**
 * Optimize route prefetching based on user behavior
 */
export const setupSmartPrefetch = (routes: string[]): void => {
  // Only prefetch on fast connections
  const conn = (navigator as any).connection;
  if (conn && (conn.saveData || conn.effectiveType === '2g')) {
    logger.info('[CriticalPath] Skipping prefetch on slow connection');
    return;
  }

  // Prefetch after page load
  deferWork(() => {
    routes.forEach((route) => {
      prefetchResource(route);
    });
    logger.info(`[CriticalPath] Prefetched ${routes.length} routes`);
  }, 3000);
};

/**
 * Initialize critical path optimizations
 */
export const initCriticalPathOptimizer = (): void => {
  // Preconnect to critical origins
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    preconnect(supabaseUrl, true);
  }
  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com', true);

  // Setup lazy loading after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLazyImages);
  } else {
    setupLazyImages();
  }

  // Defer non-critical analytics/tracking
  deferWork(() => {
    // Initialize analytics, error tracking, etc.
    logger.debug('[CriticalPath] Deferred work initialized');
  }, 5000);

  logger.info('[CriticalPath] Optimizer initialized');
};

/**
 * Measure and report critical path metrics
 */
export const measureCriticalPath = (): void => {
  if (!('performance' in window)) return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        logger.info(`[CriticalPath] LCP: ${entry.startTime.toFixed(0)}ms`);
      }
      if (entry.entryType === 'first-input') {
        const fidEntry = entry as PerformanceEventTiming;
        logger.info(`[CriticalPath] FID: ${fidEntry.processingStart - fidEntry.startTime}ms`);
      }
    });
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // Some browsers don't support these entry types
  }

  // Log navigation timing
  window.addEventListener('load', () => {
    deferWork(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (timing) {
        logger.info('[CriticalPath] Navigation Timing:', {
          dns: (timing.domainLookupEnd - timing.domainLookupStart).toFixed(0),
          tcp: (timing.connectEnd - timing.connectStart).toFixed(0),
          ttfb: timing.responseStart.toFixed(0),
          domInteractive: timing.domInteractive.toFixed(0),
          domComplete: timing.domComplete.toFixed(0),
          loadComplete: timing.loadEventEnd.toFixed(0),
        });
      }
    });
  });
};
