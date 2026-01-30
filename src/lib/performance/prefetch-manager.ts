/**
 * Prefetch Manager
 * Intelligent route and resource prefetching based on user behavior
 */

import { logger } from '@/lib/logger';

interface PrefetchConfig {
  routes: Record<string, string[]>;
  commonRoutes: string[];
  criticalModules: Array<() => Promise<unknown>>;
}

const DEFAULT_CONFIG: PrefetchConfig = {
  // Routes to prefetch based on current route
  routes: {
    '/': ['/dashboard', '/auth'],
    '/dashboard': ['/analytics', '/crew', '/missions', '/reports'],
    '/crew': ['/crew/new', '/hr', '/training'],
    '/missions': ['/missions/new', '/fleet'],
    '/fleet': ['/fleet/vessels', '/maintenance'],
    '/maintenance': ['/maintenance/predictive', '/parts'],
    '/compliance': ['/compliance/mlc', '/compliance/stcw'],
    '/ai': ['/ai/nauti-brain', '/ai/insights'],
  },
  
  // Routes that are commonly visited - always prefetch
  commonRoutes: ['/dashboard', '/notifications-center', '/settings'],
  
  // Critical modules to preload after initial render
  criticalModules: [
    () => import('@/components/ui/dialog'),
    () => import('@/components/ui/dropdown-menu'),
    () => import('@/components/ui/sheet'),
  ]
};

class PrefetchManager {
  private prefetchedRoutes = new Set<string>();
  private prefetchedModules = new Set<string>();
  private isSlowConnection = false;
  private isOffline = false;
  
  constructor() {
    this.detectConnectionQuality();
    this.setupListeners();
  }
  
  private detectConnectionQuality(): void {
    if ('connection' in navigator) {
      const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
      if (conn) {
        this.isSlowConnection = conn.saveData || 
          ['slow-2g', '2g', '3g'].includes(conn.effectiveType || '');
        
        conn.addEventListener('change', () => {
          this.isSlowConnection = conn.saveData || 
            ['slow-2g', '2g', '3g'].includes(conn.effectiveType || '');
        });
      }
    }
    
    // PATCH v34 iOS PWA: Sempre assume online - navigator.onLine não é confiável
    this.isOffline = false;
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this.isOffline = false;
    });
    
    window.addEventListener('offline', () => {
      this.isOffline = true;
    });
  }
  
  /**
   * Check if prefetching should be allowed
   */
  private canPrefetch(): boolean {
    return !this.isOffline && !this.isSlowConnection;
  }
  
  /**
   * Prefetch a single route
   */
  prefetchRoute(route: string): void {
    if (!this.canPrefetch()) return;
    if (this.prefetchedRoutes.has(route)) return;
    
    // Create prefetch link
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.as = 'document';
    document.head.appendChild(link);
    
    this.prefetchedRoutes.add(route);
    logger.debug(`Prefetched route: ${route}`);
  }
  
  /**
   * Prefetch routes based on current location
   */
  prefetchForCurrentRoute(currentPath: string): void {
    if (!this.canPrefetch()) return;
    
    const routesToPrefetch = DEFAULT_CONFIG.routes[currentPath] || [];
    
    // Delay prefetch to not compete with current page resources
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routesToPrefetch.forEach(route => this.prefetchRoute(route));
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        routesToPrefetch.forEach(route => this.prefetchRoute(route));
      }, 2000);
    }
  }
  
  /**
   * Prefetch common routes after initial load
   */
  prefetchCommonRoutes(): void {
    if (!this.canPrefetch()) return;
    
    setTimeout(() => {
      DEFAULT_CONFIG.commonRoutes.forEach(route => this.prefetchRoute(route));
    }, 5000);
  }
  
  /**
   * Preload critical modules
   */
  preloadCriticalModules(): void {
    if (!this.canPrefetch()) return;
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        DEFAULT_CONFIG.criticalModules.forEach((loader, index) => {
          const key = `module-${index}`;
          if (!this.prefetchedModules.has(key)) {
            loader()
              .then(() => {
                this.prefetchedModules.add(key);
                logger.debug(`Preloaded critical module ${index + 1}`);
              })
              .catch(err => logger.warn('Failed to preload module', { error: err }));
          }
        });
      }, { timeout: 5000 });
    }
  }
  
  /**
   * Prefetch on link hover (for immediate navigation)
   */
  onLinkHover(route: string): void {
    if (!this.canPrefetch()) return;
    if (this.prefetchedRoutes.has(route)) return;
    
    // High priority prefetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.as = 'document';
    // @ts-expect-error fetchpriority is a valid attribute
    link.fetchpriority = 'high';
    document.head.appendChild(link);
    
    this.prefetchedRoutes.add(route);
  }
  
  /**
   * Preconnect to external origins
   */
  preconnectOrigins(origins: string[]): void {
    origins.forEach(origin => {
      // DNS prefetch
      const dns = document.createElement('link');
      dns.rel = 'dns-prefetch';
      dns.href = origin;
      document.head.appendChild(dns);
      
      // Preconnect
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = origin;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    });
    
    logger.debug(`Preconnected to ${origins.length} origins`);
  }
  
  /**
   * Get prefetch stats
   */
  getStats(): { prefetchedRoutes: number; prefetchedModules: number; canPrefetch: boolean } {
    return {
      prefetchedRoutes: this.prefetchedRoutes.size,
      prefetchedModules: this.prefetchedModules.size,
      canPrefetch: this.canPrefetch()
    };
  }
  
  /**
   * Clear prefetch cache (useful for testing)
   */
  clearCache(): void {
    this.prefetchedRoutes.clear();
    this.prefetchedModules.clear();
  }
}

// Network Information API types
interface NetworkInformation {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  saveData?: boolean;
  addEventListener: (type: 'change', listener: () => void) => void;
}

// Export singleton
export const prefetchManager = new PrefetchManager();

// Initialize preconnections on load
if (typeof window !== 'undefined') {
  prefetchManager.preconnectOrigins([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]);
}

export default prefetchManager;
