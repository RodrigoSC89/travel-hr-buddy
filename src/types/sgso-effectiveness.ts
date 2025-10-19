/**
 * SGSO Effectiveness Monitoring Types
 * Types for tracking and analyzing SGSO action plan effectiveness
 */

export type SGSOCategory = 'Erro humano' | 'Falha técnica' | 'Comunicação' | 'Falha organizacional';

export interface SGSOEffectivenessByCategory {
  category: SGSOCategory;
  total_incidents: number;
  repeated_incidents: number;
  effectiveness_percentage: number;
  avg_resolution_days: number | null;
}

export interface SGSOEffectivenessByVessel {
  vessel_id: string;
  vessel_name: string;
  total_incidents: number;
  repeated_incidents: number;
  effectiveness_percentage: number;
  avg_resolution_days: number | null;
}

export interface SGSOEffectivenessSummary {
  total_incidents: number;
  total_repeated: number;
  overall_effectiveness: number;
  avg_resolution_time: number | null;
  by_category: SGSOEffectivenessByCategory[];
  by_vessel: SGSOEffectivenessByVessel[];
}

export interface SGSOEffectivenessResponse {
  success: boolean;
  data?: SGSOEffectivenessSummary;
  error?: string;
}

export type SGSOEffectivenessViewMode = 'general' | 'vessel' | 'detailed';

export interface SGSOEffectivenessInsight {
  type: 'warning' | 'success' | 'info';
  category: string;
  message: string;
}
