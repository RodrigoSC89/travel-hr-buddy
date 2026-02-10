/**
 * Deep Linking Service for Mobile
 * Handles app-to-app deep links and universal links
 */

import { Capacitor } from "@capacitor/core";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { logger } from "@/lib/logger";
import { spaNavigate } from "@/lib/navigation/spa-navigate";

export interface DeepLinkRoute {
  path: string;
  handler: (params: Record<string, string>) => void;
}

export interface DeepLinkParams {
  url: string;
  path: string;
  params: Record<string, string>;
  hash?: string;
}

class DeepLinkingService {
  private routes: DeepLinkRoute[] = [];
  private isNative: boolean;
  private initialized: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Navigate using History API (SPA-safe)
   */
  private navigateTo(path: string): void {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  /**
   * Initialize deep linking listener
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Register default routes
    this.registerDefaultRoutes();

    if (this.isNative) {
      // Listen for app URL open events
      App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
        logger.info("[DeepLink] App opened with URL:", event.url);
        this.handleDeepLink(event.url);
      });

      // Check if app was opened with a deep link
      const launchUrl = await App.getLaunchUrl();
      if (launchUrl?.url) {
        logger.info("[DeepLink] App launched with URL:", launchUrl.url);
        this.handleDeepLink(launchUrl.url);
      }
    } else {
      // Web: Listen for hash changes and initial load
      window.addEventListener("hashchange", () => {
        const url = window.location.href;
        this.handleDeepLink(url);
      });

      // Handle initial deep link on web
      if (window.location.pathname !== "/" || window.location.search || window.location.hash) {
        this.handleDeepLink(window.location.href);
      }
    }

    this.initialized = true;
    logger.info("[DeepLink] Service initialized");
  }

  /**
   * Register a deep link route handler
   */
  registerRoute(path: string, handler: (params: Record<string, string>) => void): void {
    this.routes.push({ path, handler });
    logger.debug("[DeepLink] Route registered:", path);
  }

  /**
   * Register default app routes
   */
  private registerDefaultRoutes(): void {
    // Crew module
    this.registerRoute("/crew/:id", (params) => {
      this.navigateTo(`/crew?id=${params.id}`);
    });

    // Vessel module
    this.registerRoute("/vessel/:id", (params) => {
      this.navigateTo(`/vessels?id=${params.id}`);
    });

    // Documents
    this.registerRoute("/document/:id", (params) => {
      this.navigateTo(`/documents?id=${params.id}`);
    });

    // Checklist
    this.registerRoute("/checklist/:id", (params) => {
      this.navigateTo(`/checklists?id=${params.id}`);
    });

    // Training
    this.registerRoute("/training/:courseId", (params) => {
      this.navigateTo(`/academy?course=${params.courseId}`);
    });

    // Notification action
    this.registerRoute("/notification/:action/:id", (params) => {
      this.handleNotificationDeepLink(params);
    });

    // Travel booking
    this.registerRoute("/travel/:bookingId", (params) => {
      this.navigateTo(`/travel-command?booking=${params.bookingId}`);
    });

    // ESG report
    this.registerRoute("/esg/report/:id", (params) => {
      this.navigateTo(`/esg-emissions?report=${params.id}`);
    });
  }

  /**
   * Handle a deep link URL
   */
  handleDeepLink(url: string): boolean {
    try {
      const parsed = this.parseDeepLink(url);
      if (!parsed) {
        logger.warn("[DeepLink] Could not parse URL:", url);
        return false;
      }

      logger.info("[DeepLink] Handling:", parsed);

      // Find matching route
      for (const route of this.routes) {
        const params = this.matchRoute(parsed.path, route.path);
        if (params !== null) {
          // Merge URL query params with route params
          const allParams = { ...parsed.params, ...params };
          route.handler(allParams);
          return true;
        }
      }

      // No matching route, try direct navigation
      if (parsed.path) {
        logger.info("[DeepLink] No handler, navigating to:", parsed.path);
        spaNavigate(parsed.path);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("[DeepLink] Error handling URL:", error);
      return false;
    }
  }

  /**
   * Parse a deep link URL
   */
  parseDeepLink(url: string): DeepLinkParams | null {
    try {
      const parsed = new URL(url);
      const params: Record<string, string> = {};

      // Parse query parameters
      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return {
        url,
        path: parsed.pathname,
        params,
        hash: parsed.hash ? parsed.hash.slice(1) : undefined
      };
    } catch {
      // Try to parse as relative URL
      try {
        const parsed = new URL(url, "https://app.nautilusone.com");
        const params: Record<string, string> = {};

        parsed.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return {
          url,
          path: parsed.pathname,
          params,
          hash: parsed.hash ? parsed.hash.slice(1) : undefined
        };
      } catch {
        return null;
      }
    }
  }

  /**
   * Match a path against a route pattern
   */
  private matchRoute(
    path: string,
    pattern: string
  ): Record<string, string> | null {
    const pathParts = path.split("/").filter(Boolean);
    const patternParts = pattern.split("/").filter(Boolean);

    if (pathParts.length !== patternParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(":")) {
        // Dynamic parameter
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Static part doesn't match
        return null;
      }
    }

    return params;
  }

  /**
   * Handle notification-triggered deep links
   */
  private handleNotificationDeepLink(params: Record<string, string>): void {
    const { action, id } = params;

    switch (action) {
      case "view-document":
        spaNavigate(`/documents?id=${id}`);
        break;
      case "approve-request":
        spaNavigate(`/approvals?id=${id}&action=approve`);
        break;
      case "view-alert":
        spaNavigate(`/alerts?id=${id}`);
        break;
      case "view-task":
        spaNavigate(`/tasks?id=${id}`);
        break;
      default:
        logger.warn("[DeepLink] Unknown notification action:", action);
        spaNavigate(`/notifications`);
    }
  }

  /**
   * Create a deep link URL for the app
   */
  createDeepLink(path: string, params?: Record<string, string>): string {
    const scheme = this.isNative ? "nautilusone://" : window.location.origin;
    const url = new URL(path, scheme);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  /**
   * Create a universal link (for sharing)
   */
  createUniversalLink(path: string, params?: Record<string, string>): string {
    const baseUrl = "https://app.nautilusone.com";
    const url = new URL(path, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  /**
   * Share a deep link
   */
  async shareLink(
    title: string,
    text: string,
    url: string
  ): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        logger.warn("[DeepLink] Share failed:", error);
        return false;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const deepLinkingService = new DeepLinkingService();
export default deepLinkingService;
