/**
 * Supabase Type Aliases
 * Centralized type exports for existing Supabase tables only
 */

import type { Database, Json } from "@/integrations/supabase/types";

// Helper types
export type TableRow<T extends keyof Database["public"]["Tables"]> = 
  Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends keyof Database["public"]["Tables"]> = 
  Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends keyof Database["public"]["Tables"]> = 
  Database["public"]["Tables"][T]["Update"];

export type { Json };

// ============================================================================
// VERIFIED EXISTING TABLES ONLY
// ============================================================================

// Core
export type Organization = TableRow<"organizations">;
export type OrganizationInsert = TableInsert<"organizations">;
export type Vessel = TableRow<"vessels">;
export type VesselInsert = TableInsert<"vessels">;
export type Profile = TableRow<"profiles">;
export type ProfileInsert = TableInsert<"profiles">;

// Crew
export type CrewMember = TableRow<"crew_members">;
export type CrewMemberInsert = TableInsert<"crew_members">;
export type CrewAssignment = TableRow<"crew_assignments">;
export type CrewDocument = TableRow<"crew_documents">;
export type CrewPerformanceReview = TableRow<"crew_performance_reviews">;
export type CrewHealthCheckin = TableRow<"crew_health_checkins">;

// Certificates
export type MaritimeCertificate = TableRow<"maritime_certificates">;
export type MaritimeCertificateInsert = TableInsert<"maritime_certificates">;

// Compliance
export type PscInspection = TableRow<"psc_inspections">;
export type PscDeficiency = TableRow<"psc_deficiencies">;
export type OvidInspection = TableRow<"ovid_inspections">;
export type PeotramAudit = TableRow<"peotram_audits">;
export type PeotramNonConformity = TableRow<"peotram_non_conformities">;
export type PreovidAudit = TableRow<"preovid_audits">;
export type PreovidResponse = TableRow<"preovid_responses">;
export type SgsoAudit = TableRow<"sgso_audits">;
export type SgsoAction = TableRow<"sgso_actions">;
export type SgsoActionPlan = TableRow<"sgso_action_plans">;
export type SgsoFinding = TableRow<"sgso_findings">;
export type MlcNonConformity = TableRow<"mlc_non_conformities">;

// DP
export type DpIncident = TableRow<"dp_incidents">;
export type DpIncidentInsert = TableInsert<"dp_incidents">;

// MMI
export type MmiMaintenanceJob = TableRow<"mmi_maintenance_jobs">;
export type MmiMaintenanceJobInsert = TableInsert<"mmi_maintenance_jobs">;
export type MmiJobHistory = TableRow<"mmi_job_history">;

// AI
export type AiAuditLog = TableRow<"ai_audit_logs">;
export type AiDecision = TableRow<"ai_decisions">;
export type AiMemory = TableRow<"ai_memory">;
export type AiChatConversation = TableRow<"ai_chat_conversations">;
export type AiChatMessage = TableRow<"ai_chat_messages">;

// Scheduling
export type ScheduledTask = TableRow<"scheduled_tasks">;
export type ScheduledTaskInsert = TableInsert<"scheduled_tasks">;
export type ActionItem = TableRow<"action_items">;
export type ActionItemInsert = TableInsert<"action_items">;

// Access
export type UserRole = TableRow<"user_roles">;
export type AccessLog = TableRow<"access_logs">;

// System
export type CloneRegistry = TableRow<"clone_registry">;
export type CloneRegistryInsert = TableInsert<"clone_registry">;
export type PriorityShift = TableRow<"priority_shifts">;
export type PriorityShiftInsert = TableInsert<"priority_shifts">;
export type SystemMetric = TableRow<"system_metrics">;

// Equipment
export type EquipmentSensor = TableRow<"equipment_sensors">;
export type RouteOptimization = TableRow<"route_optimizations">;

// API Gateway - Aligned with existing schema
export type ApiKey = TableRow<"api_keys">;
export type ApiKeyInsert = TableInsert<"api_keys">;
export type ApiRateLimit = TableRow<"api_rate_limits">;
export type ApiEndpoint = TableRow<"api_endpoints">;

// Interop & Mission - Aligned with existing schema
export type JointMissionLog = TableRow<"joint_mission_log">;
export type AgentSwarmMetric = TableRow<"agent_swarm_metrics">;
export type TrustEvent = TableRow<"trust_events">;
export type InteropLog = TableRow<"interop_log">;

// SGSO
export type SgsoPlan = TableRow<"sgso_plans">;
export type SgsoPlanInsert = TableInsert<"sgso_plans">;

// Document Templates
export type DocumentTemplateVersion = TableRow<"document_template_versions">;
export type DocumentTemplateVersionInsert = TableInsert<"document_template_versions">;

// Agent Registry
export type AgentRegistry = TableRow<"agent_registry">;

// ============================================================================
// JSONB CONTENT HELPERS - Extract typed data from Json columns
// ============================================================================

/**
 * Safely extract a value from a JSONB column
 */
export function getJsonField<T>(json: Json | null | undefined, key: string, fallback: T): T {
  if (json === null || json === undefined) return fallback;
  if (typeof json !== "object" || Array.isArray(json)) return fallback;
  const value = (json as Record<string, unknown>)[key];
  return value !== undefined ? (value as T) : fallback;
}

/**
 * Cast entire JSONB to a typed object
 */
export function castJson<T>(json: Json | null, fallback: T): T {
  if (json === null || json === undefined) return fallback;
  return json as unknown as T;
}

/**
 * Cast JSONB to array of typed items
 */
export function castJsonArray<T>(json: Json | null, fallback: T[] = []): T[] {
  if (!Array.isArray(json)) return fallback;
  return json as unknown as T[];
}

// ============================================================================
// MISSION/INTEROP JSONB CONTENT TYPES
// ============================================================================

/** Content structure for joint_mission_log.details JSONB */
export interface MissionDetails {
  mission_name?: string;
  mission_type?: string;
  mission_status?: string;
  priority?: string;
  completion_percentage?: number;
  sync_status?: string;
}

/** Content structure for trust_events.details JSONB */
export interface TrustAlertDetails {
  alert_level?: string;
  alert_message?: string;
  compliance_status?: string;
  source_system?: string;
}

/** Content structure for interop_log.message JSONB */
export interface InteropMessage {
  protocol?: string;
  source_system?: string;
  latency_ms?: number;
}

/** Content structure for sgso_plans.content JSONB */
export interface SgsoPlanContent {
  description?: string;
  sections?: Array<{
    title: string;
    content: string;
  }>;
}

/** Content for document_template_versions.variables JSONB */
export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

// ============================================================================
// API ROUTES - Custom table from migrations (not in generated types)
// Use with dynamicFrom helper
// ============================================================================

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
