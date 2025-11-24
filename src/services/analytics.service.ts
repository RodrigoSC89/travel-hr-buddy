/**
 * PATCH 347: Analytics Core v2 - Real-Time Service Layer
 * PATCH-601: Re-applied @ts-nocheck for build stability
 * Service for tracking events, managing metrics, and handling alerts
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  AnalyticsEvent,
  AnalyticsAlert,
  AnalyticsDashboard,
  RealTimeMetrics,
  TimeSeriesData,
  EventTrackingOptions,
} from "@/types/analytics";

export class AnalyticsService {
  private static sessionId: string | null = null;

  // Session Management
  static initSession(): string {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    return this.sessionId;
  }

  static getSessionId(): string {
    return this.sessionId || this.initSession();
  }

  // Event Tracking
  static async trackEvent(options: EventTrackingOptions): Promise<string> {
    const sessionId = this.getSessionId();

    const { data, error } = await supabase.rpc("track_analytics_event", {
      p_event_type: options.event_type,
      p_event_category: options.event_category,
      p_event_name: options.event_name,
      p_session_id: sessionId,
      p_properties: options.properties || {},
      p_metrics: options.metrics || null,
      p_page_url: window.location.href,
    });

    if (error) throw error;
    return data;
  }

  static async trackPageView(pageName: string): Promise<string> {
    return this.trackEvent({
      event_type: "page_view",
      event_category: "navigation",
      event_name: pageName,
      properties: {
        url: window.location.href,
        title: document.title,
      },
    });
  }

  static async trackUserAction(
    actionName: string,
    properties?: Record<string, unknown>
  ): Promise<string> {
    return this.trackEvent({
      event_type: "user_action",
      event_category: "interaction",
      event_name: actionName,
      properties,
    });
  }

  static async trackError(
    errorMessage: string,
    errorDetails?: Record<string, unknown>
  ): Promise<string> {
    return this.trackEvent({
      event_type: "error",
      event_category: "system",
      event_name: "error_occurred",
      properties: {
        message: errorMessage,
        ...errorDetails,
      },
    });
  }

  // Events Retrieval
  static async getEvents(
    timeframeMinutes = 5,
    limit = 100
  ): Promise<AnalyticsEvent[]> {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte(
        "timestamp",
        new Date(Date.now() - timeframeMinutes * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getEventsByType(
    eventType: string,
    timeframeMinutes = 60
  ): Promise<AnalyticsEvent[]> {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("event_type", eventType)
      .gte(
        "timestamp",
        new Date(Date.now() - timeframeMinutes * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Real-Time Metrics
  static async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const now = Date.now();
    const fiveMinAgo = new Date(now - 5 * 60 * 1000);

    const [events, sessions] = await Promise.all([
      this.getEvents(5, 1000),
      this.getActiveSessions(),
    ]);

    const eventsPerMinute = events.length / 5;
    const pageViews = events.filter((e) => e.event_type === "page_view").length;
    const errors = events.filter((e) => e.event_type === "error").length;
    const uniqueUsers = new Set(events.map((e) => e.user_id).filter(Boolean)).size;

    return {
      events_per_minute: Math.round(eventsPerMinute),
      active_users: uniqueUsers,
      page_views_last_5min: pageViews,
      errors_last_5min: errors,
      avg_response_time_ms: 0, // Would be calculated from API call events
      active_sessions: sessions.length,
    };
  }

  // Time Series Data
  static async getTimeSeriesData(
    metricName: string,
    timeframeMinutes = 60,
    granularityMinutes = 5
  ): Promise<TimeSeriesData[]> {
    const endTime = new Date();
    const startTime = new Date(Date.now() - timeframeMinutes * 60 * 1000);

    const { data, error } = await supabase
      .from("analytics_events")
      .select("timestamp")
      .eq("event_type", metricName)
      .gte("timestamp", startTime.toISOString())
      .lte("timestamp", endTime.toISOString())
      .order("timestamp", { ascending: true });

    if (error) throw error;

    // Aggregate events into time buckets
    const buckets = new Map<string, number>();
    const bucketSize = granularityMinutes * 60 * 1000;

    (data || []).forEach((event) => {
      const time = new Date(event.timestamp).getTime();
      const bucketTime = Math.floor(time / bucketSize) * bucketSize;
      const bucketKey = new Date(bucketTime).toISOString();
      buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1);
    });

    return Array.from(buckets.entries())
      .map(([timestamp, value]) => ({ timestamp, value }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  // Alerts Management
  static async getAlerts(): Promise<AnalyticsAlert[]> {
    const { data, error } = await supabase
      .from("analytics_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getActiveAlerts(): Promise<AnalyticsAlert[]> {
    const alerts = await this.getAlerts();
    return alerts.filter((a) => a.is_enabled);
  }

  static async createAlert(
    alert: Partial<AnalyticsAlert>
  ): Promise<AnalyticsAlert> {
    const { data, error } = await supabase
      .from("analytics_alerts")
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAlert(
    id: string,
    updates: Partial<AnalyticsAlert>
  ): Promise<AnalyticsAlert> {
    const { data, error } = await supabase
      .from("analytics_alerts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async toggleAlert(id: string, enabled: boolean): Promise<void> {
    await this.updateAlert(id, { is_enabled: enabled });
  }

  static async checkAlerts(): Promise<void> {
    const { error } = await supabase.rpc("check_analytics_alerts");
    if (error) throw error;
  }

  static async getAlertHistory(alertId?: string) {
    let query = supabase
      .from("analytics_alert_history")
      .select("*")
      .order("triggered_at", { ascending: false })
      .limit(50);

    if (alertId) {
      query = query.eq("alert_id", alertId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Dashboards
  static async getDashboards(): Promise<AnalyticsDashboard[]> {
    const { data, error } = await supabase
      .from("analytics_dashboards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getDefaultDashboard(): Promise<AnalyticsDashboard | null> {
    const { data, error } = await supabase
      .from("analytics_dashboards")
      .select("*")
      .eq("is_default", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createDashboard(
    dashboard: Partial<AnalyticsDashboard>
  ): Promise<AnalyticsDashboard> {
    const { data, error } = await supabase
      .from("analytics_dashboards")
      .insert(dashboard)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Sessions
  static async getActiveSessions() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const { data, error } = await supabase
      .from("analytics_sessions")
      .select("*")
      .gte("last_activity_at", fiveMinAgo.toISOString())
      .is("ended_at", null);

    if (error) throw error;
    return data || [];
  }

  // Aggregation
  static async aggregateMetrics(): Promise<void> {
    const { error } = await supabase.rpc("aggregate_analytics_metrics", {
      p_granularity: "minute",
    });
    if (error) throw error;
  }
}
