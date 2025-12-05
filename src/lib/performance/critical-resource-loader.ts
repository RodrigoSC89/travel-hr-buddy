/**
 * Critical Resource Loader
 * Prioritizes loading of critical resources for faster initial render
 */

interface ResourcePriority {
  url: string;
  type: 'script' | 'style' | 'font' | 'image' | 'fetch';
  priority: 'critical' | 'high' | 'medium' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

class CriticalResourceLoader {
  private loadedResources = new Set<string>();
  private pendingResources: Map<string, Promise<void>> = new Map();

  /**
   * Preload critical resources immediately
   */
  preloadCritical(resources: ResourcePriority[]) {
    const critical = resources.filter(r => r.priority === 'critical');
    critical.forEach(resource => this.preload(resource));
  }

  /**
   * Preload a single resource
   */
  preload(resource: ResourcePriority): Promise<void> {
    if (this.loadedResources.has(resource.url)) {
      return Promise.resolve();
    }

    if (this.pendingResources.has(resource.url)) {
      return this.pendingResources.get(resource.url)!;
    }

    const promise = this.createPreload(resource);
    this.pendingResources.set(resource.url, promise);
    
    promise.finally(() => {
      this.loadedResources.add(resource.url);
      this.pendingResources.delete(resource.url);
    });

    return promise;
  }

  private createPreload(resource: ResourcePriority): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = this.getAsType(resource.type);
      
      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }

      if (resource.type === 'font') {
        link.crossOrigin = 'anonymous';
      }

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload: ${resource.url}`));

      document.head.appendChild(link);
    });
  }

  private getAsType(type: ResourcePriority['type']): string {
    const typeMap: Record<string, string> = {
      script: 'script',
      style: 'style',
      font: 'font',
      image: 'image',
      fetch: 'fetch',
    };
    return typeMap[type] || 'fetch';
  }

  /**
   * Prefetch resources for future navigation
   */
  prefetchRoute(routePath: string, resources: string[]) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        resources.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          document.head.appendChild(link);
        });
      });
    }
  }

  /**
   * DNS prefetch for external domains
   */
  dnsPrefetch(domains: string[]) {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * Preconnect to critical origins
   */
  preconnect(origins: string[]) {
    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

export const criticalResourceLoader = new CriticalResourceLoader();

/**
 * Hook for component-level resource preloading
 */
export function useResourcePreload() {
  return {
    preload: (url: string, type: ResourcePriority['type']) => {
      criticalResourceLoader.preload({ url, type, priority: 'high' });
    },
    prefetchRoute: criticalResourceLoader.prefetchRoute.bind(criticalResourceLoader),
    preconnect: criticalResourceLoader.preconnect.bind(criticalResourceLoader),
  };
}
