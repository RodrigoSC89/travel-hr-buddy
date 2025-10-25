-- PATCH 107.0: Predictive Maintenance Engine
-- Create maintenance_records table for tracking maintenance schedules, history, and predictions

create table if not exists maintenance_records (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid references vessels(id) on delete cascade,
  component text not null,
  last_maintenance timestamptz,
  next_due timestamptz,
  status text default 'ok' check (status in ('ok', 'scheduled', 'overdue', 'forecasted')),
  notes text,
  forecasted_issue text,
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'critical')),
  maintenance_type text check (maintenance_type in ('preventive', 'corrective', 'predictive', 'condition_based')),
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  performed_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_maintenance_records_vessel_id on maintenance_records(vessel_id);
create index if not exists idx_maintenance_records_component on maintenance_records(component);
create index if not exists idx_maintenance_records_status on maintenance_records(status);
create index if not exists idx_maintenance_records_next_due on maintenance_records(next_due);
create index if not exists idx_maintenance_records_priority on maintenance_records(priority);

-- Enable Row Level Security
alter table maintenance_records enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read maintenance records"
  on maintenance_records for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert maintenance records"
  on maintenance_records for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update maintenance records"
  on maintenance_records for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete maintenance records"
  on maintenance_records for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_maintenance_records_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger maintenance_records_updated_at
  before update on maintenance_records
  for each row
  execute function update_maintenance_records_updated_at();

-- Insert sample data for testing
insert into maintenance_records (
  vessel_id,
  component,
  last_maintenance,
  next_due,
  status,
  notes,
  forecasted_issue,
  priority,
  maintenance_type,
  estimated_cost
)
select
  v.id,
  'Main Engine',
  now() - interval '30 days',
  now() + interval '60 days',
  'ok',
  'Regular maintenance performed',
  null,
  'normal',
  'preventive',
  5000.00
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into maintenance_records (
  vessel_id,
  component,
  last_maintenance,
  next_due,
  status,
  notes,
  forecasted_issue,
  priority,
  maintenance_type,
  estimated_cost
)
select
  v.id,
  'Auxiliary Generator',
  now() - interval '45 days',
  now() + interval '15 days',
  'scheduled',
  'Scheduled for next port visit',
  'Potential oil filter clogging detected',
  'high',
  'predictive',
  2500.00
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into maintenance_records (
  vessel_id,
  component,
  last_maintenance,
  next_due,
  status,
  notes,
  forecasted_issue,
  priority,
  maintenance_type,
  estimated_cost
)
select
  v.id,
  'Navigation System',
  now() - interval '90 days',
  now() - interval '5 days',
  'overdue',
  'GPS calibration required',
  null,
  'critical',
  'corrective',
  3000.00
from vessels v
where v.imo_code = 'IMO9345678'
limit 1
on conflict do nothing;

insert into maintenance_records (
  vessel_id,
  component,
  last_maintenance,
  next_due,
  status,
  forecasted_issue,
  priority,
  maintenance_type,
  estimated_cost
)
values
  (
    (select id from vessels where imo_code = 'IMO9456789' limit 1),
    'Hydraulic System',
    now() - interval '60 days',
    now() + interval '30 days',
    'forecasted',
    'AI detected unusual pressure patterns',
    'high',
    'predictive',
    4500.00
  ),
  (
    (select id from vessels where imo_code = 'IMO9234567' limit 1),
    'Fire Suppression System',
    now() - interval '20 days',
    now() + interval '160 days',
    'ok',
    null,
    'normal',
    'preventive',
    1500.00
  ),
  (
    (select id from vessels where imo_code = 'IMO9345678' limit 1),
    'Ballast Water Treatment',
    now() - interval '10 days',
    now() + interval '50 days',
    'ok',
    null,
    'normal',
    'preventive',
    3500.00
  )
on conflict do nothing;

-- Create view for maintenance dashboard
create or replace view maintenance_dashboard as
select 
  mr.id,
  mr.component,
  mr.last_maintenance,
  mr.next_due,
  mr.status,
  mr.priority,
  mr.forecasted_issue,
  v.name as vessel_name,
  v.imo_code,
  case 
    when mr.next_due < now() then 'overdue'
    when mr.next_due < now() + interval '7 days' then 'urgent'
    when mr.next_due < now() + interval '30 days' then 'upcoming'
    else 'ok'
  end as urgency_status,
  extract(days from (mr.next_due - now())) as days_until_due
from maintenance_records mr
join vessels v on mr.vessel_id = v.id
order by mr.next_due asc;

-- Create function for predictive maintenance analysis
create or replace function get_maintenance_predictions(vessel_uuid uuid default null)
returns table (
  vessel_id uuid,
  vessel_name text,
  component text,
  prediction_score numeric,
  recommended_action text,
  estimated_cost numeric
) as $$
begin
  return query
  select 
    v.id,
    v.name,
    mr.component,
    case 
      when mr.status = 'overdue' then 1.0
      when mr.status = 'forecasted' then 0.8
      when mr.next_due < now() + interval '7 days' then 0.6
      when mr.next_due < now() + interval '30 days' then 0.4
      else 0.2
    end as prediction_score,
    case 
      when mr.status = 'overdue' then 'Immediate action required'
      when mr.status = 'forecasted' then 'Schedule preventive maintenance'
      when mr.next_due < now() + interval '7 days' then 'Plan maintenance soon'
      else 'Monitor condition'
    end as recommended_action,
    coalesce(mr.estimated_cost, 0.0) as estimated_cost
  from vessels v
  join maintenance_records mr on v.id = mr.vessel_id
  where vessel_uuid is null or v.id = vessel_uuid
  order by prediction_score desc, mr.next_due asc;
end;
$$ language plpgsql;
