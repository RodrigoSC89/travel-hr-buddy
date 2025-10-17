// DP Incident types and interfaces with SGSO integration

export interface DPIncident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  root_cause: string;
  class_dp: string;
  source: string;
  link: string;
  summary: string;
  tags: string[];
  // SGSO fields
  sgso_category?: string;
  sgso_root_cause?: string;
  sgso_risk_level?: 'baixo' | 'moderado' | 'alto' | 'crítico';
  created_at?: string;
  updated_at?: string;
}

export const SGSO_CATEGORIES = [
  "Falha de sistema",
  "Erro humano",
  "Não conformidade com procedimento",
  "Problema de comunicação",
  "Fator externo (clima, mar, etc)",
  "Falha organizacional",
  "Ausência de manutenção preventiva",
] as const;

export const SGSO_RISK_LEVELS = [
  { value: "baixo", label: "🟢 Baixo", color: "green" },
  { value: "moderado", label: "🟡 Moderado", color: "yellow" },
  { value: "alto", label: "🟠 Alto", color: "orange" },
  { value: "crítico", label: "🔴 Crítico", color: "red" },
] as const;

export type SGSOCategory = typeof SGSO_CATEGORIES[number];
export type SGSORiskLevel = 'baixo' | 'moderado' | 'alto' | 'crítico';
