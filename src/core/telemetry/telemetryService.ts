/**
 * Telemetry Service
 * PATCH 623 - Core telemetry logging service
 */

import { supabase } from "@/integrations/supabase/client";

export interface TelemetryEvent {
  event_type: "performance" | "error" | "user_action" | "system";
  component: string;
  metric_name: string;
  metric_value: number;
  metadata?: Record<string, any>;
  timestamp?: string;
}

class TelemetryService {
  private queue: TelemetryEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL_MS = 10000; // 10 seconds
  private readonly MAX_QUEUE_SIZE = 50;

  constructor() {
    this.startFlushInterval();
  }

  /**
   * Log a performance metric
   */
  logPerformance(component: string, metricName: string, value: number, metadata?: Record<string, any>) {
    this.addEvent({
      event_type: "performance",
      component,
      metric_name: metricName,
      metric_value: value,
      metadata
    });
  }

  /**
   * Log an error
   */
  logError(component: string, error: Error, metadata?: Record<string, any>) {
    this.addEvent({
      event_type: "error",
      component,
      metric_name: "error_occurred",
      metric_value: 1,
      metadata: {
        ...metadata,
        error_message: error.message,
        error_stack: error.stack
      }
    });
  }

  /**
   * Log a user action
   */
  logUserAction(component: string, action: string, metadata?: Record<string, any>) {
    this.addEvent({
      event_type: "user_action",
      component,
      metric_name: action,
      metric_value: 1,
      metadata
    });
  }

  /**
   * Add event to queue
   */
  private addEvent(event: TelemetryEvent) {
    const eventWithTimestamp = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.queue.push(eventWithTimestamp);
    console.log(`[Telemetry] Event queued: ${event.event_type}/${event.component}/${event.metric_name} = ${event.metric_value}`);

    // Flush if queue is full
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush events to database
   */
  private async flush() {
    if (this.queue.length === 0) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      // Optional: Log to Supabase or external service
      // const { error } = await supabase.from('telemetry_events').insert(events);
      
      // For now, just log to console
      console.log(`[Telemetry] Flushed ${events.length} events to console`);
      
      // In production, you would send to your analytics service:
      // await sendToAnalytics(events);
    } catch (error) {
      console.error("[Telemetry] Failed to flush events:", error);
      // Re-queue events on failure
      this.queue.unshift(...events);
    }
  }

  /**
   * Start automatic flush interval
   */
  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Stop telemetry service
   */
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }
}

export const telemetryService = new TelemetryService();
