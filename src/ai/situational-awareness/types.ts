/**
 * PATCH 576 - Situational Awareness Core Types
 * Type definitions for situational awareness system
 */

/**
 * Source types for data collection
 */
export type DataSource = "mqtt" | "supabase" | "websocket" | "internal";

/**
 * Module context sources
 */
export type ModuleSource = "navigation" | "weather" | "failures" | "crew" | "sensors" | "mission" | "system";

/**
 * Alert severity levels
 */
export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

/**
 * Alert types
 */
export type AlertType = "preventive" | "reactive" | "predictive" | "informational";

/**
 * Context data from modules
 */
export interface ModuleContextData {
  source: ModuleSource;
  dataSource: DataSource;
  timestamp: number;
  data: Record<string, any>;
  metadata?: {
    quality?: number; // Data quality score 0-1
    latency?: number; // Data age in ms
    reliability?: number; // Source reliability 0-1
  };
}

/**
 * AI-generated insight
 */
export interface SituationalInsight {
  id: string;
  timestamp: number;
  type: "opportunity" | "risk" | "optimization" | "alert";
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedModules: ModuleSource[];
  confidence: number; // 0-1
  suggestedActions: string[];
  context: Record<string, any>;
}

/**
 * Preventive alert
 */
export interface PreventiveAlert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  triggerConditions: string[];
  affectedSystems: ModuleSource[];
  recommendedActions: TacticalDecision[];
  expiresAt?: number;
}

/**
 * Tactical decision suggestion
 */
export interface TacticalDecision {
  id: string;
  action: string;
  priority: number; // 1-10
  estimatedImpact: string;
  implementationSteps: string[];
  risks: string[];
  confidence: number; // 0-1
}

/**
 * Situational awareness state
 */
export interface SituationalState {
  timestamp: number;
  overall_status: "normal" | "caution" | "warning" | "critical";
  modules: Record<ModuleSource, {
    status: "healthy" | "degraded" | "failed" | "unknown";
    lastUpdate: number;
    metrics: Record<string, any>;
  }>;
  activeAlerts: PreventiveAlert[];
  recentInsights: SituationalInsight[];
  systemHealth: number; // 0-1
}

/**
 * Observer mode configuration
 */
export interface ObserverConfig {
  enabled: boolean;
  interval: number; // Analysis interval in ms
  sources: DataSource[];
  modules: ModuleSource[];
  alertThresholds: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Situational log entry
 */
export interface SituationalLogEntry {
  id: string;
  timestamp: number;
  level: "debug" | "info" | "warn" | "error";
  category: "analysis" | "alert" | "decision" | "data_collection";
  message: string;
  context: Record<string, any>;
  moduleSource?: ModuleSource;
}
