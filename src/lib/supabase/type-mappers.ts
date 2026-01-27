/**
 * PATCH 873: Type Mappers for Supabase <-> UI alignment
 * Centralized mapping functions for complex tables
 */

import type { Database } from "@/integrations/supabase/types";

// Type aliases for common tables
export type CrewRotationRow = Database["public"]["Tables"]["crew_rotations"]["Row"];
export type VesselRow = Database["public"]["Tables"]["vessels"]["Row"];
export type TemplateVersionRow = Database["public"]["Tables"]["template_versions"]["Row"];
export type PerformanceAlertRow = Database["public"]["Tables"]["performance_alerts"]["Row"];
export type UnderwaterMissionRow = Database["public"]["Tables"]["underwater_missions"]["Row"];
export type DroneTelemetryRow = Database["public"]["Tables"]["drone_telemetry"]["Row"];
export type MissionEventRow = Database["public"]["Tables"]["mission_events"]["Row"];

// UI Interfaces aligned with DB
export interface UICrewRotation {
  id: string;
  crew_member_id: string;
  vessel_id: string | null;
  rotation_type: "embarkation" | "disembarkation" | "rotation" | "leave" | "emergency";
  scheduled_date: string;
  actual_date: string | null;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "delayed";
  departure_port: string | null;
  arrival_port: string | null;
  transportation_method: string | null;
  flight_details: Record<string, unknown> | null;
  accommodation_details: Record<string, unknown> | null;
  documentation_status: "pending" | "verified" | "incomplete" | "expired";
  medical_clearance: boolean;
  visa_status: string | null;
  notes: string | null;
}

export interface UITemplateVersion {
  id: string;
  template_id: string | null;
  version_number: number;
  content: string;
  change_notes: string | null;
  created_at: string | null;
  is_active: boolean | null;
}

export interface UIPerformanceAlert {
  id: string;
  system_name: string | null;
  alert_type: string;
  severity: "info" | "warning" | "critical";
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface UIUnderwaterMission {
  id: string;
  user_id: string;
  mission_name: string;
  mission_type: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  target_location: Record<string, unknown> | null;
  depth_target: number | null;
  max_depth: number | null;
  battery_level: number | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Mapper functions
export function mapCrewRotationRow(row: CrewRotationRow): UICrewRotation {
  return {
    id: row.id,
    crew_member_id: row.crew_member_id ?? "",
    vessel_id: row.vessel_id ?? null,
    rotation_type: (row.rotation_type as UICrewRotation["rotation_type"]) ?? "rotation",
    scheduled_date: row.scheduled_date ?? new Date().toISOString().split("T")[0],
    actual_date: row.actual_date ?? null,
    status: (row.status as UICrewRotation["status"]) ?? "scheduled",
    departure_port: row.departure_port ?? null,
    arrival_port: row.arrival_port ?? null,
    transportation_method: row.transportation_method ?? null,
    flight_details: row.flight_details as Record<string, unknown> | null,
    accommodation_details: row.accommodation_details as Record<string, unknown> | null,
    documentation_status: (row.documentation_status as UICrewRotation["documentation_status"]) ?? "pending",
    medical_clearance: row.medical_clearance ?? false,
    visa_status: row.visa_status ?? null,
    notes: row.notes ?? null,
  };
}

export function mapTemplateVersionRow(row: TemplateVersionRow): UITemplateVersion {
  return {
    id: row.id,
    template_id: row.template_id,
    version_number: row.version_number,
    content: row.content,
    change_notes: row.change_notes,
    created_at: row.created_at,
    is_active: row.is_active,
  };
}

export function mapPerformanceAlertRow(row: PerformanceAlertRow): UIPerformanceAlert {
  return {
    id: row.id,
    system_name: row.system_name ?? null,
    alert_type: row.alert_type,
    severity: (row.severity as UIPerformanceAlert["severity"]) ?? "info",
    message: row.message ?? "",
    is_resolved: row.is_resolved ?? false,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export function mapUnderwaterMissionRow(row: UnderwaterMissionRow): UIUnderwaterMission {
  return {
    id: row.id,
    user_id: row.user_id,
    mission_name: row.mission_name ?? "Unnamed Mission",
    mission_type: row.mission_type ?? "survey",
    status: row.status ?? "pending",
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
    target_location: row.target_location as Record<string, unknown> | null,
    depth_target: row.depth_target ?? null,
    max_depth: row.max_depth ?? null,
    battery_level: row.battery_level ?? null,
    notes: row.notes ?? null,
    metadata: row.metadata as Record<string, unknown> | null,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

// Status color helpers (using design tokens)
export const rotationStatusColors: Record<UICrewRotation["status"], string> = {
  scheduled: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  delayed: "bg-warning/10 text-warning",
};

export const alertSeverityColors: Record<UIPerformanceAlert["severity"], string> = {
  info: "bg-muted text-muted-foreground",
  warning: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};
