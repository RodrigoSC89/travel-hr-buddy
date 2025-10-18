/**
 * DP Incident types with SGSO integration
 */

// SGSO Risk Levels
export type SGSORiskLevel = "baixo" | "moderado" | "alto" | "crítico";

// SGSO Categories as defined in the requirements
export const SGSO_CATEGORIES = [
  "Falha de sistema",
  "Erro humano",
  "Não conformidade com procedimento",
  "Problema de comunicação",
  "Fator externo (clima, mar, etc)",
  "Falha organizacional",
  "Ausência de manutenção preventiva",
] as const;

export type SGSOCategory = typeof SGSO_CATEGORIES[number];

// Main DPIncident interface
export interface DPIncident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  class_dp: string;
  root_cause?: string;
  rootCause?: string; // Legacy support
  tags: string[];
  summary: string;
  link?: string;
  source?: string;
  created_at?: string;
  
  // Plan of Action fields
  plan_of_action?: string;
  plan_status?: string;
  plan_sent_to?: string;
  plan_sent_at?: string;
  plan_updated_at?: string;
  
  // SGSO fields
  sgso_category?: SGSOCategory | string;
  sgso_root_cause?: string;
  sgso_risk_level?: SGSORiskLevel;
}

// Risk level display configurations
export const RISK_LEVEL_CONFIG: Record<SGSORiskLevel, { emoji: string; color: string; label: string }> = {
  "baixo": { emoji: "🟢", color: "bg-green-100 text-green-800", label: "Baixo" },
  "moderado": { emoji: "🟡", color: "bg-yellow-100 text-yellow-800", label: "Moderado" },
  "alto": { emoji: "🟠", color: "bg-orange-100 text-orange-800", label: "Alto" },
  "crítico": { emoji: "🔴", color: "bg-red-100 text-red-800", label: "Crítico" },
};

// Filter options for SGSO panel
export interface SGSOFilters {
  category?: string;
  riskLevel?: SGSORiskLevel;
  vessel?: string;
}
