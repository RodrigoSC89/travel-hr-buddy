/**
 * Resource Hints - Intelligent preloading for ultra-fast navigation
 * Predicts user navigation intent and preloads resources
 */

const preloadedRoutes = new Set<string>();

/**
 * Preload a route chunk on hover/focus intent
 */
export function preloadOnIntent(routeImporter: () => Promise<unknown>, routeKey: string) {
  if (preloadedRoutes.has(routeKey)) return;
  preloadedRoutes.add(routeKey);
  routeImporter().catch(() => { /* silent */ });
}

/**
 * Add link preload hints dynamically
 */
export function addResourceHint(url: string, as: string, type?: string) {
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  if (type) link.type = type;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * Intersection-based lazy preloading
 * Preloads route when sidebar link enters viewport
 */
export function createIntentObserver(
  element: HTMLElement,
  routeImporter: () => Promise<unknown>,
  routeKey: string
) {
  // Preload on hover (desktop) or intersection (mobile)
  const handleIntent = () => preloadOnIntent(routeImporter, routeKey);
  
  element.addEventListener('mouseenter', handleIntent, { passive: true, once: true });
  element.addEventListener('focus', handleIntent, { passive: true, once: true });
  
  // Mobile: preload when visible
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Delay preload slightly on mobile to not compete with visible content
            setTimeout(handleIntent, 1000);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }
  
  return () => {};
}

/**
 * Adaptive quality based on connection speed
 */
export function getAdaptiveQuality(): 'high' | 'medium' | 'low' {
  const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } };
  const conn = nav.connection;
  
  if (conn?.saveData) return 'low';
  
  switch (conn?.effectiveType) {
    case '4g': return 'high';
    case '3g': return 'medium';
    default: return 'low';
  }
}
