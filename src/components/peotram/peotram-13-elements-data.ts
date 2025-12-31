/**
 * PEOTRAM 2024 - 13 Elementos Reais Petrobras
 * Baseado no arquivo "LV PEOTRAM Ciclo 2024 PETROBRAS.xlsx"
 */

export interface PeotramItem {
  id: string;
  itemNumber: string;
  description: string;
  requirement: string;
  normReference: string;
  evidenceRequired: string[];
  criticalityLevel: 'critical' | 'major' | 'minor' | 'observation';
}

export interface PeotramSection {
  id: string;
  sectionNumber: string;
  sectionName: string;
  items: PeotramItem[];
}

export interface PeotramElement {
  id: string;
  elementNumber: number;
  elementName: string;
  elementSigla: string;
  description: string;
  isCritical: boolean;
  importanceLevel: 'critical' | 'high' | 'normal' | 'low';
  weightPercentage: number;
  sections: PeotramSection[];
  totalItems: number;
  documentationRequired: string[];
  normsReferenced: string[];
}

export interface ScoringCriteria {
  value: number | null;
  label: string;
  percentage: number;
  color: string;
}

export interface NCClassification {
  code: string;
  label: string;
  description: string;
  color: string;
  priority: number;
}

// Critérios de Pontuação PEOTRAM
export const PEOTRAM_SCORING: Record<string, ScoringCriteria> = {
  "NA": { value: null, label: "Não Aplicável", percentage: 0, color: "hsl(var(--muted))" },
  "0": { value: 0, label: "Não Evidenciado", percentage: 0, color: "hsl(var(--destructive))" },
  "1": { value: 1, label: "Falhas Sistemáticas", percentage: 20, color: "hsl(var(--destructive))" },
  "2": { value: 2, label: "Falhas Pontuais", percentage: 50, color: "hsl(var(--warning))" },
  "3": { value: 3, label: "Sem Falhas", percentage: 90, color: "hsl(var(--success))" },
  "4": { value: 4, label: "Excelência", percentage: 100, color: "hsl(var(--success))" }
};

// Classificação de Não-Conformidades
export const NC_CLASSIFICATIONS: Record<string, NCClassification> = {
  "A": { code: "A", label: "Crítica", description: "Não-conformidade que representa risco iminente", color: "hsl(var(--destructive))", priority: 1 },
  "B": { code: "B", label: "Grave", description: "Não-conformidade que pode comprometer a operação", color: "hsl(var(--destructive))", priority: 2 },
  "C": { code: "C", label: "Moderada", description: "Não-conformidade que requer atenção", color: "hsl(var(--warning))", priority: 3 },
  "D": { code: "D", label: "Leve", description: "Não-conformidade menor", color: "hsl(var(--warning))", priority: 4 }
};

// 13 ELEMENTOS REAIS DO PEOTRAM 2024 PETROBRAS
export const PEOTRAM_2024_ELEMENTS: PeotramElement[] = [
  {
    id: "ELEM_01",
    elementNumber: 1,
    elementName: "Liderança, Gerenciamento e Responsabilidade",
    elementSigla: "LGR",
    description: "Compromisso da alta administração e gestão de segurança, meio ambiente e saúde",
    isCritical: false,
    importanceLevel: "high",
    weightPercentage: 8.5,
    totalItems: 12,
    documentationRequired: [
      "Política de SMS assinada",
      "Organograma atualizado",
      "Matriz de responsabilidades",
      "Atas de reunião de SMS"
    ],
    normsReferenced: ["ISM Code", "MARPOL", "SOLAS"],
    sections: [
      {
        id: "S1.1",
        sectionNumber: "1.1",
        sectionName: "Compromisso da Alta Administração",
        items: [
          {
            id: "1.1.1",
            itemNumber: "1.1.1",
            description: "A alta administração demonstra compromisso claro em implementar e manter a gestão de SMS?",
            requirement: "Evidências de visitas, reuniões e comunicados da alta administração sobre SMS",
            normReference: "ISM Code 3.1",
            evidenceRequired: ["Entrevistas", "Registros de visitas", "Comunicados"],
            criticalityLevel: "major"
          },
          {
            id: "1.1.2",
            itemNumber: "1.1.2",
            description: "A empresa possui setores de Operação, Manutenção, RH e SMS adequadamente estruturados?",
            requirement: "Organograma e matriz de competências dos setores críticos",
            normReference: "ISM Code 3.2",
            evidenceRequired: ["Organograma", "Descrição de cargos", "Qualificações"],
            criticalityLevel: "major"
          },
          {
            id: "1.1.3",
            itemNumber: "1.1.3",
            description: "Existe definição clara de responsabilidades e autoridades para SMS?",
            requirement: "Matriz RACI ou equivalente documentada",
            normReference: "ISM Code 3.3",
            evidenceRequired: ["Matriz de responsabilidades", "Procedimentos"],
            criticalityLevel: "minor"
          }
        ]
      },
      {
        id: "S1.2",
        sectionNumber: "1.2",
        sectionName: "Recursos e Investimentos",
        items: [
          {
            id: "1.2.1",
            itemNumber: "1.2.1",
            description: "A empresa disponibiliza recursos adequados para implementação do SMS?",
            requirement: "Orçamento de SMS, investimentos em segurança",
            normReference: "ISM Code 3.3",
            evidenceRequired: ["Orçamento", "Comprovantes de investimento"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_02",
    elementNumber: 2,
    elementName: "Conformidade Legal",
    elementSigla: "CL",
    description: "Identificação e atendimento a requisitos legais, normativos e contratuais",
    isCritical: false,
    importanceLevel: "high",
    weightPercentage: 7.5,
    totalItems: 10,
    documentationRequired: [
      "Lista de requisitos legais",
      "Certificados e licenças",
      "Registros de conformidade"
    ],
    normsReferenced: ["NORMAM", "NR-34", "NR-37", "MARPOL"],
    sections: [
      {
        id: "S2.1",
        sectionNumber: "2.1",
        sectionName: "Requisitos Legais e Normativos",
        items: [
          {
            id: "2.1.1",
            itemNumber: "2.1.1",
            description: "A empresa possui sistema para identificar e atualizar legislações e normas pertinentes?",
            requirement: "Sistema de gestão de requisitos legais atualizado",
            normReference: "NORMAM-01",
            evidenceRequired: ["Lista de requisitos", "Software de gestão", "Atualizações"],
            criticalityLevel: "critical"
          },
          {
            id: "2.1.2",
            itemNumber: "2.1.2",
            description: "Os certificados estatutários estão válidos e disponíveis?",
            requirement: "Todos os certificados dentro da validade",
            normReference: "SOLAS",
            evidenceRequired: ["Certificados", "Registros de vistoria"],
            criticalityLevel: "critical"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_03",
    elementNumber: 3,
    elementName: "Avaliação e Gestão de Riscos",
    elementSigla: "AGR",
    description: "Identificação, análise e controle de riscos operacionais e de SMS",
    isCritical: false,
    importanceLevel: "high",
    weightPercentage: 9.0,
    totalItems: 14,
    documentationRequired: [
      "Análise de riscos operacionais",
      "Matriz de riscos",
      "Planos de mitigação",
      "Registros de APR/PT"
    ],
    normsReferenced: ["ISM Code 1.2.2", "NR-34", "NR-37"],
    sections: [
      {
        id: "S3.1",
        sectionNumber: "3.1",
        sectionName: "Identificação de Perigos",
        items: [
          {
            id: "3.1.1",
            itemNumber: "3.1.1",
            description: "Existe metodologia sistemática para identificação de perigos?",
            requirement: "Procedimento de identificação de perigos documentado",
            normReference: "ISM Code 1.2.2",
            evidenceRequired: ["Procedimento", "Registros de análise"],
            criticalityLevel: "major"
          }
        ]
      },
      {
        id: "S3.2",
        sectionNumber: "3.2",
        sectionName: "Análise e Avaliação de Riscos",
        items: [
          {
            id: "3.2.1",
            itemNumber: "3.2.1",
            description: "A empresa utiliza metodologia adequada para análise de riscos?",
            requirement: "APR, HAZOP, What-If ou metodologia equivalente",
            normReference: "NR-37",
            evidenceRequired: ["Estudos de risco", "Relatórios"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_04",
    elementNumber: 4,
    elementName: "Informação, Documentação e Controle de Registros",
    elementSigla: "IDC",
    description: "Gestão de documentos e registros do sistema de gestão",
    isCritical: true,
    importanceLevel: "critical",
    weightPercentage: 6.5,
    totalItems: 8,
    documentationRequired: [
      "Procedimento de controle de documentos",
      "Lista mestra de documentos",
      "Registros de treinamento",
      "Backup de documentos"
    ],
    normsReferenced: ["ISM Code 11", "ISO 9001"],
    sections: [
      {
        id: "S4.1",
        sectionNumber: "4.1",
        sectionName: "Controle de Documentos",
        items: [
          {
            id: "4.1.1",
            itemNumber: "4.1.1",
            description: "Existe procedimento para controle de documentos do SGI?",
            requirement: "Procedimento documentado com revisão e aprovação",
            normReference: "ISM Code 11",
            evidenceRequired: ["Procedimento", "Lista mestra"],
            criticalityLevel: "major"
          },
          {
            id: "4.1.2",
            itemNumber: "4.1.2",
            description: "Os documentos estão disponíveis nos locais de uso?",
            requirement: "Documentos acessíveis a bordo e em terra",
            normReference: "ISM Code 11.2",
            evidenceRequired: ["Verificação in loco", "Sistema de acesso"],
            criticalityLevel: "minor"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_05",
    elementNumber: 5,
    elementName: "Pessoal, Capacitação e Competência",
    elementSigla: "PCC",
    description: "Gestão de pessoas, treinamento e desenvolvimento de competências",
    isCritical: false,
    importanceLevel: "high",
    weightPercentage: 8.0,
    totalItems: 12,
    documentationRequired: [
      "Matriz de competências",
      "Plano de treinamento",
      "Certificados de capacitação",
      "Registros de treinamento"
    ],
    normsReferenced: ["STCW", "NR-34", "NR-37", "ISM Code 6"],
    sections: [
      {
        id: "S5.1",
        sectionNumber: "5.1",
        sectionName: "Competências e Qualificações",
        items: [
          {
            id: "5.1.1",
            itemNumber: "5.1.1",
            description: "A tripulação possui as qualificações exigidas pela STCW?",
            requirement: "Certificados STCW válidos para toda a tripulação",
            normReference: "STCW",
            evidenceRequired: ["Certificados", "Endossos", "Registros"],
            criticalityLevel: "critical"
          }
        ]
      },
      {
        id: "S5.2",
        sectionNumber: "5.2",
        sectionName: "Treinamento",
        items: [
          {
            id: "5.2.1",
            itemNumber: "5.2.1",
            description: "Existe plano de treinamento estruturado?",
            requirement: "Plano anual de treinamento documentado",
            normReference: "ISM Code 6.3",
            evidenceRequired: ["Plano de treinamento", "Cronograma"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_06",
    elementNumber: 6,
    elementName: "Integridade Mecânica e Garantia de Qualidade",
    elementSigla: "IMG",
    description: "Manutenção de equipamentos críticos e garantia de integridade operacional",
    isCritical: true,
    importanceLevel: "critical",
    weightPercentage: 9.5,
    totalItems: 16,
    documentationRequired: [
      "Plano de manutenção",
      "Registros de manutenção",
      "Certificados de equipamentos",
      "Relatórios de inspeção"
    ],
    normsReferenced: ["ISM Code 10", "SOLAS", "Class Rules"],
    sections: [
      {
        id: "S6.1",
        sectionNumber: "6.1",
        sectionName: "Manutenção Preventiva",
        items: [
          {
            id: "6.1.1",
            itemNumber: "6.1.1",
            description: "Existe sistema de manutenção planejada (PMS)?",
            requirement: "Sistema PMS implementado e atualizado",
            normReference: "ISM Code 10",
            evidenceRequired: ["Software PMS", "Registros", "Histórico"],
            criticalityLevel: "critical"
          },
          {
            id: "6.1.2",
            itemNumber: "6.1.2",
            description: "Os equipamentos críticos são identificados e priorizados?",
            requirement: "Lista de equipamentos críticos com criticidade",
            normReference: "ISM Code 10.2",
            evidenceRequired: ["Lista de equipamentos", "Matriz de criticidade"],
            criticalityLevel: "major"
          }
        ]
      },
      {
        id: "S6.2",
        sectionNumber: "6.2",
        sectionName: "Inspeções e Testes",
        items: [
          {
            id: "6.2.1",
            itemNumber: "6.2.1",
            description: "Os testes periódicos de equipamentos de segurança são realizados?",
            requirement: "Cronograma de testes com registros",
            normReference: "SOLAS III",
            evidenceRequired: ["Cronograma", "Registros de testes"],
            criticalityLevel: "critical"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_07",
    elementNumber: 7,
    elementName: "Gestão de Contratadas",
    elementSigla: "GC",
    description: "Gestão de empresas contratadas e prestadores de serviço",
    isCritical: false,
    importanceLevel: "normal",
    weightPercentage: 6.0,
    totalItems: 8,
    documentationRequired: [
      "Critérios de qualificação",
      "Contratos com cláusulas de SMS",
      "Avaliação de fornecedores",
      "Monitoramento de desempenho"
    ],
    normsReferenced: ["ISM Code", "NR-34"],
    sections: [
      {
        id: "S7.1",
        sectionNumber: "7.1",
        sectionName: "Qualificação de Contratadas",
        items: [
          {
            id: "7.1.1",
            itemNumber: "7.1.1",
            description: "Existe processo de qualificação de contratadas?",
            requirement: "Procedimento de qualificação documentado",
            normReference: "ISM Code",
            evidenceRequired: ["Procedimento", "Critérios", "Registros"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_08",
    elementNumber: 8,
    elementName: "Gestão de Operações",
    elementSigla: "GO",
    description: "Procedimentos e controles operacionais para atividades críticas",
    isCritical: false,
    importanceLevel: "high",
    weightPercentage: 8.5,
    totalItems: 14,
    documentationRequired: [
      "Procedimentos operacionais",
      "Checklists operacionais",
      "Registros de operações",
      "Análise de desvios"
    ],
    normsReferenced: ["ISM Code 7", "MARPOL", "SOLAS"],
    sections: [
      {
        id: "S8.1",
        sectionNumber: "8.1",
        sectionName: "Procedimentos Operacionais",
        items: [
          {
            id: "8.1.1",
            itemNumber: "8.1.1",
            description: "Existem procedimentos para operações críticas?",
            requirement: "Procedimentos documentados para cada operação crítica",
            normReference: "ISM Code 7",
            evidenceRequired: ["Procedimentos", "Checklists"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_09",
    elementNumber: 9,
    elementName: "Gestão de Mudanças",
    elementSigla: "GM",
    description: "Controle de mudanças em processos, equipamentos e organização",
    isCritical: false,
    importanceLevel: "normal",
    weightPercentage: 5.5,
    totalItems: 6,
    documentationRequired: [
      "Procedimento de gestão de mudanças",
      "Formulários de solicitação",
      "Análise de impacto",
      "Registros de aprovação"
    ],
    normsReferenced: ["ISM Code", "NR-37"],
    sections: [
      {
        id: "S9.1",
        sectionNumber: "9.1",
        sectionName: "Processo de Mudanças",
        items: [
          {
            id: "9.1.1",
            itemNumber: "9.1.1",
            description: "Existe procedimento formal de gestão de mudanças?",
            requirement: "Procedimento de MOC documentado",
            normReference: "NR-37",
            evidenceRequired: ["Procedimento", "Formulários", "Registros"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_10",
    elementNumber: 10,
    elementName: "Gestão de Trabalhos e Serviços",
    elementSigla: "GTS",
    description: "Planejamento e execução segura de trabalhos e serviços",
    isCritical: false,
    importanceLevel: "high",
    weightPercentage: 7.5,
    totalItems: 10,
    documentationRequired: [
      "Sistema de permissão de trabalho",
      "APR/PT preenchidas",
      "Registros de trabalhos",
      "Liberação de áreas"
    ],
    normsReferenced: ["NR-34", "NR-35", "NR-33"],
    sections: [
      {
        id: "S10.1",
        sectionNumber: "10.1",
        sectionName: "Permissão de Trabalho",
        items: [
          {
            id: "10.1.1",
            itemNumber: "10.1.1",
            description: "Existe sistema de permissão de trabalho implementado?",
            requirement: "Sistema PT com formulários e autorizações",
            normReference: "NR-34",
            evidenceRequired: ["Sistema PT", "Formulários", "Registros"],
            criticalityLevel: "critical"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_11",
    elementNumber: 11,
    elementName: "Comunicação e Consulta",
    elementSigla: "CC",
    description: "Comunicação interna e externa sobre SMS",
    isCritical: true,
    importanceLevel: "critical",
    weightPercentage: 5.5,
    totalItems: 8,
    documentationRequired: [
      "Matriz de comunicação",
      "Canais de comunicação",
      "Atas de reuniões",
      "Comunicados de segurança"
    ],
    normsReferenced: ["ISM Code 4", "SOLAS"],
    sections: [
      {
        id: "S11.1",
        sectionNumber: "11.1",
        sectionName: "Comunicação Interna",
        items: [
          {
            id: "11.1.1",
            itemNumber: "11.1.1",
            description: "Existem canais efetivos de comunicação de SMS?",
            requirement: "Matriz de comunicação implementada",
            normReference: "ISM Code 4",
            evidenceRequired: ["Matriz", "Registros de comunicação"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_12",
    elementNumber: 12,
    elementName: "Investigação e Análise de Incidentes",
    elementSigla: "IAI",
    description: "Investigação, análise e aprendizado com incidentes e acidentes",
    isCritical: true,
    importanceLevel: "critical",
    weightPercentage: 8.0,
    totalItems: 12,
    documentationRequired: [
      "Procedimento de investigação",
      "Relatórios de incidentes",
      "Análise de causa raiz",
      "Ações corretivas",
      "Divulgação de lições aprendidas"
    ],
    normsReferenced: ["ISM Code 9", "MARPOL", "NORMAM"],
    sections: [
      {
        id: "S12.1",
        sectionNumber: "12.1",
        sectionName: "Reporte de Incidentes",
        items: [
          {
            id: "12.1.1",
            itemNumber: "12.1.1",
            description: "Existe sistema de reporte de incidentes e quase-acidentes?",
            requirement: "Sistema de reporte implementado e acessível",
            normReference: "ISM Code 9",
            evidenceRequired: ["Sistema", "Formulários", "Registros"],
            criticalityLevel: "critical"
          }
        ]
      },
      {
        id: "S12.2",
        sectionNumber: "12.2",
        sectionName: "Investigação",
        items: [
          {
            id: "12.2.1",
            itemNumber: "12.2.1",
            description: "As investigações utilizam metodologia de análise de causa raiz?",
            requirement: "Metodologia documentada (5 Porquês, Ishikawa, etc)",
            normReference: "ISM Code 9.2",
            evidenceRequired: ["Metodologia", "Relatórios de investigação"],
            criticalityLevel: "major"
          }
        ]
      }
    ]
  },
  {
    id: "ELEM_13",
    elementNumber: 13,
    elementName: "Prontidão e Resposta a Emergências",
    elementSigla: "PRE",
    description: "Preparação e resposta a situações de emergência",
    isCritical: false,
    importanceLevel: "high",
    weightPercentage: 10.0,
    totalItems: 18,
    documentationRequired: [
      "Plano de emergência",
      "Procedimentos de emergência",
      "Registros de exercícios",
      "Equipamentos de emergência",
      "Contatos de emergência"
    ],
    normsReferenced: ["ISM Code 8", "SOLAS III", "MARPOL"],
    sections: [
      {
        id: "S13.1",
        sectionNumber: "13.1",
        sectionName: "Planos de Emergência",
        items: [
          {
            id: "13.1.1",
            itemNumber: "13.1.1",
            description: "Existe plano de emergência documentado e atualizado?",
            requirement: "Plano de emergência com cenários e responsabilidades",
            normReference: "ISM Code 8",
            evidenceRequired: ["Plano", "Procedimentos", "Fluxogramas"],
            criticalityLevel: "critical"
          }
        ]
      },
      {
        id: "S13.2",
        sectionNumber: "13.2",
        sectionName: "Exercícios e Simulados",
        items: [
          {
            id: "13.2.1",
            itemNumber: "13.2.1",
            description: "São realizados exercícios periódicos conforme requisitos?",
            requirement: "Cronograma de exercícios cumprido",
            normReference: "SOLAS III/19",
            evidenceRequired: ["Cronograma", "Registros", "Relatórios"],
            criticalityLevel: "critical"
          }
        ]
      }
    ]
  }
];

// Helper functions
export function getElementById(elementNumber: number): PeotramElement | undefined {
  return PEOTRAM_2024_ELEMENTS.find(e => e.elementNumber === elementNumber);
}

export function getTotalItems(): number {
  return PEOTRAM_2024_ELEMENTS.reduce((total, element) => total + element.totalItems, 0);
}

export function getCriticalElements(): PeotramElement[] {
  return PEOTRAM_2024_ELEMENTS.filter(e => e.isCritical);
}

export function getElementProgress(elementNumber: number, completedItems: number): number {
  const element = getElementById(elementNumber);
  if (!element || element.totalItems === 0) return 0;
  return Math.round((completedItems / element.totalItems) * 100);
}

export function calculateOverallScore(scores: Record<number, number>): number {
  let totalWeight = 0;
  let weightedScore = 0;
  
  PEOTRAM_2024_ELEMENTS.forEach(element => {
    if (scores[element.elementNumber] !== undefined) {
      weightedScore += scores[element.elementNumber] * element.weightPercentage;
      totalWeight += element.weightPercentage;
    }
  });
  
  return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) / 100 : 0;
}
