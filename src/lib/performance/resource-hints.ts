/**
 * Resource Hints Manager
 * Manages preconnect, prefetch, and preload hints
 */

class ResourceHintsManager {
  private addedHints = new Set<string>();

  /**
   * Add preconnect hint for external origins
   */
  preconnect(origin: string, crossOrigin: boolean = true): void {
    const key = `preconnect:${origin}`;
    if (this.addedHints.has(key)) return;

    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    if (crossOrigin) {
      link.crossOrigin = "anonymous";
    }
    
    document.head.appendChild(link);
    this.addedHints.add(key);
  }

  /**
   * Add DNS prefetch hint
   */
  dnsPrefetch(origin: string): void {
    const key = `dns-prefetch:${origin}`;
    if (this.addedHints.has(key)) return;

    const link = document.createElement("link");
    link.rel = "dns-prefetch";
    link.href = origin;
    
    document.head.appendChild(link);
    this.addedHints.add(key);
  }

  /**
   * Prefetch a resource for future navigation
   */
  prefetch(url: string, as?: string): void {
    const key = `prefetch:${url}`;
    if (this.addedHints.has(key)) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    if (as) {
      link.as = as;
    }
    
    document.head.appendChild(link);
    this.addedHints.add(key);
  }

  /**
   * Preload a critical resource
   */
  preload(url: string, as: string, type?: string): void {
    const key = `preload:${url}`;
    if (this.addedHints.has(key)) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = as;
    if (type) {
      link.type = type;
    }
    
    document.head.appendChild(link);
    this.addedHints.add(key);
  }

  /**
   * Add module preload for JavaScript modules
   */
  modulePreload(url: string): void {
    const key = `modulepreload:${url}`;
    if (this.addedHints.has(key)) return;

    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = url;
    
    document.head.appendChild(link);
    this.addedHints.add(key);
  }

  /**
   * Initialize common resource hints
   */
  initializeCommonHints(): void {
    // Preconnect to common external services
    const commonOrigins = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];

    commonOrigins.forEach(origin => {
      this.preconnect(origin);
    });
  }

  /**
   * Prefetch route based on user intent
   */
  prefetchRoute(route: string): void {
    // In a real app, this would map routes to their chunk URLs
    this.prefetch(route, "document");
  }

  /**
   * Clear all added hints
   */
  clear(): void {
    const links = document.querySelectorAll("link[rel=\"preconnect\"], link[rel=\"dns-prefetch\"], link[rel=\"prefetch\"], link[rel=\"preload\"], link[rel=\"modulepreload\"]");
    links.forEach(link => {
      const key = `${link.getAttribute("rel")}:${link.getAttribute("href")}`;
      if (this.addedHints.has(key)) {
        link.remove();
      }
    });
    this.addedHints.clear();
  }
}

export const resourceHints = new ResourceHintsManager();

// Initialize common hints on module load
if (typeof window !== "undefined") {
  resourceHints.initializeCommonHints();
}
