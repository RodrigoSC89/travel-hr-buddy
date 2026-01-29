/**
 * Analytics Engine - PROMPT 13
 * Comprehensive analytics and BI system
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

type EventCategory = 
  | "navigation"
  | "interaction"
  | "transaction"
  | "error"
  | "performance"
  | "ai"
  | "compliance"
  | "maintenance";

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface SessionData {
  id: string;
  startTime: number;
  pageViews: number;
  events: number;
  lastActivity: number;
  device: string;
  browser: string;
  os: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class AnalyticsEngine {
  private events: AnalyticsEvent[] = [];
  private session: SessionData;
  private readonly MAX_EVENTS = 500;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.session = this.initSession();
    this.startAutoFlush();
    this.trackPageViews();
  }

  /**
   * Initialize session
   */
  private initSession(): SessionData {
    const ua = navigator.userAgent;
    return {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      pageViews: 0,
      events: 0,
      lastActivity: Date.now(),
      device: this.detectDevice(ua),
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua),
    };
  }

  /**
   * Track page views
   */
  private trackPageViews(): void {
    // Initial page view
    this.trackEvent("navigation", "page_view", window.location.pathname);

    // Track route changes
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackEvent("navigation", "page_view", window.location.pathname);
    };

    window.addEventListener("popstate", () => {
      this.trackEvent("navigation", "page_view", window.location.pathname);
    });
  }

  /**
   * Track an analytics event
   */
  trackEvent(
    category: EventCategory,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, unknown>
  ): void {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.session.id,
    };

    this.events.push(event);
    this.session.events++;
    this.session.lastActivity = Date.now();

    if (category === "navigation" && action === "page_view") {
      this.session.pageViews++;
    }

    // Trim events if too many
    if (this.events.length > this.MAX_EVENTS) {
      this.flush();
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(name: string, value: number, unit: string = "ms"): void {
    this.trackEvent("performance", "metric", name, value, { unit });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    this.trackEvent("error", error.name, error.message, undefined, {
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Track AI interaction
   */
  trackAI(action: string, model?: string, tokensUsed?: number): void {
    this.trackEvent("ai", action, model, tokensUsed);
  }

  /**
   * Track compliance event
   */
  trackCompliance(action: string, regulation?: string, status?: string): void {
    this.trackEvent("compliance", action, regulation, undefined, { status });
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);

    // Flush on page unload
    window.addEventListener("beforeunload", () => this.flush());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.flush();
    });
  }

  /**
   * Flush events to server
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Skip if not authenticated (prevents 401 errors)
      if (!user) {
        // Re-add events for later (when user logs in)
        this.events = [...eventsToSend.slice(0, 50), ...this.events];
        return;
      }

      // Batch insert events
      const formattedEvents = eventsToSend.map(event => ({
        event_type: event.category,
        event_name: event.action,
        event_data: {
          label: event.label,
          value: event.value,
          metadata: event.metadata,
          sessionId: event.sessionId,
        },
        user_id: user.id,
        created_at: new Date(event.timestamp).toISOString(),
      }));

      await supabase.from("analytics_events").insert(formattedEvents);
    } catch {
      // Re-add events on failure (max 50)
      this.events = [...eventsToSend.slice(0, 50), ...this.events];
    }
  }

  /**
   * Get session data
   */
  getSession(): SessionData {
    return { ...this.session };
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 50): AnalyticsEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Generate session report
   */
  generateReport(): Record<string, unknown> {
    const duration = Date.now() - this.session.startTime;
    const eventsByCategory = this.events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      sessionId: this.session.id,
      duration,
      pageViews: this.session.pageViews,
      totalEvents: this.session.events,
      eventsByCategory,
      device: this.session.device,
      browser: this.session.browser,
      os: this.session.os,
      averageEventsPerMinute: (this.session.events / (duration / 60000)).toFixed(2),
    };
  }

  // Device detection helpers
  private detectDevice(ua: string): string {
    if (/mobile/i.test(ua)) return "mobile";
    if (/tablet/i.test(ua)) return "tablet";
    return "desktop";
  }

  private detectBrowser(ua: string): string {
    if (/chrome/i.test(ua)) return "Chrome";
    if (/firefox/i.test(ua)) return "Firefox";
    if (/safari/i.test(ua)) return "Safari";
    if (/edge/i.test(ua)) return "Edge";
    return "Unknown";
  }

  private detectOS(ua: string): string {
    if (/windows/i.test(ua)) return "Windows";
    if (/mac/i.test(ua)) return "macOS";
    if (/linux/i.test(ua)) return "Linux";
    if (/android/i.test(ua)) return "Android";
    if (/ios/i.test(ua)) return "iOS";
    return "Unknown";
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const analyticsEngine = new AnalyticsEngine();
