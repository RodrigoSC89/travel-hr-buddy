/**
 * Compliance One Module - Type Definitions
 * Based on ISO 37301 - Compliance Management System
 */

export type ComplianceStatus = 'active' | 'pending' | 'expired' | 'revoked';
export type RiskStatus = 'open' | 'mitigated' | 'accepted' | 'transferred' | 'closed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type EvidenceStatus = 'valid' | 'pending_review' | 'expired' | 'rejected';
export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type RecommendationStatus = 'pending' | 'applied' | 'dismissed' | 'expired';

export interface ComplianceRule {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  category: string;
  legal_reference?: string;
  jurisdiction: string;
  effective_date?: string;
  expiration_date?: string;
  status: ComplianceStatus;
  priority: Priority;
  source_url?: string;
  metadata?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRisk {
  id: string;
  organization_id: string;
  rule_id?: string;
  title: string;
  description?: string;
  category?: string;
  department?: string;
  probability: number;
  impact: number;
  risk_score: number;
  risk_level: RiskLevel;
  control_description?: string;
  mitigation_plan?: string;
  owner_id?: string;
  status: RiskStatus;
  review_date?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceEvidence {
  id: string;
  organization_id: string;
  rule_id?: string;
  risk_id?: string;
  title: string;
  description?: string;
  document_type?: string;
  file_url?: string;
  file_hash?: string;
  file_size?: number;
  mime_type?: string;
  tags?: string[];
  validity_start?: string;
  validity_end?: string;
  status: EvidenceStatus;
  uploaded_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReport {
  id: string;
  organization_id: string;
  report_code: string;
  reporter_email?: string;
  reporter_name?: string;
  is_anonymous: boolean;
  category: string;
  subcategory?: string;
  description: string;
  location?: string;
  involved_parties?: string[];
  evidence_urls?: string[];
  severity: Priority;
  status: ReportStatus;
  assigned_to?: string;
  resolution?: string;
  resolution_date?: string;
  ai_classification?: string;
  ai_priority_score?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceThirdParty {
  id: string;
  organization_id: string;
  name: string;
  legal_name?: string;
  document_type?: string;
  document_number?: string;
  country: string;
  relationship_type?: string;
  risk_score: number;
  risk_level: RiskLevel;
  is_blocked: boolean;
  block_reason?: string;
  sanctions_check: boolean;
  pep_check: boolean;
  adverse_media_check: boolean;
  last_check_date?: string;
  next_check_date?: string;
  check_results?: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceWorkflow {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  workflow_type?: string;
  trigger_type?: string;
  trigger_config?: Record<string, unknown>;
  steps?: WorkflowStep[];
  current_step: number;
  status: WorkflowStatus;
  priority: Priority;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  escalation_config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_date?: string;
  completed_at?: string;
  notes?: string;
}

export interface ComplianceAIRecommendation {
  id: string;
  organization_id: string;
  target_type: 'risk' | 'rule' | 'evidence' | 'thirdparty' | 'report' | 'general';
  target_id?: string;
  recommendation_type?: string;
  title: string;
  recommendation: string;
  reasoning?: string;
  confidence: number;
  priority: Priority;
  impact_area?: string[];
  suggested_actions?: SuggestedAction[];
  status: RecommendationStatus;
  applied_by?: string;
  applied_at?: string;
  feedback?: string;
  ai_model: string;
  metadata?: Record<string, unknown>;
  generated_at: string;
  expires_at?: string;
}

export interface SuggestedAction {
  id: string;
  action: string;
  description?: string;
  priority: Priority;
  estimated_effort?: string;
}

export interface ComplianceDashboardStats {
  totalRules: number;
  activeRules: number;
  totalRisks: number;
  openRisks: number;
  criticalRisks: number;
  totalEvidences: number;
  pendingEvidences: number;
  expiredEvidences: number;
  totalReports: number;
  openReports: number;
  totalThirdParties: number;
  blockedThirdParties: number;
  highRiskThirdParties: number;
  totalWorkflows: number;
  overdueWorkflows: number;
  pendingRecommendations: number;
  complianceScore: number;
}

export interface RiskMatrixData {
  probability: number;
  impact: number;
  count: number;
  risks: ComplianceRisk[];
}
