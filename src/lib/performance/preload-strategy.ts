/**
 * Preload Strategy - Intelligent Resource Loading
 * Optimized for 2Mbps networks
 */

type Priority = "critical" | "high" | "medium" | "low";

interface PreloadConfig {
  url: string;
  as: "script" | "style" | "image" | "font" | "fetch";
  priority: Priority;
  crossOrigin?: "anonymous" | "use-credentials";
}

class PreloadStrategy {
  private preloaded = new Set<string>();
  private queue: PreloadConfig[] = [];
  private isProcessing = false;

  /**
   * Preload a resource
   */
  preload(config: PreloadConfig): void {
    if (this.preloaded.has(config.url)) return;
    
    if (config.priority === "critical") {
      this.executePreload(config);
    } else {
      this.queue.push(config);
      this.processQueue();
    }
  }

  /**
   * Preload multiple resources
   */
  preloadBatch(configs: PreloadConfig[]): void {
    const sorted = configs.sort((a, b) => 
      this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority)
    );
    sorted.forEach(config => this.preload(config));
  }

  /**
   * Preload a route's resources
   */
  preloadRoute(path: string): void {
    // Common route resources
    const routeResources: Record<string, PreloadConfig[]> = {
      "/dashboard": [
        { url: "/src/pages/Dashboard.tsx", as: "script", priority: "high" }
      ],
      "/crew": [
        { url: "/src/pages/modules/CrewManagement.tsx", as: "script", priority: "high" }
      ],
      "/fleet": [
        { url: "/src/pages/modules/FleetManagement.tsx", as: "script", priority: "high" }
      ]
    };

    const resources = routeResources[path];
    if (resources) {
      this.preloadBatch(resources);
    }
  }

  private executePreload(config: PreloadConfig): void {
    if (this.preloaded.has(config.url)) return;
    this.preloaded.add(config.url);

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = config.url;
    link.as = config.as;
    
    if (config.crossOrigin) {
      link.crossOrigin = config.crossOrigin;
    }

    document.head.appendChild(link);
  }

  private processQueue(): void {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const process = () => {
      const config = this.queue.shift();
      if (config) {
        this.executePreload(config);
        // Delay between preloads for slow networks
        setTimeout(process, 50);
      } else {
        this.isProcessing = false;
      }
    };

    // Use idle callback or timeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(process);
    } else {
      setTimeout(process, 100);
    }
  }

  private getPriorityValue(priority: Priority): number {
    const values: Record<Priority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3
    };
    return values[priority];
  }

  /**
   * Clear preload cache
   */
  clear(): void {
    this.preloaded.clear();
    this.queue = [];
  }
}

export const preloadStrategy = new PreloadStrategy();
export default preloadStrategy;
