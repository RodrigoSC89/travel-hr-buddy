import { WorkflowItem, WorkflowExecution, WorkflowTemplate } from "./types";

export const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: "1",
    name: "Aprovação de Documentos",
    description: "Workflow para aprovação automática de documentos baseado em regras",
    status: "active",
    trigger: "Documento Enviado",
    steps: [],
    executions: 247,
    successRate: 94.2,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    category: "Documentos",
    tags: ["aprovação", "automático", "documento"]
  },
  {
    id: "2",
    name: "Onboarding de Funcionários",
    description: "Processo completo de integração de novos colaboradores",
    status: "active",
    trigger: "Novo Funcionário",
    steps: [],
    executions: 23,
    successRate: 100,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    category: "RH",
    tags: ["onboarding", "funcionário", "integração"]
  },
  {
    id: "3",
    name: "Alertas de Performance",
    description: "Monitoramento automático de KPIs com notificações inteligentes",
    status: "active",
    trigger: "Dados Atualizados",
    steps: [],
    executions: 1520,
    successRate: 98.7,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 30 * 60 * 1000),
    category: "Monitoramento",
    tags: ["kpi", "alerta", "performance"]
  }
];

export const INITIAL_EXECUTIONS: WorkflowExecution[] = [
  {
    id: "1",
    workflowId: "1",
    status: "completed",
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000),
    duration: 45,
    steps: [
      { stepId: "1", status: "completed" },
      { stepId: "2", status: "completed" },
      { stepId: "3", status: "completed" }
    ]
  },
  {
    id: "2",
    workflowId: "2",
    status: "running",
    startedAt: new Date(Date.now() - 30 * 60 * 1000),
    steps: [
      { stepId: "1", status: "completed" },
      { stepId: "2", status: "running" },
      { stepId: "3", status: "pending" }
    ]
  }
];

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    name: "Aprovação de Despesas",
    description: "Automatiza o processo de aprovação de reembolsos",
    category: "Financeiro",
    trigger: "Nova Despesa",
    steps: 3
  },
  {
    name: "Backup Automático",
    description: "Executa backups programados dos dados críticos",
    category: "TI",
    trigger: "Agendamento",
    steps: 4
  },
  {
    name: "Relatório Semanal",
    description: "Gera e distribui relatórios automaticamente",
    category: "Relatórios",
    trigger: "Cronograma",
    steps: 5
  },
  {
    name: "Notificação de Vendas",
    description: "Alerta sobre metas e oportunidades de vendas",
    category: "Vendas",
    trigger: "Meta Atingida",
    steps: 2
  }
];
