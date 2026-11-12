-- =====================================================================
-- MB MARITIME · CONTROL TOWER — Fases 2 e 3 (camada de dados)
-- Alertas, feed de atividades, comentários, tempo real, cadastro restrito,
-- modelos de trabalho + checklists, horas, capacidade, mudanças de escopo,
-- riscos (ISO 31000), não conformidades/CAPA (ISO 9001 10.2), documentos,
-- satisfação do cliente, financeiro, OKRs e análise crítica.
-- Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Cadastro restrito aos e-mails dos membros
-- ---------------------------------------------------------------------
create or replace function public.ct_signup_allowlist()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.ct_members m where m.active and lower(m.email) = lower(new.email)) then
    raise exception 'Cadastro não autorizado para este e-mail. Peça a um membro da MB Maritime para cadastrá-lo.';
  end if;
  return new;
end $$;
drop trigger if exists ct_signup_allowlist on auth.users;
create trigger ct_signup_allowlist before insert on auth.users
  for each row execute function public.ct_signup_allowlist();

-- membros podem cadastrar novos membros (com e-mail) e editar perfis
drop policy if exists ct_members_insert on public.ct_members;
create policy ct_members_insert on public.ct_members for insert to authenticated
  with check (public.ct_is_member() and user_id is null and email is not null);

-- ---------------------------------------------------------------------
-- 1. Configurações
-- ---------------------------------------------------------------------
create table if not exists public.ct_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);
insert into public.ct_settings (key, value, description) values
  ('wip_limit', '3', 'Máximo de tarefas "Em andamento" por executor (Kanban)'),
  ('seagems_monthly_hours', '40', 'Banco mensal de horas de suporte remoto SEAGEMS (Rev7)'),
  ('hours_alert_pct', '80', 'Alerta quando o consumo de horas do mês passar deste percentual'),
  ('digest_hour_brt', '7', 'Hora do resumo diário (horário de Brasília)')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- 2. Notificações
-- ---------------------------------------------------------------------
create table if not exists public.ct_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.ct_members(id) on delete cascade,
  actor_id uuid references public.ct_members(id),
  kind text not null,
  priority text not null default 'normal' check (priority in ('baixa', 'normal', 'alta')),
  title text not null,
  body text,
  link text,
  entity_type text,
  entity_id uuid,
  dedupe_key text unique,
  read_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ct_notifications_recipient_idx on public.ct_notifications(recipient_id, read_at, created_at desc);

create or replace function public.ct_notify(
  p_recipient uuid, p_actor uuid, p_kind text, p_title text, p_body text,
  p_link text, p_entity_type text, p_entity_id uuid,
  p_priority text default 'normal', p_dedupe text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_recipient is null or p_recipient is not distinct from p_actor then
    return;
  end if;
  if not exists (select 1 from public.ct_members where id = p_recipient and active) then
    return;
  end if;
  insert into public.ct_notifications (recipient_id, actor_id, kind, priority, title, body, link, entity_type, entity_id, dedupe_key)
  values (p_recipient, p_actor, p_kind, coalesce(p_priority, 'normal'), p_title, p_body, p_link, p_entity_type, p_entity_id, p_dedupe)
  on conflict (dedupe_key) do nothing;
end $$;

create or replace function public.ct_member_name(p_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select short_name from public.ct_members where id = p_id), 'Sistema')
$$;

-- marcar como lidas
create or replace function public.ct_mark_notifications_read(p_ids uuid[] default null)
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  update public.ct_notifications
     set read_at = now()
   where recipient_id = public.ct_current_member()
     and read_at is null
     and (p_ids is null or id = any (p_ids));
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- ---------------------------------------------------------------------
-- 3. Feed de atividades (quem fez o quê)
-- ---------------------------------------------------------------------
create table if not exists public.ct_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.ct_members(id),
  entity_type text not null,
  entity_id uuid,
  entity_code text,
  action text not null,
  summary text not null,
  link text,
  created_at timestamptz not null default now()
);
create index if not exists ct_activity_created_idx on public.ct_activity(created_at desc);

create or replace function public.ct_log_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb := to_jsonb(coalesce(new, old));
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else null end;
  v_actor uuid := public.ct_current_member();
  v_label text;
  v_type text;
  v_link text;
  v_action text;
  v_summary text;
  v_code text := v_row ->> 'code';
begin
  v_type := case tg_table_name
    when 'ct_contracts' then 'Contrato' when 'ct_deliverables' then 'Entregável'
    when 'ct_tasks' then 'Tarefa' when 'ct_deliverable_lots' then 'Lote'
    when 'ct_events' then 'Compromisso' when 'ct_opportunities' then 'Oportunidade'
    when 'ct_comments' then 'Comentário' when 'ct_changes' then 'Mudança de escopo'
    when 'ct_risks' then 'Risco' when 'ct_nonconformities' then 'Não conformidade'
    when 'ct_documents' then 'Documento' when 'ct_invoices' then 'Medição'
    when 'ct_objectives' then 'Objetivo' when 'ct_key_results' then 'Resultado-chave'
    when 'ct_feedback' then 'Avaliação do cliente' when 'ct_reviews' then 'Análise crítica'
    else tg_table_name end;
  v_label := coalesce(v_row ->> 'title', v_row ->> 'package', v_row ->> 'account', v_row ->> 'client',
                      v_row ->> 'description', left(v_row ->> 'body', 80), '');
  v_link := case tg_table_name
    when 'ct_tasks' then '/tarefas?task=' || (v_row ->> 'id')
    when 'ct_contracts' then '/contratos?c=' || (v_row ->> 'id')
    when 'ct_deliverables' then '/entregaveis?d=' || (v_row ->> 'id')
    when 'ct_deliverable_lots' then '/entregaveis?d=' || (v_row ->> 'deliverable_id')
    when 'ct_events' then '/agenda'
    when 'ct_opportunities' then '/comercial'
    when 'ct_changes' then '/mudancas'
    when 'ct_risks' then '/riscos'
    when 'ct_nonconformities' then '/qualidade'
    when 'ct_documents' then '/documentos'
    when 'ct_invoices' then '/financeiro'
    when 'ct_objectives' then '/indicadores' when 'ct_key_results' then '/indicadores'
    when 'ct_comments' then case v_row ->> 'entity_type' when 'task' then '/tarefas?task=' || (v_row ->> 'entity_id') else null end
    else null end;

  if tg_op = 'INSERT' then
    v_action := 'criou';
  elsif tg_op = 'DELETE' then
    v_action := 'excluiu';
  else
    if (v_row ->> 'status') is distinct from (v_old ->> 'status') then
      v_action := 'alterou status de';
      v_label := v_label || ' → ' || coalesce(case v_row ->> 'status'
        when 'a_iniciar' then 'A iniciar' when 'em_andamento' then 'Em andamento'
        when 'aguardando_terceiro' then 'Aguardando terceiro' when 'em_double_check' then 'Em double check'
        when 'em_ajuste' then 'Em ajuste' when 'concluida' then 'Concluída'
        when 'rascunho' then 'Rascunho' when 'aprovado' then 'Aprovado' when 'reprovado' then 'Reprovado'
        else v_row ->> 'status' end, '');
    elsif (v_row ->> 'phase') is distinct from (v_old ->> 'phase') then
      v_action := 'moveu';
      v_label := v_label || ' → ' || coalesce(v_row ->> 'phase', '');
    else
      v_action := 'atualizou';
    end if;
    -- evita ruído: ignora updates que só mexem em updated_at/read_at
    if (v_row - 'updated_at' - 'read_at' - 'emailed_at') = (v_old - 'updated_at' - 'read_at' - 'emailed_at') then
      return null;
    end if;
  end if;

  v_summary := public.ct_member_name(v_actor) || ' ' || v_action || ' ' || lower(v_type) ||
               coalesce(' ' || v_code, '') || case when v_label <> '' then ': ' || v_label else '' end;

  insert into public.ct_activity (actor_id, entity_type, entity_id, entity_code, action, summary, link)
  values (v_actor, tg_table_name, (v_row ->> 'id')::uuid, v_code, v_action, left(v_summary, 400), v_link);
  return null;
end $$;

-- ---------------------------------------------------------------------
-- 4. Comentários com @menções
-- ---------------------------------------------------------------------
create table if not exists public.ct_comments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('task', 'deliverable', 'contract', 'opportunity', 'event', 'change', 'risk', 'nc')),
  entity_id uuid not null,
  author_id uuid not null default public.ct_current_member() references public.ct_members(id),
  body text not null check (length(btrim(body)) > 0),
  mentions uuid[] not null default '{}',
  edited_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ct_comments_entity_idx on public.ct_comments(entity_type, entity_id, created_at);

create or replace function public.ct_comments_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.author_id := public.ct_current_member();
    return new;
  end if;
  if old.author_id is distinct from public.ct_current_member() then
    raise exception 'Somente o autor pode alterar ou excluir o comentário';
  end if;
  if tg_op = 'UPDATE' then
    new.author_id := old.author_id; new.created_at := old.created_at; new.edited_at := now();
    return new;
  end if;
  return old;
end $$;
drop trigger if exists ct_comments_guard on public.ct_comments;
create trigger ct_comments_guard before insert or update or delete on public.ct_comments
  for each row execute function public.ct_comments_guard();

create or replace function public.ct_comments_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_task public.ct_tasks%rowtype;
  v_title text := 'Novo comentário';
  v_link text;
  v_m uuid;
  v_notified uuid[] := '{}';
begin
  if new.entity_type = 'task' then
    select * into v_task from public.ct_tasks where id = new.entity_id;
    v_title := 'Comentário em ' || v_task.code || ': ' || v_task.title;
    v_link := '/tarefas?task=' || new.entity_id;
  end if;
  -- menções
  foreach v_m in array coalesce(new.mentions, '{}') loop
    perform public.ct_notify(v_m, new.author_id, 'mencao',
      public.ct_member_name(new.author_id) || ' mencionou você', left(new.body, 300), v_link, 'comment', new.id, 'normal', null);
    v_notified := v_notified || v_m;
  end loop;
  -- envolvidos na tarefa
  if new.entity_type = 'task' then
    foreach v_m in array array[v_task.executor_id, v_task.reviewer_id] loop
      if not (v_m = any (v_notified)) then
        perform public.ct_notify(v_m, new.author_id, 'comentario', v_title, left(new.body, 300), v_link, 'comment', new.id, 'normal', null);
        v_notified := v_notified || v_m;
      end if;
    end loop;
  end if;
  return null;
end $$;
drop trigger if exists ct_comments_notify on public.ct_comments;
create trigger ct_comments_notify after insert on public.ct_comments
  for each row execute function public.ct_comments_notify();

-- ---------------------------------------------------------------------
-- 5. Checklists de verificação por tarefa
-- ---------------------------------------------------------------------
create table if not exists public.ct_task_checklist (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.ct_tasks(id) on delete cascade,
  position integer not null default 0,
  item text not null,
  done_by uuid references public.ct_members(id),
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ct_task_checklist_task_idx on public.ct_task_checklist(task_id, position);

create or replace function public.ct_checklist_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  select status into v_status from public.ct_tasks where id = coalesce(new.task_id, old.task_id);
  if v_status = 'concluida' then
    raise exception 'Checklist de tarefa concluída não pode ser alterado (reabra a tarefa)';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  if tg_op = 'UPDATE' then
    if new.done_at is not null and old.done_at is null then
      new.done_by := public.ct_current_member(); new.done_at := now();
    elsif new.done_at is null then
      new.done_by := null;
    else
      new.done_by := old.done_by; new.done_at := old.done_at;
    end if;
  else
    if new.done_at is not null then new.done_by := public.ct_current_member(); new.done_at := now(); end if;
  end if;
  return new;
end $$;
drop trigger if exists ct_checklist_guard on public.ct_task_checklist;
create trigger ct_checklist_guard before insert or update or delete on public.ct_task_checklist
  for each row execute function public.ct_checklist_guard();

-- aprovar exige checklist completo (roda antes do guard pela ordem alfabética)
create or replace function public.ct_tasks_checklist_gate()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_open integer;
begin
  if new.status = 'concluida' and old.status is distinct from 'concluida' then
    select count(*) into v_open from public.ct_task_checklist where task_id = new.id and done_at is null;
    if v_open > 0 then
      raise exception 'Checklist de verificação incompleto: % item(ns) pendente(s)', v_open;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists ct_tasks_checklist_gate on public.ct_tasks;
create trigger ct_tasks_checklist_gate before update on public.ct_tasks
  for each row execute function public.ct_tasks_checklist_gate();

-- ---------------------------------------------------------------------
-- 6. Modelos de trabalho (padrão por tipo de serviço)
-- ---------------------------------------------------------------------
create table if not exists public.ct_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  service_type text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.ct_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.ct_templates(id) on delete cascade,
  position integer not null,
  title text not null,
  priority text not null default 'P1' check (priority in ('P0', 'P1', 'P2', 'P3')),
  offset_days integer not null default 0,
  duration_days integer not null default 1,
  hours_executor numeric,
  hours_reviewer numeric,
  swap_roles boolean not null default false,
  checklist text[] not null default '{}'
);

create or replace function public.ct_apply_template(
  p_template uuid, p_deliverable uuid, p_start date, p_executor uuid, p_reviewer uuid)
returns integer language plpgsql security invoker set search_path = public as $$
declare
  v_item public.ct_template_items%rowtype;
  v_del public.ct_deliverables%rowtype;
  v_task uuid;
  v_n integer := 0;
  v_i integer;
begin
  if not public.ct_is_member() then raise exception 'Acesso negado'; end if;
  if p_executor = p_reviewer then raise exception 'Executor e revisor devem ser pessoas diferentes'; end if;
  select * into v_del from public.ct_deliverables where id = p_deliverable;
  if not found then raise exception 'Entregável não encontrado'; end if;
  for v_item in select * from public.ct_template_items where template_id = p_template order by position loop
    insert into public.ct_tasks (priority, front, contract_id, deliverable_id, title, executor_id, reviewer_id,
                                 start_date, due_date, hours_executor, hours_reviewer, client_acceptance, notes)
    values (v_item.priority,
            (select client from public.ct_contracts where id = v_del.contract_id),
            v_del.contract_id, v_del.id,
            v_item.title || ' · ' || v_del.code || coalesce(' ' || v_del.unit, ''),
            case when v_item.swap_roles then p_reviewer else p_executor end,
            case when v_item.swap_roles then p_executor else p_reviewer end,
            p_start + v_item.offset_days, p_start + v_item.offset_days + greatest(v_item.duration_days - 1, 0),
            v_item.hours_executor, v_item.hours_reviewer, 'Não requerido',
            'Gerada pelo modelo: ' || (select name from public.ct_templates where id = p_template))
    returning id into v_task;
    for v_i in 1 .. coalesce(array_length(v_item.checklist, 1), 0) loop
      insert into public.ct_task_checklist (task_id, position, item) values (v_task, v_i, v_item.checklist[v_i]);
    end loop;
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;
grant execute on function public.ct_apply_template(uuid, uuid, date, uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 7. Horas e capacidade
-- ---------------------------------------------------------------------
create table if not exists public.ct_time_logs (
  id uuid primary key default gen_random_uuid(),
  work_date date not null default current_date,
  member_id uuid not null default public.ct_current_member() references public.ct_members(id),
  contract_id uuid references public.ct_contracts(id) on delete set null,
  task_id uuid references public.ct_tasks(id) on delete set null,
  category text not null default 'Entrega contratual'
    check (category in ('Entrega contratual', 'Suporte remoto', 'Comercial', 'Gestão e QA', 'Deslocamento / embarque', 'Outros')),
  hours numeric not null check (hours > 0 and hours <= 24),
  billable boolean not null default true,
  in_scope text not null default 'Sim' check (in_scope in ('Sim', 'Não', 'A confirmar')),
  extra_approved boolean not null default false,
  description text not null,
  created_at timestamptz not null default now()
);
create index if not exists ct_time_logs_date_idx on public.ct_time_logs(work_date desc);

create or replace function public.ct_time_logs_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.member_id := coalesce(public.ct_current_member(), new.member_id);
    return new;
  end if;
  if old.member_id is distinct from public.ct_current_member() then
    raise exception 'Cada um só pode alterar o próprio apontamento de horas';
  end if;
  if tg_op = 'UPDATE' then new.member_id := old.member_id; return new; end if;
  return old;
end $$;
drop trigger if exists ct_time_logs_guard on public.ct_time_logs;
create trigger ct_time_logs_guard before insert or update or delete on public.ct_time_logs
  for each row execute function public.ct_time_logs_guard();

create table if not exists public.ct_capacity (
  id uuid primary key default gen_random_uuid(),
  week_start date not null check (extract(isodow from week_start) = 1),
  member_id uuid not null references public.ct_members(id),
  available_hours numeric not null check (available_hours >= 0 and available_hours <= 100),
  notes text,
  updated_at timestamptz not null default now(),
  unique (week_start, member_id)
);

-- ---------------------------------------------------------------------
-- 8. Mudanças de escopo (19_MUDANCAS) — aprovação cruzada
-- ---------------------------------------------------------------------
create sequence if not exists public.ct_change_code_seq start 1;
create table if not exists public.ct_changes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('CR-' || lpad(nextval('public.ct_change_code_seq')::text, 3, '0')),
  contract_id uuid references public.ct_contracts(id) on delete set null,
  title text not null,
  description text,
  justification text,
  impact_technical text,
  impact_days integer,
  impact_hours numeric,
  impact_value numeric,
  requested_at date not null default current_date,
  requested_by uuid default public.ct_current_member() references public.ct_members(id),
  status text not null default 'Em análise'
    check (status in ('Em análise', 'Aprovada internamente', 'Aprovada pelo cliente', 'Rejeitada', 'Implementada')),
  external_approval text,
  evidence text,
  decided_by uuid references public.ct_members(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.ct_changes_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_me uuid := public.ct_current_member();
begin
  if tg_op = 'INSERT' then
    new.requested_by := coalesce(v_me, new.requested_by);
    if new.status <> 'Em análise' then raise exception 'Uma mudança nova começa "Em análise"'; end if;
    return new;
  end if;
  new.requested_by := old.requested_by; new.decided_by := old.decided_by; new.decided_at := old.decided_at;
  new.updated_at := now();
  if new.status is distinct from old.status then
    if new.status in ('Aprovada internamente', 'Rejeitada') then
      if v_me is null or v_me = old.requested_by then
        raise exception 'A aprovação interna deve ser feita por outra pessoa (não por quem solicitou)';
      end if;
      new.decided_by := v_me; new.decided_at := now();
    elsif new.status = 'Aprovada pelo cliente' then
      if old.status <> 'Aprovada internamente' then raise exception 'Primeiro aprove internamente'; end if;
      if coalesce(btrim(new.external_approval), '') = '' then
        raise exception 'Informe a evidência da aprovação do cliente (OS, aditivo, e-mail)';
      end if;
    elsif new.status = 'Implementada' then
      if old.status <> 'Aprovada pelo cliente' then
        raise exception 'Só implemente depois da aprovação do cliente (OS/aditivo)';
      end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists ct_changes_guard on public.ct_changes;
create trigger ct_changes_guard before insert or update on public.ct_changes
  for each row execute function public.ct_changes_guard();

-- ---------------------------------------------------------------------
-- 9. Riscos (ISO 31000) — 08_RISCOS
-- ---------------------------------------------------------------------
create sequence if not exists public.ct_risk_code_seq start 10;
create table if not exists public.ct_risks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('R' || lpad(nextval('public.ct_risk_code_seq')::text, 2, '0')),
  title text not null,
  scope text,
  contract_id uuid references public.ct_contracts(id) on delete set null,
  probability integer not null check (probability between 1 and 3),
  impact integer not null check (impact between 1 and 3),
  score integer generated always as (probability * impact) stored,
  mitigation text,
  owner_id uuid references public.ct_members(id),
  reviewer_id uuid references public.ct_members(id),
  due_date date,
  review_date date,
  status text not null default 'Aberto' check (status in ('Aberto', 'Em tratamento', 'Monitorando', 'Fechado')),
  evidence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. Não conformidades e ações corretivas (ISO 9001 8.7 / 10.2)
-- ---------------------------------------------------------------------
create sequence if not exists public.ct_nc_code_seq start 1;
create table if not exists public.ct_nonconformities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('NC-' || lpad(nextval('public.ct_nc_code_seq')::text, 3, '0')),
  source text not null default 'Double check interno'
    check (source in ('Double check interno', 'Devolução do cliente', 'Reclamação do cliente', 'Auditoria', 'Prazo perdido', 'Outro')),
  contract_id uuid references public.ct_contracts(id) on delete set null,
  task_id uuid references public.ct_tasks(id) on delete set null,
  deliverable_id uuid references public.ct_deliverables(id) on delete set null,
  description text not null,
  immediate_action text,
  root_cause text,
  corrective_action text,
  owner_id uuid references public.ct_members(id),
  due_date date,
  status text not null default 'Aberta'
    check (status in ('Aberta', 'Em análise', 'Ação em andamento', 'Verificando eficácia', 'Encerrada')),
  effectiveness_note text,
  verified_by uuid references public.ct_members(id),
  closed_at timestamptz,
  created_by uuid default public.ct_current_member() references public.ct_members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.ct_nc_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_me uuid := public.ct_current_member();
begin
  if tg_op = 'INSERT' then return new; end if;
  new.verified_by := old.verified_by; new.closed_at := old.closed_at; new.created_by := old.created_by;
  new.updated_at := now();
  if new.status = 'Encerrada' and old.status <> 'Encerrada' then
    if old.status <> 'Verificando eficácia' then raise exception 'Verifique a eficácia antes de encerrar'; end if;
    if coalesce(btrim(new.root_cause), '') = '' or coalesce(btrim(new.corrective_action), '') = '' then
      raise exception 'Informe causa raiz e ação corretiva antes de encerrar';
    end if;
    if coalesce(btrim(new.effectiveness_note), '') = '' then raise exception 'Registre a evidência de eficácia'; end if;
    if v_me is null or v_me = new.owner_id then
      raise exception 'A eficácia deve ser verificada por outra pessoa (não pelo responsável pela ação)';
    end if;
    new.verified_by := v_me; new.closed_at := now();
  elsif old.status = 'Encerrada' and new.status <> 'Encerrada' then
    new.closed_at := null; new.verified_by := null;
  end if;
  return new;
end $$;
drop trigger if exists ct_nc_guard on public.ct_nonconformities;
create trigger ct_nc_guard before insert or update on public.ct_nonconformities
  for each row execute function public.ct_nc_guard();

-- ---------------------------------------------------------------------
-- 11. Documentos (18_DOCUMENTOS), avaliação do cliente, financeiro
-- ---------------------------------------------------------------------
create sequence if not exists public.ct_doc_code_seq start 10;
create table if not exists public.ct_documents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('DOC-' || lpad(nextval('public.ct_doc_code_seq')::text, 3, '0')),
  contract_id uuid references public.ct_contracts(id) on delete set null,
  client_unit text,
  doc_type text not null default 'Relatório',
  title text not null,
  revision text,
  received_at date,
  origin text,
  reviewer_id uuid references public.ct_members(id),
  access_path text,
  applicable text not null default 'A confirmar' check (applicable in ('Sim', 'Não', 'A confirmar')),
  status text not null default 'Vigente' check (status in ('Rascunho', 'Em revisão', 'Vigente', 'Obsoleto')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ct_feedback (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references public.ct_contracts(id) on delete set null,
  deliverable_id uuid references public.ct_deliverables(id) on delete set null,
  received_at date not null default current_date,
  score integer not null check (score between 1 and 5),
  respondent text,
  comment text,
  recorded_by uuid default public.ct_current_member() references public.ct_members(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ct_invoices (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  contract_id uuid references public.ct_contracts(id) on delete set null,
  period text,
  service_order text,
  description text,
  amount numeric,
  issued_at date,
  payment_terms_days integer,
  due_date date,
  paid_amount numeric not null default 0,
  paid_at date,
  status text not null default 'A medir'
    check (status in ('A medir', 'Medição enviada', 'Medição aprovada', 'NF emitida', 'Paga parcialmente', 'Paga', 'Cancelada')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 12. OKRs e análise crítica pela direção (ISO 9001 9.3)
-- ---------------------------------------------------------------------
create table if not exists public.ct_objectives (
  id uuid primary key default gen_random_uuid(),
  quarter text not null,
  title text not null,
  owner_id uuid references public.ct_members(id),
  status text not null default 'Em andamento' check (status in ('Em andamento', 'Atingido', 'Parcial', 'Não atingido', 'Cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ct_key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.ct_objectives(id) on delete cascade,
  title text not null,
  unit text,
  start_value numeric not null default 0,
  target_value numeric not null,
  current_value numeric not null default 0,
  owner_id uuid references public.ct_members(id),
  updated_at timestamptz not null default now()
);
create table if not exists public.ct_reviews (
  id uuid primary key default gen_random_uuid(),
  review_date date not null default current_date,
  period text not null,
  snapshot jsonb,
  conclusions text,
  decisions text,
  created_by uuid default public.ct_current_member() references public.ct_members(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 13. updated_at, RLS, atividade, tempo real
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['ct_changes', 'ct_risks', 'ct_nonconformities', 'ct_documents', 'ct_invoices', 'ct_objectives', 'ct_key_results', 'ct_capacity']
  loop
    if t not in ('ct_changes', 'ct_nonconformities') then
      execute format('drop trigger if exists %I_touch on public.%I', t, t);
      execute format('create trigger %I_touch before update on public.%I for each row execute function public.ct_touch_updated_at()', t, t);
    end if;
  end loop;

  foreach t in array array['ct_settings', 'ct_activity', 'ct_comments', 'ct_task_checklist', 'ct_templates', 'ct_template_items',
                           'ct_time_logs', 'ct_capacity', 'ct_changes', 'ct_risks', 'ct_nonconformities', 'ct_documents',
                           'ct_feedback', 'ct_invoices', 'ct_objectives', 'ct_key_results', 'ct_reviews']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_all on public.%I', t, t);
    if t = 'ct_activity' then
      execute format('create policy %I_all on public.%I for select to authenticated using (public.ct_is_member())', t, t);
    else
      execute format('create policy %I_all on public.%I for all to authenticated using (public.ct_is_member()) with check (public.ct_is_member())', t, t);
    end if;
  end loop;

  foreach t in array array['ct_contracts', 'ct_deliverables', 'ct_tasks', 'ct_deliverable_lots', 'ct_events', 'ct_opportunities',
                           'ct_comments', 'ct_changes', 'ct_risks', 'ct_nonconformities', 'ct_documents', 'ct_invoices',
                           'ct_objectives', 'ct_feedback', 'ct_reviews']
  loop
    execute format('drop trigger if exists %I_activity on public.%I', t, t);
    execute format('create trigger %I_activity after insert or update or delete on public.%I for each row execute function public.ct_log_activity()', t, t);
  end loop;
end $$;

alter table public.ct_notifications enable row level security;
drop policy if exists ct_notifications_select on public.ct_notifications;
create policy ct_notifications_select on public.ct_notifications for select to authenticated
  using (recipient_id = public.ct_current_member());

grant execute on function public.ct_mark_notifications_read(uuid[]) to authenticated;

do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['ct_contracts', 'ct_deliverables', 'ct_tasks', 'ct_deliverable_lots', 'ct_events', 'ct_opportunities',
                             'ct_notifications', 'ct_activity', 'ct_comments', 'ct_task_checklist', 'ct_time_logs', 'ct_changes',
                             'ct_risks', 'ct_nonconformities', 'ct_documents', 'ct_invoices', 'ct_task_history']
    loop
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;
