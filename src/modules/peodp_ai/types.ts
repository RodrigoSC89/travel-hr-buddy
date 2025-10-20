/**
 * PEO-DP AI Types
 * Type definitions for Dynamic Positioning Intelligent System
 */

export type ComplianceSeverity = "critical" | "high" | "medium" | "low";
export type ComplianceStatus = "green" | "yellow" | "red";
export type EventType = "Loss of DP Reference" | "Thruster Fault" | "UPS Alarm" | "Manual Override" | "System Normal" | "Position Drift" | "Power Failure";
export type DPClass = "DP1" | "DP2" | "DP3";

export interface ComplianceRule {
  id: string;
  category: string;
  rule: string;
  severity: ComplianceSeverity;
  action: string;
}

export interface ComplianceProfile {
  profile_name: string;
  version: string;
  authority: string;
  description: string;
  rules: ComplianceRule[];
  compliance_levels: {
    green: ComplianceLevel;
    yellow: ComplianceLevel;
    red: ComplianceLevel;
  };
}

export interface ComplianceLevel {
  threshold: number;
  status: string;
  description: string;
}

export interface DPEvent {
  evento: EventType;
  data: string;
  severity?: ComplianceSeverity;
  vessel?: string;
  rule_violated?: string;
  additional_data?: Record<string, unknown>;
}

export interface AuditResult {
  timestamp: string;
  profile: string;
  total_rules: number;
  compliant_rules: number;
  non_compliant_rules: number;
  compliance_percentage: number;
  status: ComplianceStatus;
  violations: RuleViolation[];
  recommendations: string[];
}

export interface RuleViolation {
  rule_id: string;
  category: string;
  severity: ComplianceSeverity;
  description: string;
  action_required: string;
}

export interface WorkflowAction {
  tipo: EventType;
  acao: string;
  timestamp: Date;
  status: "pending" | "in_progress" | "completed" | "failed";
}

export interface VesselConfiguration {
  name: string;
  imo: string;
  dp_class: DPClass;
  thrusters: number;
  generators: number;
  position_references: number;
}

export interface MonitoringSession {
  id: string;
  vessel: VesselConfiguration;
  start_time: string;
  events: DPEvent[];
  active: boolean;
  tolerance_limit: number;
}

export interface ReportData {
  session_id: string;
  vessel_name: string;
  report_date: string;
  total_events: number;
  critical_events: number;
  compliance_score: number;
  recommendations: string[];
  events_summary: Record<EventType, number>;
}
