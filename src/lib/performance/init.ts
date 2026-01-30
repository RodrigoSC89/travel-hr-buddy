/**
 * Performance Initialization - Enhanced
 * Sets up all performance optimizations for 2Mbps networks
 */

import { memoryManager } from './memory-manager';
import { resourceHints } from './resource-hints';
import { bandwidthOptimizer } from './low-bandwidth-optimizer';
import { Logger } from "@/lib/utils/logger";

let isInitialized = false;
let startTime = 0;
const milestones: Map<string, number> = new Map();

/**
 * Initialize performance optimizations
 */
export function initializePerformance() {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  
  isInitialized = true;
  startTime = performance.now();
  recordMilestone('init-start');

  Logger.info("Initializing performance optimizations", undefined, "PerfInit");

  // 1. Bandwidth optimizer first (critical for slow networks)
  bandwidthOptimizer.init();
  recordMilestone('bandwidth-init');

  // 2. Apply critical CSS optimizations
  applyCriticalOptimizations();
  recordMilestone('critical-css');

  // 3. Memory monitoring (light)
  memoryManager.startMonitoring(60000); // 60s for lower overhead

  // 4. Resource hints
  try {
    resourceHints.initializeCommonHints();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      resourceHints.preconnect(supabaseUrl);
    }
  } catch (e) {
    Logger.warn("Resource hints setup failed", { error: e }, "PerfInit");
  }

  // 5. Register Service Worker (async)
  registerServiceWorker();

  // 6. Setup performance observer
  setupPerformanceObserver();

  // 7. Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    memoryManager.stopMonitoring();
  });

  recordMilestone('init-complete');
  Logger.info(`Performance init complete in ${(performance.now() - startTime).toFixed(2)}ms`, undefined, "PerfInit");
}

/**
 * Apply critical CSS optimizations
 */
function applyCriticalOptimizations() {
  document.documentElement.classList.add('perf-optimized');

  // Check for existing style
  if (document.getElementById('critical-perf-styles')) return;

  const style = document.createElement('style');
  style.id = 'critical-perf-styles';
  style.textContent = `
    .perf-optimized {
      text-rendering: optimizeSpeed;
      -webkit-font-smoothing: antialiased;
    }
    
    .low-bandwidth .shadow-lg,
    .low-bandwidth .shadow-xl {
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }
    
    .low-bandwidth [class*="gradient"] {
      background-image: none !important;
    }
    
    .skeleton-loading {
      background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--muted)) 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }
    
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    .content-hidden {
      content-visibility: auto;
      contain-intrinsic-size: 0 300px;
    }
  `;
  document.head.appendChild(style);
}

function recordMilestone(name: string) {
  milestones.set(name, performance.now() - startTime);
}

/**
 * Register Service Worker for offline support
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        dispatchEvent(new CustomEvent('sync-complete', { detail: event.data }));
      }
    });

  } catch (error) {
    Logger.warn("Service Worker registration failed", { error }, "PerfInit");
  }
}

/**
 * Setup Performance Observer for metrics
 */
function setupPerformanceObserver() {
  if (!('PerformanceObserver' in window)) return;

  try {
    // LCP Observer
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      recordMilestone(`lcp-${lastEntry.startTime.toFixed(0)}`);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS Observer
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

  } catch (e) {
    // Ignore observer errors
  }
}

/**
 * Stop performance monitoring
 */
export function stopPerformance() {
  memoryManager.stopMonitoring();
  isInitialized = false;
  Logger.info("Performance monitoring stopped", undefined, "PerfInit");
}

/**
 * Get performance report
 */
export function getPerformanceReport() {
  return {
    milestones: Object.fromEntries(milestones),
    loadTime: performance.now() - startTime,
    bandwidth: bandwidthOptimizer.getConfig(),
    connectionType: bandwidthOptimizer.getConnectionType(),
    memory: (performance as any).memory?.usedJSHeapSize || 0,
  };
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallbackPolyfill(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, options);
  }
  return setTimeout(() => callback({ 
    didTimeout: true, 
    timeRemaining: () => 0 
  }), options?.timeout || 1) as unknown as number;
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallbackPolyfill(id: number) {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}
