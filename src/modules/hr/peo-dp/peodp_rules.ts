/**
 * PEO-DP Rules
 * Regras e validações da NORMAM-101 e IMCA M 117
 */

export interface PEODPRule {
  id: string;
  norma: string;
  categoria: string;
  descricao: string;
  criticidade: "Crítica" | "Alta" | "Média" | "Baixa";
  validacao: (data?: any) => boolean | Promise<boolean>;
}

/**
 * Regras NORMAM-101
 */
export const NORMAM_101_RULES: PEODPRule[] = [
  {
    id: "N101-01",
    norma: "NORMAM-101",
    categoria: "Certificação",
    descricao: "Sistema DP classificado e certificado conforme IMO MSC/Circ.645",
    criticidade: "Crítica",
    validacao: async () => {
      // Em produção: verificar certificado válido no banco de dados
      return true;
    },
  },
  {
    id: "N101-02",
    norma: "NORMAM-101",
    categoria: "Documentação",
    descricao: "Registro de horas DP e eventos de falha disponíveis",
    criticidade: "Alta",
    validacao: async () => {
      // Em produção: verificar existência de logs DP
      return true;
    },
  },
  {
    id: "N101-03",
    norma: "NORMAM-101",
    categoria: "Tripulação",
    descricao: "Tripulação DP certificada e escalada conforme nível de operação",
    criticidade: "Crítica",
    validacao: async () => {
      // Em produção: verificar certificações da tripulação
      return true;
    },
  },
  {
    id: "N101-04",
    norma: "NORMAM-101",
    categoria: "Manutenção",
    descricao: "Plano de manutenção e ensaios DP em conformidade com IMCA M117",
    criticidade: "Alta",
    validacao: async () => {
      // Em produção: verificar plano de manutenção atualizado
      return true;
    },
  },
  {
    id: "N101-05",
    norma: "NORMAM-101",
    categoria: "Análise de Risco",
    descricao: "Relatórios ASOG e FMEA revisados e atualizados",
    criticidade: "Alta",
    validacao: async () => {
      // Em produção: verificar data de revisão de ASOG/FMEA
      return true;
    },
  },
];

/**
 * Regras IMCA M117
 */
export const IMCA_M117_RULES: PEODPRule[] = [
  {
    id: "M117-01",
    norma: "IMCA M117",
    categoria: "Certificação Pessoal",
    descricao: "DPO (Dynamic Positioning Operator) com certificação válida",
    criticidade: "Crítica",
    validacao: async () => {
      // Em produção: verificar certificação DPO válida
      return true;
    },
  },
  {
    id: "M117-02",
    norma: "IMCA M117",
    categoria: "Treinamento",
    descricao: "Treinamento específico para classe DP da embarcação",
    criticidade: "Alta",
    validacao: async () => {
      // Em produção: verificar treinamentos específicos
      return true;
    },
  },
  {
    id: "M117-03",
    norma: "IMCA M117",
    categoria: "Experiência",
    descricao: "Experiência mínima documentada em operações DP",
    criticidade: "Alta",
    validacao: async () => {
      // Em produção: verificar horas de experiência DP
      return true;
    },
  },
  {
    id: "M117-04",
    norma: "IMCA M117",
    categoria: "Capacitação Contínua",
    descricao: "Programa de treinamento contínuo e reciclagem",
    criticidade: "Média",
    validacao: async () => {
      // Em produção: verificar programa de reciclagem
      return true;
    },
  },
  {
    id: "M117-05",
    norma: "IMCA M117",
    categoria: "Competências",
    descricao: "Matriz de competências e avaliação periódica",
    criticidade: "Média",
    validacao: async () => {
      // Em produção: verificar matriz de competências atualizada
      return true;
    },
  },
];

/**
 * Todas as regras combinadas
 */
export const ALL_PEODP_RULES = [...NORMAM_101_RULES, ...IMCA_M117_RULES];

/**
 * Get rule by ID
 */
export function getRuleById(ruleId: string): PEODPRule | undefined {
  return ALL_PEODP_RULES.find((rule) => rule.id === ruleId);
}

/**
 * Get rules by criticality
 */
export function getRulesByCriticality(
  criticidade: "Crítica" | "Alta" | "Média" | "Baixa"
): PEODPRule[] {
  return ALL_PEODP_RULES.filter((rule) => rule.criticidade === criticidade);
}

/**
 * Get rules by standard
 */
export function getRulesByStandard(norma: "NORMAM-101" | "IMCA M117"): PEODPRule[] {
  return ALL_PEODP_RULES.filter((rule) => rule.norma === norma);
}

/**
 * Validate all rules
 */
export async function validateAllRules(data?: any): Promise<{
  passed: number;
  failed: number;
  results: { ruleId: string; passed: boolean }[];
}> {
  const results: { ruleId: string; passed: boolean }[] = [];
  let passed = 0;
  let failed = 0;

  for (const rule of ALL_PEODP_RULES) {
    try {
      const result = await rule.validacao(data);
      results.push({ ruleId: rule.id, passed: result });
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      results.push({ ruleId: rule.id, passed: false });
      failed++;
    }
  }

  return { passed, failed, results };
}
