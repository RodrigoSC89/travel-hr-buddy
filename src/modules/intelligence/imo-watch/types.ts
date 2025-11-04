/**
 * IMO Watch & Compliance Alerts - Type Definitions
 * PATCH 634
 * Monitoring of external sources: IMO, Equasis, Paris MoU, USCG, PSC
 */

export type AlertSource = "IMO" | "Equasis" | "Paris_MoU" | "USCG" | "PSC" | "Tokyo_MoU" | "Other";
export type AlertType = "inspection" | "detention" | "deficiency" | "ban" | "circular" | "amendment" | "notification";
export type AlertSeverity = "info" | "warning" | "critical" | "urgent";
export type AlertStatus = "new" | "acknowledged" | "in_review" | "resolved" | "archived";

export interface IMOAlert {
  id: string;
  source: AlertSource;
  alert_type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  vessel_imo_number?: string;
  vessel_name?: string;
  flag_state?: string;
  company_name?: string;
  port_of_inspection?: string;
  inspection_date?: string;
  deficiency_count?: number;
  detention_days?: number;
  source_url?: string;
  metadata: Record<string, any>;
  assigned_to?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VesselWatchlist {
  id: string;
  vessel_imo_number: string;
  vessel_name: string;
  flag_state: string;
  vessel_type: string;
  company_name?: string;
  reason: string;
  risk_level: "low" | "medium" | "high" | "critical";
  monitoring_since: string;
  last_inspection_date?: string;
  last_detention_date?: string;
  inspection_count: number;
  detention_count: number;
  deficiency_count: number;
  alert_preferences: AlertPreferences;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AlertPreferences {
  notify_on_inspection: boolean;
  notify_on_detention: boolean;
  notify_on_deficiency: boolean;
  notify_on_imo_circular: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  in_app_notifications: boolean;
}

export interface PSCInspection {
  id: string;
  vessel_imo_number: string;
  vessel_name: string;
  flag_state: string;
  inspection_date: string;
  port_of_inspection: string;
  port_state: string;
  mou_region: string;
  deficiency_count: number;
  deficiency_codes: string[];
  detention: boolean;
  detention_days?: number;
  detention_reason?: string;
  inspector_name?: string;
  inspection_type: "initial" | "more_detailed" | "expanded" | "follow_up";
  source_reference: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReport {
  id: string;
  report_type: "vessel" | "fleet" | "flag" | "company";
  entity_id: string;
  entity_name: string;
  period_start: string;
  period_end: string;
  total_inspections: number;
  total_detentions: number;
  total_deficiencies: number;
  detention_rate: number;
  deficiency_rate: number;
  risk_score: number;
  trend: "improving" | "stable" | "declining";
  top_deficiencies: DeficiencySummary[];
  recommendations: string[];
  generated_at: string;
  generated_by: string;
}

export interface DeficiencySummary {
  code: string;
  description: string;
  count: number;
  severity: "minor" | "major" | "critical";
  trend: "increasing" | "stable" | "decreasing";
}

export interface ExternalFeedConfig {
  source: AlertSource;
  enabled: boolean;
  api_endpoint?: string;
  rss_feed?: string;
  poll_interval_minutes: number;
  last_poll_at?: string;
  last_success_at?: string;
  error_count: number;
  last_error?: string;
}
