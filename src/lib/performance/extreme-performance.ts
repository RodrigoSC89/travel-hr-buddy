/**
 * Extreme Performance Module - Lighthouse 100 Target
 * PATCH APEX v1.0 - Maximum Performance Optimization
 */

import { Logger } from "@/lib/utils/logger";

/**
 * Critical CSS that must be loaded inline for FCP < 1s
 */
const CRITICAL_CSS = `
.skeleton-ultra{background:linear-gradient(90deg,hsl(var(--muted)) 0%,hsl(var(--muted-foreground)/0.15) 50%,hsl(var(--muted)) 100%);background-size:400% 100%;animation:skeleton-wave 1.2s ease-in-out infinite}
@keyframes skeleton-wave{0%{background-position:200% 0}100%{background-position:-200% 0}}
.fade-in{animation:fadeIn 0.15s ease-out}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.instant-visible{opacity:1!important;visibility:visible!important}
.gpu-accelerated{transform:translateZ(0);will-change:transform}
.contain-paint{contain:paint}
.contain-layout{contain:layout}
.contain-strict{contain:strict}
.scroll-smooth{scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
`;

/**
 * Performance configuration for different network conditions
 */
export const PERFORMANCE_TIERS = {
  satellite: { // < 1 Mbps
    imageQuality: 30,
    disableAnimations: true,
    disableBlur: true,
    disableShadows: true,
    prefetchCount: 0,
    batchSize: 5,
    cacheMaxAge: 3600000, // 1 hour
  },
  slow: { // 1-2 Mbps
    imageQuality: 50,
    disableAnimations: true,
    disableBlur: true,
    disableShadows: false,
    prefetchCount: 1,
    batchSize: 10,
    cacheMaxAge: 1800000, // 30 min
  },
  medium: { // 2-10 Mbps
    imageQuality: 70,
    disableAnimations: false,
    disableBlur: false,
    disableShadows: false,
    prefetchCount: 3,
    batchSize: 20,
    cacheMaxAge: 600000, // 10 min
  },
  fast: { // > 10 Mbps
    imageQuality: 90,
    disableAnimations: false,
    disableBlur: false,
    disableShadows: false,
    prefetchCount: 5,
    batchSize: 50,
    cacheMaxAge: 300000, // 5 min
  },
} as const;

type PerformanceTier = keyof typeof PERFORMANCE_TIERS;

let currentTier: PerformanceTier = 'medium';
let isInitialized = false;

/**
 * Detect network conditions and set performance tier
 */
export function detectNetworkTier(): PerformanceTier {
  if (typeof navigator === 'undefined') return 'medium';
  
  const connection = (navigator as any).connection;
  if (!connection) return 'medium';
  
  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink || 10;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
    return 'satellite';
  } else if (effectiveType === '3g' || downlink < 2) {
    return 'slow';
  } else if (effectiveType === '4g' && downlink < 10) {
    return 'medium';
  }
  
  return 'fast';
}

/**
 * Get current performance configuration
 */
export function getPerformanceConfig() {
  return PERFORMANCE_TIERS[currentTier];
}

/**
 * Initialize extreme performance optimizations
 */
export function initExtremePerformance() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;
  
  const startTime = performance.now();
  currentTier = detectNetworkTier();
  
  Logger.info(`[ExtremePerf] Initializing - Tier: ${currentTier}`, undefined, "Performance");
  
  // 1. Inject critical CSS immediately
  injectCriticalCSS();
  
  // 2. Apply performance tier optimizations
  applyTierOptimizations();
  
  // 3. Setup intersection observer for lazy loading
  setupLazyLoading();
  
  // 4. Monitor network changes
  monitorNetworkChanges();
  
  // 5. Optimize images on the page
  optimizeExistingImages();
  
  // 6. Setup performance budget monitoring
  setupPerformanceBudget();
  
  Logger.info(`[ExtremePerf] Initialized in ${(performance.now() - startTime).toFixed(2)}ms`, undefined, "Performance");
}

/**
 * Inject critical CSS for instant rendering
 */
function injectCriticalCSS() {
  if (document.getElementById('extreme-perf-css')) return;
  
  const style = document.createElement('style');
  style.id = 'extreme-perf-css';
  style.textContent = CRITICAL_CSS;
  document.head.insertBefore(style, document.head.firstChild);
}

/**
 * Apply performance tier specific optimizations
 */
function applyTierOptimizations() {
  const config = PERFORMANCE_TIERS[currentTier];
  const root = document.documentElement;
  
  // Apply CSS classes based on tier
  root.classList.toggle('low-bandwidth', currentTier === 'satellite' || currentTier === 'slow');
  root.classList.toggle('no-animations', config.disableAnimations);
  root.classList.toggle('no-blur', config.disableBlur);
  root.classList.toggle('no-shadows', config.disableShadows);
  
  // Set CSS variables for dynamic adjustments
  root.style.setProperty('--animation-duration', config.disableAnimations ? '0ms' : '200ms');
  root.style.setProperty('--transition-duration', config.disableAnimations ? '0ms' : '150ms');
  root.style.setProperty('--blur-radius', config.disableBlur ? '0px' : '8px');
  root.style.setProperty('--shadow-opacity', config.disableShadows ? '0' : '1');
}

/**
 * Setup intersection observer for efficient lazy loading
 */
function setupLazyLoading() {
  if (!('IntersectionObserver' in window)) return;
  
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('fade-in');
          }
          imageObserver.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );
  
  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
  
  // Setup mutation observer for dynamically added images
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement && node.dataset.src) {
          imageObserver.observe(node);
        }
        if (node instanceof Element) {
          node.querySelectorAll('img[data-src]').forEach((img) => {
            imageObserver.observe(img);
          });
        }
      });
    });
  });
  
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

/**
 * Monitor network changes and adapt performance
 */
function monitorNetworkChanges() {
  const connection = (navigator as any).connection;
  if (!connection) return;
  
  const handleChange = () => {
    const newTier = detectNetworkTier();
    if (newTier !== currentTier) {
      Logger.info(`[ExtremePerf] Network changed: ${currentTier} -> ${newTier}`, undefined, "Performance");
      currentTier = newTier;
      applyTierOptimizations();
    }
  };
  
  connection.addEventListener('change', handleChange);
}

/**
 * Optimize existing images on the page
 */
function optimizeExistingImages() {
  const config = PERFORMANCE_TIERS[currentTier];
  
  document.querySelectorAll('img').forEach((img) => {
    // Add loading="lazy" if not already set
    if (!img.loading) {
      img.loading = 'lazy';
    }
    
    // Add decoding="async" for non-LCP images
    if (!img.decoding) {
      img.decoding = 'async';
    }
    
    // Apply contain for layout stability
    if (!img.style.contain) {
      img.style.contain = 'layout';
    }
  });
}

/**
 * Setup performance budget monitoring
 */
function setupPerformanceBudget() {
  if (!('PerformanceObserver' in window)) return;
  
  // Monitor Long Tasks
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          Logger.warn(`[ExtremePerf] Long task detected: ${entry.duration.toFixed(2)}ms`, undefined, "Performance");
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch {
    // Long task observer not supported
  }
  
  // Monitor LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      const lcpTime = lastEntry.renderTime || lastEntry.loadTime;
      
      if (lcpTime > 2500) {
        Logger.warn(`[ExtremePerf] LCP exceeds budget: ${lcpTime.toFixed(2)}ms`, undefined, "Performance");
      } else {
        Logger.info(`[ExtremePerf] LCP: ${lcpTime.toFixed(2)}ms ✓`, undefined, "Performance");
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // LCP observer not supported
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(urls: string[]) {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (/\.(png|jpg|jpeg|webp|avif|gif)$/i.test(url)) {
      link.as = 'image';
    } else if (/\.(woff2?|ttf|otf)$/i.test(url)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Defer non-critical JavaScript
 */
export function deferNonCritical(callback: () => void, priority: 'idle' | 'low' | 'high' = 'idle') {
  if (priority === 'high') {
    requestAnimationFrame(callback);
  } else if (priority === 'low') {
    setTimeout(callback, 0);
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 5000 });
  } else {
    setTimeout(callback, 100);
  }
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    tier: currentTier,
    config: PERFORMANCE_TIERS[currentTier],
    metrics: {
      dnsLookup: navigation ? navigation.domainLookupEnd - navigation.domainLookupStart : 0,
      tcpConnect: navigation ? navigation.connectEnd - navigation.connectStart : 0,
      ttfb: navigation ? navigation.responseStart - navigation.requestStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.startTime : 0,
      domComplete: navigation ? navigation.domComplete - navigation.startTime : 0,
      fcp: paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
      fp: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
    },
  };
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  // Initialize as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtremePerformance, { once: true });
  } else {
    initExtremePerformance();
  }
}
