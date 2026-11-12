-- =====================================================================
-- MB MARITIME · CONTROL TOWER — Alertas automáticos
-- Eventos: atribuição, revisão, devolução, aprovação, prazos, reuniões,
-- follow-up comercial, lotes, mudanças de escopo, riscos e NCs.
-- Ninguém é notificado das próprias ações (ct_notify ignora o autor).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tarefas
-- ---------------------------------------------------------------------
create or replace function public.ct_tasks_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := public.ct_current_member();
  v_link text := '/tarefas?task=' || new.id;
  v_lbl text := new.code || ' · ' || new.title;
  v_prio text := case when new.priority = 'P0' then 'alta' else 'normal' end;
begin
  if tg_op = 'INSERT' then
    perform public.ct_notify(new.executor_id, v_me, 'tarefa_atribuida',
      public.ct_member_name(v_me) || ' atribuiu uma tarefa a você', v_lbl ||
      coalesce(' · prazo ' || to_char(new.due_date, 'DD/MM'), ''), v_link, 'task', new.id, v_prio, null);
    perform public.ct_notify(new.reviewer_id, v_me, 'revisor_definido',
      'Você é o revisor (double check) de ' || new.code, v_lbl, v_link, 'task', new.id, 'baixa', null);
    if new.priority = 'P0' then
      perform public.ct_notify(m.id, v_me, 'urgente', 'Tarefa URGENTE (P0) criada', v_lbl, v_link, 'task', new.id, 'alta', null)
        from public.ct_members m where m.active and m.id not in (new.executor_id, new.reviewer_id);
    end if;
    return null;
  end if;

  if new.executor_id is distinct from old.executor_id then
    perform public.ct_notify(new.executor_id, v_me, 'tarefa_atribuida',
      public.ct_member_name(v_me) || ' passou uma tarefa para você', v_lbl, v_link, 'task', new.id, v_prio, null);
    perform public.ct_notify(old.executor_id, v_me, 'tarefa_reatribuida',
      new.code || ' foi passada para ' || public.ct_member_name(new.executor_id), v_lbl, v_link, 'task', new.id, 'baixa', null);
  end if;
  if new.reviewer_id is distinct from old.reviewer_id then
    perform public.ct_notify(new.reviewer_id, v_me, 'revisor_definido',
      'Você agora é o revisor de ' || new.code, v_lbl, v_link, 'task', new.id, 'normal', null);
  end if;

  if new.status is distinct from old.status then
    if new.status = 'em_double_check' then
      perform public.ct_notify(new.reviewer_id, v_me, 'aguardando_revisao',
        'Aguardando seu double check: ' || new.code, v_lbl || coalesce(E'\nEvidência: ' || new.evidence_note, ''),
        v_link, 'task', new.id, case when new.priority = 'P0' then 'alta' else 'normal' end, null);
    elsif new.status = 'concluida' then
      perform public.ct_notify(new.executor_id, v_me, 'tarefa_aprovada',
        public.ct_member_name(v_me) || ' aprovou ' || new.code, v_lbl, v_link, 'task', new.id, 'normal', null);
    elsif old.status = 'em_double_check' and new.status = 'em_ajuste' then
      perform public.ct_notify(new.executor_id, v_me, 'tarefa_devolvida',
        new.code || ' devolvida para ajuste', coalesce(new.review_comment, v_lbl), v_link, 'task', new.id, 'alta', null);
    elsif old.status = 'concluida' then
      perform public.ct_notify(new.executor_id, v_me, 'tarefa_reaberta', new.code || ' foi reaberta', v_lbl, v_link, 'task', new.id, 'normal', null);
      perform public.ct_notify(new.reviewer_id, v_me, 'tarefa_reaberta', new.code || ' foi reaberta', v_lbl, v_link, 'task', new.id, 'normal', null);
    end if;
  end if;

  if new.due_date is distinct from old.due_date then
    perform public.ct_notify(x, v_me, 'prazo_alterado',
      'Prazo de ' || new.code || ' alterado para ' || coalesce(to_char(new.due_date, 'DD/MM/YYYY'), 'sem prazo'),
      v_lbl, v_link, 'task', new.id, 'normal', null)
      from unnest(array[new.executor_id, new.reviewer_id]) as x;
  end if;

  -- recusa do cliente gera não conformidade automaticamente (ISO 9001 8.7)
  if new.client_acceptance = 'Recusado' and old.client_acceptance is distinct from 'Recusado' then
    insert into public.ct_nonconformities (source, contract_id, task_id, deliverable_id, description, owner_id, status, created_by)
    values ('Devolução do cliente', new.contract_id, new.id, new.deliverable_id,
            'Cliente recusou ' || v_lbl, new.executor_id, 'Aberta', v_me);
  end if;
  return null;
end $$;
drop trigger if exists ct_tasks_notify on public.ct_tasks;
create trigger ct_tasks_notify after insert or update on public.ct_tasks
  for each row execute function public.ct_tasks_notify();

-- ---------------------------------------------------------------------
-- Lotes de entregáveis
-- ---------------------------------------------------------------------
create or replace function public.ct_lots_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := public.ct_current_member();
  v_del public.ct_deliverables%rowtype;
  v_link text;
  v_lbl text;
begin
  select * into v_del from public.ct_deliverables where id = new.deliverable_id;
  v_link := '/entregaveis?d=' || new.deliverable_id;
  v_lbl := v_del.code || ' · ' || new.description || ' (' || new.qty || ' un.)';
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'em_double_check' then
      if v_del.reviewer_id is not null then
        perform public.ct_notify(v_del.reviewer_id, v_me, 'lote_revisao', 'Lote aguardando seu double check', v_lbl, v_link, 'lot', new.id, 'normal', null);
      else
        perform public.ct_notify(m.id, v_me, 'lote_revisao', 'Lote aguardando double check', v_lbl, v_link, 'lot', new.id, 'normal', null)
          from public.ct_members m where m.active;
      end if;
    elsif new.status = 'aprovado' then
      perform public.ct_notify(new.executor_id, v_me, 'lote_aprovado', 'Lote aprovado', v_lbl, v_link, 'lot', new.id, 'normal', null);
    elsif new.status = 'reprovado' then
      perform public.ct_notify(new.executor_id, v_me, 'lote_reprovado', 'Lote reprovado no double check',
        coalesce(new.review_comment, v_lbl), v_link, 'lot', new.id, 'alta', null);
    end if;
  end if;
  if tg_op = 'UPDATE' and new.external_acceptance = 'Recusado' and old.external_acceptance is distinct from 'Recusado' then
    insert into public.ct_nonconformities (source, contract_id, deliverable_id, description, owner_id, status, created_by)
    values ('Devolução do cliente', v_del.contract_id, v_del.id, 'Cliente recusou o lote ' || v_lbl, new.executor_id, 'Aberta', v_me);
  end if;
  return null;
end $$;
drop trigger if exists ct_lots_notify on public.ct_deliverable_lots;
create trigger ct_lots_notify after update on public.ct_deliverable_lots
  for each row execute function public.ct_lots_notify();

-- ---------------------------------------------------------------------
-- Agenda, comercial, mudanças, riscos, NCs, entregáveis
-- ---------------------------------------------------------------------
create or replace function public.ct_misc_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := public.ct_current_member();
  v_new jsonb := to_jsonb(new);
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  v_owner_col text;
  v_owner uuid;
  v_label text := coalesce(v_new ->> 'code', '') || ' · ' || coalesce(v_new ->> 'title', v_new ->> 'account', v_new ->> 'package', v_new ->> 'description', '');
  v_link text;
  v_what text;
begin
  v_owner_col := case tg_table_name
    when 'ct_events' then 'owner_id' when 'ct_opportunities' then 'owner_id'
    when 'ct_risks' then 'owner_id' when 'ct_nonconformities' then 'owner_id'
    when 'ct_deliverables' then 'executor_id' when 'ct_contracts' then 'leader_id' else null end;
  v_what := case tg_table_name
    when 'ct_events' then 'compromisso' when 'ct_opportunities' then 'oportunidade'
    when 'ct_risks' then 'risco' when 'ct_nonconformities' then 'não conformidade'
    when 'ct_deliverables' then 'entregável' when 'ct_contracts' then 'contrato' else 'item' end;
  v_link := case tg_table_name
    when 'ct_events' then '/agenda' when 'ct_opportunities' then '/comercial'
    when 'ct_risks' then '/riscos' when 'ct_nonconformities' then '/qualidade'
    when 'ct_deliverables' then '/entregaveis?d=' || (v_new ->> 'id')
    when 'ct_contracts' then '/contratos?c=' || (v_new ->> 'id')
    when 'ct_changes' then '/mudancas' else null end;

  -- responsável definido / alterado
  if v_owner_col is not null then
    v_owner := (v_new ->> v_owner_col)::uuid;
    if v_owner is not null and (tg_op = 'INSERT' or v_owner is distinct from (v_old ->> v_owner_col)::uuid) then
      perform public.ct_notify(v_owner, v_me, 'responsavel_definido',
        public.ct_member_name(v_me) || ' definiu você como responsável por ' || v_what, v_label, v_link,
        tg_table_name, (v_new ->> 'id')::uuid, case when tg_table_name = 'ct_nonconformities' then 'alta' else 'normal' end, null);
    end if;
  end if;

  -- revisor de entregável/contrato/compromisso/oportunidade/risco
  if (v_new ? 'reviewer_id') and (v_new ->> 'reviewer_id') is not null
     and (tg_op = 'INSERT' or (v_new ->> 'reviewer_id') is distinct from (v_old ->> 'reviewer_id')) then
    perform public.ct_notify((v_new ->> 'reviewer_id')::uuid, v_me, 'revisor_definido',
      'Você é o revisor de ' || v_what, v_label, v_link, tg_table_name, (v_new ->> 'id')::uuid, 'baixa', null);
  end if;

  -- agenda confirmada
  if tg_table_name = 'ct_events' and (v_new ->> 'status') = 'Confirmado' and (v_old ->> 'status') is distinct from 'Confirmado' then
    perform public.ct_notify(m.id, v_me, 'reuniao_confirmada',
      'Compromisso confirmado: ' || (v_new ->> 'title'),
      to_char((v_new ->> 'starts_at')::timestamptz at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'),
      v_link, 'event', (v_new ->> 'id')::uuid, 'normal', null)
      from public.ct_members m where m.active;
  end if;

  -- mudança de escopo: pede aprovação do outro / informa decisão
  if tg_table_name = 'ct_changes' then
    if tg_op = 'INSERT' then
      perform public.ct_notify(m.id, v_me, 'mudanca_aprovacao', 'Mudança de escopo aguardando sua aprovação', v_label, v_link, 'change', (v_new ->> 'id')::uuid, 'alta', null)
        from public.ct_members m where m.active;
    elsif (v_new ->> 'status') is distinct from (v_old ->> 'status') then
      perform public.ct_notify((v_new ->> 'requested_by')::uuid, v_me, 'mudanca_decidida',
        'Mudança de escopo: ' || (v_new ->> 'status'), v_label, v_link, 'change', (v_new ->> 'id')::uuid, 'normal', null);
    end if;
  end if;

  -- NC aguardando verificação de eficácia
  if tg_table_name = 'ct_nonconformities' and (v_new ->> 'status') = 'Verificando eficácia'
     and (v_old ->> 'status') is distinct from 'Verificando eficácia' then
    perform public.ct_notify(m.id, v_me, 'nc_verificacao', 'Verifique a eficácia da ação corretiva', v_label, v_link, 'nc', (v_new ->> 'id')::uuid, 'normal', null)
      from public.ct_members m where m.active and m.id is distinct from (v_new ->> 'owner_id')::uuid;
  end if;
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['ct_events', 'ct_opportunities', 'ct_changes', 'ct_risks', 'ct_nonconformities', 'ct_deliverables', 'ct_contracts']
  loop
    execute format('drop trigger if exists %I_notify on public.%I', t, t);
    execute format('create trigger %I_notify after insert or update on public.%I for each row execute function public.ct_misc_notify()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Alertas agendados (prazos, reuniões, follow-ups, revisões paradas)
-- Idempotente por dia: dedupe_key inclui a data.
-- ---------------------------------------------------------------------
create or replace function public.ct_scheduled_alerts()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_before integer;
  v_after integer;
begin
  select count(*) into v_before from public.ct_notifications;

  -- tarefas: vence em 3 dias, vence hoje, vencida
  perform public.ct_notify(x.member, null,
      case when t.due_date < v_today then 'prazo_vencido' when t.due_date = v_today then 'prazo_hoje' else 'prazo_proximo' end,
      case when t.due_date < v_today then 'Prazo VENCIDO: ' || t.code
           when t.due_date = v_today then 'Vence hoje: ' || t.code
           else 'Vence em ' || (t.due_date - v_today) || ' dia(s): ' || t.code end,
      t.title || ' · prazo ' || to_char(t.due_date, 'DD/MM/YYYY'),
      '/tarefas?task=' || t.id, 'task', t.id,
      case when t.due_date <= v_today or t.priority = 'P0' then 'alta' else 'normal' end,
      'due:' || t.id || ':' || x.member || ':' || v_today)
    from public.ct_tasks t
    cross join lateral (values (t.executor_id), (t.reviewer_id)) as x(member)
   where t.status <> 'concluida' and t.due_date is not null and t.due_date <= v_today + 3
     and (x.member = t.executor_id or t.due_date <= v_today);

  -- double check parado há mais de 2 dias
  perform public.ct_notify(t.reviewer_id, null, 'revisao_parada',
      'Double check parado há ' || (v_today - (t.submitted_at at time zone 'America/Sao_Paulo')::date) || ' dias: ' || t.code,
      t.title, '/tarefas?task=' || t.id, 'task', t.id, 'alta', 'stale:' || t.id || ':' || v_today)
    from public.ct_tasks t
   where t.status = 'em_double_check' and t.submitted_at < now() - interval '2 days';

  -- compromissos nas próximas 24 h
  perform public.ct_notify(x.member, null, 'reuniao_proxima',
      'Em breve: ' || e.title,
      to_char(e.starts_at at time zone 'America/Sao_Paulo', 'DD/MM HH24:MI') || coalesce(' · ' || e.location, '') || coalesce(' · ' || e.link, ''),
      '/agenda', 'event', e.id, 'normal', 'event24:' || e.id || ':' || x.member)
    from public.ct_events e
    cross join lateral (values (e.owner_id), (e.reviewer_id)) as x(member)
   where e.status in ('Confirmado', 'A confirmar') and e.starts_at between now() and now() + interval '24 hours';

  -- follow-up comercial vencido ou hoje
  perform public.ct_notify(o.owner_id, null, 'followup',
      'Follow-up comercial: ' || o.account, coalesce(o.next_action, ''), '/comercial', 'opportunity', o.id,
      'normal', 'fup:' || o.id || ':' || v_today)
    from public.ct_opportunities o
   where o.follow_up_date <= v_today and o.phase not in ('Ganha', 'Perdida');

  -- riscos com revisão vencida e NCs com prazo vencido
  perform public.ct_notify(r.owner_id, null, 'risco_revisao', 'Revisar risco ' || r.code, r.title, '/riscos', 'risk', r.id,
      case when r.score >= 6 then 'alta' else 'normal' end, 'risk:' || r.id || ':' || v_today)
    from public.ct_risks r where r.status <> 'Fechado' and coalesce(r.review_date, r.due_date) <= v_today;
  perform public.ct_notify(n.owner_id, null, 'nc_prazo', 'Ação corretiva vencida: ' || n.code, n.description, '/qualidade', 'nc', n.id,
      'alta', 'nc:' || n.id || ':' || v_today)
    from public.ct_nonconformities n where n.status <> 'Encerrada' and n.due_date < v_today;

  -- medições vencidas sem pagamento
  perform public.ct_notify(m.id, null, 'financeiro', 'Recebimento vencido: ' || i.code,
      coalesce(i.description, '') || ' · venc. ' || to_char(i.due_date, 'DD/MM/YYYY'), '/financeiro', 'invoice', i.id,
      'alta', 'inv:' || i.id || ':' || m.id || ':' || v_today)
    from public.ct_invoices i cross join public.ct_members m
   where m.active and i.due_date < v_today and i.status not in ('Paga', 'Cancelada');

  select count(*) into v_after from public.ct_notifications;
  return v_after - v_before;
end $$;

-- agenda o job (a cada hora; dedupe evita repetição)
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule(jobid) from cron.job where jobname = 'ct-scheduled-alerts';
    perform cron.schedule('ct-scheduled-alerts', '5 * * * *', 'select public.ct_scheduled_alerts()');
  end if;
end $$;
