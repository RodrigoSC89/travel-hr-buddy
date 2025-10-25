// PATCH 106.0: Crew Management Types

export type HealthStatus = "fit" | "restricted" | "unfit" | "under_review";
export type ReadinessStatus = "ready" | "not_ready" | "unknown";

export interface CrewMember {
  id: string;
  name: string;
  position: string;
  certifications: string[];
  health_status: HealthStatus;
  onboard_status: boolean;
  last_mission?: string;
  vessel_id?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  date_of_birth?: string;
  hire_date?: string;
  cert_expiry_dates?: Record<string, string>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CrewReadinessStatus {
  id: string;
  name: string;
  position: string;
  health_status: HealthStatus;
  onboard_status: boolean;
  vessel_name?: string;
  readiness_status: ReadinessStatus;
  certifications: string[];
  cert_expiry_dates?: Record<string, string>;
}

export interface CrewFilters {
  position?: string;
  health_status?: HealthStatus;
  onboard_status?: boolean;
  vessel_id?: string;
  search?: string;
}

export interface CrewReadinessAnalysis {
  total_crew: number;
  ready_crew: number;
  not_ready_crew: number;
  unknown_crew: number;
  onboard_crew: number;
  critical_issues: string[];
  expiring_certifications: Array<{
    crew_member: string;
    certification: string;
    expiry_date: string;
  }>;
  recommendations: string[];
}
