/**
 * Lighthouse Performance Configuration
 * Target: Lighthouse score > 90
 */

export const performanceThresholds = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint < 2.5s
  FID: 100,  // First Input Delay < 100ms
  CLS: 0.1,  // Cumulative Layout Shift < 0.1
  
  // Additional metrics
  FCP: 1800, // First Contentful Paint < 1.8s
  TTI: 3800, // Time to Interactive < 3.8s
  TBT: 200,  // Total Blocking Time < 200ms
  
  // Lighthouse scores target
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 90,
};

export const lazyLoadingConfig = {
  // Route-based code splitting is already in place via lazy()
  imageThreshold: '200px', // Start loading images 200px before viewport
  componentThreshold: 0.1, // 10% intersection triggers load
};

export const cachingStrategy = {
  // Static assets: Cache for 1 year
  staticAssets: {
    maxAge: 31536000, // 1 year in seconds
    staleWhileRevalidate: 86400, // 1 day
  },
  
  // API responses: Cache for 5 minutes
  apiResponses: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60, // 1 minute
  },
  
  // Dynamic content: No cache
  dynamicContent: {
    maxAge: 0,
    mustRevalidate: true,
  },
};

export const preloadConfig = {
  // Critical routes to prefetch
  criticalRoutes: [
    '/central-comando/visao-geral',
    '/dashboard',
    '/billing',
  ],
  
  // Critical assets
  criticalAssets: [
    '/fonts/inter-var.woff2',
  ],
};

/**
 * Performance monitoring utilities
 */
export function measureCoreWebVitals(callback: (metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}) => void) {
  if (typeof window === 'undefined') return;

  // LCP Observer
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    const value = lastEntry.startTime;
    callback({
      name: 'LCP',
      value,
      rating: value <= performanceThresholds.LCP ? 'good' : 
              value <= performanceThresholds.LCP * 1.5 ? 'needs-improvement' : 'poor',
    });
  });
  
  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP observer not supported');
  }

  // FID Observer
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      const value = entry.processingStart - entry.startTime;
      callback({
        name: 'FID',
        value,
        rating: value <= performanceThresholds.FID ? 'good' :
                value <= performanceThresholds.FID * 3 ? 'needs-improvement' : 'poor',
      });
    });
  });
  
  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID observer not supported');
  }

  // CLS Observer
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    callback({
      name: 'CLS',
      value: clsValue,
      rating: clsValue <= performanceThresholds.CLS ? 'good' :
              clsValue <= performanceThresholds.CLS * 2.5 ? 'needs-improvement' : 'poor',
    });
  });
  
  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS observer not supported');
  }
}

export function reportWebVitalsToAnalytics(metric: { name: string; value: number }) {
  // Send to analytics (can be extended for PostHog, Sentry, etc.)
  if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
    const body = JSON.stringify({
      metric: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      page: window.location.pathname,
      timestamp: Date.now(),
    });
    
    // Beacon to analytics endpoint (if configured)
    // navigator.sendBeacon('/api/analytics/vitals', body);
    console.log('[WebVitals]', metric.name, metric.value);
  }
}
