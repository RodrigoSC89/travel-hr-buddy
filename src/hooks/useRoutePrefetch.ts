/**
 * Route Prefetch Hook
 * Intelligent route prefetching based on user behavior and network
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePerformanceOptional } from '@/contexts/PerformanceContext';

interface PrefetchConfig {
  // Routes to prefetch when this route is visited
  [route: string]: string[];
}

// Define which routes to prefetch based on current route
const PREFETCH_CONFIG: PrefetchConfig = {
  '/': ['/dashboard', '/settings'],
  '/dashboard': ['/analytics', '/reports', '/missions'],
  '/missions': ['/missions/new', '/crew'],
  '/crew': ['/crew/new', '/hr'],
  '/hr': ['/hr/crew', '/hr/documents'],
  '/settings': ['/settings/profile', '/settings/security'],
};

// Routes that are commonly visited - always prefetch these after initial load
const COMMON_ROUTES = ['/dashboard', '/settings', '/notifications-center'];

export const useRoutePrefetch = () => {
  const location = useLocation();
  const performance = usePerformanceOptional();
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  // Prefetch a single route
  const prefetchRoute = useCallback((route: string) => {
    // Skip if already prefetched
    if (prefetchedRoutes.current.has(route)) return;
    
    // Skip if slow connection or offline
    if (performance?.isSlowConnection || performance?.isOffline) return;
    
    // Create prefetch link
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
    
    prefetchedRoutes.current.add(route);
  }, [performance?.isSlowConnection, performance?.isOffline]);

  // Prefetch routes based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const routesToPrefetch = PREFETCH_CONFIG[currentPath] || [];
    
    // Delay prefetch to not compete with current page resources
    const timer = setTimeout(() => {
      routesToPrefetch.forEach(prefetchRoute);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname, prefetchRoute]);

  // Prefetch common routes after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      COMMON_ROUTES.forEach(prefetchRoute);
    }, 5000);

    return () => clearTimeout(timer);
  }, [prefetchRoute]);

  // Prefetch on link hover
  const prefetchOnHover = useCallback((route: string) => {
    return {
      onMouseEnter: () => prefetchRoute(route),
      onFocus: () => prefetchRoute(route),
    };
  }, [prefetchRoute]);

  return {
    prefetchRoute,
    prefetchOnHover,
    isPrefetched: (route: string) => prefetchedRoutes.current.has(route),
  };
};

/**
 * Link component with automatic prefetch on hover
 */
export const usePrefetchLink = (to: string) => {
  const { prefetchOnHover } = useRoutePrefetch();
  return prefetchOnHover(to);
};

export default useRoutePrefetch;
