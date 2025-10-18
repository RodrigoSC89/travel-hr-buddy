// SGSO Effectiveness Monitoring Types

export const SGSO_EFFECTIVENESS_CATEGORIES = [
  "Erro humano",
  "Falha técnica",
  "Comunicação",
  "Falha organizacional",
] as const;

export type SGSOEffectivenessCategory = typeof SGSO_EFFECTIVENESS_CATEGORIES[number];

export interface SGSOEffectivenessMetric {
  category: string;
  total_incidents: number;
  repeated_incidents: number;
  effectiveness_percentage: number;
  avg_resolution_days: number | null;
}

export interface SGSOEffectivenessByVessel extends SGSOEffectivenessMetric {
  vessel_name: string;
}

export interface SGSOEffectivenessResponse {
  data: SGSOEffectivenessMetric[] | SGSOEffectivenessByVessel[];
  summary: {
    total_incidents: number;
    total_repeated: number;
    overall_effectiveness: number;
  };
}

// Effectiveness level thresholds and colors for UI
export const EFFECTIVENESS_LEVELS = {
  excellent: { threshold: 90, label: "Excelente", color: "green", icon: "🟢" },
  good: { threshold: 75, label: "Bom", color: "yellow", icon: "🟡" },
  regular: { threshold: 50, label: "Regular", color: "orange", icon: "🟠" },
  critical: { threshold: 0, label: "Crítico", color: "red", icon: "🔴" },
} as const;

export function getEffectivenessLevel(percentage: number) {
  if (percentage >= EFFECTIVENESS_LEVELS.excellent.threshold) return EFFECTIVENESS_LEVELS.excellent;
  if (percentage >= EFFECTIVENESS_LEVELS.good.threshold) return EFFECTIVENESS_LEVELS.good;
  if (percentage >= EFFECTIVENESS_LEVELS.regular.threshold) return EFFECTIVENESS_LEVELS.regular;
  return EFFECTIVENESS_LEVELS.critical;
}
