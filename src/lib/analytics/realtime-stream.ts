/**
 * Real-Time Streaming Analytics
 * WebSocket-based live metrics and updates
 * Phase 4: Analytics Premium
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface StreamMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  change_percent: number;
  trend: "up" | "down" | "stable";
  timestamp: string;
}

export interface StreamEvent {
  type: "metric" | "alert" | "update" | "notification";
  source: string;
  data: unknown;
  timestamp: string;
}

export type StreamCallback = (event: StreamEvent) => void;

/**
 * Real-Time Stream Manager
 * Handles WebSocket connections for live analytics
 */
export class RealtimeStreamManager {
  private subscriptions = new Map<string, ReturnType<typeof supabase.channel>>();
  private callbacks = new Map<string, Set<StreamCallback>>();
  private metricsBuffer = new Map<string, StreamMetric[]>();
  private aggregationInterval: number | null = null;

  /**
   * Initialize real-time streaming
   */
  async initialize(): Promise<void> {
    try {
      // Subscribe to key tables for real-time updates
      await this.subscribeToTable("crew_members", "crew");
      await this.subscribeToTable("vessels", "fleet");
      await this.subscribeToTable("incidents", "safety");
      await this.subscribeToTable("soc_alerts", "alerts");

      // Start metrics aggregation
      this.startMetricsAggregation();

      logger.info("[Stream] Real-time streaming initialized");
    } catch (error) {
      logger.error("[Stream] Initialization failed", error);
    }
  }

  /**
   * Subscribe to a Supabase table for real-time changes
   */
  private async subscribeToTable(
    table: string,
    source: string
  ): Promise<void> {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          this.handleDatabaseChange(source, payload);
        }
      )
      .subscribe();

    this.subscriptions.set(table, channel);
  }

  /**
   * Handle database change event
   */
  private handleDatabaseChange(
    source: string,
    payload: {
      eventType: string;
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }
  ): void {
    const event: StreamEvent = {
      type: "update",
      source,
      data: {
        eventType: payload.eventType,
        record: payload.new || payload.old,
      },
      timestamp: new Date().toISOString(),
    };

    this.notifySubscribers(source, event);
  }

  /**
   * Subscribe to a specific stream source
   */
  subscribe(source: string, callback: StreamCallback): () => void {
    if (!this.callbacks.has(source)) {
      this.callbacks.set(source, new Set());
    }
    this.callbacks.get(source)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.get(source)?.delete(callback);
    };
  }

  /**
   * Subscribe to all streams
   */
  subscribeAll(callback: StreamCallback): () => void {
    return this.subscribe("*", callback);
  }

  /**
   * Notify subscribers of an event
   */
  private notifySubscribers(source: string, event: StreamEvent): void {
    // Notify source-specific subscribers
    this.callbacks.get(source)?.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        logger.error("[Stream] Callback error", e);
      }
    });

    // Notify wildcard subscribers
    this.callbacks.get("*")?.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        logger.error("[Stream] Callback error", e);
      }
    });
  }

  /**
   * Push a custom metric
   */
  pushMetric(metric: Omit<StreamMetric, "id" | "timestamp">): void {
    const fullMetric: StreamMetric = {
      ...metric,
      id: `${metric.name}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Buffer metric
    if (!this.metricsBuffer.has(metric.name)) {
      this.metricsBuffer.set(metric.name, []);
    }
    const buffer = this.metricsBuffer.get(metric.name)!;
    buffer.push(fullMetric);

    // Keep only last 100 points
    if (buffer.length > 100) {
      buffer.shift();
    }

    // Notify subscribers
    this.notifySubscribers("metrics", {
      type: "metric",
      source: "metrics",
      data: fullMetric,
      timestamp: fullMetric.timestamp,
    });
  }

  /**
   * Push an alert
   */
  pushAlert(alert: {
    title: string;
    message: string;
    severity: "info" | "warning" | "error" | "critical";
    source?: string;
  }): void {
    this.notifySubscribers("alerts", {
      type: "alert",
      source: alert.source || "system",
      data: alert,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start metrics aggregation loop
   */
  private startMetricsAggregation(): void {
    // Aggregate every 5 seconds
    this.aggregationInterval = window.setInterval(() => {
      this.aggregateMetrics();
    }, 5000);
  }

  /**
   * Aggregate buffered metrics
   */
  private aggregateMetrics(): void {
    const aggregated: Record<string, StreamMetric> = {};

    this.metricsBuffer.forEach((buffer, name) => {
      if (buffer.length === 0) return;

      const latest = buffer[buffer.length - 1];
      const previous = buffer.length > 1 ? buffer[buffer.length - 2] : latest;

      const change = latest.value - previous.value;
      const changePercent =
        previous.value !== 0 ? (change / previous.value) * 100 : 0;

      aggregated[name] = {
        ...latest,
        change,
        change_percent: changePercent,
        trend:
          changePercent > 1 ? "up" : changePercent < -1 ? "down" : "stable",
      };
    });

    if (Object.keys(aggregated).length > 0) {
      this.notifySubscribers("aggregated", {
        type: "metric",
        source: "aggregated",
        data: aggregated,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get historical metrics for a name
   */
  getMetricHistory(name: string, limit: number = 50): StreamMetric[] {
    const buffer = this.metricsBuffer.get(name) || [];
    return buffer.slice(-limit);
  }

  /**
   * Get current value for a metric
   */
  getCurrentMetric(name: string): StreamMetric | null {
    const buffer = this.metricsBuffer.get(name);
    return buffer && buffer.length > 0 ? buffer[buffer.length - 1] : null;
  }

  /**
   * Create a live counter
   */
  createCounter(name: string, initialValue: number = 0): {
    increment: (by?: number) => void;
    decrement: (by?: number) => void;
    set: (value: number) => void;
    get: () => number;
  } {
    let value = initialValue;

    const push = () => {
      this.pushMetric({
        name,
        value,
        unit: "count",
        change: 0,
        change_percent: 0,
        trend: "stable",
      });
    };

    return {
      increment: (by = 1) => {
        value += by;
        push();
      },
      decrement: (by = 1) => {
        value -= by;
        push();
      },
      set: (newValue) => {
        value = newValue;
        push();
      },
      get: () => value,
    };
  }

  /**
   * Create a live gauge
   */
  createGauge(
    name: string,
    unit: string,
    fetcher: () => Promise<number>,
    intervalMs: number = 10000
  ): () => void {
    let interval: number;

    const update = async () => {
      try {
        const value = await fetcher();
        const history = this.getMetricHistory(name, 2);
        const previous = history.length > 0 ? history[history.length - 1].value : value;
        const change = value - previous;

        this.pushMetric({
          name,
          value,
          unit,
          change,
          change_percent: previous !== 0 ? (change / previous) * 100 : 0,
          trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
        });
      } catch (error) {
        logger.error(`[Stream] Gauge fetch error: ${name}`, error);
      }
    };

    // Initial update
    update();

    // Schedule updates
    interval = window.setInterval(update, intervalMs);

    // Return cleanup function
    return () => clearInterval(interval);
  }

  /**
   * Cleanup and disconnect
   */
  destroy(): void {
    // Unsubscribe from all Supabase channels
    this.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();

    // Clear callbacks
    this.callbacks.clear();

    // Clear buffers
    this.metricsBuffer.clear();

    // Stop aggregation
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }

    logger.info("[Stream] Destroyed");
  }
}

// Singleton instance
export const realtimeStream = new RealtimeStreamManager();
