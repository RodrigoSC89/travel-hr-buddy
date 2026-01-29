/**
 * Route Preloader - Smart prefetching based on navigation patterns
 * Predicts and preloads routes user is likely to visit
 */

import { logger } from "@/lib/logger";

interface RouteVisit {
  path: string;
  timestamp: number;
  source: string;
}

interface TransitionCount {
  [from: string]: {
    [to: string]: number;
  };
}

class RoutePreloader {
  private visitHistory: RouteVisit[] = [];
  private transitions: TransitionCount = {};
  private preloadedRoutes = new Set<string>();
  private initialized = false;
  
  // Critical routes that should always be warm
  private criticalRoutes = [
    "/central-comando",
    "/fleet-command",
    "/crew",
    "/maintenance-command",
    "/documents",
  ];
  
  // Route to chunk mapping (dynamic imports)
  private routeFactories: Record<string, () => Promise<any>> = {};

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // Load history from storage
    this.loadHistory();
    
    // Preload critical routes after page load
    this.preloadCriticalRoutes();
    
    // Listen to route changes
    this.setupNavigationListener();
    
    logger.debug("[RoutePreloader] Initialized");
  }

  /**
   * Register a route factory for preloading
   */
  registerRoute(path: string, factory: () => Promise<any>) {
    this.routeFactories[path] = factory;
  }

  /**
   * Record a route visit for learning patterns
   */
  recordVisit(path: string, source: string = "navigation") {
    const visit: RouteVisit = {
      path,
      timestamp: Date.now(),
      source,
    };

    // Record transition from previous path
    if (this.visitHistory.length > 0) {
      const previousPath = this.visitHistory[this.visitHistory.length - 1].path;
      this.recordTransition(previousPath, path);
    }

    this.visitHistory.push(visit);
    
    // Keep only last 100 visits
    if (this.visitHistory.length > 100) {
      this.visitHistory = this.visitHistory.slice(-100);
    }
    
    // Save to storage periodically
    this.saveHistory();
    
    // Predict and preload next routes
    this.predictAndPreload(path);
  }

  /**
   * Record a transition between routes
   */
  private recordTransition(from: string, to: string) {
    if (!this.transitions[from]) {
      this.transitions[from] = {};
    }
    this.transitions[from][to] = (this.transitions[from][to] || 0) + 1;
  }

  /**
   * Predict likely next routes based on history
   */
  private predictNextRoutes(currentPath: string): string[] {
    const fromTransitions = this.transitions[currentPath];
    if (!fromTransitions) return [];

    // Sort by frequency
    const sorted = Object.entries(fromTransitions)
      .sort((a, b) => b[1] - a[1])
      .map(([path]) => path);

    // Return top 3 most likely routes
    return sorted.slice(0, 3);
  }

  /**
   * Predict and preload likely next routes
   */
  private predictAndPreload(currentPath: string) {
    const predicted = this.predictNextRoutes(currentPath);
    
    predicted.forEach((path, index) => {
      // Delay preload based on prediction confidence (position)
      const delay = (index + 1) * 500;
      
      setTimeout(() => {
        this.preloadRoute(path);
      }, delay);
    });
  }

  /**
   * Preload a specific route
   */
  async preloadRoute(path: string) {
    if (this.preloadedRoutes.has(path)) return;
    
    const factory = this.routeFactories[path];
    if (!factory) return;

    // Use requestIdleCallback for non-blocking preload
    const preload = () => {
      factory()
        .then(() => {
          this.preloadedRoutes.add(path);
          logger.debug(`[RoutePreloader] Preloaded: ${path}`);
        })
        .catch(() => {
          // Silently fail - preload is optional
        });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(preload, { timeout: 5000 });
    } else {
      setTimeout(preload, 100);
    }
  }

  /**
   * Preload critical routes on startup
   */
  private preloadCriticalRoutes() {
    // Wait for app to be interactive
    const preload = () => {
      this.criticalRoutes.forEach((path, index) => {
        setTimeout(() => {
          this.preloadRoute(path);
        }, 1000 + index * 500);
      });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(preload, { timeout: 10000 });
    } else {
      setTimeout(preload, 3000);
    }
  }

  /**
   * Setup navigation listener
   */
  private setupNavigationListener() {
    // Listen to popstate for browser navigation
    window.addEventListener("popstate", () => {
      this.recordVisit(window.location.pathname, "popstate");
    });

    // Intercept link clicks for preloading on hover
    document.addEventListener("mouseover", (e) => {
      const link = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href");
      if (href?.startsWith("/") && !href.startsWith("//")) {
        this.preloadRoute(href);
      }
    });
  }

  /**
   * Load visit history from storage
   */
  private loadHistory() {
    try {
      const stored = localStorage.getItem("route_transitions");
      if (stored) {
        this.transitions = JSON.parse(stored);
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Save history to storage (debounced)
   */
  private saveHistoryTimeout: ReturnType<typeof setTimeout> | null = null;
  private saveHistory() {
    if (this.saveHistoryTimeout) return;
    
    this.saveHistoryTimeout = setTimeout(() => {
      try {
        localStorage.setItem("route_transitions", JSON.stringify(this.transitions));
      } catch {
        // Ignore storage errors
      }
      this.saveHistoryTimeout = null;
    }, 5000);
  }

  /**
   * Clear preload cache
   */
  clearCache() {
    this.preloadedRoutes.clear();
  }

  /**
   * Get preload statistics
   */
  getStats() {
    return {
      preloadedCount: this.preloadedRoutes.size,
      visitCount: this.visitHistory.length,
      transitionPatterns: Object.keys(this.transitions).length,
    };
  }
}

export const routePreloader = new RoutePreloader();

// Auto-init
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => routePreloader.init());
  } else {
    routePreloader.init();
  }
}
