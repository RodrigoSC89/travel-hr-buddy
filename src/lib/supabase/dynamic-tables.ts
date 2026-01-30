/**
 * Dynamic Table Access for tables not in generated Supabase types
 * Provides type-safe access to custom tables
 * 
 * These tables exist in migrations but are not included in the auto-generated types.
 * This module provides a type-safe interface for accessing them.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// ============================================================================
// TYPE DEFINITIONS FOR UNMAPPED TABLES
// ============================================================================

/** Weather logs for caching weather API responses */
export interface WeatherLog {
  id: string;
  latitude: number;
  longitude: number;
  weather_data: Json;
  created_at: string;
}

export interface WeatherLogInsert {
  latitude: number;
  longitude: number;
  weather_data: Json;
}

/** Analytics events for tracking user interactions */
export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_category: string;
  event_name: string;
  session_id: string | null;
  user_id: string | null;
  properties: Json | null;
  metrics: Json | null;
  page_url: string | null;
  timestamp: string;
  created_at: string;
}

/** Analytics alerts configuration */
export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string | null;
  metric_name: string;
  condition: string;
  threshold: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** Analytics alert history */
export interface AnalyticsAlertHistory {
  id: string;
  alert_id: string;
  triggered_at: string;
  value: number;
  message: string | null;
}

/** Analytics dashboards */
export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string | null;
  layout: Json | null;
  widgets: Json | null;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Analytics sessions */
export interface AnalyticsSession {
  id: string;
  session_id: string;
  user_id: string | null;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
  metadata: Json | null;
}

/** Smart workflows */
export interface SmartWorkflow {
  id: string;
  name: string;
  description: string | null;
  workflow_type: string;
  status: "draft" | "active" | "inactive";
  metadata: Json | null;
  created_by: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SmartWorkflowInsert {
  name: string;
  description?: string | null;
  workflow_type?: string;
  status?: "draft" | "active" | "inactive";
  metadata?: Json | null;
  created_by?: string | null;
  organization_id?: string | null;
}

/** Smart workflow steps */
export interface SmartWorkflowStep {
  id: string;
  workflow_id: string;
  step_name: string;
  description: string | null;
  position: number;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string | null;
}

export interface SmartWorkflowStepInsert {
  workflow_id: string;
  step_name: string;
  description?: string | null;
  position?: number;
  status?: string;
  priority?: string;
  assigned_to?: string | null;
  due_date?: string | null;
  created_by?: string | null;
  metadata?: Json | null;
}

/** Incident workflow logs */
export interface IncidentWorkflowLog {
  id: string;
  incident_id: string;
  action: string;
  notes: string | null;
  performed_by: string | null;
  performed_at: string;
  created_at: string;
}

export interface IncidentWorkflowLogInsert {
  incident_id: string;
  action: string;
  notes?: string | null;
  performed_by?: string | null;
  performed_at?: string;
}

/** API Routes */
export interface ApiRoute {
  id: string;
  route_path: string;
  route_name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  description: string | null;
  schema_validation: Json;
  rate_limit_tier: string | null;
  requires_auth: boolean;
  is_public: boolean;
  status: "active" | "beta" | "deprecated" | "disabled";
  version: string;
  tags: string[];
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface ApiRouteInsert {
  route_path: string;
  route_name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  description?: string | null;
  schema_validation?: Json;
  rate_limit_tier?: string | null;
  requires_auth?: boolean;
  is_public?: boolean;
  status?: "active" | "beta" | "deprecated" | "disabled";
  version?: string;
  tags?: string[];
  metadata?: Json;
}

// ============================================================================
// GENERIC DYNAMIC TABLE ACCESSOR
// ============================================================================

type TableName = "organizations"; // Type bypass - any table from the schema works

/**
 * Creates a type-safe accessor for dynamic tables
 */
function createTableAccessor<T, TInsert = Partial<T>>(tableName: string) {
  return {
    async select(columns = "*") {
      const { data, error } = await supabase
        .from(tableName as TableName)
        .select(columns);
      return { data: data as T[] | null, error };
    },

    async selectWithFilter(
      columns: string,
      filters: Array<{ column: string; operator: string; value: unknown }>
    ) {
      let query = supabase.from(tableName as TableName).select(columns);
      
      for (const filter of filters) {
        if (filter.operator === "eq") {
          query = query.eq(filter.column, filter.value as string);
        } else if (filter.operator === "gte") {
          query = query.gte(filter.column, filter.value as string);
        } else if (filter.operator === "lte") {
          query = query.lte(filter.column, filter.value as string);
        } else if (filter.operator === "is") {
          query = query.is(filter.column, filter.value as null);
        }
      }
      
      return query as unknown as Promise<{ data: T[] | null; error: Error | null }>;
    },

    async selectOne(id: string) {
      const { data, error } = await supabase
        .from(tableName as TableName)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      return { data: data as T | null, error };
    },

    async insert(values: TInsert | TInsert[]) {
      const { data, error } = await supabase
        .from(tableName as TableName)
        .insert(values as never)
        .select();
      return { data: data as T[] | null, error };
    },

    async insertNoSelect(values: TInsert | TInsert[]) {
      const { error } = await supabase
        .from(tableName as TableName)
        .insert(values as never);
      return { error };
    },

    async insertSingle(values: TInsert) {
      const { data, error } = await supabase
        .from(tableName as TableName)
        .insert(values as never)
        .select()
        .single();
      return { data: data as T | null, error };
    },

    async update(id: string, values: Partial<TInsert>) {
      const { data, error } = await supabase
        .from(tableName as TableName)
        .update(values as never)
        .eq("id", id)
        .select();
      return { data: data as T[] | null, error };
    },

    async updateSingle(id: string, values: Partial<TInsert>) {
      const { data, error } = await supabase
        .from(tableName as TableName)
        .update(values as never)
        .eq("id", id)
        .select()
        .single();
      return { data: data as T | null, error };
    },

    async delete(id: string) {
      const { error } = await supabase
        .from(tableName as TableName)
        .delete()
        .eq("id", id);
      return { error };
    },

    /**
     * Raw query builder for complex operations
     */
    query() {
      return supabase.from(tableName as TableName);
    },
  };
}

// ============================================================================
// TABLE ACCESSORS
// ============================================================================

/** Type-safe accessor for weather_logs table */
export const weatherLogsTable = createTableAccessor<WeatherLog, WeatherLogInsert>("weather_logs");

/** Type-safe accessor for analytics_events table */
export const analyticsEventsTable = createTableAccessor<AnalyticsEvent>("analytics_events");

/** Type-safe accessor for analytics_alerts table */
export const analyticsAlertsTable = createTableAccessor<AnalyticsAlert>("analytics_alerts");

/** Type-safe accessor for analytics_alert_history table */
export const analyticsAlertHistoryTable = createTableAccessor<AnalyticsAlertHistory>("analytics_alert_history");

/** Type-safe accessor for analytics_dashboards table */
export const analyticsDashboardsTable = createTableAccessor<AnalyticsDashboard>("analytics_dashboards");

/** Type-safe accessor for analytics_sessions table */
export const analyticsSessionsTable = createTableAccessor<AnalyticsSession>("analytics_sessions");

/** Type-safe accessor for smart_workflows table */
export const smartWorkflowsTable = createTableAccessor<SmartWorkflow, SmartWorkflowInsert>("smart_workflows");

/** Type-safe accessor for smart_workflow_steps table */
export const smartWorkflowStepsTable = createTableAccessor<SmartWorkflowStep, SmartWorkflowStepInsert>("smart_workflow_steps");

/** Type-safe accessor for incident_workflow_logs table */
export const incidentWorkflowLogsTable = createTableAccessor<IncidentWorkflowLog, IncidentWorkflowLogInsert>("incident_workflow_logs");

/** Type-safe accessor for api_routes table */
export const apiRoutesTable = createTableAccessor<ApiRoute, ApiRouteInsert>("api_routes");

// ============================================================================
// LEGACY SUPPORT - Generic dynamic accessor
// ============================================================================

/**
 * Generic dynamic table accessor for other custom tables
 * @deprecated Use specific table accessors instead
 */
export function dynamicFrom<T>(tableName: string) {
  return createTableAccessor<T>(tableName);
}
