/**
 * Performance Initialization
 * Sets up all performance optimizations on app start
 */

import { memoryManager } from './memory-manager';
import { resourceHints } from './resource-hints';

/**
 * Initialize performance optimizations
 */
export function initializePerformance() {
  if (typeof window === 'undefined') return;

  console.log('[Performance] Initializing optimizations...');

  // 1. Start memory monitoring
  memoryManager.startMonitoring(30000); // Check every 30s

  // 2. Setup resource hints
  try {
    resourceHints.initializeCommonHints();
    
    // Preconnect to Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      resourceHints.preconnect(supabaseUrl);
    }
  } catch (e) {
    console.warn('[Performance] Resource hints setup failed:', e);
  }

  // 3. Register Service Worker
  registerServiceWorker();

  // 4. Setup performance observer
  setupPerformanceObserver();

  // 5. Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    memoryManager.stopMonitoring();
  });

  console.log('[Performance] Initialization complete');
}

/**
 * Register Service Worker for offline support
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[Performance] Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('[Performance] Service Worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[Performance] New Service Worker available');
            // Notify user about update
            dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    // Handle messages from Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        console.log('[Performance] Background sync complete');
        dispatchEvent(new CustomEvent('sync-complete', { detail: event.data }));
      }
    });

  } catch (error) {
    console.warn('[Performance] Service Worker registration failed:', error);
  }
}

/**
 * Setup Performance Observer for metrics
 */
function setupPerformanceObserver() {
  if (!('PerformanceObserver' in window)) return;

  try {
    // Observe LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[Performance] LCP:', lastEntry.startTime.toFixed(0), 'ms');
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // Observe FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('[Performance] FID:', entry.processingStart - entry.startTime, 'ms');
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Observe CLS
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Report CLS on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('[Performance] CLS:', clsScore.toFixed(4));
      }
    });

  } catch (e) {
    console.warn('[Performance] Performance observer setup failed:', e);
  }
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
