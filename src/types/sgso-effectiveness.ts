/**
 * Type definitions for SGSO Effectiveness Monitoring
 * 
 * These types support the SGSO effectiveness monitoring system that tracks
 * action plan success, incident recurrence, and resolution times.
 */

export type SGSOCategory = 
  | "Erro humano"
  | "Falha técnica"
  | "Comunicação"
  | "Falha organizacional";

/**
 * SGSO effectiveness metrics by category
 */
export interface SGSOEffectiveness {
  category: SGSOCategory;
  total_incidents: number;
  repeated_incidents: number;
  effectiveness_percentage: number;
  avg_resolution_days: number;
}

/**
 * SGSO effectiveness metrics by vessel and category
 */
export interface SGSOEffectivenessByVessel {
  vessel_name: string;
  category: SGSOCategory;
  total_incidents: number;
  repeated_incidents: number;
  effectiveness_percentage: number;
  avg_resolution_days: number;
}

/**
 * Summary of overall SGSO effectiveness
 */
export interface SGSOEffectivenessSummary {
  total_incidents: number;
  total_repeated: number;
  overall_effectiveness: number;
  avg_resolution_time: number;
}

/**
 * API response for SGSO effectiveness endpoint
 */
export interface SGSOEffectivenessResponse {
  data: SGSOEffectiveness[] | SGSOEffectivenessByVessel[];
  summary: SGSOEffectivenessSummary;
  by_vessel: boolean;
}

/**
 * Helper function to get effectiveness status color
 */
export function getEffectivenessStatus(percentage: number): {
  label: string;
  color: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (percentage >= 90) {
    return { label: "Excelente", color: "text-green-600", variant: "default" };
  } else if (percentage >= 75) {
    return { label: "Bom", color: "text-yellow-600", variant: "secondary" };
  } else if (percentage >= 50) {
    return { label: "Regular", color: "text-orange-600", variant: "outline" };
  } else {
    return { label: "Crítico", color: "text-red-600", variant: "destructive" };
  }
}
