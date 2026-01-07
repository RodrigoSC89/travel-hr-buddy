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

// ============================================================================
// UTILITIES
// ============================================================================

export function castJson<T>(json: Json | null, fallback: T): T {
  if (json === null || json === undefined) return fallback;
  return json as unknown as T;
}

export function castJsonArray<T>(json: Json | null, fallback: T[] = []): T[] {
  if (!Array.isArray(json)) return fallback;
  return json as unknown as T[];
}
