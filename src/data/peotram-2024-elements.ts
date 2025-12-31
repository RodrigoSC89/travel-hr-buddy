/**
 * PEOTRAM 2024 - 13 Elementos Oficiais Petrobras
 * Fonte: LV PEOTRAM - Ciclo 2024 - PETROBRAS.xlsx
 */

export interface PeotramElement {
  id: number;
  name: string;
  shortName: string;
  description: string;
  isCritical: boolean;
  criticalityLevel: 1 | 2 | 3; // 1 = normal, 2 = high, 3 = critical
  totalItems: number;
  sections: PeotramSection[];
}

export interface PeotramSection {
  id: string;
  name: string;
  items: PeotramItem[];
}

export interface PeotramItem {
  id: string;
  code: string; // e.g., "1.1.1"
  description: string;
  evidenceRequired: string;
  normsReferenced?: string[];
}

export interface PeotramGrading {
  value: number | null;
  label: string;
  description: string;
  percentage: number;
  color: string;
}

export const PEOTRAM_GRADES: PeotramGrading[] = [
  { value: null, label: 'N/A', description: 'Não Aplicável / Não Avaliado', percentage: 0, color: 'gray' },
  { value: 0, label: '0', description: 'Não Evidenciado ou Não Implantado', percentage: 0, color: 'red' },
  { value: 1, label: '1', description: 'Falhas Sistemáticas ou Críticas', percentage: 20, color: 'orange' },
  { value: 2, label: '2', description: 'Falhas Pontuais', percentage: 50, color: 'yellow' },
  { value: 3, label: '3', description: 'Evidenciado sem Falhas', percentage: 90, color: 'green' },
  { value: 4, label: '4', description: 'Boas Práticas além do Requerido', percentage: 100, color: 'blue' },
];

export const NC_CLASSIFICATIONS = [
  { code: 'A', label: 'Crítica', description: 'Risco iminente às pessoas/meio ambiente', deadline: 10, color: 'destructive' },
  { code: 'B', label: 'Grave', description: 'Falha relevante no atendimento a requisito', deadline: 15, color: 'orange' },
  { code: 'C', label: 'Moderada', description: 'Atendimento parcial ou insuficiente', deadline: 30, color: 'warning' },
  { code: 'D', label: 'Leve', description: 'Desvio ou falha isolada', deadline: 60, color: 'info' },
  { code: '✓', label: 'Conforme', description: 'Atende aos requisitos', deadline: 0, color: 'success' },
  { code: '✓✓', label: 'Excelência', description: 'Item de excelência', deadline: 0, color: 'primary' },
];

export const PEOTRAM_2024_ELEMENTS: PeotramElement[] = [
  {
    id: 1,
    name: 'Liderança, Gerenciamento e Responsabilidade',
    shortName: 'Liderança',
    description: 'Avalia o compromisso da alta administração com SMS e segurança operacional',
    isCritical: false,
    criticalityLevel: 1,
    totalItems: 6,
    sections: [
      {
        id: '1.1',
        name: 'Responsabilidade e Autoridade',
        items: [
          { id: '1.1.1', code: '1.1.1', description: 'Alta administração demonstra compromisso em SMS', evidenceRequired: 'Entrevistas, atribuições definidas, auditorias comportamentais' },
          { id: '1.1.2', code: '1.1.2', description: 'Setores de Operação/Manutenção/RH/SMS estruturados', evidenceRequired: 'Organograma, matriz de responsabilidades' },
        ]
      },
      {
        id: '1.2',
        name: 'Comprometimento da Liderança',
        items: [
          { id: '1.2.1', code: '1.2.1', description: 'Sistemática para especificações de normas (NRs)', evidenceRequired: 'ISM Code, IMCA, NR 10-35', normsReferenced: ['ISM Code', 'IMCA', 'NR 10', 'NR 11', 'NR 12', 'NR 13'] },
          { id: '1.2.2', code: '1.2.2', description: 'Responsáveis legais designados (PLH, DPA)', evidenceRequired: 'Carta de designação DPA, registros NRs' },
          { id: '1.2.3', code: '1.2.3', description: 'Compromisso com redução de emissões GEE', evidenceRequired: 'Ações práticas, indicadores de emissão' },
        ]
      },
      {
        id: '1.3',
        name: 'Indicadores e Itens Críticos',
        items: [
          { id: '1.3.1', code: '1.3.1', description: 'Indicadores e metas de SMS estabelecidos', evidenceRequired: 'TAR, TOR, TFCA, TG, Vazamentos, ICMP, planos de ação' },
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Conformidade Legal',
    shortName: 'Conformidade',
    description: 'Identificação e atendimento a requisitos legais, NRs e normas marítimas',
    isCritical: false,
    criticalityLevel: 2,
    totalItems: 24,
    sections: [
      {
        id: '2.1',
        name: 'Identificação de Requisitos Legais',
        items: [
          { id: '2.1.1', code: '2.1.1', description: 'Sistema de identificação e atualização de legislação', evidenceRequired: 'Lista ou Software de requisitos legais' },
          { id: '2.1.2', code: '2.1.2', description: 'Grupo interno de inspeção/auditoria', evidenceRequired: 'Cronograma de inspeções, relatórios, qualificação de auditores' },
        ]
      },
      {
        id: '2.2',
        name: 'Atendimento à NR-34',
        items: [
          { id: '2.2.1', code: '2.2.1', description: 'Profissional designado para NR-34', evidenceRequired: 'Evidências de designação' },
          { id: '2.2.2', code: '2.2.2', description: 'Profissionais capacitados conforme NR-34', evidenceRequired: 'Registros de treinamento, carga horária' },
          { id: '2.2.3', code: '2.2.3', description: 'Documentações NR-34 disponíveis', evidenceRequired: 'Permissões para Trabalho' },
          { id: '2.2.4', code: '2.2.4', description: 'Trabalhos a quente conformes', evidenceRequired: 'Registros de atendimento 34.5' },
          { id: '2.2.5', code: '2.2.5', description: 'Trabalhos em altura conformes', evidenceRequired: 'Registros de atendimento 34.6' },
        ]
      },
      {
        id: '2.3',
        name: 'Atendimento à NR-12',
        items: [
          { id: '2.3.1', code: '2.3.1', description: 'PLH para NR-12 designado e atuante', evidenceRequired: 'Evidências de designação, ART recolhida' },
          { id: '2.3.2', code: '2.3.2', description: 'Arranjo físico conforme NR-12', evidenceRequired: 'Relatórios, fotos, visita a bordo' },
        ]
      },
      {
        id: '2.6',
        name: 'Normas de Segurança Marítimas',
        items: [
          { id: '2.6.1', code: '2.6.1', description: 'STCW 95 implementado', evidenceRequired: 'Procedimento documentado, registros', normsReferenced: ['STCW 95'] },
          { id: '2.6.2', code: '2.6.2', description: 'ISM Code implementado', evidenceRequired: 'Procedimento documentado, registros', normsReferenced: ['ISM Code'] },
          { id: '2.6.3', code: '2.6.3', description: 'SOLAS implementado', evidenceRequired: 'Procedimento documentado, registros', normsReferenced: ['SOLAS'] },
          { id: '2.6.6', code: '2.6.6', description: 'IMCA 103 para embarcações DP', evidenceRequired: 'Procedimento documentado, registros', normsReferenced: ['IMCA 103'] },
          { id: '2.6.7', code: '2.6.7', description: 'IMCA 117 para pessoal DP', evidenceRequired: 'Registros de qualificação e treinamento', normsReferenced: ['IMCA 117'] },
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Gestão de Riscos',
    shortName: 'Riscos',
    description: 'Identificação, avaliação e gerenciamento de riscos ocupacionais e operacionais',
    isCritical: false,
    criticalityLevel: 2,
    totalItems: 14,
    sections: [
      {
        id: '3.1',
        name: 'Identificação e Avaliação de Riscos',
        items: [
          { id: '3.1.1', code: '3.1.1', description: 'Processo estruturado de identificação de perigos', evidenceRequired: 'Procedimento, relatórios de análise de riscos' },
          { id: '3.1.3', code: '3.1.3', description: 'Técnicas de classificação de risco (ASOG para DP)', evidenceRequired: 'HAZOP, FMEA/ASOG, HAZID, Bow Tie' },
          { id: '3.1.4', code: '3.1.4', description: 'Matriz de Tolerabilidade aplicada', evidenceRequired: 'Conforme Norma Petrobras N-2782' },
          { id: '3.1.11', code: '3.1.11', description: 'Cenários de risco abrangentes', evidenceRequired: 'Abalroamento, incêndio, naufrágio, DP, diving less' },
        ]
      },
      {
        id: '3.2',
        name: 'Gerenciamento de Riscos',
        items: [
          { id: '3.2.1', code: '3.2.1', description: 'Ações de prevenção/mitigação implementadas', evidenceRequired: 'Verificação em campo, barreiras íntegras' },
          { id: '3.2.2', code: '3.2.2', description: 'Hierarquia de controles aplicada', evidenceRequired: 'Eliminação, substituição, engenharia, admin, EPI' },
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Operação',
    shortName: 'Operação',
    description: 'Gestão de operações críticas, transporte de pessoas/cargas, convés, máquinas',
    isCritical: true,
    criticalityLevel: 3,
    totalItems: 28,
    sections: [
      {
        id: '4.1',
        name: 'Geral',
        items: [
          { id: '4.1.1', code: '4.1.1', description: 'Gestão de equipamentos críticos', evidenceRequired: 'Lista de equipamentos, análise de risco' },
          { id: '4.1.2', code: '4.1.2', description: 'VCP - Verificação de Conformidade de Procedimentos', evidenceRequired: 'Lista de padrões críticos, cronograma' },
          { id: '4.1.3', code: '4.1.3', description: 'Gestão de operações críticas', evidenceRequired: 'Atracação, zona 500m, transferência, DP, SIMOPS' },
          { id: '4.1.4', code: '4.1.4', description: 'Procedimento zona 500 metros', evidenceRequired: 'Registros no diário de bordo' },
          { id: '4.1.7', code: '4.1.7', description: 'Permissões para Trabalho (PT)', evidenceRequired: 'PT emitidas conformes, NRs aplicáveis' },
        ]
      },
      {
        id: '4.2',
        name: 'Transporte de Pessoas',
        items: [
          { id: '4.2.1', code: '4.2.1', description: 'Transferência de pessoas conforme NR-37', evidenceRequired: 'Procedimentos, NR-37' },
        ]
      },
      {
        id: '4.3',
        name: 'Transporte de Cargas e Granéis',
        items: [
          { id: '4.3.2', code: '4.3.2', description: 'Transferência de granéis poluentes', evidenceRequired: 'Bandeja de contenção, kit SOPEP' },
        ]
      },
      {
        id: '4.6',
        name: 'Convés',
        items: [
          { id: '4.6.5', code: '4.6.5', description: 'Equipamentos de içamento com SWL', evidenceRequired: 'Certificados válidos, constatação visual' },
          { id: '4.6.6', code: '4.6.6', description: 'Acessórios de içamento com SWL', evidenceRequired: 'Eslingas, correntes, cabos certificados' },
        ]
      }
    ]
  },
  {
    id: 5,
    name: 'Segurança Técnica e Eficiência Energética',
    shortName: 'Seg. Técnica',
    description: 'Segurança na navegação, operações DP e baixo carbono',
    isCritical: false,
    criticalityLevel: 2,
    totalItems: 14,
    sections: [
      {
        id: '5.1',
        name: 'Segurança na Navegação',
        items: [
          { id: '5.1.1', code: '5.1.1', description: 'Pessoal qualificado para navegação', evidenceRequired: 'Designação, qualificação' },
          { id: '5.1.3', code: '5.1.3', description: 'BRM - Bridge Resource Management', evidenceRequired: 'Planejamento, STCW' },
        ]
      },
      {
        id: '5.2',
        name: 'Operações DP',
        items: [
          { id: '5.2.1', code: '5.2.1', description: 'Departamento de garantia DP estruturado', evidenceRequired: 'Organograma, IMCA 117' },
          { id: '5.2.2', code: '5.2.2', description: 'Manual de operações DP', evidenceRequired: 'Manuais de todas embarcações' },
          { id: '5.2.4', code: '5.2.4', description: 'CAM ASOG por operação', evidenceRequired: 'Conjunto CAM ASOG específico' },
          { id: '5.2.8', code: '5.2.8', description: 'FMEA, FMEA Trials, DP Annual Trials', evidenceRequired: 'Registros, gestão de NC' },
        ]
      },
      {
        id: '5.3',
        name: 'Baixo Carbono',
        items: [
          { id: '5.3.1', code: '5.3.1', description: 'Sistemática GEE conforme ISO 14064', evidenceRequired: 'Inventário de emissões, verificação' },
          { id: '5.3.4', code: '5.3.4', description: 'Medidas técnicas de redução CO2', evidenceRequired: 'Procedimentos, implementação' },
        ]
      }
    ]
  },
  {
    id: 6,
    name: 'Manutenção e Confiabilidade de Embarcações',
    shortName: 'Manutenção',
    description: 'Sistema de manutenção planejado, gestão de equipamentos críticos',
    isCritical: true,
    criticalityLevel: 3,
    totalItems: 24,
    sections: [
      {
        id: '6.1',
        name: 'Manutenção Corretiva e Preventiva',
        items: [
          { id: '6.1.1', code: '6.1.1', description: 'Sistema de manutenção planejado', evidenceRequired: 'Sistema, inventário, registros' },
          { id: '6.1.2', code: '6.1.2', description: 'Estrutura de Gestão de Manutenção', evidenceRequired: 'Organograma, papéis, processos' },
          { id: '6.1.5', code: '6.1.5', description: 'Sistema informatizado de manutenção', evidenceRequired: 'Apresentação do sistema' },
          { id: '6.1.7', code: '6.1.7', description: 'Indicadores de performance/confiabilidade', evidenceRequired: 'Indicadores, metas, registros' },
          { id: '6.1.8', code: '6.1.8', description: 'Plano de manutenção preventiva/corretiva', evidenceRequired: 'Procedimentos, registros, NR-12, NR-34' },
          { id: '6.1.10', code: '6.1.10', description: 'Manutenção de elementos críticos', evidenceRequired: 'Procedimentos, registros, NORMAM 01' },
          { id: '6.1.12', code: '6.1.12', description: 'Manutenções do sistema DP', evidenceRequired: 'Registros, plano de manutenção' },
          { id: '6.1.22', code: '6.1.22', description: 'Comunicação de defeitos críticos', evidenceRequired: 'Procedimento, comunicação terra-bordo' },
        ]
      }
    ]
  },
  {
    id: 7,
    name: 'Gestão de Mudanças',
    shortName: 'Mudanças',
    description: 'Controle de mudanças em operações, processos, equipamentos e pessoas',
    isCritical: false,
    criticalityLevel: 2,
    totalItems: 14,
    sections: [
      {
        id: '7.1',
        name: 'Mudança de Tecnologias/Processos/Equipamentos/Pessoas',
        items: [
          { id: '7.1.1', code: '7.1.1', description: 'Procedimentos de gestão de mudanças', evidenceRequired: 'Procedimento, registros, aprovações' },
          { id: '7.1.2', code: '7.1.2', description: 'Avaliação de risco para mudanças', evidenceRequired: 'Registros de avaliação' },
          { id: '7.1.5', code: '7.1.5', description: 'GM de pessoas (função, área, embarcação)', evidenceRequired: 'Procedimento, registros' },
          { id: '7.1.7', code: '7.1.7', description: 'Modificação de equipamento crítico', evidenceRequired: 'Lista de modificações, registros' },
          { id: '7.1.12', code: '7.1.12', description: 'Software de gestão de mudanças', evidenceRequired: 'Software com registros' },
        ]
      }
    ]
  },
  {
    id: 8,
    name: 'Aquisição de Bens e Serviços',
    shortName: 'Aquisição',
    description: 'Pré-qualificação e avaliação de fornecedores',
    isCritical: false,
    criticalityLevel: 1,
    totalItems: 11,
    sections: [
      {
        id: '8.1',
        name: 'Aquisição de Bens e Serviços',
        items: [
          { id: '8.1.1', code: '8.1.1', description: 'Auditorias de fornecedores', evidenceRequired: 'Relatórios de auditorias' },
          { id: '8.1.2', code: '8.1.2', description: 'Pré-qualificação de fornecedores', evidenceRequired: 'Relação de fornecedores contratados' },
          { id: '8.1.7', code: '8.1.7', description: 'Avaliação de requisitos SMS', evidenceRequired: 'Avaliações, verificação DP, certificações' },
          { id: '8.1.10', code: '8.1.10', description: 'Matriz de responsabilidades com terceiros', evidenceRequired: 'Contratos, Work Agreement, Bridge Documents' },
        ]
      }
    ]
  },
  {
    id: 9,
    name: 'Gestão de Recursos Humanos',
    shortName: 'RH',
    description: 'Recrutamento, treinamentos, simuladores e fatores humanos',
    isCritical: false,
    criticalityLevel: 2,
    totalItems: 18,
    sections: [
      {
        id: '9.3',
        name: 'Treinamentos',
        items: [
          { id: '9.3.2', code: '9.3.2', description: 'Qualificação DP (IMCA, IMO)', evidenceRequired: 'Certificados, Log Book' },
          { id: '9.3.5', code: '9.3.5', description: 'Suporte psicológico', evidenceRequired: 'Avaliação psicológica, ASO, procedimentos' },
        ]
      },
      {
        id: '9.4',
        name: 'Simuladores',
        items: [
          { id: '9.4.1', code: '9.4.1', description: 'Treinamento em simuladores', evidenceRequired: 'Registros de treinamento, SIAGRA, SINDIMAR' },
        ]
      },
      {
        id: '9.6',
        name: 'Fatores Humanos',
        items: [
          { id: '9.6.1', code: '9.6.1', description: 'Programa de Fatores Humanos', evidenceRequired: 'Programa, treinamentos, investigações' },
          { id: '9.6.2', code: '9.6.2', description: 'CRM (Crew Resource Management)', evidenceRequired: 'Certificado de Competência com anotação' },
        ]
      }
    ]
  },
  {
    id: 10,
    name: 'Gestão da Informação & Comunicação',
    shortName: 'Informação',
    description: 'Controle de documentos, registros e comunicação',
    isCritical: false,
    criticalityLevel: 1,
    totalItems: 7,
    sections: [
      {
        id: '10.1',
        name: 'Controle de Documentos',
        items: [
          { id: '10.1.1', code: '10.1.1', description: 'Atendimento NR-1 (informação digital)', evidenceRequired: 'Registros conforme item 1.6 NR-1' },
        ]
      },
      {
        id: '10.3',
        name: 'Comunicação',
        items: [
          { id: '10.3.1', code: '10.3.1', description: 'Sistemática "NA DÚVIDA, PARE!"', evidenceRequired: 'Procedimento, fluxo de comunicação' },
          { id: '10.3.2', code: '10.3.2', description: 'Ouvidoria/SAC', evidenceRequired: 'Procedimento, registros' },
        ]
      }
    ]
  },
  {
    id: 11,
    name: 'Preparação e Respostas à Emergências',
    shortName: 'Emergências',
    description: 'Planos de contingência, simulados e salvatagem',
    isCritical: true,
    criticalityLevel: 3,
    totalItems: 12,
    sections: [
      {
        id: '11.1',
        name: 'Plano de Contingência',
        items: [
          { id: '11.1.1', code: '11.1.1', description: 'Planos de resposta baseados em riscos', evidenceRequired: 'Planos de emergência completos' },
          { id: '11.1.2', code: '11.1.2', description: 'Modelo ICS implementado', evidenceRequired: 'Plano alinhado ao ICS' },
          { id: '11.1.6', code: '11.1.6', description: 'Planos para todos cenários críticos', evidenceRequired: 'Abalroamento, naufrágio, incêndio, etc.' },
          { id: '11.1.7', code: '11.1.7', description: 'Medicina remota 24h', evidenceRequired: 'Contrato com telemedicina' },
        ]
      },
      {
        id: '11.2',
        name: 'Simulados',
        items: [
          { id: '11.2.1', code: '11.2.1', description: 'Cronograma de exercícios simulados', evidenceRequired: 'Cronograma, registros' },
        ]
      },
      {
        id: '11.3',
        name: 'Salvatagem',
        items: [
          { id: '11.3.1', code: '11.3.1', description: 'Bote resgate em 5 minutos', evidenceRequired: 'Constatação, registros (SOLAS)' },
        ]
      }
    ]
  },
  {
    id: 12,
    name: 'Análise de Acidentes e Incidentes e Tratamento de Não-Conformidades',
    shortName: 'Acidentes',
    description: 'Investigação, análise de causas e tratamento de NC',
    isCritical: true,
    criticalityLevel: 3,
    totalItems: 13,
    sections: [
      {
        id: '12.1',
        name: 'Acidentes, Incidentes, Desvios',
        items: [
          { id: '12.1.1', code: '12.1.1', description: 'Sistemática de registro/investigação', evidenceRequired: 'Procedimento completo' },
          { id: '12.1.3', code: '12.1.3', description: 'Comissões de investigação qualificadas', evidenceRequired: 'Listagem, registros de treinamento' },
          { id: '12.1.5', code: '12.1.5', description: 'Técnicas estruturadas de investigação', evidenceRequired: 'Árvore de eventos, causas, falhas (IOGP 621)' },
          { id: '12.1.6', code: '12.1.6', description: 'Abrangência de acidentes', evidenceRequired: 'Análise de abrangência, divulgação' },
        ]
      },
      {
        id: '12.2',
        name: 'Não-Conformidades',
        items: [
          { id: '12.2.1', code: '12.2.1', description: 'Avaliação de eficácia das ações', evidenceRequired: 'Registros da sistemática' },
        ]
      }
    ]
  },
  {
    id: 13,
    name: 'Processo de Melhoria Contínua',
    shortName: 'Melhoria',
    description: 'Inspeções, auditorias internas, objetivos e análise crítica',
    isCritical: false,
    criticalityLevel: 2,
    totalItems: 9,
    sections: [
      {
        id: '13.1',
        name: 'Inspeções Internas',
        items: [
          { id: '13.1.1', code: '13.1.1', description: 'Inspeções internas na frota', evidenceRequired: 'Procedimentos, cronograma' },
        ]
      },
      {
        id: '13.2',
        name: 'Auditoria Interna',
        items: [
          { id: '13.2.1', code: '13.2.1', description: 'Auditorias internas periódicas', evidenceRequired: 'Relatórios (ISM, OCIMF, ISO)' },
        ]
      },
      {
        id: '13.3',
        name: 'Objetivos, Metas e Programas',
        items: [
          { id: '13.3.1', code: '13.3.1', description: 'Indicadores reativos e proativos', evidenceRequired: 'Objetivos, metas, programas' },
        ]
      },
      {
        id: '13.4',
        name: 'Análise Crítica',
        items: [
          { id: '13.4.1', code: '13.4.1', description: 'Planos de ação da análise crítica', evidenceRequired: 'Registro, plano de ação, acompanhamento' },
        ]
      },
      {
        id: '13.5',
        name: 'Fatores Humanos',
        items: [
          { id: '13.5.1', code: '13.5.1', description: 'Análise crítica de Fatores Humanos', evidenceRequired: 'Programa, treinamentos, melhorias' },
        ]
      }
    ]
  }
];

// Helper functions
export const getElementById = (id: number) => PEOTRAM_2024_ELEMENTS.find(e => e.id === id);

export const getCriticalElements = () => PEOTRAM_2024_ELEMENTS.filter(e => e.isCritical);

export const getTotalItems = () => PEOTRAM_2024_ELEMENTS.reduce((acc, e) => acc + e.totalItems, 0);

export const getElementColor = (element: PeotramElement) => {
  if (element.criticalityLevel === 3) return 'destructive';
  if (element.criticalityLevel === 2) return 'warning';
  return 'default';
};

export const getAllItems = () => {
  const items: PeotramItem[] = [];
  PEOTRAM_2024_ELEMENTS.forEach(element => {
    element.sections.forEach(section => {
      items.push(...section.items);
    });
  });
  return items;
};
