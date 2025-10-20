/**
 * PEO-DP (Dynamic Positioning Intelligent Audit) Types
 * Based on NORMAM-101 and IMCA M 117 standards
 */

export interface PEODPRequisito {
  id: string;
  descricao: string;
}

export interface PEODPProfile {
  versao: string;
  name?: string;
  description?: string;
  requisitos: PEODPRequisito[];
}

export interface PEODPResultadoItem {
  item: string;
  descricao: string;
  cumprimento: "OK" | "N/A" | "Não Conforme" | "Pendente";
  observacoes?: string;
}

export interface PEODPAuditoria {
  data: string;
  resultado: PEODPResultadoItem[];
  score: number;
  vesselName?: string;
  dpClass?: string;
  normas: string[];
}

export interface PEODPReportOptions {
  incluirDetalhes?: boolean;
  incluirRecomendacoes?: boolean;
  formato?: "pdf" | "markdown" | "html";
}

/**
 * Score de conformidade
 * - 90-100: Excelente
 * - 75-89: Bom
 * - 60-74: Aceitável
 * - 0-59: Não Conforme
 */
export function getScoreLevel(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Bom";
  if (score >= 60) return "Aceitável";
  return "Não Conforme";
}

/**
 * Get color for score display
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}
