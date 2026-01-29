/**
 * Usage Tracker - Sistema de Analytics de Uso
 * PATCH 902: Corrigido para evitar carregamento infinito
 */

import { supabase } from '@/integrations/supabase/client';

interface TrackingEvent {
  event_type: string;
  event_name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

interface UserSession {
  session_id: string;
  started_at: string;
  pages_viewed: number;
  events_count: number;
}

class UsageTracker {
  private sessionId: string = '';
  private sessionStart: number = 0;
  private pageEnterTime: number = 0;
  private eventsQueue: TrackingEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private flushPromise: Promise<void> | null = null;

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Initialize tracker - SAFE: Only runs after DOM is ready
   */
  init(): void {
    // Early exit if already initialized or not in browser
    if (this.isInitialized) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this.isInitialized = true;
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();

    // Use requestIdleCallback for non-blocking init
    const initCallback = () => {
      try {
        // Track initial page view
        this.trackPageView(window.location.pathname);

        // Flush events every 30 seconds
        this.flushInterval = setInterval(() => {
          this.flush().catch(() => {});
        }, 30000);

        // Flush on page unload - use sendBeacon for reliability
        window.addEventListener('beforeunload', () => {
          this.flushSync();
        });

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.flush().catch(() => {});
          }
        });
      } catch (e) {
        // Silent fail - analytics should never break the app
      }
    };

    // Defer initialization to avoid blocking
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(initCallback, { timeout: 2000 });
    } else {
      setTimeout(initCallback, 100);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    if (!this.isInitialized) return;
    
    try {
      const now = Date.now();
      if (this.pageEnterTime > 0) {
        const duration = now - this.pageEnterTime;
        this.queueEvent('page_exit', {
          duration_ms: duration,
          path: window.location.pathname,
        });
      }
      this.pageEnterTime = now;

      this.queueEvent('page_view', {
        path,
        title: title || document.title,
        referrer: document.referrer,
      });
    } catch {
      // Silent fail
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isInitialized) return;
    this.queueEvent(eventName, properties);
  }

  private queueEvent(eventName: string, properties?: Record<string, unknown>): void {
    try {
      const event: TrackingEvent = {
        event_type: this.getEventType(eventName),
        event_name: eventName,
        properties: {
          ...properties,
          session_id: this.sessionId,
          url: window.location.href,
          user_agent: navigator.userAgent,
          screen_width: window.innerWidth,
          screen_height: window.innerHeight,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        timestamp: new Date().toISOString(),
      };

      this.eventsQueue.push(event);

      // Auto-flush if queue is large
      if (this.eventsQueue.length >= 10) {
        this.flush().catch(() => {});
      }
    } catch {
      // Silent fail
    }
  }

  private getEventType(eventName: string): string {
    if (eventName.startsWith('page_')) return 'navigation';
    if (eventName.startsWith('click_')) return 'interaction';
    if (eventName.startsWith('form_')) return 'form';
    if (eventName.startsWith('error_')) return 'error';
    if (eventName.startsWith('feature_')) return 'feature';
    return 'custom';
  }

  /**
   * Track feature usage
   */
  trackFeature(featureName: string, action: string, metadata?: Record<string, unknown>): void {
    this.trackEvent(`feature_${action}`, { feature_name: featureName, ...metadata });
  }

  /**
   * Track button/link click
   */
  trackClick(elementName: string, metadata?: Record<string, unknown>): void {
    this.trackEvent(`click_${elementName}`, metadata);
  }

  /**
   * Track form submission
   */
  trackForm(formName: string, action: 'start' | 'complete' | 'error', metadata?: Record<string, unknown>): void {
    this.trackEvent(`form_${action}`, { form_name: formName, ...metadata });
  }

  /**
   * Track error
   */
  trackError(errorType: string, message: string, stack?: string): void {
    this.trackEvent('error_occurred', {
      error_type: errorType,
      error_message: message,
      error_stack: stack,
    });
  }

  /**
   * Flush events to database (async)
   */
  async flush(): Promise<void> {
    if (this.eventsQueue.length === 0) return;
    if (this.flushPromise) return this.flushPromise;

    const events = [...this.eventsQueue];
    this.eventsQueue = [];

    this.flushPromise = (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        // Skip flush if user is not authenticated (prevents 401 errors)
        if (!user) {
          // Re-queue events for later (when user logs in)
          const toRequeue = events.slice(0, Math.max(0, 20 - this.eventsQueue.length));
          this.eventsQueue = [...this.eventsQueue, ...toRequeue];
          return;
        }

        const { error } = await supabase.from('analytics_events').insert(
          events.map(event => ({
            user_id: user.id,
            session_id: this.sessionId,
            event_category: event.event_type,
            event_name: event.event_name,
            properties: event.properties as unknown as Record<string, unknown>,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: event.timestamp,
          } as any))
        );

        if (error) {
          // Re-queue events on error (max 50 to prevent memory issues)
          const toRequeue = events.slice(0, Math.max(0, 50 - this.eventsQueue.length));
          this.eventsQueue = [...toRequeue, ...this.eventsQueue];
        }
      } catch {
        // Re-queue some events on error
        const toRequeue = events.slice(0, Math.max(0, 50 - this.eventsQueue.length));
        this.eventsQueue = [...toRequeue, ...this.eventsQueue];
      } finally {
        this.flushPromise = null;
      }
    })();

    return this.flushPromise;
  }

  /**
   * Synchronous flush for beforeunload (uses sendBeacon)
   */
  private flushSync(): void {
    if (this.eventsQueue.length === 0) return;

    try {
      const events = this.eventsQueue.slice(0, 20); // Limit for beacon
      this.eventsQueue = [];

      // Use sendBeacon for reliable delivery on page unload
      const payload = JSON.stringify({
        events: events.map(event => ({
          session_id: this.sessionId,
          event_category: event.event_type,
          event_name: event.event_name,
          properties: event.properties,
          page_url: window.location.href,
          timestamp: event.timestamp,
        })),
      });

      // This will work even during page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          'https://vnbptmixvwropvanyhdb.supabase.co/rest/v1/analytics_events',
          payload
        );
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Get session info
   */
  getSession(): UserSession {
    return {
      session_id: this.sessionId,
      started_at: new Date(this.sessionStart).toISOString(),
      pages_viewed: this.eventsQueue.filter(e => e.event_name === 'page_view').length,
      events_count: this.eventsQueue.length,
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush().catch(() => {});
    this.isInitialized = false;
  }
}

// Singleton instance - initialized lazily
export const usageTracker = new UsageTracker();

/**
 * React hook for tracking
 */
export function useTracking() {
  return {
    trackEvent: usageTracker.trackEvent.bind(usageTracker),
    trackPageView: usageTracker.trackPageView.bind(usageTracker),
    trackFeature: usageTracker.trackFeature.bind(usageTracker),
    trackClick: usageTracker.trackClick.bind(usageTracker),
    trackForm: usageTracker.trackForm.bind(usageTracker),
    trackError: usageTracker.trackError.bind(usageTracker),
  };
}
