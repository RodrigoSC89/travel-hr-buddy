/**
 * PATCH 638: Telemetry Tracking System
 * Capture user interactions for UX improvement suggestions
 */

import { supabase } from "@/integrations/supabase/client";

interface TelemetryEvent {
  eventType: string;
  elementId?: string;
  elementName?: string;
  action: string;
  context?: Record<string, any>;
  isError?: boolean;
  errorMessage?: string;
}

class TelemetryTracker {
  private sessionId: string;
  private queue: TelemetryEvent[] = [];
  private flushInterval: number = 5000; // Flush every 5 seconds
  private maxQueueSize: number = 50;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushInterval();
    this.setupEventListeners();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private startFlushInterval(): void {
    this.intervalId = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupEventListeners(): void {
    // Track clicks with throttling to avoid performance impact
    let lastClickTime = 0;
    const throttleMs = 100; // Throttle to max 10 clicks per second
    
    const throttledClick = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastClickTime >= throttleMs) {
        lastClickTime = now;
        this.handleClick(event);
      }
    };
    
    document.addEventListener("click", throttledClick, true);

    // Track errors
    window.addEventListener("error", this.handleError.bind(this));

    // Track unhandled promise rejections
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection.bind(this));

    // Flush before page unload
    window.addEventListener("beforeunload", () => {
      this.flush();
    });
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Use data-track-id if available, fallback to id, then first class, then 'unknown'
    const elementId = target.dataset.trackId || 
                     target.id || 
                     target.className.split(" ")[0] || 
                     "unknown";
    const elementName = target.tagName.toLowerCase();

    this.track({
      eventType: "click",
      elementId,
      elementName,
      action: "click",
      context: {
        x: event.clientX,
        y: event.clientY,
        targetText: target.textContent?.substring(0, 50),
      },
    });
  }

  private handleError(event: ErrorEvent): void {
    this.track({
      eventType: "error",
      action: "error_occurred",
      isError: true,
      errorMessage: event.message,
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.track({
      eventType: "unhandled_rejection",
      action: "promise_rejection",
      isError: true,
      errorMessage: event.reason?.toString() || "Unknown promise rejection",
    });
  }

  track(event: TelemetryEvent): void {
    this.queue.push(event);

    // Flush if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const { error } = await supabase.from("telemetry_events").insert(
        events.map(event => ({
          event_type: event.eventType,
          element_id: event.elementId,
          element_name: event.elementName,
          action: event.action,
          context: event.context || {},
          session_id: this.sessionId,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          is_error: event.isError || false,
          error_message: event.errorMessage,
        }))
      );

      if (error) {
        console.error("Failed to send telemetry:", error);
        // Put events back in queue to retry
        this.queue.unshift(...events);
      }
    } catch (error) {
      console.error("Telemetry flush error:", error);
      // Put events back in queue to retry
      this.queue.unshift(...events);
    }
  }

  trackPageView(pageName: string): void {
    this.track({
      eventType: "pageview",
      action: "page_viewed",
      context: {
        pageName,
        referrer: document.referrer,
      },
    });
  }

  trackFeatureUse(featureName: string, details?: Record<string, any>): void {
    this.track({
      eventType: "feature_use",
      action: "feature_used",
      elementName: featureName,
      context: details,
    });
  }

  trackInteraction(elementId: string, interactionType: string, details?: Record<string, any>): void {
    this.track({
      eventType: "interaction",
      elementId,
      action: interactionType,
      context: details,
    });
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.flush();
  }
}

// Global telemetry tracker instance
export const telemetry = new TelemetryTracker();

/**
 * Initialize telemetry system
 */
export function initTelemetry() {
  // Telemetry is already initialized via the global instance
  // This function exists for compatibility
  console.log("[Telemetry] System initialized");
}

/**
 * React hook for tracking telemetry in components
 */
export function useTelemetry() {
  return {
    trackPageView: telemetry.trackPageView.bind(telemetry),
    trackFeatureUse: telemetry.trackFeatureUse.bind(telemetry),
    trackInteraction: telemetry.trackInteraction.bind(telemetry),
    track: telemetry.track.bind(telemetry),
  };
}
