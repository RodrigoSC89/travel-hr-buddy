/**
 * ISM Audit Intelligence Module - Type Definitions
 * PATCH 633
 * Based on IMO Resolution A.1070(28) and ISM Code
 */

export type ISMSection =
  | "safety_policy"
  | "company_responsibility"
  | "designated_person"
  | "master_responsibility"
  | "resources_personnel"
  | "ship_operations"
  | "emergency_preparedness"
  | "incident_reporting"
  | "maintenance"
  | "documentation"
  | "company_verification"
  | "certification";

export type ISMComplianceStatus = "compliant" | "observation" | "non_conformity" | "major_non_conformity" | "not_verified";

export interface ISMAuditItem {
  id: string;
  vessel_id: string;
  vessel_name: string;
  audit_date: string;
  auditor_name: string;
  audit_type: "internal" | "external" | "certification" | "surveillance";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  overall_score: number;
  section_scores: Record<ISMSection, number>;
  findings: ISMFinding[];
  evidence_ids: string[];
  llm_analysis?: ISMLLMAnalysis;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ISMChecklistItem {
  id: string;
  section: ISMSection;
  requirement: string;
  description: string;
  imo_reference: string;
  compliance_status: ISMComplianceStatus;
  notes?: string;
  evidence_required: boolean;
  order: number;
}

export interface ISMFinding {
  id: string;
  audit_id: string;
  section: ISMSection;
  type: "observation" | "non_conformity" | "major_non_conformity";
  title: string;
  description: string;
  imo_reference: string;
  corrective_action?: string;
  target_date?: string;
  status: "open" | "in_progress" | "closed" | "verified";
  created_at: string;
  updated_at: string;
}

export interface ISMEvidence {
  id: string;
  audit_id: string;
  section: ISMSection;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ISMLLMAnalysis {
  audit_id: string;
  overall_assessment: string;
  section_insights: Record<ISMSection, string>;
  critical_gaps: string[];
  strengths: string[];
  recommendations: string[];
  risk_level: "low" | "medium" | "high" | "critical";
  confidence_score: number;
  generated_at: string;
}

export interface ISMAuditHistory {
  vessel_id: string;
  vessel_name: string;
  audits: ISMAuditItem[];
  trend_data: {
    dates: string[];
    scores: number[];
    finding_counts: number[];
  };
  last_audit_date?: string;
  next_due_date?: string;
  compliance_rate: number;
}

export interface ISMReportExport {
  audit: ISMAuditItem;
  checklist: ISMChecklistItem[];
  findings: ISMFinding[];
  evidence: ISMEvidence[];
  llm_analysis?: ISMLLMAnalysis;
  generated_at: string;
  generated_by: string;
}

// ISM Code Sections based on IMO Resolution A.1070(28)
export const ISM_SECTIONS: Record<ISMSection, { title: string; imo_ref: string }> = {
  safety_policy: {
    title: "Safety and Environmental Protection Policy",
    imo_ref: "ISM Code 2.0"
  },
  company_responsibility: {
    title: "Company Responsibilities and Authority",
    imo_ref: "ISM Code 3.0"
  },
  designated_person: {
    title: "Designated Person(s)",
    imo_ref: "ISM Code 4.0"
  },
  master_responsibility: {
    title: "Master's Responsibility and Authority",
    imo_ref: "ISM Code 5.0"
  },
  resources_personnel: {
    title: "Resources and Personnel",
    imo_ref: "ISM Code 6.0"
  },
  ship_operations: {
    title: "Shipboard Operations",
    imo_ref: "ISM Code 7.0"
  },
  emergency_preparedness: {
    title: "Emergency Preparedness",
    imo_ref: "ISM Code 8.0"
  },
  incident_reporting: {
    title: "Reports and Analysis of Non-conformities",
    imo_ref: "ISM Code 9.0"
  },
  maintenance: {
    title: "Maintenance of Ship and Equipment",
    imo_ref: "ISM Code 10.0"
  },
  documentation: {
    title: "Documentation",
    imo_ref: "ISM Code 11.0"
  },
  company_verification: {
    title: "Company Verification, Review and Evaluation",
    imo_ref: "ISM Code 12.0"
  },
  certification: {
    title: "Certification and Verification",
    imo_ref: "ISM Code 13.0"
  }
};
