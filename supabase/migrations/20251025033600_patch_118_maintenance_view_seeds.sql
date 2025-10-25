-- PATCH 118.0: Maintenance Engine - Views + Seeds
-- Create view for maintenance due in next 7 days

create or replace view maintenance_due_next_7d as
select * from maintenance_records
where next_due <= now() + interval '7 days'
  and next_due >= now()
order by next_due asc;

-- Add additional seed data for maintenance records
insert into maintenance_records (
  vessel_id,
  component,
  last_maintenance,
  next_due,
  status,
  notes,
  priority,
  maintenance_type,
  estimated_cost
)
values
  (
    (select id from vessels where imo_code = 'IMO9234567' limit 1),
    'Motor Principal',
    '2024-07-01'::date,
    '2024-10-01'::date,
    'ok',
    'Regular maintenance completed',
    'normal',
    'preventive',
    6000.00
  ),
  (
    (select id from vessels where imo_code = 'IMO9345678' limit 1),
    'Gerador Auxiliar',
    '2024-08-15'::date,
    '2024-11-15'::date,
    'ok',
    'All systems operational',
    'normal',
    'preventive',
    3500.00
  ),
  (
    (select id from vessels where imo_code = 'IMO9456789' limit 1),
    'Propulsion System',
    now() - interval '20 days',
    now() + interval '5 days',
    'scheduled',
    'Scheduled for upcoming maintenance window',
    'high',
    'preventive',
    8500.00
  ),
  (
    (select id from vessels where imo_code = 'IMO9234567' limit 1),
    'Communication Equipment',
    now() - interval '15 days',
    now() + interval '3 days',
    'scheduled',
    'Radio and satellite systems check',
    'normal',
    'preventive',
    2000.00
  )
-- Note: ON CONFLICT DO NOTHING ensures idempotency when migration runs multiple times
-- Since id is auto-generated, conflicts only occur on re-runs
on conflict do nothing;

-- Create helper function to get upcoming maintenance
create or replace function get_upcoming_maintenance(days_ahead integer default 7)
returns table (
  id uuid,
  vessel_name text,
  component text,
  last_maintenance timestamptz,
  next_due timestamptz,
  status text,
  priority text,
  days_remaining numeric
) as $$
begin
  return query
  select 
    mr.id,
    v.name as vessel_name,
    mr.component,
    mr.last_maintenance,
    mr.next_due,
    mr.status,
    mr.priority,
    extract(epoch from (mr.next_due - now())) / 86400 as days_remaining
  from maintenance_records mr
  join vessels v on mr.vessel_id = v.id
  where mr.next_due <= now() + make_interval(days => days_ahead)
    and mr.next_due >= now()
  order by mr.next_due asc;
end;
$$ language plpgsql;
