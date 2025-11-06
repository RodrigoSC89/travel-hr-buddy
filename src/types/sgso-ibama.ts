/**
 * SGSO IBAMA Requirements Types
 * Official IBAMA SGSO (Sistema de Gestão de Segurança Operacional) requirements
 * Used for maritime safety compliance and audit tracking
 */

export interface SGSOIbamaRequirement {
  id: string;
  requirement_number: number; // 1-17
  requirement_title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type for compliance tracking against IBAMA requirements
 */
export interface SGSOIbamaCompliance {
  id: string;
  organization_id: string;
  vessel_id?: string;
  requirement_id: string;
  requirement_number: number;
  status: 'compliant' | 'non_compliant' | 'pending' | 'in_progress' | 'not_applicable';
  compliance_level: number; // 0-100
  evidence_files?: string[];
  notes?: string;
  responsible_user_id?: string;
  last_audit_date?: string;
  next_audit_date?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Extended requirement with compliance info for UI display
 */
export interface SGSOIbamaRequirementWithCompliance extends SGSOIbamaRequirement {
  compliance?: SGSOIbamaCompliance;
}

/**
 * Type for AI-powered explanations of IBAMA requirements
 */
export interface SGSOIbamaRequirementExplanation {
  requirement_id: string;
  requirement_number: number;
  title: string;
  plain_explanation: string; // Simple explanation for crew
  technical_details: string; // Technical details for auditors
  practical_examples: string[]; // Real-world examples
  common_issues: string[]; // Common compliance issues
  recommended_actions: string[]; // Actions to achieve compliance
  related_requirements: number[]; // Related requirement numbers
}
