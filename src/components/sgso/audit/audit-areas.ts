/**
 * ANP 43/2007 - 17 Práticas Obrigatórias
 * Audit areas configuration
 */

import { AuditArea } from "./types";

export const auditAreas: AuditArea[] = [
  {
    id: "practice_1",
    name: "Prática 1: Política de SGSO",
    criteria: [
      "Política documentada e assinada pela direção",
      "Comprometimento com a melhoria contínua",
      "Disponibilidade da política para todos os colaboradores",
    ],
  },
  {
    id: "practice_2",
    name: "Prática 2: Identificação de Perigos e Avaliação de Riscos",
    criteria: [
      "Procedimento para identificação de perigos",
      "Matriz de risco implementada",
      "Revisão periódica das avaliações",
    ],
  },
  {
    id: "practice_3",
    name: "Prática 3: Objetivos, Metas e Programas",
    criteria: [
      "Objetivos de SGSO definidos",
      "Indicadores de desempenho estabelecidos",
      "Programa de ação para atingir metas",
    ],
  },
  {
    id: "practice_4",
    name: "Prática 4: Estrutura e Responsabilidades",
    criteria: [
      "Organograma definido",
      "Responsabilidades documentadas",
      "Recursos adequados alocados",
    ],
  },
  {
    id: "practice_5",
    name: "Prática 5: Competência e Treinamento",
    criteria: [
      "Levantamento de necessidades de treinamento",
      "Registros de treinamento mantidos",
      "Avaliação da eficácia dos treinamentos",
    ],
  },
  {
    id: "practice_6",
    name: "Prática 6: Documentação",
    criteria: [
      "Manual de SGSO atualizado",
      "Procedimentos documentados",
      "Controle de documentos implementado",
    ],
  },
  {
    id: "practice_7",
    name: "Prática 7: Controle Operacional",
    criteria: [
      "Procedimentos operacionais padronizados",
      "Controles de risco implementados",
      "Manutenção preventiva em dia",
    ],
  },
  {
    id: "practice_8",
    name: "Prática 8: Gerenciamento de Mudanças",
    criteria: [
      "Procedimento para gerenciamento de mudanças",
      "Análise de riscos antes de mudanças",
      "Comunicação de mudanças",
    ],
  },
  {
    id: "practice_9",
    name: "Prática 9: Planejamento e Resposta a Emergências",
    criteria: [
      "Plano de emergência documentado",
      "Simulados realizados periodicamente",
      "Equipamentos de emergência disponíveis",
    ],
  },
  {
    id: "practice_10",
    name: "Prática 10: Monitoramento e Medição",
    criteria: [
      "Indicadores de desempenho monitorados",
      "Equipamentos calibrados",
      "Registros de medições mantidos",
    ],
  },
  {
    id: "practice_11",
    name: "Prática 11: Investigação de Incidentes",
    criteria: [
      "Procedimento de investigação documentado",
      "Incidentes registrados e investigados",
      "Ações corretivas implementadas",
    ],
  },
  {
    id: "practice_12",
    name: "Prática 12: Não Conformidades e Ações Corretivas",
    criteria: [
      "Procedimento para tratamento de NC",
      "Ações corretivas documentadas",
      "Verificação de eficácia",
    ],
  },
  {
    id: "practice_13",
    name: "Prática 13: Controle de Registros",
    criteria: [
      "Registros identificados e armazenados",
      "Tempo de retenção definido",
      "Proteção contra deterioração",
    ],
  },
  {
    id: "practice_14",
    name: "Prática 14: Auditoria Interna",
    criteria: [
      "Programa de auditorias implementado",
      "Auditores qualificados",
      "Relatórios de auditoria emitidos",
    ],
  },
  {
    id: "practice_15",
    name: "Prática 15: Análise Crítica pela Direção",
    criteria: [
      "Reuniões de análise crítica realizadas",
      "Atas documentadas",
      "Decisões e ações definidas",
    ],
  },
  {
    id: "practice_16",
    name: "Prática 16: Melhoria Contínua",
    criteria: [
      "Programa de melhoria contínua",
      "Sugestões dos colaboradores incentivadas",
      "Resultados de melhoria documentados",
    ],
  },
  {
    id: "practice_17",
    name: "Prática 17: Comunicação",
    criteria: [
      "Canais de comunicação definidos",
      "Comunicação interna efetiva",
      "Comunicação externa quando aplicável",
    ],
  },
];

export function getAuditAreaById(id: string): AuditArea | undefined {
  return auditAreas.find((area) => area.id === id);
}

export function getTotalCriteriaCount(): number {
  return auditAreas.reduce((sum, area) => sum + area.criteria.length, 0);
}
