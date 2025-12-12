/**
 * Critical Path Optimizer - Otimização para redes de 2MB
 * Prioriza recursos críticos e otimiza carregamento
 */

interface ResourcePriority {
  url: string;
  priority: "critical" | "high" | "medium" | "low";
  type: "script" | "style" | "image" | "font" | "data";
}

class CriticalPathOptimizer {
  private criticalResources: ResourcePriority[] = [];
  private loadedResources = new Set<string>();
  private connectionSpeed: "slow" | "medium" | "fast" = "medium";

  constructor() {
    this.detectConnectionSpeed();
    this.setupResourceHints();
  }

  private detectConnectionSpeed() {
    if ("connection" in navigator) {
      const conn = (navigator as any).connection;
      const effectiveType = conn?.effectiveType || "4g";
      
      if (effectiveType === "slow-2g" || effectiveType === "2g") {
        this.connectionSpeed = "slow";
      } else if (effectiveType === "3g") {
        this.connectionSpeed = "medium";
      } else {
        this.connectionSpeed = "fast";
      }

      conn?.addEventListener("change", () => {
        this.detectConnectionSpeed();
      });
    }
  }

  private setupResourceHints() {
    // DNS prefetch para domínios externos
    const domains = [
      "fonts.googleapis.com",
      "fonts.gstatic.com",
    ];

    domains.forEach(domain => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  // Preload de recursos críticos
  preloadCritical(resources: ResourcePriority[]) {
    const critical = resources.filter(r => r.priority === "critical");
    
    critical.forEach(resource => {
      if (this.loadedResources.has(resource.url)) return;
      
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource.url;
      link.as = resource.type === "script" ? "script" : 
        resource.type === "style" ? "style" :
          resource.type === "font" ? "font" : "fetch";
      
      if (resource.type === "font") {
        link.crossOrigin = "anonymous";
      }
      
      document.head.appendChild(link);
      this.loadedResources.add(resource.url);
    });
  }

  // Lazy load de imagens com IntersectionObserver
  setupLazyImages() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              // Para conexões lentas, usar imagem de menor qualidade
              if (this.connectionSpeed === "slow") {
                img.src = this.getLowQualityUrl(src);
              } else {
                img.src = src;
              }
              
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: "50px 0px",
        threshold: 0.01
      });

      document.querySelectorAll("img[data-src]").forEach(img => {
        imageObserver.observe(img);
      });

      return imageObserver;
    }
    return null;
  }

  private getLowQualityUrl(url: string): string {
    // Adiciona parâmetro de qualidade para imagens
    if (url.includes("?")) {
      return `${url}&q=50&w=400`;
    }
    return `${url}?q=50&w=400`;
  }

  // Defer de scripts não críticos
  deferNonCriticalScripts() {
    const scripts = document.querySelectorAll("script[data-defer]");
    
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        scripts.forEach(script => {
          const newScript = document.createElement("script");
          newScript.src = script.getAttribute("data-src") || "";
          newScript.async = true;
          document.body.appendChild(newScript);
        });
      });
    } else {
      setTimeout(() => {
        scripts.forEach(script => {
          const newScript = document.createElement("script");
          newScript.src = script.getAttribute("data-src") || "";
          newScript.async = true;
          document.body.appendChild(newScript);
        });
      }, 2000);
    }
  }

  // Otimização de CSS crítico
  inlineCriticalCSS(css: string) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // Métricas de performance
  getPerformanceMetrics() {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    
    return {
      connectionSpeed: this.connectionSpeed,
      ttfb: navigation?.responseStart - navigation?.requestStart || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.startTime || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.startTime || 0,
      resourceCount: performance.getEntriesByType("resource").length,
      transferSize: this.calculateTotalTransfer(),
    };
  }

  private calculateTotalTransfer(): number {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return resources.reduce((total, r) => total + (r.transferSize || 0), 0);
  }

  // Estratégia adaptativa baseada na conexão
  getLoadingStrategy() {
    switch (this.connectionSpeed) {
    case "slow":
      return {
        imageQuality: 50,
        maxImageWidth: 400,
        enableAnimations: false,
        prefetchCount: 1,
        batchSize: 3,
        debounceMs: 500,
      };
    case "medium":
      return {
        imageQuality: 75,
        maxImageWidth: 800,
        enableAnimations: true,
        prefetchCount: 3,
        batchSize: 5,
        debounceMs: 300,
      };
    case "fast":
      return {
        imageQuality: 100,
        maxImageWidth: 1920,
        enableAnimations: true,
        prefetchCount: 5,
        batchSize: 10,
        debounceMs: 100,
      };
    }
  }
}

export const criticalPathOptimizer = new CriticalPathOptimizer();
