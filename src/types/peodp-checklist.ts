/**
 * PEO-DP Checklist Types
 * Baseado no Programa de Excelência em Operações DP - Petrobras
 */

export type ComplianceStatus = "conforme" | "parcial" | "nao_conforme" | "nao_aplicavel" | "pendente";

export interface PEODPRequirement {
  id: string;
  section: PEODPSection;
  code: string; // e.g., "3.2.1", "3.3.5"
  title: string;
  description: string;
  reference?: string; // e.g., "IMCA M 117", "NORMAM-01"
  mandatory: boolean;
  weight: number; // 1-10 for scoring
}

export interface PEODPAuditItem {
  requirementId: string;
  status: ComplianceStatus;
  evidence?: string;
  observations?: string;
  actionRequired?: string;
  auditorNotes?: string;
  attachments?: string[];
}

export type PEODPSection = 
  | "gestao" 
  | "treinamentos" 
  | "procedimentos" 
  | "operacao" 
  | "manutencao" 
  | "testes_anuais";

export interface PEODPSectionMeta {
  id: PEODPSection;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface PEODPChecklistVersion {
  id: string;
  year: number;
  version: string;
  effectiveDate: string;
  requirements: PEODPRequirement[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
}

export interface PEODPAudit {
  id: string;
  vesselId: string;
  vesselName: string;
  dpClass: "DP1" | "DP2" | "DP3";
  checklistVersionId: string;
  auditorId?: string;
  auditorName?: string;
  auditDate: string;
  status: "rascunho" | "em_andamento" | "concluido" | "aprovado";
  items: PEODPAuditItem[];
  score: number;
  scoreBySection: Record<PEODPSection, number>;
  recommendations: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Section metadata
export const PEODP_SECTIONS: PEODPSectionMeta[] = [
  {
    id: "gestao",
    code: "3.2",
    name: "Gestão",
    description: "Gestão de riscos, plano de ação, indicadores e abrangência",
    icon: "Users",
    color: "blue"
  },
  {
    id: "treinamentos",
    code: "3.3",
    name: "Treinamentos",
    description: "Capacitação em DP, bow-ties, FMEA e competências técnicas",
    icon: "GraduationCap",
    color: "green"
  },
  {
    id: "procedimentos",
    code: "3.4",
    name: "Procedimentos",
    description: "Análise de desvios, incidentes, bow-ties e manual de operações",
    icon: "FileText",
    color: "purple"
  },
  {
    id: "operacao",
    code: "3.5",
    name: "Operação",
    description: "Sistema DP, FMEA, configuração UTC e exercícios de blackout",
    icon: "Radio",
    color: "orange"
  },
  {
    id: "manutencao",
    code: "3.6",
    name: "Manutenção",
    description: "Plano anual, software/hardware e sistemas críticos",
    icon: "Wrench",
    color: "red"
  },
  {
    id: "testes_anuais",
    code: "3.7",
    name: "Testes Anuais DP",
    description: "DP Trials, CAMO, ASOG e cronograma de testes",
    icon: "TestTube",
    color: "indigo"
  }
];

// Default checklist based on PEO-DP 2021 document
export const PEODP_DEFAULT_REQUIREMENTS: PEODPRequirement[] = [
  // === GESTÃO (3.2) ===
  {
    id: "req-3.2.1.1",
    section: "gestao",
    code: "3.2.1.1",
    title: "Gestão de Riscos alinhada com objetivos",
    description: "A empresa CONTRATADA deverá descrever como a Gestão de Riscos está alinhada com os objetivos, estratégias e cultura da sua Organização.",
    reference: "PE-2LEP-00001",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.2.1.2",
    section: "gestao",
    code: "3.2.1.2",
    title: "Gestão de Riscos integrada às atividades",
    description: "A empresa CONTRATADA deverá descrever como a Gestão de Riscos está integrada em todas as atividades da sua Organização.",
    reference: "ISO 31000",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.2.1.3",
    section: "gestao",
    code: "3.2.1.3",
    title: "Segurança como valor principal",
    description: "A empresa CONTRATADA deverá descrever como a segurança das operações de suas embarcações é um dos seus principais valores.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.2.2",
    section: "gestao",
    code: "3.2.2",
    title: "Estudo de riscos das operações",
    description: "A empresa CONTRATADA deverá, sempre que solicitada pela PETROBRAS, entregar uma cópia atualizada do estudo de riscos das operações de suas embarcações.",
    reference: "PE-2LEP-00001",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.2.3",
    section: "gestao",
    code: "3.2.3",
    title: "Plano de Ação aprovado pela direção",
    description: "A empresa CONTRATADA deverá ter o seu Plano de Ação aprovado pela mais alta direção da empresa.",
    mandatory: true,
    weight: 10
  },
  {
    id: "req-3.2.4",
    section: "gestao",
    code: "3.2.4",
    title: "Revisão anual do Plano de Ação",
    description: "A empresa CONTRATADA deverá revisar anualmente o seu Plano de Ação para assegurar abrangência de acidentes, incidentes e desvios.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.2.5",
    section: "gestao",
    code: "3.2.5",
    title: "Plano de Ação no Sistema de Gestão Integrado",
    description: "A empresa CONTRATADA deverá entregar à PETROBRAS, quando solicitada, evidência de que o seu Plano de Ação faz parte do seu Sistema de Gestão Integrado.",
    reference: "ISO 9001",
    mandatory: true,
    weight: 7
  },
  {
    id: "req-3.2.6",
    section: "gestao",
    code: "3.2.6",
    title: "Melhoria contínua do Plano de Ação",
    description: "A empresa CONTRATADA deverá implantar, implementar e gerir continuamente seu Plano de Ação, considerando as melhores práticas e lições aprendidas.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.2.7",
    section: "gestao",
    code: "3.2.7",
    title: "Fatores Humanos na cultura de segurança",
    description: "A empresa CONTRATADA deverá descrever como aspectos ligados a Fatores Humanos estão integrados à sua cultura de segurança operacional.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.2.8",
    section: "gestao",
    code: "3.2.8",
    title: "Recursos para gestão de riscos",
    description: "A empresa CONTRATADA deverá assegurar que os recursos necessários sejam alocados para gerenciar os riscos tratados no Plano de Ação.",
    mandatory: true,
    weight: 7
  },
  {
    id: "req-3.2.9",
    section: "gestao",
    code: "3.2.9",
    title: "Sistema de consequências e reconhecimento",
    description: "A empresa CONTRATADA deverá descrever como será elaborado e atualizado um sistema de consequências para violações e um sistema de reconhecimento pelo desempenho em segurança.",
    mandatory: true,
    weight: 7
  },
  {
    id: "req-3.2.14",
    section: "gestao",
    code: "3.2.14",
    title: "Análise crítica mensal de eficiência",
    description: "A empresa CONTRATADA deverá realizar mensalmente uma análise crítica de cada embarcação de sua frota em termos de eficiência operacional.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.2.17",
    section: "gestao",
    code: "3.2.17",
    title: "Indicador IPCLV",
    description: "Índice de Preenchimento Correto das Listas de Verificação para entrada na Zona de 500 metros da Unidade Marítima - Meta: 100%.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.2.23",
    section: "gestao",
    code: "3.2.23",
    title: "Registro de Drift off, Drive off e Large Excursion",
    description: "A empresa CONTRATADA deverá preencher o Anexo C e entrega-lo à PETROBRAS até o 8º dia útil do mês corrente para eventos de perda de posição.",
    mandatory: true,
    weight: 10
  },
  {
    id: "req-3.2.24",
    section: "gestao",
    code: "3.2.24",
    title: "Company DP Authority nomeado",
    description: "A empresa CONTRATADA deverá nomear formalmente uma pessoa responsável pela implementação e desenvolvimento de treinamentos (Company DP Authority), conforme IMCA M 117.",
    reference: "IMCA M 117",
    mandatory: true,
    weight: 10
  },

  // === TREINAMENTOS (3.3) ===
  {
    id: "req-3.3.1",
    section: "treinamentos",
    code: "3.3.1",
    title: "Levantamento de lacunas em treinamentos",
    description: "A empresa CONTRATADA deverá descrever como será desenvolvido e tratado o levantamento de lacunas em treinamentos da força de trabalho.",
    reference: "IMCA M 117",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.3.2",
    section: "treinamentos",
    code: "3.3.2",
    title: "Treinamentos em Análises de Riscos DP",
    description: "A empresa CONTRATADA deverá descrever como são realizados os treinamentos de toda a força de trabalho nas Análises de Riscos para as operações em modo DP.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.3.3",
    section: "treinamentos",
    code: "3.3.3",
    title: "Treinamentos em Bow-ties",
    description: "A empresa CONTRATADA deverá descrever como são realizados os treinamentos nos bow-ties ou ferramentas equivalentes de toda a força de trabalho.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.3.4",
    section: "treinamentos",
    code: "3.3.4",
    title: "Treinamento para Líderes e força de trabalho",
    description: "A empresa CONTRATADA deverá descrever como será ministrado e mantido o Treinamento para Líderes envolvidos no cumprimento do PEO-DP, incluindo cultura de segurança e Fatores Humanos.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.3.5",
    section: "treinamentos",
    code: "3.3.5",
    title: "Atualização em procedimentos de blackout",
    description: "A empresa CONTRATADA deverá descrever como manterá seus Oficiais das Seções de Convés e de Máquinas atualizados nos procedimentos de recuperação de blackout.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.3.6",
    section: "treinamentos",
    code: "3.3.6",
    title: "Manual do Sistema DP a bordo",
    description: "A empresa CONTRATADA deverá manter disponível, a bordo de cada embarcação de sua frota, uma cópia do Manual do Sistema DP.",
    mandatory: true,
    weight: 7
  },
  {
    id: "req-3.3.7",
    section: "treinamentos",
    code: "3.3.7",
    title: "Familiarização de oficiais em DP",
    description: "A empresa CONTRATADA deverá descrever no seu Plano de Ação como, onde e quando será realizada a familiarização do Oficial de Náutica e do Oficial de Máquinas nos sistemas DP.",
    reference: "STCW",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.3.8",
    section: "treinamentos",
    code: "3.3.8",
    title: "Avaliação de desempenho dos oficiais",
    description: "A empresa CONTRATADA deverá descrever como avaliará o desempenho de seus Oficiais de Náutica e Máquinas na operação dos sistemas DP.",
    mandatory: true,
    weight: 7
  },

  // === PROCEDIMENTOS (3.4) ===
  {
    id: "req-3.4.1",
    section: "procedimentos",
    code: "3.4.1",
    title: "Procedimento de análise de desvios e incidentes",
    description: "A empresa CONTRATADA deverá elaborar e manter atualizado procedimento que contemple a análise e tratamento de desvios, incidentes e acidentes com a devida abrangência.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.4.2",
    section: "procedimentos",
    code: "3.4.2",
    title: "Elaboração de bow-ties por tipo de embarcação",
    description: "A empresa CONTRATADA deverá descrever como se dará a elaboração e a atualização constante dos bow-tie ou ferramentas equivalentes, específicos para cada tipo de projeto de embarcação DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.4.3",
    section: "procedimentos",
    code: "3.4.3",
    title: "Conhecimento de riscos em Turret e NT Ancorados",
    description: "A empresa CONTRATADA deverá manter nos seus procedimentos operacionais a necessidade de reforçar o conhecimento sobre os riscos das operações em unidades do tipo Turret e NT Ancorados.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.4.4",
    section: "procedimentos",
    code: "3.4.4",
    title: "Manual de Operações com configuração de referências DP",
    description: "A empresa CONTRATADA deverá assegurar que o Manual de Operações de cada embarcação especifique a melhor configuração dos sistemas de referências em modo DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.4.5",
    section: "procedimentos",
    code: "3.4.5",
    title: "Relative Heading Control em Turret/NT",
    description: "A empresa CONTRATADA deverá incluir no Manual de Operações a orientação para habilitar a função Relative Heading Control sempre que operar com unidades Turret e NT Ancorados.",
    mandatory: true,
    weight: 7
  },
  {
    id: "req-3.4.6",
    section: "procedimentos",
    code: "3.4.6",
    title: "Lista de verificação pré-operacional completa",
    description: "A empresa CONTRATADA deverá assegurar que todos os testes previstos na lista de verificação pré-operacional sejam realizados e que estabeleça a correta configuração do sistema DP.",
    mandatory: true,
    weight: 10
  },

  // === OPERAÇÃO (3.5) ===
  {
    id: "req-3.5.1",
    section: "operacao",
    code: "3.5.1",
    title: "Identificação de problemas no sistema de energia",
    description: "A empresa CONTRATADA deverá descrever como se dará a identificação e o tratamento de eventuais problemas referentes ao sistema de geração, controle e distribuição de energia.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.5.2",
    section: "operacao",
    code: "3.5.2",
    title: "Atendimento às normas IMO, IMCA, OCIMF, MTS",
    description: "A empresa CONTRATADA deverá atender as Normas da Autoridade Marítima, regras da Sociedade Classificadora, padrões da PETROBRAS e recomendações aplicáveis.",
    reference: "IMO, IMCA, OCIMF, MTS",
    mandatory: true,
    weight: 10
  },
  {
    id: "req-3.5.3",
    section: "operacao",
    code: "3.5.3",
    title: "Lista de verificação pré-operacional no CCM",
    description: "A empresa CONTRATADA deverá assegurar que será mantida nos CCM das embarcações uma cópia da lista de verificação pré-operacional, com base na configuração testada do FMEA.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.5.4",
    section: "operacao",
    code: "3.5.4",
    title: "FMEA atualizado a bordo",
    description: "A empresa CONTRATADA deverá manter o FMEA atualizado e a bordo das embarcações e garantir que seja do total conhecimento dos Oficiais.",
    reference: "IMCA M 166",
    mandatory: true,
    weight: 10
  },
  {
    id: "req-3.5.5",
    section: "operacao",
    code: "3.5.5",
    title: "Referência UTC para sincronização",
    description: "A empresa CONTRATADA deverá assegurar no seu Plano de Ação a utilização da referência UTC para sincronização dos diferentes controladores.",
    mandatory: true,
    weight: 7
  },
  {
    id: "req-3.5.6",
    section: "operacao",
    code: "3.5.6",
    title: "Exercícios de recuperação de blackout semestrais",
    description: "A empresa CONTRATADA deverá fazer constar que exercícios simulados de recuperação de blackout (total e parcial) serão realizados a cada 6 meses.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.5.7",
    section: "operacao",
    code: "3.5.7",
    title: "Configuração DP conforme FMEA e ASOG",
    description: "A empresa CONTRATADA deverá fazer constar que será mantida a configuração do sistema DP conforme o FMEA e ASOG da embarcação durante toda a operação.",
    mandatory: true,
    weight: 10
  },

  // === MANUTENÇÃO (3.6) ===
  {
    id: "req-3.6.1",
    section: "manutencao",
    code: "3.6.1",
    title: "Plano de Manutenção anual aprovado",
    description: "A empresa CONTRATADA deverá assegurar a existência de um Plano de Manutenção anual para sistemas e equipamentos críticos, aprovado pela alta direção.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.6.2",
    section: "manutencao",
    code: "3.6.2",
    title: "Cópia atualizada do Plano de Manutenção",
    description: "A empresa CONTRATADA deverá, sempre que for solicitada pela PETROBRAS, entregar uma cópia atualizada do Plano de Manutenção.",
    mandatory: true,
    weight: 7
  },
  {
    id: "req-3.6.3",
    section: "manutencao",
    code: "3.6.3",
    title: "Softwares e hardwares do Sistema DP atualizados",
    description: "A empresa CONTRATADA deverá assegurar que os softwares e hardwares do Sistema DP de cada embarcação encontram-se atualizados, com controle de vida útil.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.6.4",
    section: "manutencao",
    code: "3.6.4",
    title: "Planos de Manutenção de sistemas críticos",
    description: "A empresa CONTRATADA deverá ter os Planos de Manutenção de sistemas e equipamentos críticos das embarcações de sua frota.",
    reference: "Anexo G",
    mandatory: true,
    weight: 8
  },

  // === TESTES ANUAIS DP (3.7) ===
  {
    id: "req-3.7.1",
    section: "testes_anuais",
    code: "3.7.1",
    title: "DP Annual Trials por profissionais competentes",
    description: "A empresa CONTRATADA deverá assegurar que os testes anuais DP serão realizados por profissionais que possuam comprovada competência técnica e experiência para embarcações DP classe 2.",
    reference: "IMCA M 190",
    mandatory: true,
    weight: 10
  },
  {
    id: "req-3.7.2",
    section: "testes_anuais",
    code: "3.7.2",
    title: "Escopo de testes baseado no FMEA",
    description: "A empresa CONTRATADA deverá assegurar que o escopo de testes será baseado no estudo FMEA da embarcação e cumprido em sua totalidade.",
    mandatory: true,
    weight: 10
  },
  {
    id: "req-3.7.3",
    section: "testes_anuais",
    code: "3.7.3",
    title: "Cronograma de testes para 5 anos",
    description: "A empresa CONTRATADA deverá entregar o seu cronograma de testes para os cinco anos seguintes ou até docagem seguinte.",
    mandatory: true,
    weight: 8
  },
  {
    id: "req-3.7.4",
    section: "testes_anuais",
    code: "3.7.4",
    title: "Relatórios dos testes anuais DP",
    description: "A empresa CONTRATADA deverá entregar à PETROBRAS os relatórios dos testes anuais DP de todas as embarcações DP de sua frota.",
    mandatory: true,
    weight: 9
  },
  {
    id: "req-3.7.5",
    section: "testes_anuais",
    code: "3.7.5",
    title: "CAMO, ASOG e FMEA atualizados",
    description: "A empresa CONTRATADA deverá entregar à PETROBRAS, quando solicitado, a versão mais atual do CAMO, ASOG e FMEA de todas as embarcações DP.",
    mandatory: true,
    weight: 10
  }
];

// Helper functions
export function calculateAuditScore(items: PEODPAuditItem[], requirements: PEODPRequirement[]): number {
  const requirementMap = new Map(requirements.map(r => [r.id, r]));
  let totalWeight = 0;
  let earnedWeight = 0;

  items.forEach(item => {
    const req = requirementMap.get(item.requirementId);
    if (!req || item.status === "nao_aplicavel") return;

    totalWeight += req.weight;
    
    switch (item.status) {
      case "conforme":
        earnedWeight += req.weight;
        break;
      case "parcial":
        earnedWeight += req.weight * 0.5;
        break;
      case "nao_conforme":
      case "pendente":
        // No points
        break;
    }
  });

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

export function calculateSectionScores(
  items: PEODPAuditItem[], 
  requirements: PEODPRequirement[]
): Record<PEODPSection, number> {
  const requirementMap = new Map(requirements.map(r => [r.id, r]));
  const sectionScores: Record<PEODPSection, { earned: number; total: number }> = {
    gestao: { earned: 0, total: 0 },
    treinamentos: { earned: 0, total: 0 },
    procedimentos: { earned: 0, total: 0 },
    operacao: { earned: 0, total: 0 },
    manutencao: { earned: 0, total: 0 },
    testes_anuais: { earned: 0, total: 0 }
  };

  items.forEach(item => {
    const req = requirementMap.get(item.requirementId);
    if (!req || item.status === "nao_aplicavel") return;

    sectionScores[req.section].total += req.weight;
    
    switch (item.status) {
      case "conforme":
        sectionScores[req.section].earned += req.weight;
        break;
      case "parcial":
        sectionScores[req.section].earned += req.weight * 0.5;
        break;
    }
  });

  const result: Record<PEODPSection, number> = {} as any;
  for (const [section, data] of Object.entries(sectionScores)) {
    result[section as PEODPSection] = data.total > 0 
      ? Math.round((data.earned / data.total) * 100) 
      : 0;
  }

  return result;
}

export function getStatusColor(status: ComplianceStatus): string {
  switch (status) {
    case "conforme": return "text-green-600";
    case "parcial": return "text-yellow-600";
    case "nao_conforme": return "text-red-600";
    case "nao_aplicavel": return "text-gray-400";
    case "pendente": return "text-muted-foreground";
    default: return "text-muted-foreground";
  }
}

export function getStatusBgColor(status: ComplianceStatus): string {
  switch (status) {
    case "conforme": return "bg-green-50 border-green-200";
    case "parcial": return "bg-yellow-50 border-yellow-200";
    case "nao_conforme": return "bg-red-50 border-red-200";
    case "nao_aplicavel": return "bg-gray-50 border-gray-200";
    case "pendente": return "bg-muted border-border";
    default: return "bg-muted border-border";
  }
}

export function getStatusLabel(status: ComplianceStatus): string {
  switch (status) {
    case "conforme": return "Conforme";
    case "parcial": return "Parcial";
    case "nao_conforme": return "Não Conforme";
    case "nao_aplicavel": return "N/A";
    case "pendente": return "Pendente";
    default: return status;
  }
}

export function getScoreLevel(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Bom";
  if (score >= 60) return "Regular";
  if (score >= 40) return "Insuficiente";
  return "Crítico";
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}
