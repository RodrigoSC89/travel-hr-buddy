-- PATCH 114.0: Smart Alerts with AI Predictive Analysis
-- Create smart_alerts table for intelligent operational alerts

create table if not exists smart_alerts (
  id uuid primary key default gen_random_uuid(),
  source_module text not null,
  level text not null check (level in ('info', 'warning', 'critical', 'predictive')),
  message text not null,
  predicted boolean default false,
  confidence_score numeric,
  impact_estimate text,
  cause_analysis text,
  recommended_actions jsonb default '[]'::jsonb,
  affected_systems jsonb default '[]'::jsonb,
  vessel_id uuid references vessels(id) on delete cascade,
  acknowledged boolean default false,
  acknowledged_by uuid references auth.users(id),
  acknowledged_at timestamptz,
  resolved boolean default false,
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  resolution_notes text,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_smart_alerts_source_module on smart_alerts(source_module);
create index if not exists idx_smart_alerts_level on smart_alerts(level);
create index if not exists idx_smart_alerts_predicted on smart_alerts(predicted);
create index if not exists idx_smart_alerts_vessel_id on smart_alerts(vessel_id);
create index if not exists idx_smart_alerts_acknowledged on smart_alerts(acknowledged);
create index if not exists idx_smart_alerts_resolved on smart_alerts(resolved);
create index if not exists idx_smart_alerts_timestamp on smart_alerts(timestamp desc);

-- Enable Row Level Security
alter table smart_alerts enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read smart alerts"
  on smart_alerts for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert smart alerts"
  on smart_alerts for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update smart alerts"
  on smart_alerts for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete smart alerts"
  on smart_alerts for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_smart_alerts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  
  -- Auto-set acknowledgment timestamp
  if new.acknowledged = true and old.acknowledged = false then
    new.acknowledged_at = now();
  end if;
  
  -- Auto-set resolution timestamp
  if new.resolved = true and old.resolved = false then
    new.resolved_at = now();
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger smart_alerts_updated_at
  before update on smart_alerts
  for each row
  execute function update_smart_alerts_updated_at();

-- Insert sample smart alerts
insert into smart_alerts (
  source_module,
  level,
  message,
  predicted,
  confidence_score,
  impact_estimate,
  cause_analysis,
  recommended_actions,
  affected_systems,
  vessel_id
)
select
  'maintenance.planner',
  'critical',
  'Critical equipment failure predicted in main engine cooling system',
  true,
  94.5,
  'High - Potential engine shutdown within 48-72 hours if not addressed',
  'Historical data indicates temperature fluctuations exceeding normal parameters. Pattern matches previous cooling system failures.',
  '[
    {"action": "Immediate inspection of cooling system pumps and heat exchangers", "priority": "urgent"},
    {"action": "Check coolant levels and quality", "priority": "urgent"},
    {"action": "Prepare backup cooling system", "priority": "high"},
    {"action": "Schedule port call for repairs if issue confirmed", "priority": "high"}
  ]'::jsonb,
  '["main_engine", "cooling_system", "temperature_sensors"]'::jsonb,
  v.id
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into smart_alerts (
  source_module,
  level,
  message,
  predicted,
  confidence_score,
  impact_estimate,
  cause_analysis,
  recommended_actions,
  vessel_id
)
select
  'inventory.supply-chain',
  'warning',
  'Fuel consumption rate 15% above projected baseline',
  false,
  88.2,
  'Medium - Increased operational costs, potential supply chain impact',
  'Current fuel consumption exceeds planned rate. Weather conditions and route changes may be contributing factors.',
  '[
    {"action": "Review current route efficiency", "priority": "medium"},
    {"action": "Optimize vessel speed for fuel economy", "priority": "medium"},
    {"action": "Update fuel resupply schedule", "priority": "low"}
  ]'::jsonb,
  v.id
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into smart_alerts (
  source_module,
  level,
  message,
  predicted,
  confidence_score,
  impact_estimate,
  cause_analysis,
  recommended_actions
)
values
  (
    'hr.training',
    'warning',
    '3 crew certifications expiring within 7 days',
    false,
    100.0,
    'Medium - Crew may be non-compliant for operations',
    'Multiple crew certifications approaching expiry. Regulatory compliance at risk.',
    '[
      {"action": "Contact crew members for certification renewal", "priority": "high"},
      {"action": "Arrange training sessions if needed", "priority": "high"},
      {"action": "Document certification status", "priority": "medium"}
    ]'::jsonb
  ),
  (
    'operations.performance',
    'predictive',
    'Weather system may impact operations in next 36 hours',
    true,
    82.3,
    'Low to Medium - Potential delays in current route',
    'AI analysis of meteorological data predicts adverse weather conditions along planned route.',
    '[
      {"action": "Monitor weather updates closely", "priority": "medium"},
      {"action": "Prepare alternative routing options", "priority": "medium"},
      {"action": "Brief crew on potential weather conditions", "priority": "low"}
    ]'::jsonb
  )
on conflict do nothing;

-- Create view for active alerts dashboard
create or replace view active_alerts_dashboard as
select 
  sa.id,
  sa.source_module,
  sa.level,
  sa.message,
  sa.predicted,
  sa.confidence_score,
  sa.impact_estimate,
  sa.acknowledged,
  sa.resolved,
  sa.timestamp,
  v.name as vessel_name,
  v.imo_code,
  jsonb_array_length(sa.recommended_actions) as actions_count,
  jsonb_array_length(sa.affected_systems) as affected_systems_count,
  extract(hour from now() - sa.timestamp) as hours_since_alert
from smart_alerts sa
left join vessels v on sa.vessel_id = v.id
where sa.resolved = false
order by 
  case sa.level
    when 'critical' then 1
    when 'predictive' then 2
    when 'warning' then 3
    when 'info' then 4
    else 5
  end,
  sa.timestamp desc;

-- Create function to get alert statistics
create or replace function get_alert_statistics()
returns table (
  total_alerts bigint,
  active_alerts bigint,
  critical_alerts bigint,
  warning_alerts bigint,
  predictive_alerts bigint,
  acknowledged_alerts bigint,
  resolved_alerts bigint,
  avg_resolution_time_hours numeric
) as $$
begin
  return query
  select
    count(*)::bigint as total_alerts,
    count(case when resolved = false then 1 end)::bigint as active_alerts,
    count(case when level = 'critical' and resolved = false then 1 end)::bigint as critical_alerts,
    count(case when level = 'warning' and resolved = false then 1 end)::bigint as warning_alerts,
    count(case when predicted = true and resolved = false then 1 end)::bigint as predictive_alerts,
    count(case when acknowledged = true then 1 end)::bigint as acknowledged_alerts,
    count(case when resolved = true then 1 end)::bigint as resolved_alerts,
    round(
      avg(extract(epoch from (resolved_at - timestamp)) / 3600.0),
      2
    ) as avg_resolution_time_hours
  from smart_alerts
  where timestamp >= now() - interval '30 days';
end;
$$ language plpgsql;

-- Create function to generate alert from system event
create or replace function generate_smart_alert(
  p_source_module text,
  p_level text,
  p_message text,
  p_vessel_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  v_alert_id uuid;
begin
  insert into smart_alerts (
    source_module,
    level,
    message,
    vessel_id,
    metadata
  ) values (
    p_source_module,
    p_level,
    p_message,
    p_vessel_id,
    p_metadata
  )
  returning id into v_alert_id;
  
  return v_alert_id;
end;
$$ language plpgsql;
