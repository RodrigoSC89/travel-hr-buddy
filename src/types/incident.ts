// DP Incidents - SGSO Integration Types

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

export type SGSORiskLevel = "baixo" | "moderado" | "alto" | "crítico";

export interface DPIncident {
  id: string;
  title?: string;
  description?: string;
  vessel: string;
  incident_date: string;
  severity: "Alta" | "Média" | "Baixa";
  root_cause?: string;
  location?: string;
  class_dp?: string;
  status?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  plan_of_action?: string;
  plan_status?: string;
  plan_sent_to?: string;
  plan_sent_at?: string;
  plan_updated_at?: string;
  gpt_analysis?: string;
  sgso_category?: string;
  sgso_root_cause?: string;
  sgso_risk_level?: SGSORiskLevel;
}

// Risk level colors for UI
export const RISK_LEVEL_COLORS = {
  baixo: { bg: "bg-success/10", text: "text-success", badge: "bg-success", icon: "🟢" },
  moderado: { bg: "bg-warning/10", text: "text-warning", badge: "bg-warning", icon: "🟡" },
  alto: { bg: "bg-warning/20", text: "text-warning", badge: "bg-warning", icon: "🟠" },
  crítico: { bg: "bg-destructive/10", text: "text-destructive", badge: "bg-destructive", icon: "🔴" },
} as const;
