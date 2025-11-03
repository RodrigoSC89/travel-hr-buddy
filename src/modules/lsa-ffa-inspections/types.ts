// LSA/FFA Inspection Module Types
// Based on SOLAS Chapter III and MSC/Circ.1093

export type InspectionType = 'LSA' | 'FFA';
export type InspectionFrequency = 'weekly' | 'monthly' | 'annual' | 'ad_hoc';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'reviewed';
export type RiskRating = 'low' | 'medium' | 'high' | 'critical';
export type EquipmentCondition = 'good' | 'fair' | 'poor' | 'defective';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplianceTrend = 'improving' | 'stable' | 'declining';

export interface ChecklistItem {
  id: string;
  item: string;
  required: boolean;
  checked?: boolean;
  notes?: string;
}

export interface IssueFound {
  equipment: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  correctiveAction?: string;
}

export interface LSAFFAInspection {
  id: string;
  vessel_id: string;
  inspector: string;
  date: string;
  type: InspectionType;
  frequency?: InspectionFrequency;
  checklist: ChecklistItem[];
  issues_found: IssueFound[];
  score: number;
  ai_notes?: string;
  ai_risk_rating?: RiskRating;
  ai_suggestions?: string[];
  status: InspectionStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface LSAFFAEquipment {
  id: string;
  inspection_id: string;
  equipment_type: string;
  equipment_name: string;
  equipment_id?: string;
  location?: string;
  condition: EquipmentCondition;
  compliant: boolean;
  defects_found?: string;
  corrective_action?: string;
  action_deadline?: string;
  action_completed: boolean;
  ai_predicted_failure_date?: string;
  ai_maintenance_priority?: MaintenancePriority;
  inspected_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: InspectionType;
  frequency: InspectionFrequency;
  items: ChecklistItem[];
  solas_regulation?: string;
  msc_circular?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LSAFFAReport {
  id: string;
  inspection_id: string;
  report_type: 'pdf' | 'summary' | 'ai_analysis';
  report_url?: string;
  report_data?: Record<string, unknown>;
  executive_summary?: string;
  key_findings?: string[];
  recommendations?: string;
  overall_compliance?: number;
  non_compliance_count: number;
  critical_issues_count: number;
  generated_at: string;
  generated_by?: string;
}

export interface ComplianceStats {
  id: string;
  vessel_id: string;
  period_start: string;
  period_end: string;
  total_inspections: number;
  average_compliance_score: number;
  lsa_inspections: number;
  ffa_inspections: number;
  critical_issues: number;
  open_corrective_actions: number;
  overdue_actions: number;
  most_defective_equipment: Array<{
    type: string;
    count: number;
  }>;
  compliance_trend: ComplianceTrend;
  calculated_at: string;
}

export interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  flag_state: string;
}

// Form data interfaces
export interface InspectionFormData {
  vessel_id: string;
  inspector: string;
  type: InspectionType;
  frequency?: InspectionFrequency;
  checklist: ChecklistItem[];
  issues_found: IssueFound[];
}

// AI Analysis request/response
export interface AIAnalysisRequest {
  inspection_id: string;
  checklist_results: ChecklistItem[];
  issues: IssueFound[];
  vessel_info: Vessel;
}

export interface AIAnalysisResponse {
  summary: string;
  risk_rating: RiskRating;
  suggestions: string[];
  predicted_issues: string[];
  compliance_score: number;
}
