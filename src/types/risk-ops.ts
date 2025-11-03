// PATCH 600: Risk Ops AI Types

export type RiskType = 'operational' | 'compliance' | 'safety' | 'environmental' | 'financial';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskLikelihood = 'unlikely' | 'possible' | 'likely' | 'almost_certain';
export type RiskStatus = 'open' | 'mitigated' | 'closed';
export type TrendDirection = 'improving' | 'stable' | 'degrading';

// Constants for UI rendering
export const RISK_SEVERITIES: RiskSeverity[] = ['critical', 'high', 'medium', 'low'];
export const RISK_LIKELIHOODS: RiskLikelihood[] = ['unlikely', 'possible', 'likely', 'almost_certain'];

export interface RiskOperation {
  id: string;
  title: string;
  description: string | null;
  risk_type: RiskType;
  module: string;
  vessel_id: string | null;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  risk_score: number;
  status: RiskStatus;
  mitigation_plan: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  metadata: Record<string, any>;
}

export interface RiskAssessment {
  id: string;
  risk_id: string;
  assessment_date: string;
  assessor_id: string | null;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  risk_score: number;
  comments: string | null;
  ai_analysis: Record<string, any>;
  created_at: string;
}

export interface RiskTrend {
  id: string;
  period_start: string;
  period_end: string;
  vessel_id: string | null;
  module: string | null;
  risk_type: RiskType | null;
  total_risks: number;
  open_risks: number;
  closed_risks: number;
  average_risk_score: number;
  high_severity_count: number;
  critical_severity_count: number;
  trend_direction: TrendDirection | null;
  created_at: string;
}

export interface RiskStatistics {
  total_risks: number;
  open_risks: number;
  closed_risks: number;
  mitigated_risks: number;
  critical_risks: number;
  high_risks: number;
  average_risk_score: number;
  risks_by_type: Record<RiskType, number>;
  risks_by_module: Record<string, number>;
}

export interface RiskHeatmapCell {
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  count: number;
  avg_score: number;
}

export interface RiskExportData {
  risks: RiskOperation[];
  statistics: RiskStatistics;
  generated_at: string;
}
