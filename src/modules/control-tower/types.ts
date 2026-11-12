/**
 * MB Maritime Control Tower — tipos de domínio
 * Espelham as tabelas ct_* (supabase/migrations/20261112120000_mb_control_tower_schema.sql)
 */

export type YesNo = "Sim" | "Não" | "A confirmar";
export type Acceptance = "Não requerido" | "A confirmar" | "Pendente" | "Aceito" | "Recusado";

export interface Member {
  id: string;
  name: string;
  short_name: string;
  email: string | null;
  role: string;
  user_id: string | null;
  active: boolean;
}

export interface Contract {
  id: string;
  code: string;
  client: string;
  status_informed: string;
  signed_status: YesNo;
  source_version: string | null;
  start_date: string | null;
  end_date: string | null;
  leader_id: string | null;
  reviewer_id: string | null;
  client_focal: string | null;
  scope_status: YesNo;
  finance_status: YesNo;
  next_milestone: string | null;
  next_action: string | null;
  notes: string | null;
  updated_at: string;
}

export type DeliverableStatus =
  | "A iniciar"
  | "Em andamento"
  | "Aguardando terceiro"
  | "Em double check"
  | "Concluído"
  | "Suspenso";

export interface Deliverable {
  id: string;
  code: string;
  contract_id: string | null;
  unit: string | null;
  package: string;
  target_qty: number | null;
  rule: string | null;
  due_date: string | null;
  executor_id: string | null;
  reviewer_id: string | null;
  status: DeliverableStatus;
  client_acceptance: Acceptance;
  source: string | null;
  notes: string | null;
}

export interface DeliverableProgress {
  deliverable_id: string;
  released_qty: number;
  in_review_qty: number;
  awaiting_external: number;
}

export type LotStatus = "rascunho" | "em_double_check" | "aprovado" | "reprovado";
export type ExternalAcceptance = "Não requerido" | "Pendente" | "Aceito" | "Recusado";

export interface DeliverableLot {
  id: string;
  deliverable_id: string;
  description: string;
  qty: number;
  executor_id: string;
  status: LotStatus;
  external_acceptance: ExternalAcceptance;
  evidence_note: string | null;
  sent_at: string | null;
  submitted_by: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  created_at: string;
}

export type TaskStatus =
  | "a_iniciar"
  | "em_andamento"
  | "aguardando_terceiro"
  | "em_double_check"
  | "em_ajuste"
  | "concluida";

export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Task {
  id: string;
  code: string;
  priority: Priority;
  front: string | null;
  contract_id: string | null;
  deliverable_id: string | null;
  title: string;
  executor_id: string;
  reviewer_id: string;
  executor_part: string | null;
  reviewer_part: string | null;
  status: TaskStatus;
  start_date: string | null;
  due_date: string | null;
  hours_executor: number | null;
  hours_reviewer: number | null;
  client_acceptance: Acceptance;
  evidence_note: string | null;
  next_action: string | null;
  notes: string | null;
  submitted_by: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  actor_id: string | null;
  action: string;
  from_status: TaskStatus | null;
  to_status: TaskStatus | null;
  comment: string | null;
  created_at: string;
}

export interface Evidence {
  id: string;
  task_id: string | null;
  lot_id: string | null;
  contract_id: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export type EventKind = "Reunião" | "Auditoria" | "Treinamento" | "Visita" | "Interno" | "Prazo";
export type EventStatus = "A agendar" | "A confirmar" | "Confirmado" | "Realizado" | "Cancelado";

export interface CtEvent {
  id: string;
  code: string;
  kind: EventKind;
  title: string;
  client: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  link: string | null;
  task_id: string | null;
  status: EventStatus;
  owner_id: string | null;
  reviewer_id: string | null;
  agenda: string | null;
  outcome: string | null;
  next_action: string | null;
  notes: string | null;
}

export type OpportunityPhase =
  | "A contatar"
  | "Contato CDPA pendente"
  | "Reunião a confirmar"
  | "Aguardando retorno"
  | "Portfolio solicitado"
  | "Orçamento solicitado"
  | "Proposta em revisão"
  | "Proposta enviada"
  | "Negociação"
  | "Ganha"
  | "Perdida"
  | "Monitoramento"
  | "Relacionamento";

export interface Opportunity {
  id: string;
  code: string;
  account: string;
  contact: string | null;
  phase: OpportunityPhase;
  demand: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  owner_id: string | null;
  reviewer_id: string | null;
  evidence_status: string | null;
  meeting_confirmed: YesNo;
  proposal_sent: "Sim" | "Não";
  capacity_checked: "Sim" | "Não";
  estimated_value: number | null;
  notes: string | null;
}
