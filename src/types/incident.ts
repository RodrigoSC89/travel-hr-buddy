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

export type SGSORiskLevel = 'baixo' | 'moderado' | 'alto' | 'crítico';

// SGSO Incident type matching database schema
export interface SGSOIncident {
  id: string;
  vessel_id?: string;
  type: string;
  description: string;
  reported_at: string;
  severity: string;
  status: string;
  corrective_action?: string;
  created_at?: string;
  created_by?: string;
}

export interface DPIncident {
  id: string;
  title?: string;
  description?: string;
  vessel: string;
  incident_date: string;
  severity: 'Alta' | 'Média' | 'Baixa';
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
  baixo: { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-600', icon: '🟢' },
  moderado: { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-600', icon: '🟡' },
  alto: { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-600', icon: '🟠' },
  crítico: { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-600', icon: '🔴' },
} as const;
