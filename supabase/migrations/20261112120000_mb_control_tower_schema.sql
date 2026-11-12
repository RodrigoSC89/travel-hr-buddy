-- =====================================================================
-- MB MARITIME · OPERATIONS CONTROL TOWER — Etapa 1 (+ agenda/comercial)
-- Contratos, entregáveis, aceites (lotes), tarefas com double check,
-- agenda, comercial, evidências e histórico.
--
-- Regra central (aplicada no banco, não só na tela):
--   ninguém encerra uma tarefa/lote sozinho. Quem envia para double check
--   é o executor; quem aprova é o revisor designado e precisa ser outra
--   pessoa. Data, autor e evidência ficam registrados no histórico.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Membros (Rodrigo e Marcelo inicialmente)
-- ---------------------------------------------------------------------
create table if not exists public.ct_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null unique,
  email text,
  role text not null default 'Sócio',
  user_id uuid unique references auth.users(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.ct_current_member()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.ct_members where user_id = auth.uid() and active limit 1
$$;

create or replace function public.ct_is_member()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.ct_members where user_id = auth.uid() and active)
$$;

-- Perfis ainda não vinculados (para a tela de primeiro acesso)
create or replace function public.ct_unclaimed_members()
returns table (id uuid, name text, short_name text, requires_email boolean)
language sql stable security definer set search_path = public
as $$
  select m.id, m.name, m.short_name, (m.email is not null)
  from public.ct_members m
  where m.user_id is null and m.active and auth.uid() is not null
  order by m.short_name
$$;

-- Vincula o usuário logado a um perfil livre. Se o perfil tiver e-mail
-- cadastrado, somente o dono daquele e-mail pode vincular.
create or replace function public.ct_claim_member(p_member_id uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_member public.ct_members%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Login obrigatório';
  end if;
  if exists (select 1 from public.ct_members where user_id = auth.uid()) then
    raise exception 'Este usuário já está vinculado a um perfil';
  end if;
  select * into v_member from public.ct_members where id = p_member_id for update;
  if not found or not v_member.active then
    raise exception 'Perfil não encontrado';
  end if;
  if v_member.user_id is not null then
    raise exception 'Perfil já vinculado a outro usuário';
  end if;
  if v_member.email is not null and lower(v_member.email) <> v_email then
    raise exception 'Este perfil está reservado para outro e-mail';
  end if;
  update public.ct_members
     set user_id = auth.uid(), email = coalesce(email, nullif(v_email, ''))
   where id = p_member_id;
  return p_member_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Utilitário updated_at
-- ---------------------------------------------------------------------
create or replace function public.ct_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Contratos
-- ---------------------------------------------------------------------
create table if not exists public.ct_contracts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client text not null,
  status_informed text not null default 'Vigente (informado)',
  signed_status text not null default 'A confirmar'
    check (signed_status in ('Sim', 'Não', 'A confirmar')),
  source_version text,
  start_date date,
  end_date date,
  leader_id uuid references public.ct_members(id),
  reviewer_id uuid references public.ct_members(id),
  client_focal text,
  scope_status text not null default 'A confirmar'
    check (scope_status in ('Sim', 'Não', 'A confirmar')),
  finance_status text not null default 'Não'
    check (finance_status in ('Sim', 'Não', 'A confirmar')),
  next_milestone text,
  next_action text,
  notes text,
  created_by uuid references public.ct_members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ct_contracts_leader_reviewer_distinct
    check (leader_id is null or reviewer_id is null or leader_id <> reviewer_id)
);

-- ---------------------------------------------------------------------
-- Entregáveis (registro mestre)
-- ---------------------------------------------------------------------
create table if not exists public.ct_deliverables (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  contract_id uuid references public.ct_contracts(id) on delete set null,
  unit text,
  package text not null,
  target_qty numeric,
  rule text,
  due_date date,
  executor_id uuid references public.ct_members(id),
  reviewer_id uuid references public.ct_members(id),
  status text not null default 'A iniciar'
    check (status in ('A iniciar', 'Em andamento', 'Aguardando terceiro', 'Em double check', 'Concluído', 'Suspenso')),
  client_acceptance text not null default 'A confirmar'
    check (client_acceptance in ('Não requerido', 'A confirmar', 'Pendente', 'Aceito', 'Recusado')),
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ct_deliverables_exec_rev_distinct
    check (executor_id is null or reviewer_id is null or executor_id <> reviewer_id)
);

-- ---------------------------------------------------------------------
-- Tarefas
-- ---------------------------------------------------------------------
create sequence if not exists public.ct_task_code_seq start 100;

create table if not exists public.ct_tasks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('MB-' || lpad(nextval('public.ct_task_code_seq')::text, 3, '0')),
  priority text not null default 'P2'
    check (priority in ('P0', 'P1', 'P2', 'P3')),
  front text,
  contract_id uuid references public.ct_contracts(id) on delete set null,
  deliverable_id uuid references public.ct_deliverables(id) on delete set null,
  title text not null,
  executor_id uuid not null references public.ct_members(id),
  reviewer_id uuid not null references public.ct_members(id),
  executor_part text,
  reviewer_part text,
  status text not null default 'a_iniciar'
    check (status in ('a_iniciar', 'em_andamento', 'aguardando_terceiro', 'em_double_check', 'em_ajuste', 'concluida')),
  start_date date,
  due_date date,
  hours_executor numeric,
  hours_reviewer numeric,
  client_acceptance text not null default 'Não requerido'
    check (client_acceptance in ('Não requerido', 'A confirmar', 'Pendente', 'Aceito', 'Recusado')),
  evidence_note text,
  next_action text,
  notes text,
  submitted_by uuid references public.ct_members(id),
  submitted_at timestamptz,
  reviewed_by uuid references public.ct_members(id),
  reviewed_at timestamptz,
  review_comment text,
  completed_at timestamptz,
  created_by uuid references public.ct_members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ct_tasks_exec_rev_distinct check (executor_id <> reviewer_id)
);

create index if not exists ct_tasks_status_idx on public.ct_tasks(status);
create index if not exists ct_tasks_due_idx on public.ct_tasks(due_date);

create table if not exists public.ct_task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ct_tasks(id) on delete cascade,
  actor_id uuid references public.ct_members(id),
  action text not null,
  from_status text,
  to_status text,
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists ct_task_history_task_idx on public.ct_task_history(task_id, created_at desc);

-- ---------------------------------------------------------------------
-- Aceites: lotes comprováveis de entregáveis (17_ACEITES)
-- Quantidade liberada = lotes aprovados no double check e, quando
-- exigido, com aceite externo.
-- ---------------------------------------------------------------------
create table if not exists public.ct_deliverable_lots (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.ct_deliverables(id) on delete cascade,
  description text not null,
  qty numeric not null check (qty > 0),
  executor_id uuid not null references public.ct_members(id),
  status text not null default 'rascunho'
    check (status in ('rascunho', 'em_double_check', 'aprovado', 'reprovado')),
  external_acceptance text not null default 'Não requerido'
    check (external_acceptance in ('Não requerido', 'Pendente', 'Aceito', 'Recusado')),
  evidence_note text,
  sent_at date,
  submitted_by uuid references public.ct_members(id),
  submitted_at timestamptz,
  reviewed_by uuid references public.ct_members(id),
  reviewed_at timestamptz,
  review_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Evidências (arquivos no bucket privado ct-evidences)
-- ---------------------------------------------------------------------
create table if not exists public.ct_evidences (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.ct_tasks(id) on delete cascade,
  lot_id uuid references public.ct_deliverable_lots(id) on delete cascade,
  contract_id uuid references public.ct_contracts(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references public.ct_members(id) default public.ct_current_member(),
  created_at timestamptz not null default now(),
  constraint ct_evidences_has_parent check (num_nonnulls(task_id, lot_id, contract_id) = 1)
);

-- ---------------------------------------------------------------------
-- Agenda (reuniões, auditorias, treinamentos)
-- ---------------------------------------------------------------------
create sequence if not exists public.ct_event_code_seq start 100;

create table if not exists public.ct_events (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('AG-' || lpad(nextval('public.ct_event_code_seq')::text, 3, '0')),
  kind text not null default 'Reunião'
    check (kind in ('Reunião', 'Auditoria', 'Treinamento', 'Visita', 'Interno', 'Prazo')),
  title text not null,
  client text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  link text,
  task_id uuid references public.ct_tasks(id) on delete set null,
  status text not null default 'A agendar'
    check (status in ('A agendar', 'A confirmar', 'Confirmado', 'Realizado', 'Cancelado')),
  owner_id uuid references public.ct_members(id),
  reviewer_id uuid references public.ct_members(id),
  agenda text,
  outcome text,
  next_action text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Só entra no calendário como "Confirmado/Realizado" quem tem data
  constraint ct_events_confirmed_needs_date
    check (status not in ('Confirmado', 'Realizado') or starts_at is not null),
  constraint ct_events_end_after_start
    check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

-- ---------------------------------------------------------------------
-- Comercial (pipeline)
-- ---------------------------------------------------------------------
create sequence if not exists public.ct_opp_code_seq start 100;

create table if not exists public.ct_opportunities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('C' || lpad(nextval('public.ct_opp_code_seq')::text, 3, '0')),
  account text not null,
  contact text,
  phase text not null default 'A contatar'
    check (phase in ('A contatar', 'Contato CDPA pendente', 'Reunião a confirmar', 'Aguardando retorno',
                     'Portfolio solicitado', 'Orçamento solicitado', 'Proposta em revisão', 'Proposta enviada',
                     'Negociação', 'Ganha', 'Perdida', 'Monitoramento', 'Relacionamento')),
  demand text,
  next_action text,
  follow_up_date date,
  owner_id uuid references public.ct_members(id),
  reviewer_id uuid references public.ct_members(id),
  evidence_status text,
  meeting_confirmed text not null default 'Não' check (meeting_confirmed in ('Sim', 'Não', 'A confirmar')),
  proposal_sent text not null default 'Não' check (proposal_sent in ('Sim', 'Não')),
  capacity_checked text not null default 'Não' check (capacity_checked in ('Sim', 'Não')),
  estimated_value numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- "Contato não é contrato": proposta só sai após checar capacidade
  constraint ct_opps_capacity_gate
    check (phase not in ('Proposta enviada', 'Negociação', 'Ganha') or capacity_checked = 'Sim')
);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['ct_contracts', 'ct_deliverables', 'ct_deliverable_lots', 'ct_events', 'ct_opportunities']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.ct_touch_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- DOUBLE CHECK — tarefas
-- ---------------------------------------------------------------------
create or replace function public.ct_tasks_guard()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_me uuid := public.ct_current_member();
  v_has_evidence boolean;
begin
  if tg_op = 'INSERT' then
    if new.status in ('em_double_check', 'concluida') then
      raise exception 'Uma tarefa nova não pode nascer em double check ou concluída';
    end if;
    new.created_by := coalesce(new.created_by, v_me);
    new.submitted_by := null; new.submitted_at := null;
    new.reviewed_by := null; new.reviewed_at := null; new.completed_at := null;
    return new;
  end if;

  -- campos de auditoria nunca são editados diretamente
  new.submitted_by := old.submitted_by;  new.submitted_at := old.submitted_at;
  new.reviewed_by  := old.reviewed_by;   new.reviewed_at  := old.reviewed_at;
  new.completed_at := old.completed_at;  new.created_by   := old.created_by;
  new.updated_at := now();

  if new.status is distinct from old.status then
    if new.status = 'em_double_check' then
      if v_me is distinct from new.executor_id then
        raise exception 'Somente o executor principal pode enviar a tarefa para double check';
      end if;
      select exists (select 1 from public.ct_evidences e where e.task_id = new.id) into v_has_evidence;
      if coalesce(btrim(new.evidence_note), '') = '' and not v_has_evidence then
        raise exception 'Informe a evidência/versão (texto ou arquivo) antes do double check';
      end if;
      new.submitted_by := v_me; new.submitted_at := now();
      new.reviewed_by := null;  new.reviewed_at := null;

    elsif new.status = 'concluida' then
      if old.status <> 'em_double_check' then
        raise exception 'A tarefa precisa passar pelo double check antes de ser concluída';
      end if;
      if v_me is null or v_me = old.submitted_by then
        raise exception 'Ninguém encerra uma tarefa sozinho: a aprovação deve ser feita por outra pessoa';
      end if;
      if v_me <> new.reviewer_id then
        raise exception 'Somente o revisor designado pode aprovar esta tarefa';
      end if;
      if new.client_acceptance in ('A confirmar', 'Pendente', 'Recusado') then
        raise exception 'Aceite do cliente ainda não registrado (%). Atualize o aceite antes de concluir', new.client_acceptance;
      end if;
      new.reviewed_by := v_me; new.reviewed_at := now(); new.completed_at := now();

    elsif old.status = 'em_double_check' then
      -- saída do double check: devolução para ajuste pelo revisor
      -- ou recolhimento pelo próprio executor
      if v_me = new.reviewer_id and v_me is distinct from old.submitted_by then
        if coalesce(btrim(new.review_comment), '') = '' then
          raise exception 'Informe o motivo da devolução para ajuste';
        end if;
        new.reviewed_by := v_me; new.reviewed_at := now();
      elsif v_me is distinct from old.submitted_by then
        raise exception 'Durante o double check, somente o revisor (ou o executor, recolhendo) pode alterar o status';
      end if;

    elsif old.status = 'concluida' then
      -- reabertura: permitida, mas fica registrada
      new.completed_at := null;
    end if;
  end if;

  -- trocar executor/revisor durante o double check invalida a revisão
  if old.status = 'em_double_check' and new.status = 'em_double_check'
     and (new.executor_id <> old.executor_id or new.reviewer_id <> old.reviewer_id) then
    raise exception 'Não é possível trocar executor/revisor durante o double check';
  end if;

  return new;
end;
$$;

drop trigger if exists ct_tasks_guard on public.ct_tasks;
create trigger ct_tasks_guard before insert or update on public.ct_tasks
  for each row execute function public.ct_tasks_guard();

create or replace function public.ct_tasks_log()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_me uuid := public.ct_current_member();
begin
  if tg_op = 'INSERT' then
    insert into public.ct_task_history(task_id, actor_id, action, to_status)
    values (new.id, v_me, 'Criada', new.status);
  elsif new.status is distinct from old.status then
    insert into public.ct_task_history(task_id, actor_id, action, from_status, to_status, comment)
    values (
      new.id, v_me,
      case
        when new.status = 'em_double_check' then 'Enviada para double check'
        when new.status = 'concluida' then 'Aprovada no double check'
        when old.status = 'em_double_check' and new.status = 'em_ajuste' then 'Devolvida para ajuste'
        when old.status = 'concluida' then 'Reaberta'
        else 'Status alterado'
      end,
      old.status, new.status,
      case
        when new.status = 'em_double_check' then new.evidence_note
        when old.status = 'em_double_check' then new.review_comment
        else null
      end
    );
  elsif new.executor_id <> old.executor_id or new.reviewer_id <> old.reviewer_id then
    insert into public.ct_task_history(task_id, actor_id, action, comment)
    values (new.id, v_me, 'Responsáveis alterados', null);
  elsif new.due_date is distinct from old.due_date then
    insert into public.ct_task_history(task_id, actor_id, action, comment)
    values (new.id, v_me, 'Prazo alterado',
            coalesce(to_char(old.due_date, 'DD/MM/YYYY'), 'sem prazo') || ' → ' ||
            coalesce(to_char(new.due_date, 'DD/MM/YYYY'), 'sem prazo'));
  end if;
  return null;
end;
$$;

drop trigger if exists ct_tasks_log on public.ct_tasks;
create trigger ct_tasks_log after insert or update on public.ct_tasks
  for each row execute function public.ct_tasks_log();

-- ---------------------------------------------------------------------
-- DOUBLE CHECK — lotes de entregáveis
-- ---------------------------------------------------------------------
create or replace function public.ct_lots_guard()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_me uuid := public.ct_current_member();
  v_has_evidence boolean;
begin
  if tg_op = 'INSERT' then
    if new.status not in ('rascunho') then
      raise exception 'Um lote novo começa como rascunho';
    end if;
    new.submitted_by := null; new.submitted_at := null;
    new.reviewed_by := null; new.reviewed_at := null;
    return new;
  end if;

  new.submitted_by := old.submitted_by; new.submitted_at := old.submitted_at;
  new.reviewed_by := old.reviewed_by;   new.reviewed_at := old.reviewed_at;

  if new.status is distinct from old.status then
    if new.status = 'em_double_check' then
      if v_me is distinct from new.executor_id then
        raise exception 'Somente o executor do lote pode enviá-lo para double check';
      end if;
      select exists (select 1 from public.ct_evidences e where e.lot_id = new.id) into v_has_evidence;
      if coalesce(btrim(new.evidence_note), '') = '' and not v_has_evidence then
        raise exception 'Evidência obrigatória para o lote';
      end if;
      new.submitted_by := v_me; new.submitted_at := now();
      new.reviewed_by := null; new.reviewed_at := null;
    elsif new.status in ('aprovado', 'reprovado') then
      if old.status <> 'em_double_check' then
        raise exception 'O lote precisa estar em double check';
      end if;
      if v_me is null or v_me = old.submitted_by then
        raise exception 'Ninguém aprova o próprio lote: a revisão deve ser de outra pessoa';
      end if;
      if new.status = 'reprovado' and coalesce(btrim(new.review_comment), '') = '' then
        raise exception 'Informe o motivo da reprovação';
      end if;
      new.reviewed_by := v_me; new.reviewed_at := now();
    elsif old.status = 'em_double_check' and v_me is distinct from old.submitted_by then
      raise exception 'Somente o executor pode recolher um lote em double check';
    end if;
  end if;

  if old.status = 'aprovado' and new.status = 'aprovado'
     and (new.qty <> old.qty or new.deliverable_id <> old.deliverable_id) then
    raise exception 'Lote aprovado não pode ter quantidade alterada; reabra o lote';
  end if;

  return new;
end;
$$;

drop trigger if exists ct_lots_guard on public.ct_deliverable_lots;
create trigger ct_lots_guard before insert or update on public.ct_deliverable_lots
  for each row execute function public.ct_lots_guard();

-- Exclusão não pode apagar a trilha de auditoria do double check
create or replace function public.ct_block_audited_delete()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'ct_tasks' and old.status in ('em_double_check', 'concluida') then
    raise exception 'Tarefas em double check ou concluídas não podem ser excluídas (reabra antes)';
  end if;
  if tg_table_name = 'ct_deliverable_lots' and old.status in ('em_double_check', 'aprovado') then
    raise exception 'Lotes em double check ou aprovados não podem ser excluídos';
  end if;
  return old;
end;
$$;

drop trigger if exists ct_tasks_block_delete on public.ct_tasks;
create trigger ct_tasks_block_delete before delete on public.ct_tasks
  for each row execute function public.ct_block_audited_delete();
drop trigger if exists ct_lots_block_delete on public.ct_deliverable_lots;
create trigger ct_lots_block_delete before delete on public.ct_deliverable_lots
  for each row execute function public.ct_block_audited_delete();

-- Visão de progresso dos entregáveis
create or replace view public.ct_deliverable_progress
with (security_invoker = true)
as
select
  d.id as deliverable_id,
  coalesce(sum(l.qty) filter (
    where l.status = 'aprovado' and l.external_acceptance in ('Não requerido', 'Aceito')
  ), 0) as released_qty,
  coalesce(sum(l.qty) filter (where l.status = 'em_double_check'), 0) as in_review_qty,
  count(l.id) filter (where l.status = 'aprovado' and l.external_acceptance = 'Pendente') as awaiting_external
from public.ct_deliverables d
left join public.ct_deliverable_lots l on l.deliverable_id = d.id
group by d.id;

-- ---------------------------------------------------------------------
-- RLS — somente membros do Control Tower
-- ---------------------------------------------------------------------
alter table public.ct_members enable row level security;
alter table public.ct_contracts enable row level security;
alter table public.ct_deliverables enable row level security;
alter table public.ct_tasks enable row level security;
alter table public.ct_task_history enable row level security;
alter table public.ct_deliverable_lots enable row level security;
alter table public.ct_evidences enable row level security;
alter table public.ct_events enable row level security;
alter table public.ct_opportunities enable row level security;

drop policy if exists ct_members_select on public.ct_members;
create policy ct_members_select on public.ct_members for select to authenticated using (public.ct_is_member());
drop policy if exists ct_members_insert on public.ct_members;
create policy ct_members_insert on public.ct_members for insert to authenticated
  with check (public.ct_is_member() and user_id is null);
drop policy if exists ct_members_update on public.ct_members;
create policy ct_members_update on public.ct_members for update to authenticated
  using (public.ct_is_member()) with check (public.ct_is_member());

do $$
declare t text;
begin
  foreach t in array array['ct_contracts', 'ct_deliverables', 'ct_tasks', 'ct_deliverable_lots', 'ct_evidences', 'ct_events', 'ct_opportunities']
  loop
    execute format('drop policy if exists %I_all on public.%I', t, t);
    execute format('create policy %I_all on public.%I for all to authenticated using (public.ct_is_member()) with check (public.ct_is_member())', t, t);
  end loop;
end $$;

-- histórico: leitura para membros; escrita só via trigger
drop policy if exists ct_task_history_select on public.ct_task_history;
create policy ct_task_history_select on public.ct_task_history for select to authenticated using (public.ct_is_member());

grant execute on function public.ct_current_member() to authenticated;
grant execute on function public.ct_is_member() to authenticated;
grant execute on function public.ct_unclaimed_members() to authenticated;
grant execute on function public.ct_claim_member(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Storage: bucket privado de evidências
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ct-evidences', 'ct-evidences', false)
on conflict (id) do nothing;

drop policy if exists ct_evidences_read on storage.objects;
create policy ct_evidences_read on storage.objects for select to authenticated
  using (bucket_id = 'ct-evidences' and public.ct_is_member());
drop policy if exists ct_evidences_write on storage.objects;
create policy ct_evidences_write on storage.objects for insert to authenticated
  with check (bucket_id = 'ct-evidences' and public.ct_is_member());
drop policy if exists ct_evidences_delete on storage.objects;
create policy ct_evidences_delete on storage.objects for delete to authenticated
  using (bucket_id = 'ct-evidences' and public.ct_is_member());
