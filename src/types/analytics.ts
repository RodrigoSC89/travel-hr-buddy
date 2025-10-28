/**
 * PATCH 347: Analytics Core v2 - Real-Time Pipelines Type Definitions
 * Types for real-time analytics events, metrics, and dashboards
 */

export type EventType = "page_view" | "user_action" | "api_call" | "error" | "system" | "business";
export type EventCategory = "navigation" | "interaction" | "system" | "business";
export type DeviceType = "desktop" | "mobile" | "tablet";
export type MetricType = "counter" | "gauge" | "histogram" | "rate";
export type AlertCondition = "greater_than" | "less_than" | "equals" | "not_equals";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "active" | "resolved" | "acknowledged";
export type Granularity = "second" | "minute" | "hour" | "day";

export interface AnalyticsEvent {
  id: string;
  event_type: EventType;
  event_category: EventCategory;
  event_name: string;
  user_id?: string;
  session_id?: string;
  properties: Record<string, unknown>;
  metrics?: Record<string, number>;
  timestamp: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface AnalyticsMetric {
  id: string;
  metric_name: string;
  metric_type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: string;
  granularity: Granularity;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description?: string;
  metric_name: string;
  condition: AlertCondition;
  threshold: number;
  timeframe_minutes: number;
  is_enabled: boolean;
  severity: AlertSeverity;
  notification_channels?: string[];
  last_triggered_at?: string;
  trigger_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsAlertHistory {
  id: string;
  alert_id: string;
  metric_value: number;
  threshold: number;
  severity: AlertSeverity;
  message?: string;
  metadata?: Record<string, unknown>;
  triggered_at: string;
  resolved_at?: string;
  status: AlertStatus;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  config: DashboardConfig;
  is_default: boolean;
  is_realtime: boolean;
  refresh_interval_seconds: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  layout?: {
    columns: number;
    rows: number;
  };
}

export interface DashboardWidget {
  type: "line_chart" | "bar_chart" | "counter" | "gauge" | "table" | "pie_chart";
  title: string;
  metric?: string;
  timeframe?: number; // minutes
  source?: string;
  limit?: number;
  filters?: Record<string, unknown>;
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface AnalyticsSession {
  id: string;
  session_id: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  last_activity_at: string;
  page_views: number;
  events_count: number;
  duration_seconds?: number;
  entry_page?: string;
  exit_page?: string;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    city?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface RealTimeMetrics {
  events_per_minute: number;
  active_users: number;
  page_views_last_5min: number;
  errors_last_5min: number;
  avg_response_time_ms: number;
  active_sessions: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface EventTrackingOptions {
  event_type: EventType;
  event_category: EventCategory;
  event_name: string;
  properties?: Record<string, unknown>;
  metrics?: Record<string, number>;
}
