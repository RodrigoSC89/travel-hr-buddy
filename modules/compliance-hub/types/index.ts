/**
 * Compliance Hub - Unified Type Definitions
 * PATCH 92.0 - Consolidated from audit-center, checklists, risk-management
 */

// ==================== AUDIT TYPES ====================
export type AuditType = "IMCA" | "ISM" | "ISPS" | "FMEA" | "NORMAM";
export type AuditStatus = "scheduled" | "in_progress" | "completed" | "overdue";
export type ChecklistStatus = "ok" | "warning" | "fail" | "not_checked";

export interface AuditItem {
  id: string;
  title: string;
  type: AuditType;
  status: AuditStatus;
  score?: number;
  scheduled_date: string;
  completion_date?: string;
  findings_count?: number;
  checklist_data?: Record<string, ChecklistStatus>;
  ai_feedback?: string;
  vessel_id?: string;
  sector?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: AuditType;
  description?: string;
  regulation_reference?: string;
  priority?: "high" | "medium" | "low";
  required?: boolean;
}

export interface AuditEvidence {
  id: string;
  audit_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by?: string;
  ai_analyzed?: boolean;
  ai_summary?: string;
}

export interface AIAuditResponse {
  overall_compliance: number;
  critical_issues: string[];
  warnings: string[];
  recommendations: string[];
  next_steps: string[];
  summary: string;
  confidence?: number;
}

// ==================== CHECKLIST TYPES ====================
export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  type: AuditType;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_default?: boolean;
}

export interface ChecklistExecution {
  id: string;
  template_id: string;
  vessel_id?: string;
  sector?: string;
  executed_by: string;
  started_at: string;
  completed_at?: string;
  status: "in_progress" | "completed" | "cancelled";
  results: Record<string, ChecklistStatus>;
  notes?: string;
  ai_score?: number;
}

export interface ChecklistHistory {
  id: string;
  template_id: string;
  execution_id: string;
  action: "created" | "started" | "completed" | "updated";
  timestamp: string;
  user_id?: string;
  changes?: Record<string, any>;
}

// ==================== RISK TYPES ====================
export type RiskSeverity = "critical" | "high" | "medium" | "low";
export type RiskStatus = "active" | "mitigated" | "monitoring" | "resolved";

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  status: RiskStatus;
  category: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  risk_score: number; // likelihood * impact
  vessel_id?: string;
  sector?: string;
  mitigation_plan?: string;
  identified_date: string;
  review_date?: string;
  resolved_date?: string;
  identified_by?: string;
  assigned_to?: string;
  ai_insights?: string;
}

export interface RiskMatrix {
  likelihood: number;
  impact: number;
  severity: RiskSeverity;
  count: number;
}

export interface RiskTrend {
  date: string;
  total_risks: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

// ==================== DOCUMENTATION TYPES ====================
export interface ComplianceDocument {
  id: string;
  title: string;
  type: "regulation" | "standard" | "policy" | "procedure" | "evidence";
  category: AuditType | "general";
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by?: string;
  vessel_id?: string;
  sector?: string;
  expiry_date?: string;
  ai_analyzed?: boolean;
  ai_summary?: string;
  ai_tags?: string[];
  version?: string;
  supersedes?: string;
}

export interface DocumentAIAnalysis {
  document_id: string;
  summary: string;
  key_points: string[];
  compliance_requirements: string[];
  action_items: string[];
  related_regulations: string[];
  confidence: number;
  analyzed_at: string;
}

// ==================== AUDIT LOG TYPES ====================
export interface AuditLog {
  id: string;
  action: string;
  module: "audit" | "checklist" | "risk" | "document";
  entity_type: string;
  entity_id: string;
  user_id?: string;
  user_email?: string;
  timestamp: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// ==================== COMPLIANCE DASHBOARD TYPES ====================
export interface ComplianceMetrics {
  overall_score: number;
  audits_completed: number;
  audits_pending: number;
  checklists_active: number;
  checklists_completed: number;
  risks_active: number;
  risks_critical: number;
  documents_total: number;
  documents_expiring_soon: number;
  last_updated: string;
}

export interface ComplianceAlert {
  id: string;
  type: "audit_overdue" | "document_expiring" | "critical_risk" | "checklist_incomplete";
  severity: RiskSeverity;
  title: string;
  description: string;
  entity_id: string;
  created_at: string;
  acknowledged?: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}
