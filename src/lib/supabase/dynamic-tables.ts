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
export function createTableAccessor<T, TInsert = Partial<T>>(tableName: string) {
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
// ADDITIONAL DYNAMIC TABLES FOR LEGACY MODULES
// ============================================================================

/** Travel Reservations - Used by TravelReservations component */
export interface TravelReservation {
  id: string;
  reservation_number: string;
  itinerary_id?: string | null;
  crew_member_id?: string | null;
  reservation_type: string;
  provider_name: string;
  booking_reference?: string | null;
  status: string;
  check_in_date?: string | null;
  check_out_date?: string | null;
  location?: string | null;
  cost?: number | null;
  currency: string;
  payment_status: string;
  notes?: string | null;
  created_at: string;
}

export interface TravelReservationInsert {
  reservation_number: string;
  itinerary_id?: string | null;
  crew_member_id?: string | null;
  reservation_type: string;
  provider_name: string;
  booking_reference?: string | null;
  status?: string;
  check_in_date?: string | null;
  check_out_date?: string | null;
  location?: string | null;
  cost?: number | null;
  currency?: string;
  payment_status?: string;
  notes?: string | null;
}

/** Type-safe accessor for travel_reservations table */
export const travelReservationsTable = createTableAccessor<TravelReservation, TravelReservationInsert>("travel_reservations");

/** Sonar Readings - Used by SonarPersistenceService */
export interface SonarReading {
  id: string;
  mission_id?: string | null;
  user_id: string;
  location: Json;
  depth: number;
  timestamp: string;
  terrain_type: string;
  risk_level: string;
  temperature?: number | null;
  pressure?: number | null;
  visibility?: number | null;
  reading_data?: Json | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
}

export interface SonarReadingInsert {
  mission_id?: string | null;
  user_id: string;
  location: Json;
  depth: number;
  timestamp?: string;
  terrain_type: string;
  risk_level: string;
  temperature?: number | null;
  pressure?: number | null;
  visibility?: number | null;
  reading_data?: Json | null;
  metadata?: Json | null;
}

/** Type-safe accessor for sonar_readings table */
export const sonarReadingsTable = createTableAccessor<SonarReading, SonarReadingInsert>("sonar_readings");

/** Sonar AI Predictions */
export interface SonarAIPrediction {
  id: string;
  reading_id?: string | null;
  user_id: string;
  prediction_type: string;
  confidence: number;
  location: Json;
  depth_range?: Json | null;
  description?: string | null;
  detected_objects?: Json | null;
  safe_route_recommendation?: Json | null;
  warnings?: string[] | null;
  ai_model?: string | null;
  processed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SonarAIPredictionInsert {
  reading_id?: string | null;
  user_id: string;
  prediction_type: string;
  confidence: number;
  location: Json;
  depth_range?: Json | null;
  description?: string | null;
  detected_objects?: Json | null;
  safe_route_recommendation?: Json | null;
  warnings?: string[] | null;
  ai_model?: string | null;
  processed_at?: string;
}

/** Type-safe accessor for sonar_ai_predictions table */
export const sonarAIPredictionsTable = createTableAccessor<SonarAIPrediction, SonarAIPredictionInsert>("sonar_ai_predictions");

/** Vessel Sensors - Used by FleetTelemetryModule */
export interface VesselSensor {
  id: string;
  vessel_id: string;
  sensor_type: string;
  value: number;
  unit: string;
  threshold_min?: number | null;
  threshold_max?: number | null;
  status: string;
  timestamp: string;
  created_at: string;
}

export interface VesselSensorInsert {
  vessel_id: string;
  sensor_type: string;
  value: number;
  unit: string;
  threshold_min?: number | null;
  threshold_max?: number | null;
  status?: string;
  timestamp?: string;
}

/** Type-safe accessor for vessel_sensors table */
export const vesselSensorsTable = createTableAccessor<VesselSensor, VesselSensorInsert>("vessel_sensors");

/** Maintenance Alerts - Used by FleetTelemetryModule */
export interface MaintenanceAlert {
  id: string;
  vessel_id: string;
  alert_type: string;
  component: string;
  severity: string;
  message: string;
  predicted_failure_date?: string | null;
  is_resolved: boolean;
  resolved_at?: string | null;
  created_at: string;
}

export interface MaintenanceAlertInsert {
  vessel_id: string;
  alert_type: string;
  component: string;
  severity: string;
  message: string;
  predicted_failure_date?: string | null;
  is_resolved?: boolean;
  resolved_at?: string | null;
}

/** Type-safe accessor for maintenance_alerts table */
export const maintenanceAlertsTable = createTableAccessor<MaintenanceAlert, MaintenanceAlertInsert>("maintenance_alerts");

/** PEODP Plans - Used by PEODP Wizard */
export interface PeodpPlan {
  id: string;
  vessel_name: string;
  vessel_type: string;
  dp_class: string;
  operation_type: string;
  form_data: Json;
  validation_results: Json | null;
  inference_results: Json | null;
  status: string;
  created_by: string;
  organization_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PeodpPlanInsert {
  vessel_name: string;
  vessel_type: string;
  dp_class: string;
  operation_type: string;
  form_data: Json;
  validation_results?: Json | null;
  inference_results?: Json | null;
  status?: string;
  created_by: string;
  organization_id?: string | null;
}

/** Type-safe accessor for peodp_plans table */
export const peodpPlansTable = createTableAccessor<PeodpPlan, PeodpPlanInsert>("peodp_plans");

/** Organization Branding - Used by OrganizationCustomization */
export interface OrganizationBranding {
  id: string;
  organization_id: string;
  company_name: string;
  logo_url?: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  theme_mode: string;
  default_language: string;
  default_currency: string;
  timezone: string;
  custom_fields: Json | null;
  business_rules: Json | null;
  enabled_modules: Json | null;
  module_settings: Json | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationBrandingInsert {
  organization_id: string;
  company_name: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  theme_mode?: string;
  default_language?: string;
  default_currency?: string;
  timezone?: string;
  custom_fields?: Json | null;
  business_rules?: Json | null;
  enabled_modules?: Json | null;
  module_settings?: Json | null;
}

/** Type-safe accessor for organization_branding table */
export const organizationBrandingTable = createTableAccessor<OrganizationBranding, OrganizationBrandingInsert>("organization_branding");

// ============================================================================
// MMI HISTORY - Used by historyService.ts
// ============================================================================

export interface MMIHistory {
  id: string;
  vessel_id?: string | null;
  task_description: string;
  system_name?: string | null;
  component_name?: string | null;
  status?: string | null;
  priority?: string | null;
  scheduled_date?: string | null;
  completed_date?: string | null;
  technician_id?: string | null;
  ai_recommendation?: string | null;
  maintenance_type?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  notes?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
  executed_at?: string | null;
  pdf_url?: string | null;
}

export interface MMIHistoryInsert {
  vessel_id?: string | null;
  task_description: string;
  system_name?: string | null;
  component_name?: string | null;
  status?: string | null;
  priority?: string | null;
  scheduled_date?: string | null;
  completed_date?: string | null;
  technician_id?: string | null;
  ai_recommendation?: string | null;
  maintenance_type?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  notes?: string | null;
  metadata?: Json | null;
  executed_at?: string | null;
  pdf_url?: string | null;
}

export const mmiHistoryTable = createTableAccessor<MMIHistory, MMIHistoryInsert>("mmi_history");

// ============================================================================
// SATELLITES - Used by satellite-tracker.tsx
// ============================================================================

export interface Satellite {
  id: string;
  norad_id?: string | null;
  name: string;
  satellite_type?: string | null;
  operator?: string | null;
  launch_date?: string | null;
  orbital_period_minutes?: number | null;
  inclination_degrees?: number | null;
  apogee_km?: number | null;
  perigee_km?: number | null;
  tle_line1?: string | null;
  tle_line2?: string | null;
  is_active?: boolean | null;
  organization_id?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
}

export interface SatelliteInsert {
  norad_id?: string | null;
  name: string;
  satellite_type?: string | null;
  operator?: string | null;
  launch_date?: string | null;
  orbital_period_minutes?: number | null;
  inclination_degrees?: number | null;
  apogee_km?: number | null;
  perigee_km?: number | null;
  tle_line1?: string | null;
  tle_line2?: string | null;
  is_active?: boolean | null;
  organization_id?: string | null;
  metadata?: Json | null;
}

export const satellitesTable = createTableAccessor<Satellite, SatelliteInsert>("satellites");

export interface SatellitePosition {
  id: string;
  satellite_id: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_km_s?: number | null;
  timestamp: string;
  created_at: string;
}

export interface SatellitePositionInsert {
  satellite_id: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_km_s?: number | null;
  timestamp?: string;
}

export const satellitePositionsTable = createTableAccessor<SatellitePosition, SatellitePositionInsert>("satellite_positions");

export interface SatelliteAlert {
  id: string;
  satellite_id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved?: boolean | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface SatelliteAlertInsert {
  satellite_id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_resolved?: boolean | null;
  resolved_at?: string | null;
}

export const satelliteAlertsTable = createTableAccessor<SatelliteAlert, SatelliteAlertInsert>("satellite_alerts");

// ============================================================================
// PERFORMANCE MONITORING - Used by PerformanceMonitoringDashboard.tsx
// ============================================================================

export interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  target_value?: number | null;
  status: string;
  category: string;
  recorded_at: string;
  created_at: string;
  metric_type?: string | null;
  component?: string | null;
  page_url?: string | null;
  user_id?: string | null;
  session_id?: string | null;
  device_type?: string | null;
  browser?: string | null;
  connection_type?: string | null;
  metadata?: Json | null;
  unit?: string | null;
}

export interface PerformanceMetricInsert {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  target_value?: number | null;
  status: string;
  category: string;
  recorded_at?: string;
  metric_type?: string | null;
  component?: string | null;
  page_url?: string | null;
  user_id?: string | null;
  session_id?: string | null;
  device_type?: string | null;
  browser?: string | null;
  connection_type?: string | null;
  metadata?: Json | null;
  unit?: string | null;
}

export const performanceMetricsTable = createTableAccessor<PerformanceMetric, PerformanceMetricInsert>("performance_metrics");

export interface PerformanceAlert {
  id: string;
  metric_id?: string | null;
  alert_type: string;
  severity: string;
  message: string;
  threshold_value?: number | null;
  actual_value?: number | null;
  is_resolved?: boolean | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface PerformanceAlertInsert {
  metric_id?: string | null;
  alert_type: string;
  severity: string;
  message: string;
  threshold_value?: number | null;
  actual_value?: number | null;
  is_resolved?: boolean | null;
  resolved_at?: string | null;
}

export const performanceAlertsTable = createTableAccessor<PerformanceAlert, PerformanceAlertInsert>("performance_alerts");

// ============================================================================
// UNDERWATER DRONE - Used by underwaterMissionService.ts
// ============================================================================

export interface UnderwaterMission {
  id: string;
  user_id: string;
  mission_name: string;
  mission_type: string;
  status: string;
  start_time?: string | null;
  end_time?: string | null;
  target_location?: Json | null;
  depth_target?: number | null;
  max_depth?: number | null;
  battery_level?: number | null;
  notes?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
}

export interface UnderwaterMissionInsert {
  user_id: string;
  mission_name: string;
  mission_type: string;
  status?: string;
  start_time?: string | null;
  end_time?: string | null;
  target_location?: Json | null;
  depth_target?: number | null;
  max_depth?: number | null;
  battery_level?: number | null;
  notes?: string | null;
  metadata?: Json | null;
}

export const underwaterMissionsTable = createTableAccessor<UnderwaterMission, UnderwaterMissionInsert>("underwater_missions");

export interface DroneTelemetry {
  id: string;
  mission_id: string;
  latitude: number;
  longitude: number;
  depth: number;
  heading?: number | null;
  speed?: number | null;
  battery_level?: number | null;
  water_temperature?: number | null;
  pressure?: number | null;
  status: string;
  timestamp: string;
  created_at: string;
}

export interface DroneTelemetryInsert {
  mission_id: string;
  latitude: number;
  longitude: number;
  depth: number;
  heading?: number | null;
  speed?: number | null;
  battery_level?: number | null;
  water_temperature?: number | null;
  pressure?: number | null;
  status?: string;
  timestamp?: string;
}

export const droneTelemetryTable = createTableAccessor<DroneTelemetry, DroneTelemetryInsert>("drone_telemetry");

export interface MissionEvent {
  id: string;
  mission_id: string;
  event_type: string;
  severity?: string | null;
  message: string;
  event_data?: Json | null;
  timestamp: string;
  created_at: string;
}

export interface MissionEventInsert {
  mission_id: string;
  event_type: string;
  severity?: string | null;
  message: string;
  event_data?: Json | null;
  timestamp?: string;
}

export const missionEventsTable = createTableAccessor<MissionEvent, MissionEventInsert>("mission_events");

// ============================================================================
// CREW AI INSIGHTS - Used by advanced-crew-dossier-interaction.tsx
// ============================================================================

export interface CrewAIInsight {
  id: string;
  crew_member_id: string;
  analysis_type: string;
  insights_data: Json;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface CrewAIInsightInsert {
  crew_member_id: string;
  analysis_type: string;
  insights_data: Json;
  confidence_score: number;
}

export const crewAIInsightsTable = createTableAccessor<CrewAIInsight, CrewAIInsightInsert>("crew_ai_insights");

// ============================================================================
// COORDINATION AI - Used by coordinationAIService.ts
// ============================================================================

export interface CoordinationAgent {
  id: string;
  agent_name: string;
  agent_type: string;
  capabilities: Json;
  status: string;
  priority_level: number;
  max_concurrent_tasks: number;
  current_task_count: number;
  metadata: Json | null;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoordinationAgentInsert {
  agent_name: string;
  agent_type: string;
  capabilities?: Json;
  status?: string;
  priority_level?: number;
  max_concurrent_tasks?: number;
  metadata?: Json | null;
}

export const coordinationAgentsTable = createTableAccessor<CoordinationAgent, CoordinationAgentInsert>("coordination_agents");

export interface CoordinationTask {
  id: string;
  task_name: string;
  task_type: string;
  description: string | null;
  priority: number;
  status: string;
  assigned_agent_id: string | null;
  input_data: Json | null;
  output_data: Json | null;
  dependencies: string[] | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CoordinationTaskInsert {
  task_name: string;
  task_type: string;
  description?: string | null;
  priority?: number;
  status?: string;
  assigned_agent_id?: string | null;
  input_data?: Json | null;
  dependencies?: string[] | null;
  deadline?: string | null;
}

export const coordinationTasksTable = createTableAccessor<CoordinationTask, CoordinationTaskInsert>("coordination_tasks");

export interface CoordinationDecision {
  id: string;
  decision_type: string;
  context: Json;
  agents_involved: string[];
  consensus_result: Json | null;
  final_decision: string;
  confidence_score: number;
  rationale: string | null;
  created_at: string;
}

export interface CoordinationDecisionInsert {
  decision_type: string;
  context: Json;
  agents_involved: string[];
  consensus_result?: Json | null;
  final_decision: string;
  confidence_score: number;
  rationale?: string | null;
}

export const coordinationDecisionsTable = createTableAccessor<CoordinationDecision, CoordinationDecisionInsert>("coordination_decisions");

// ============================================================================
// FINANCE HUB - Used by finance-hub.service.ts
// ============================================================================

export interface FinanceTransaction {
  id: string;
  transaction_id: string;
  type: "income" | "expense" | "transfer";
  category_id: string | null;
  amount: number;
  currency: string;
  description: string | null;
  date: string;
  payment_method: string | null;
  reference_number: string | null;
  vendor: string | null;
  project_id: string | null;
  department: string | null;
  status: "pending" | "completed" | "cancelled";
  created_by: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  metadata: Json | null;
}

export interface FinanceTransactionInsert {
  transaction_id?: string;
  type: "income" | "expense" | "transfer";
  category_id?: string | null;
  amount: number;
  currency?: string;
  description?: string | null;
  date: string;
  payment_method?: string | null;
  reference_number?: string | null;
  vendor?: string | null;
  project_id?: string | null;
  department?: string | null;
  status?: "pending" | "completed" | "cancelled";
  created_by?: string | null;
  organization_id?: string | null;
  metadata?: Json | null;
}

export const financeTransactionsTable = createTableAccessor<FinanceTransaction, FinanceTransactionInsert>("finance_transactions");

export interface FinanceCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  parent_category_id: string | null;
  color: string | null;
  icon: string | null;
  budget_limit: number | null;
  is_active: boolean;
  organization_id: string | null;
  created_at: string;
}

export interface FinanceCategoryInsert {
  name: string;
  type: "income" | "expense";
  parent_category_id?: string | null;
  color?: string | null;
  icon?: string | null;
  budget_limit?: number | null;
  is_active?: boolean;
  organization_id?: string | null;
}

export const financeCategoriesTable = createTableAccessor<FinanceCategory, FinanceCategoryInsert>("finance_categories");

export interface FinanceBudget {
  id: string;
  name: string;
  category_id: string | null;
  amount: number;
  spent: number;
  remaining: number;
  period: "monthly" | "quarterly" | "yearly" | "custom";
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "exceeded";
  alert_threshold: number | null;
  created_by: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceBudgetInsert {
  name: string;
  category_id?: string | null;
  amount: number;
  spent?: number;
  remaining?: number;
  period?: "monthly" | "quarterly" | "yearly" | "custom";
  start_date: string;
  end_date: string;
  status?: "active" | "completed" | "exceeded";
  alert_threshold?: number | null;
  created_by?: string | null;
  organization_id?: string | null;
}

export const financeBudgetsTable = createTableAccessor<FinanceBudget, FinanceBudgetInsert>("finance_budgets");

// ============================================================================
// PRICE ALERTS - Used by price-alert-dashboard.tsx
// ============================================================================

export interface PriceAlert {
  id: string;
  product_name: string;
  current_price: number | null;
  target_price: number;
  product_url: string;
  is_active: boolean;
  created_at: string;
  last_checked_at: string | null;
  user_id: string;
}

export interface PriceAlertInsert {
  product_name: string;
  current_price?: number | null;
  target_price: number;
  product_url: string;
  is_active?: boolean;
  user_id: string;
}

export const priceAlertsTable = createTableAccessor<PriceAlert, PriceAlertInsert>("price_alerts");

export interface PriceHistory {
  id: string;
  alert_id: string;
  price: number;
  checked_at: string;
}

export interface PriceHistoryInsert {
  alert_id: string;
  price: number;
  checked_at?: string;
}

export const priceHistoryTable = createTableAccessor<PriceHistory, PriceHistoryInsert>("price_history");

export interface PriceNotification {
  id: string;
  alert_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PriceNotificationInsert {
  alert_id: string;
  message: string;
  is_read?: boolean;
}

export const priceNotificationsTable = createTableAccessor<PriceNotification, PriceNotificationInsert>("price_notifications");

// ============================================================================
// PERFORMANCE METRICS - Used by performance-profiler.tsx
// ============================================================================

export interface PerformanceSnapshot {
  id: string;
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  fps: number;
  slow_components: Json;
  page_load_time: number | null;
  network_latency: number | null;
  user_id: string | null;
  organization_id: string | null;
  created_at: string;
}

export interface PerformanceSnapshotInsert {
  cpu_usage: number;
  memory_usage: number;
  fps: number;
  slow_components?: Json;
  page_load_time?: number | null;
  network_latency?: number | null;
  user_id?: string | null;
  organization_id?: string | null;
}

export const performanceSnapshotsTable = createTableAccessor<PerformanceSnapshot, PerformanceSnapshotInsert>("performance_snapshots");

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
