/**
 * Audit Center - Checklist Definitions
 * PATCH 62.0
 */

import { ChecklistItem } from "./types";

export const checklistItems: ChecklistItem[] = [
  // ISM Code Items
  {
    id: "ism-bridge-procedures",
    label: "Procedimentos ISM - Ponte de comando",
    category: "ISM",
    description: "Verificar se os procedimentos operacionais da ponte estão atualizados e implementados",
    regulation_reference: "ISM Code Section 6"
  },
  {
    id: "ism-safety-policy",
    label: "Política de Segurança ISM documentada",
    category: "ISM",
    description: "Verificar existência e implementação da política de segurança",
    regulation_reference: "ISM Code Section 2"
  },
  {
    id: "ism-emergency-procedures",
    label: "Procedimentos de emergência ISM",
    category: "ISM",
    description: "Validar planos de emergência e treinamento da tripulação",
    regulation_reference: "ISM Code Section 8"
  },
  
  // IMCA Items
  {
    id: "imca-daily-logs",
    label: "Logs IMCA diários assinados",
    category: "IMCA",
    description: "Verificar logs de operação DP assinados diariamente",
    regulation_reference: "IMCA M 204"
  },
  {
    id: "imca-dp-trials",
    label: "DP Trials atualizados",
    category: "IMCA",
    description: "Validar realização e documentação de DP trials",
    regulation_reference: "IMCA M 190"
  },
  {
    id: "imca-capability-plots",
    label: "Capability Plots vigentes",
    category: "IMCA",
    description: "Verificar validade e atualização dos capability plots",
    regulation_reference: "IMCA M 140"
  },
  {
    id: "imca-training-records",
    label: "Registros de treinamento IMCA",
    category: "IMCA",
    description: "Validar certificações e treinamentos específicos DP",
    regulation_reference: "IMCA C 001"
  },
  
  // ISPS Items
  {
    id: "isps-access-control",
    label: "Verificação ISPS - Acesso restrito",
    category: "ISPS",
    description: "Verificar controles de acesso e perímetro de segurança",
    regulation_reference: "ISPS Code Part A Section 9"
  },
  {
    id: "isps-security-drills",
    label: "Exercícios de segurança ISPS",
    category: "ISPS",
    description: "Validar realização de exercícios de segurança marítima",
    regulation_reference: "ISPS Code Part A Section 13"
  },
  {
    id: "isps-threat-assessment",
    label: "Avaliação de ameaças ISPS",
    category: "ISPS",
    description: "Verificar atualização da avaliação de ameaças à segurança",
    regulation_reference: "ISPS Code Part A Section 8"
  },
  
  // General Maintenance
  {
    id: "maintenance-registry",
    label: "Registro de manutenção atualizado",
    category: "ISM",
    description: "Verificar sistema de manutenção preventiva e corretiva",
    regulation_reference: "ISM Code Section 10"
  },
  {
    id: "maintenance-critical-equipment",
    label: "Manutenção de equipamentos críticos",
    category: "IMCA",
    description: "Validar manutenção de thrusters, power management, e sensores DP",
    regulation_reference: "IMCA M 109"
  }
];

/**
 * Get checklist items by audit type
 */
export function getChecklistByType(type: "IMCA" | "ISM" | "ISPS"): ChecklistItem[] {
  return checklistItems.filter(item => item.category === type);
}

/**
 * Calculate compliance score from checklist
 */
export function calculateComplianceScore(
  checklist: Record<string, "ok" | "warning" | "fail" | "not_checked">
): number {
  const items = Object.values(checklist);
  const total = items.length;
  
  if (total === 0) return 0;
  
  const weights = {
    ok: 1,
    warning: 0.7,
    fail: 0,
    not_checked: 0
  };
  
  const score = items.reduce((sum, status) => sum + weights[status], 0);
  return Math.round((score / total) * 100);
}
