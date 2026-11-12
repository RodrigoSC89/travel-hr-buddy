import type {
  Acceptance,
  DeliverableStatus,
  EventKind,
  EventStatus,
  ExternalAcceptance,
  LotStatus,
  OpportunityPhase,
  Priority,
  TaskStatus,
  YesNo,
} from "./types";

export const CT_BASE = "/control-tower";
export const EVIDENCE_BUCKET = "ct-evidences";

export const TASK_STATUSES: { value: TaskStatus; label: string; tone: string }[] = [
  { value: "a_iniciar", label: "A iniciar", tone: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30" },
  { value: "em_andamento", label: "Em andamento", tone: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  { value: "aguardando_terceiro", label: "Aguardando terceiro", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  { value: "em_double_check", label: "Em double check", tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30" },
  { value: "em_ajuste", label: "Em ajuste", tone: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  { value: "concluida", label: "Concluída", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
];

export const taskStatusLabel = (s: TaskStatus | null | undefined) =>
  TASK_STATUSES.find((x) => x.value === s)?.label ?? "—";
export const taskStatusTone = (s: TaskStatus) => TASK_STATUSES.find((x) => x.value === s)?.tone ?? "";

/** Status que o executor pode escolher livremente (os demais exigem fluxo de double check). */
export const FREE_TASK_STATUSES: TaskStatus[] = ["a_iniciar", "em_andamento", "aguardando_terceiro", "em_ajuste"];

export const PRIORITIES: { value: Priority; label: string; tone: string }[] = [
  { value: "P0", label: "P0 · Urgente", tone: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
  { value: "P1", label: "P1 · Alta", tone: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  { value: "P2", label: "P2 · Planejada", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30" },
  { value: "P3", label: "P3 · Comercial", tone: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30" },
];
export const priorityTone = (p: Priority) => PRIORITIES.find((x) => x.value === p)?.tone ?? "";

export const YES_NO: YesNo[] = ["Sim", "Não", "A confirmar"];
export const ACCEPTANCES: Acceptance[] = ["Não requerido", "A confirmar", "Pendente", "Aceito", "Recusado"];
export const EXTERNAL_ACCEPTANCES: ExternalAcceptance[] = ["Não requerido", "Pendente", "Aceito", "Recusado"];

export const DELIVERABLE_STATUSES: DeliverableStatus[] = [
  "A iniciar",
  "Em andamento",
  "Aguardando terceiro",
  "Em double check",
  "Concluído",
  "Suspenso",
];

export const LOT_STATUSES: { value: LotStatus; label: string; tone: string }[] = [
  { value: "rascunho", label: "Rascunho", tone: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30" },
  { value: "em_double_check", label: "Em double check", tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30" },
  { value: "aprovado", label: "Aprovado", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  { value: "reprovado", label: "Reprovado", tone: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30" },
];

export const EVENT_KINDS: EventKind[] = ["Reunião", "Auditoria", "Treinamento", "Visita", "Interno", "Prazo"];
export const EVENT_STATUSES: EventStatus[] = ["A agendar", "A confirmar", "Confirmado", "Realizado", "Cancelado"];
export const eventStatusTone: Record<EventStatus, string> = {
  "A agendar": "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  "A confirmar": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  Confirmado: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  Realizado: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  Cancelado: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

/** Fases do pipeline, na ordem do funil. */
export const OPPORTUNITY_PHASES: OpportunityPhase[] = [
  "A contatar",
  "Contato CDPA pendente",
  "Reunião a confirmar",
  "Aguardando retorno",
  "Portfolio solicitado",
  "Orçamento solicitado",
  "Proposta em revisão",
  "Proposta enviada",
  "Negociação",
  "Ganha",
  "Perdida",
  "Monitoramento",
  "Relacionamento",
];

/** Colunas agrupadas do funil comercial. */
export const PIPELINE_STAGES: { key: string; label: string; phases: OpportunityPhase[] }[] = [
  { key: "prospect", label: "Prospecção", phases: ["A contatar", "Contato CDPA pendente", "Reunião a confirmar", "Aguardando retorno"] },
  { key: "qualify", label: "Qualificação", phases: ["Portfolio solicitado", "Orçamento solicitado", "Proposta em revisão"] },
  { key: "proposal", label: "Proposta", phases: ["Proposta enviada", "Negociação"] },
  { key: "closed", label: "Fechado", phases: ["Ganha", "Perdida"] },
  { key: "nurture", label: "Monitoramento", phases: ["Monitoramento", "Relacionamento"] },
];

/** Fases que exigem capacidade checada (gate "contato não é contrato"). */
export const CAPACITY_GATED_PHASES: OpportunityPhase[] = ["Proposta enviada", "Negociação", "Ganha"];
