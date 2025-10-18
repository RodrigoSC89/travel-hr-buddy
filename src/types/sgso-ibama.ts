/**
 * SGSO IBAMA Requirements Types
 * 
 * Official 17 IBAMA SGSO (Safety Management System) requirements
 * for maritime operations compliance tracking.
 */

/**
 * SGSO IBAMA Requirement
 * Reference data for the 17 official IBAMA requirements
 */
export interface SGSOIbamaRequirement {
  id: string;
  requirement_number: number;
  requirement_title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * SGSO IBAMA Requirement without database metadata
 * Useful for forms and data input
 */
export interface SGSOIbamaRequirementInput {
  requirement_number: number;
  requirement_title: string;
  description: string;
}

/**
 * SGSO IBAMA Requirement compliance status per organization
 * Links requirements to organization compliance tracking
 */
export interface SGSOIbamaRequirementCompliance {
  id: string;
  organization_id: string;
  requirement_id: string;
  requirement_number: number;
  compliance_status: "compliant" | "non_compliant" | "pending" | "in_progress";
  compliance_percentage: number; // 0-100
  evidence_documents: string[];
  responsible_user_id?: string;
  last_review_date?: string;
  next_review_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Filter options for IBAMA requirements queries
 */
export interface SGSOIbamaRequirementFilter {
  requirement_number?: number;
  search_text?: string;
}
