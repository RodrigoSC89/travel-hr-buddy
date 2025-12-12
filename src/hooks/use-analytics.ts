/**
 * Analytics Hook
 * Track user interactions, page views, and custom events
 */

import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logger } from "@/lib/logger";

// Analytics event types
export type AnalyticsEventType = 
  | "page_view"
  | "click"
  | "form_submit"
  | "search"
  | "navigation"
  | "error"
  | "performance"
  | "feature_use"
  | "conversion";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

interface AnalyticsConfig {
  enabled?: boolean;
  debug?: boolean;
  sampleRate?: number;
}

// Analytics queue for batching
const eventQueue: AnalyticsEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_QUEUE_SIZE = 50;

/**
 * Flush events to analytics service
 */
const flushEvents = async () => {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;
  
  try {
    // Send to your analytics service
    // For now, we log to console in dev and can integrate with PostHog, Mixpanel, etc.
    if (import.meta.env.DEV) {
      logger.debug(`[Analytics] Flushing ${events.length} events`, { events });
    }
    
    // Example: Send to Supabase analytics table
    // await supabase.from('analytics_events').insert(events);
    
  } catch (error) {
    logger.error("[Analytics] Failed to flush events", { error });
    // Re-queue failed events
    eventQueue.push(...events);
  }
};

/**
 * Schedule flush
 */
const scheduleFlush = () => {
  if (flushTimeout) return;
  
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushEvents();
  }, FLUSH_INTERVAL);
};

/**
 * Track an analytics event
 */
export const trackEvent = (event: AnalyticsEvent, config?: AnalyticsConfig) => {
  const { enabled = true, debug = import.meta.env.DEV, sampleRate = 1 } = config || {};
  
  if (!enabled) return;
  
  // Sample rate check
  if (Math.random() > sampleRate) return;
  
  const enrichedEvent: AnalyticsEvent = {
    ...event,
    timestamp: Date.now(),
    properties: {
      ...event.properties,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    }
  };
  
  if (debug) {
    logger.info(`[Analytics] ${event.type}: ${event.name}`, enrichedEvent.properties);
  }
  
  eventQueue.push(enrichedEvent);
  
  // Flush immediately if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents();
  } else {
    scheduleFlush();
  }
};

/**
 * Analytics hook for React components
 */
export const useAnalytics = (config?: AnalyticsConfig) => {
  const location = useLocation();
  const lastPath = useRef<string>("");
  
  // Track page views
  useEffect(() => {
    if (location.pathname !== lastPath.current) {
      lastPath.current = location.pathname;
      
      trackEvent({
        type: "page_view",
        name: location.pathname,
        properties: {
          search: location.search,
          hash: location.hash
        }
      }, config);
    }
  }, [location, config]);
  
  // Track click events
  const trackClick = useCallback((name: string, properties?: Record<string, unknown>) => {
    trackEvent({
      type: "click",
      name,
      properties
    }, config);
  }, [config]);
  
  // Track form submissions
  const trackFormSubmit = useCallback((name: string, properties?: Record<string, unknown>) => {
    trackEvent({
      type: "form_submit",
      name,
      properties
    }, config);
  }, [config]);
  
  // Track search
  const trackSearch = useCallback((query: string, properties?: Record<string, unknown>) => {
    trackEvent({
      type: "search",
      name: "search",
      properties: { query, ...properties }
    }, config);
  }, [config]);
  
  // Track feature usage
  const trackFeature = useCallback((featureName: string, properties?: Record<string, unknown>) => {
    trackEvent({
      type: "feature_use",
      name: featureName,
      properties
    }, config);
  }, [config]);
  
  // Track errors
  const trackError = useCallback((error: Error | string, properties?: Record<string, unknown>) => {
    trackEvent({
      type: "error",
      name: typeof error === "string" ? error : error.message,
      properties: {
        stack: error instanceof Error ? error.stack : undefined,
        ...properties
      }
    }, config);
  }, [config]);
  
  // Track conversions
  const trackConversion = useCallback((name: string, value?: number, properties?: Record<string, unknown>) => {
    trackEvent({
      type: "conversion",
      name,
      properties: { value, ...properties }
    }, config);
  }, [config]);
  
  return {
    trackClick,
    trackFormSubmit,
    trackSearch,
    trackFeature,
    trackError,
    trackConversion,
    trackEvent: (event: AnalyticsEvent) => trackEvent(event, config)
  };
};

/**
 * Performance tracking utilities
 */
export const trackPerformance = {
  // Track time to interactive
  tti: (value: number) => {
    trackEvent({
      type: "performance",
      name: "tti",
      properties: { value }
    });
  },
  
  // Track largest contentful paint
  lcp: (value: number) => {
    trackEvent({
      type: "performance",
      name: "lcp",
      properties: { value }
    });
  },
  
  // Track first input delay
  fid: (value: number) => {
    trackEvent({
      type: "performance",
      name: "fid",
      properties: { value }
    });
  },
  
  // Track cumulative layout shift
  cls: (value: number) => {
    trackEvent({
      type: "performance",
      name: "cls",
      properties: { value }
    });
  },
  
  // Track custom timing
  timing: (name: string, duration: number) => {
    trackEvent({
      type: "performance",
      name,
      properties: { duration }
    });
  }
};

export default useAnalytics;
