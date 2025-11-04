/**
 * PATCH 627 - ISM Evidence-Based Auditor
 * Types and interfaces
 */

export interface OperationalLog {
  id: string;
  timestamp: string;
  module: string;
  operation: string;
  user: string;
  vessel?: string;
  description: string;
  metadata: Record<string, any>;
}

export interface ComplianceStandard {
  code: 'ISM' | 'MLC' | 'SOLAS' | 'MARPOL';
  section: string;
  requirement: string;
  description: string;
  mandatory: boolean;
  checkpoints: string[];
}

export interface NonConformity {
  id: string;
  standard: ComplianceStandard['code'];
  section: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  evidence: string[];
  relatedLogs: string[];
  corrective_action?: string;
  status: 'open' | 'in_progress' | 'closed';
  detected_at: string;
  closed_at?: string;
}

export interface AuditResult {
  id: string;
  vessel?: string;
  audit_date: string;
  auditor: string;
  standards_checked: ComplianceStandard['code'][];
  total_checkpoints: number;
  passed_checkpoints: number;
  failed_checkpoints: number;
  non_conformities: NonConformity[];
  compliance_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  correlations: AuditCorrelation[];
}

export interface AuditCorrelation {
  type: 'previous_audit' | 'related_incident' | 'pattern';
  reference_id: string;
  description: string;
  relevance: number;
}

export interface AuditReport {
  audit_result: AuditResult;
  executive_summary: string;
  detailed_findings: AuditFinding[];
  action_plan: ActionItem[];
  generated_at: string;
}

export interface AuditFinding {
  checkpoint: string;
  standard: ComplianceStandard['code'];
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  evidence: string[];
  comments: string;
}

export interface ActionItem {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  responsible: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  related_non_conformity: string;
}
