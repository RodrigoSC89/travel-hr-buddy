/**
 * Analytics Client
 * PATCH 833: Client-side analytics tracking with batching
 */

import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_category?: string;
  properties?: Record<string, any>;
  page_url?: string;
  referrer?: string;
  timestamp?: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
  endpoint?: string;
  debug: boolean;
}

class AnalyticsClient {
  private queue: AnalyticsEvent[] = [];
  private config: AnalyticsConfig = {
    enabled: true,
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    debug: import.meta.env.DEV,
  };
  private sessionId: string;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startAutoFlush();
    this.setupBeforeUnload();
    this.setupUserTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startAutoFlush() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private setupBeforeUnload() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }
  }

  private async setupUserTracking() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.userId = user.id;
    }

    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null;
      if (event === 'SIGNED_IN') {
        this.track('user_signed_in');
      } else if (event === 'SIGNED_OUT') {
        this.track('user_signed_out');
        this.sessionId = this.generateSessionId();
      }
    });
  }

  configure(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config };
    if (config.flushInterval) {
      this.startAutoFlush();
    }
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      event_name: eventName,
      event_category: this.inferCategory(eventName),
      properties: {
        ...properties,
        user_id: this.userId,
        session_id: this.sessionId,
      },
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(event);

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', eventName, properties);
    }

    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private inferCategory(eventName: string): string {
    if (eventName.startsWith('page_')) return 'navigation';
    if (eventName.startsWith('click_')) return 'interaction';
    if (eventName.startsWith('form_')) return 'form';
    if (eventName.startsWith('error_')) return 'error';
    if (eventName.startsWith('user_')) return 'user';
    if (eventName.startsWith('api_')) return 'api';
    return 'general';
  }

  pageView(pageName?: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page_name: pageName || document.title,
      page_path: window.location.pathname,
      ...properties,
    });
  }

  click(elementId: string, properties?: Record<string, any>) {
    this.track('click_' + elementId, properties);
  }

  error(errorType: string, error: Error | string, properties?: Record<string, any>) {
    this.track('error_' + errorType, {
      error_message: error instanceof Error ? error.message : error,
      error_stack: error instanceof Error ? error.stack : undefined,
      ...properties,
    });
  }

  timing(category: string, variable: string, timeMs: number) {
    this.track('timing', {
      timing_category: category,
      timing_variable: variable,
      timing_value: timeMs,
    });
  }

  async flush(sync = false) {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    const metadata = {
      session_id: this.sessionId,
      device_type: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
    };

    try {
      if (sync && navigator.sendBeacon) {
        // Use sendBeacon for synchronous sends (on page unload)
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-analytics`,
          JSON.stringify({ events, metadata })
        );
      } else {
        // Use fetch for async sends
        await supabase.functions.invoke('track-analytics', {
          body: { events, metadata },
        });
      }

      if (this.config.debug) {
        console.log('[Analytics] Flushed', events.length, 'events');
      }
    } catch (error) {
      // Re-queue events on failure
      this.queue = [...events, ...this.queue];
      
      if (this.config.debug) {
        console.error('[Analytics] Flush failed:', error);
      }
    }
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) return 'Chrome';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/edge/i.test(ua)) return 'Edge';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (/windows/i.test(ua)) return 'Windows';
    if (/macintosh/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad/i.test(ua)) return 'iOS';
    return 'Unknown';
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.userId = userId;
    this.track('user_identified', { user_id: userId, ...traits });
  }

  reset() {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.queue = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  disable() {
    this.config.enabled = false;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  enable() {
    this.config.enabled = true;
    this.startAutoFlush();
  }
}

export const analytics = new AnalyticsClient();

// React hook
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export function useAnalytics() {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    analytics.pageView();
  }, [location.pathname]);

  const trackEvent = useCallback((name: string, props?: Record<string, any>) => {
    analytics.track(name, props);
  }, []);

  const trackClick = useCallback((elementId: string, props?: Record<string, any>) => {
    analytics.click(elementId, props);
  }, []);

  const trackError = useCallback((type: string, error: Error | string, props?: Record<string, any>) => {
    analytics.error(type, error, props);
  }, []);

  const trackTiming = useCallback((category: string, variable: string, timeMs: number) => {
    analytics.timing(category, variable, timeMs);
  }, []);

  return {
    track: trackEvent,
    click: trackClick,
    error: trackError,
    timing: trackTiming,
    pageView: analytics.pageView.bind(analytics),
    identify: analytics.identify.bind(analytics),
    reset: analytics.reset.bind(analytics),
    sessionId: analytics.getSessionId(),
  };
}
