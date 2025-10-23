/**
 * Audit Center - Type Definitions
 * PATCH 62.0
 */

export type AuditType = "IMCA" | "ISM" | "ISPS";
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
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: AuditType;
  description?: string;
  regulation_reference?: string;
}

export interface AuditEvidence {
  id: string;
  audit_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface AIAuditResponse {
  overall_compliance: number;
  critical_issues: string[];
  warnings: string[];
  recommendations: string[];
  next_steps: string[];
  summary: string;
}
