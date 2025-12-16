/**
 * Smart Prefetch System
 * Intelligent route and data prefetching based on user behavior
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Route prediction based on navigation patterns
interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  lastVisit: number;
}

const STORAGE_KEY = 'nav_patterns';
const MAX_PATTERNS = 50;
const PATTERN_DECAY_DAYS = 30;

class SmartPrefetchManager {
  private patterns: NavigationPattern[] = [];
  private prefetchedRoutes = new Set<string>();
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.loadPatterns();
    this.setupLinkObserver();
  }

  private loadPatterns() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.patterns = JSON.parse(stored);
        this.cleanOldPatterns();
      }
    } catch {
      this.patterns = [];
    }
  }

  private savePatterns() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.patterns.slice(0, MAX_PATTERNS)));
    } catch {
      // Storage full or unavailable
    }
  }

  private cleanOldPatterns() {
    const cutoff = Date.now() - PATTERN_DECAY_DAYS * 24 * 60 * 60 * 1000;
    this.patterns = this.patterns.filter(p => p.lastVisit > cutoff);
  }

  recordNavigation(from: string, to: string) {
    const existing = this.patterns.find(p => p.from === from && p.to === to);
    
    if (existing) {
      existing.count++;
      existing.lastVisit = Date.now();
    } else {
      this.patterns.push({
        from,
        to,
        count: 1,
        lastVisit: Date.now()
      });
    }

    // Sort by frequency
    this.patterns.sort((a, b) => b.count - a.count);
    this.savePatterns();
  }

  getPredictedRoutes(currentRoute: string, limit: number = 3): string[] {
    return this.patterns
      .filter(p => p.from === currentRoute)
      .slice(0, limit)
      .map(p => p.to);
  }

  prefetchRoute(route: string) {
    if (this.prefetchedRoutes.has(route)) return;
    
    // Don't prefetch on slow connections
    const connection = (navigator as any).connection;
    if (connection?.saveData || connection?.effectiveType === '2g') {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.as = 'document';
    document.head.appendChild(link);
    
    this.prefetchedRoutes.add(route);
  }

  private setupLinkObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute('href');
            if (href && href.startsWith('/')) {
              this.prefetchRoute(href);
            }
          }
        });
      },
      { rootMargin: '200px' }
    );
  }

  observeLink(element: HTMLAnchorElement) {
    this.observer?.observe(element);
  }

  unobserveLink(element: HTMLAnchorElement) {
    this.observer?.unobserve(element);
  }

  // Prefetch data for anticipated routes
  prefetchData(
    route: string,
    fetcher: () => Promise<unknown>,
    cacheKey: string
  ) {
    const cached = sessionStorage.getItem(`prefetch:${cacheKey}`);
    if (cached) return;

    // Use requestIdleCallback for non-blocking prefetch
    const callback = async () => {
      try {
        const data = await fetcher();
        sessionStorage.setItem(
          `prefetch:${cacheKey}`,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch {
        // Silent fail for prefetch
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  }

  getPrefetchedData<T>(cacheKey: string, maxAge: number = 60000): T | null {
    try {
      const cached = sessionStorage.getItem(`prefetch:${cacheKey}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        sessionStorage.removeItem(`prefetch:${cacheKey}`);
        return null;
      }

      return data as T;
    } catch {
      return null;
    }
  }
}

export const smartPrefetch = new SmartPrefetchManager();

/**
 * Hook for automatic prefetching based on current route
 */
export function useSmartPrefetch() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  // Record navigation patterns
  useEffect(() => {
    if (prevPath.current && prevPath.current !== location.pathname) {
      smartPrefetch.recordNavigation(prevPath.current, location.pathname);
    }
    prevPath.current = location.pathname;
  }, [location.pathname]);

  // Prefetch predicted routes
  useEffect(() => {
    const timer = setTimeout(() => {
      const predicted = smartPrefetch.getPredictedRoutes(location.pathname);
      predicted.forEach(route => smartPrefetch.prefetchRoute(route));
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const prefetchOnHover = useCallback((route: string) => ({
    onMouseEnter: () => smartPrefetch.prefetchRoute(route),
    onFocus: () => smartPrefetch.prefetchRoute(route)
  }), []);

  return {
    prefetchRoute: (route: string) => smartPrefetch.prefetchRoute(route),
    prefetchOnHover,
    prefetchData: smartPrefetch.prefetchData.bind(smartPrefetch),
    getPrefetchedData: smartPrefetch.getPrefetchedData.bind(smartPrefetch)
  };
}

/**
 * Hook for link-based prefetching on viewport intersection
 */
export function usePrefetchLink(ref: React.RefObject<HTMLAnchorElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    smartPrefetch.observeLink(element);
    return () => smartPrefetch.unobserveLink(element);
  }, [ref]);
}
