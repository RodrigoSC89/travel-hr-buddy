/**
 * Fleet Management Module Types
 * PATCH 103.0
 */

export interface VesselPosition {
  lat: number;
  lng: number;
  course?: number;
  speed?: number;
  timestamp?: string;
}

export type VesselStatus = "active" | "maintenance" | "inactive" | "critical";
export type MaintenanceStatus = "ok" | "scheduled" | "urgent" | "critical";

export interface Vessel {
  id: string;
  name: string;
  imo_code: string;
  status: VesselStatus;
  last_known_position: VesselPosition | null;
  vessel_type?: string;
  flag?: string;
  built_year?: number;
  gross_tonnage?: number;
  maintenance_status: MaintenanceStatus;
  maintenance_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VesselFilter {
  status?: VesselStatus[];
  maintenanceStatus?: MaintenanceStatus[];
  searchTerm?: string;
}

export interface VesselAlert {
  id: string;
  vessel_id: string;
  vessel_name: string;
  alert_type: "maintenance" | "position" | "safety" | "critical";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
}
