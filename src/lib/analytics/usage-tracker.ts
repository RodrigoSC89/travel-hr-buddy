/**
 * Usage Tracker - Sistema de Analytics de Uso
 * PATCH 901: Métricas de adoção e comportamento
 */

import { supabase } from '@/integrations/supabase/client';

interface TrackingEvent {
  event_type: string;
  event_name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

interface PageView {
  path: string;
  title?: string;
  referrer?: string;
  duration_ms?: number;
}

interface UserSession {
  session_id: string;
  started_at: string;
  pages_viewed: number;
  events_count: number;
}

class UsageTracker {
  private sessionId: string;
  private sessionStart: number;
  private pageEnterTime: number = 0;
  private eventsQueue: TrackingEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize tracker
   */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Track page views on navigation
    this.trackPageView(window.location.pathname);

    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });

    console.log('[UsageTracker] Initialized', { sessionId: this.sessionId });
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    // Calculate time on previous page
    const now = Date.now();
    if (this.pageEnterTime > 0) {
      const duration = now - this.pageEnterTime;
      this.trackEvent('page_exit', {
        duration_ms: duration,
        path: window.location.pathname,
      });
    }
    this.pageEnterTime = now;

    this.trackEvent('page_view', {
      path,
      title: title || document.title,
      referrer: document.referrer,
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
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
      this.flush();
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
    this.trackEvent(`feature_${action}`, {
      feature_name: featureName,
      ...metadata,
    });
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
    this.trackEvent(`form_${action}`, {
      form_name: formName,
      ...metadata,
    });
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
   * Flush events to database
   */
  async flush(): Promise<void> {
    if (this.eventsQueue.length === 0) return;

    const events = [...this.eventsQueue];
    this.eventsQueue = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Batch insert events usando tabela analytics_events existente
      const { error } = await supabase.from('analytics_events').insert(
        events.map(event => ({
          user_id: user?.id,
          session_id: this.sessionId,
          event_category: event.event_type,
          event_name: event.event_name,
          properties: event.properties,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: event.timestamp,
        } as any))
      );

      if (error) {
        // Re-queue events on error
        this.eventsQueue = [...events, ...this.eventsQueue];
        console.warn('[UsageTracker] Flush failed:', error);
      }
    } catch (err) {
      // Re-queue events on error
      this.eventsQueue = [...events, ...this.eventsQueue];
      console.warn('[UsageTracker] Flush error:', err);
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
    }
    this.flush();
    this.isInitialized = false;
  }
}

// Singleton instance
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
