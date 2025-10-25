-- PATCH 115.0: Workflow Automation Engine
-- Create workflow_rules table for rule-based automation

create table if not exists workflow_rules (
  id uuid primary key default gen_random_uuid(),
  rule_name text not null,
  trigger text not null,
  action text not null,
  target_module text not null,
  conditions jsonb default '{}'::jsonb,
  parameters jsonb default '{}'::jsonb,
  enabled boolean default true,
  priority integer default 50,
  execution_count bigint default 0,
  last_executed timestamptz,
  last_result text,
  time_saved_minutes numeric default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create table for workflow execution logs
create table if not exists workflow_executions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references workflow_rules(id) on delete cascade,
  trigger_event text,
  execution_status text check (execution_status in ('success', 'failed', 'partial', 'skipped')),
  result_data jsonb default '{}'::jsonb,
  error_message text,
  execution_time_ms integer,
  executed_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_workflow_rules_enabled on workflow_rules(enabled);
create index if not exists idx_workflow_rules_target_module on workflow_rules(target_module);
create index if not exists idx_workflow_rules_trigger on workflow_rules(trigger);
create index if not exists idx_workflow_rules_priority on workflow_rules(priority desc);
create index if not exists idx_workflow_executions_rule_id on workflow_executions(rule_id);
create index if not exists idx_workflow_executions_executed_at on workflow_executions(executed_at desc);
create index if not exists idx_workflow_executions_status on workflow_executions(execution_status);

-- Enable Row Level Security
alter table workflow_rules enable row level security;
alter table workflow_executions enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read workflow rules"
  on workflow_rules for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert workflow rules"
  on workflow_rules for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update workflow rules"
  on workflow_rules for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete workflow rules"
  on workflow_rules for delete
  to authenticated
  using (true);

create policy "Allow authenticated users to read workflow executions"
  on workflow_executions for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert workflow executions"
  on workflow_executions for insert
  to authenticated
  with check (true);

-- Create function to update updated_at timestamp
create or replace function update_workflow_rules_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger workflow_rules_updated_at
  before update on workflow_rules
  for each row
  execute function update_workflow_rules_updated_at();

-- Insert sample workflow rules
insert into workflow_rules (
  rule_name,
  trigger,
  action,
  target_module,
  conditions,
  parameters,
  enabled,
  priority,
  execution_count,
  time_saved_minutes
)
values
  (
    'Auto-register vessel location on mission start',
    'mission_started',
    'record_fleet_position',
    'operations.fleet',
    '{"mission_type": "any", "vessel_status": "active"}'::jsonb,
    '{"include_timestamp": true, "notify_admin": false}'::jsonb,
    true,
    90,
    45,
    135.0
  ),
  (
    'Generate maintenance alert 7 days before due date',
    'maintenance_due_soon',
    'create_alert',
    'maintenance.planner',
    '{"days_before": 7, "equipment_critical": true}'::jsonb,
    '{"alert_level": "warning", "notify_crew": true}'::jsonb,
    true,
    85,
    32,
    64.0
  ),
  (
    'Auto-backup compliance checklists on completion',
    'checklist_completed',
    'backup_to_archive',
    'compliance.checklist',
    '{"checklist_type": ["ISM", "ISPS", "IMCA"]}'::jsonb,
    '{"backup_location": "archive/compliance", "create_pdf": true}'::jsonb,
    true,
    80,
    78,
    390.0
  ),
  (
    'Send inventory low-stock notification',
    'inventory_below_threshold',
    'send_notification',
    'logistics.inventory',
    '{"threshold_type": "critical", "item_critical": true}'::jsonb,
    '{"notification_channels": ["email", "system"], "recipients": ["logistics_manager", "procurement_team"]}'::jsonb,
    true,
    95,
    18,
    27.0
  ),
  (
    'Schedule training renewal reminder 30 days before expiry',
    'certification_expiring',
    'create_task',
    'hr.training',
    '{"days_before_expiry": 30}'::jsonb,
    '{"task_priority": "high", "assign_to": "training_coordinator"}'::jsonb,
    true,
    85,
    56,
    112.0
  ),
  (
    'Auto-log weather data for voyage reports',
    'voyage_in_progress',
    'record_weather_data',
    'planning.voyage',
    '{"interval_hours": 4, "include_forecast": true}'::jsonb,
    '{"data_sources": ["satellite", "station"], "archive": true}'::jsonb,
    true,
    70,
    234,
    936.0
  ),
  (
    'Generate daily operational summary',
    'end_of_day',
    'compile_report',
    'core.dashboard',
    '{"time": "23:00", "include_all_vessels": true}'::jsonb,
    '{"report_format": "pdf", "email_to": "operations@company.com"}'::jsonb,
    true,
    60,
    90,
    450.0
  )
on conflict do nothing;

-- Insert sample execution logs
insert into workflow_executions (
  rule_id,
  trigger_event,
  execution_status,
  result_data,
  execution_time_ms
)
select
  wr.id,
  'mission_started',
  'success',
  '{"vessel_id": "abc-123", "position": {"lat": -22.9068, "lng": -43.1729}, "timestamp": "2025-10-25T10:30:00Z"}'::jsonb,
  125
from workflow_rules wr
where wr.trigger = 'mission_started'
limit 1
on conflict do nothing;

insert into workflow_executions (
  rule_id,
  trigger_event,
  execution_status,
  result_data,
  execution_time_ms
)
select
  wr.id,
  'maintenance_due_soon',
  'success',
  '{"alert_created": true, "alert_id": "def-456", "equipment": "Main Engine", "due_date": "2025-11-01"}'::jsonb,
  98
from workflow_rules wr
where wr.trigger = 'maintenance_due_soon'
limit 1
on conflict do nothing;

-- Create view for automation dashboard
create or replace view automation_dashboard as
select 
  wr.id,
  wr.rule_name,
  wr.trigger,
  wr.action,
  wr.target_module,
  wr.enabled,
  wr.priority,
  wr.execution_count,
  wr.time_saved_minutes,
  wr.last_executed,
  wr.created_at,
  count(we.id) as total_executions,
  count(case when we.execution_status = 'success' then 1 end) as successful_executions,
  count(case when we.execution_status = 'failed' then 1 end) as failed_executions,
  round(
    (count(case when we.execution_status = 'success' then 1 end)::numeric / 
     nullif(count(we.id)::numeric, 0)) * 100,
    2
  ) as success_rate
from workflow_rules wr
left join workflow_executions we on wr.id = we.rule_id
  and we.executed_at >= now() - interval '30 days'
group by wr.id
order by wr.priority desc, wr.execution_count desc;

-- Create function to execute workflow rule
create or replace function execute_workflow_rule(
  p_rule_id uuid,
  p_trigger_event text,
  p_result_data jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  v_execution_id uuid;
  v_execution_status text;
  v_start_time timestamptz;
  v_execution_time_ms integer;
begin
  v_start_time := clock_timestamp();
  
  -- Check if rule is enabled
  if not exists (
    select 1 from workflow_rules 
    where id = p_rule_id and enabled = true
  ) then
    v_execution_status := 'skipped';
  else
    v_execution_status := 'success';
    
    -- Update rule execution stats
    update workflow_rules
    set 
      execution_count = execution_count + 1,
      last_executed = now()
    where id = p_rule_id;
  end if;
  
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Log execution
  insert into workflow_executions (
    rule_id,
    trigger_event,
    execution_status,
    result_data,
    execution_time_ms
  ) values (
    p_rule_id,
    p_trigger_event,
    v_execution_status,
    p_result_data,
    v_execution_time_ms
  )
  returning id into v_execution_id;
  
  return v_execution_id;
end;
$$ language plpgsql;

-- Create function to get automation statistics
create or replace function get_automation_statistics()
returns table (
  total_rules bigint,
  active_rules bigint,
  total_executions bigint,
  successful_executions bigint,
  failed_executions bigint,
  total_time_saved_hours numeric,
  avg_execution_time_ms numeric
) as $$
begin
  return query
  select
    count(distinct wr.id)::bigint as total_rules,
    count(distinct case when wr.enabled = true then wr.id end)::bigint as active_rules,
    count(we.id)::bigint as total_executions,
    count(case when we.execution_status = 'success' then 1 end)::bigint as successful_executions,
    count(case when we.execution_status = 'failed' then 1 end)::bigint as failed_executions,
    round(sum(wr.time_saved_minutes) / 60.0, 2) as total_time_saved_hours,
    round(avg(we.execution_time_ms), 2) as avg_execution_time_ms
  from workflow_rules wr
  left join workflow_executions we on wr.id = we.rule_id
    and we.executed_at >= now() - interval '30 days';
end;
$$ language plpgsql;

-- Create function to suggest automation based on patterns
create or replace function suggest_automation_opportunities()
returns table (
  suggested_trigger text,
  suggested_action text,
  suggested_module text,
  reasoning text,
  estimated_time_savings_min numeric
) as $$
begin
  return query
  select
    'vessel_departure'::text as suggested_trigger,
    'run_safety_checklist'::text as suggested_action,
    'compliance.checklist'::text as suggested_module,
    'Based on manual checklist patterns, automating pre-departure safety checks could reduce human error.'::text as reasoning,
    30::numeric as estimated_time_savings_min
  where not exists (
    select 1 from workflow_rules
    where trigger = 'vessel_departure' and action = 'run_safety_checklist'
  )
  
  union all
  
  select
    'fuel_consumption_spike'::text,
    'generate_efficiency_report'::text,
    'logistics.fuel-optimizer'::text,
    'Frequent manual analysis of fuel spikes detected. Automation would provide faster insights.'::text,
    45::numeric
  where not exists (
    select 1 from workflow_rules
    where trigger = 'fuel_consumption_spike'
  )
  
  union all
  
  select
    'crew_onboarding'::text,
    'setup_user_accounts'::text,
    'hr.employee-portal'::text,
    'New crew members require multiple manual setup steps. Automation would streamline onboarding.'::text,
    60::numeric
  where not exists (
    select 1 from workflow_rules
    where trigger = 'crew_onboarding'
  );
end;
$$ language plpgsql;
