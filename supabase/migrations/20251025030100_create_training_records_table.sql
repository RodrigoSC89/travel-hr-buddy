-- PATCH 112.0: Crew Training & Certification System
-- Create training_records table for training tracking, certifications, and expirations

create table if not exists training_records (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid references crew_members(id) on delete cascade,
  course_name text not null,
  completion_date date,
  expires_at date,
  certification_file text,
  provider text,
  certificate_number text,
  training_type text,
  status text default 'valid' check (status in ('valid', 'expired', 'expiring_soon', 'pending')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_training_records_crew_id on training_records(crew_id);
create index if not exists idx_training_records_expires_at on training_records(expires_at);
create index if not exists idx_training_records_status on training_records(status);
create index if not exists idx_training_records_course_name on training_records(course_name);

-- Enable Row Level Security
alter table training_records enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read training records"
  on training_records for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert training records"
  on training_records for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update training records"
  on training_records for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete training records"
  on training_records for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp and status
create or replace function update_training_records_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  
  -- Auto-update status based on expiry date
  if new.expires_at is not null then
    if new.expires_at < current_date then
      new.status = 'expired';
    elsif new.expires_at <= current_date + interval '30 days' then
      new.status = 'expiring_soon';
    elsif new.completion_date is not null then
      new.status = 'valid';
    else
      new.status = 'pending';
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp and status update
create trigger training_records_updated_at
  before update on training_records
  for each row
  execute function update_training_records_updated_at();

-- Create trigger for status update on insert
create trigger training_records_status_on_insert
  before insert on training_records
  for each row
  execute function update_training_records_updated_at();

-- Insert sample data for testing
insert into training_records (crew_id, course_name, completion_date, expires_at, provider, certificate_number, training_type)
select
  cm.id,
  'STCW Basic Safety Training',
  '2023-01-15',
  '2028-01-15',
  'Maritime Training Institute',
  'STCW-2023-001234',
  'Safety'
from crew_members cm
where cm.name = 'Captain John Smith'
limit 1
on conflict do nothing;

insert into training_records (crew_id, course_name, completion_date, expires_at, provider, certificate_number, training_type, status)
select
  cm.id,
  'Advanced Fire Fighting',
  '2022-06-20',
  '2025-06-20',
  'Maritime Safety Academy',
  'AFF-2022-005678',
  'Safety',
  'expiring_soon'
from crew_members cm
where cm.name = 'Captain John Smith'
limit 1
on conflict do nothing;

insert into training_records (crew_id, course_name, completion_date, expires_at, provider, certificate_number, training_type)
select
  cm.id,
  'GMDSS Radio Operator',
  '2023-03-10',
  '2028-03-10',
  'Radio Communications School',
  'GMDSS-2023-009876',
  'Technical'
from crew_members cm
where cm.name = 'Captain John Smith'
limit 1
on conflict do nothing;

insert into training_records (crew_id, course_name, completion_date, expires_at, provider, certificate_number, training_type)
select
  cm.id,
  'Engine Room Safety',
  '2023-05-22',
  '2028-05-22',
  'Maritime Engineering Academy',
  'ERS-2023-012345',
  'Technical'
from crew_members cm
where cm.name = 'Chief Engineer Maria Santos'
limit 1
on conflict do nothing;

insert into training_records (crew_id, course_name, completion_date, expires_at, provider, certificate_number, training_type, status)
select
  cm.id,
  'Medical First Aid',
  '2020-02-15',
  '2025-02-15',
  'Maritime Medical Center',
  'MFA-2020-003456',
  'Medical',
  'expired'
from crew_members cm
where cm.name = 'Chief Engineer Maria Santos'
limit 1
on conflict do nothing;

-- Create view for training expiry monitoring
create or replace view training_expiry_status as
select 
  tr.id,
  tr.course_name,
  tr.completion_date,
  tr.expires_at,
  tr.status,
  tr.training_type,
  cm.name as crew_name,
  cm.position,
  cm.email,
  v.name as vessel_name,
  case 
    when tr.expires_at < current_date then extract(day from current_date - tr.expires_at)
    else null
  end as days_expired,
  case 
    when tr.expires_at >= current_date then extract(day from tr.expires_at - current_date)
    else null
  end as days_until_expiry
from training_records tr
join crew_members cm on tr.crew_id = cm.id
left join vessels v on cm.vessel_id = v.id
order by 
  case tr.status
    when 'expired' then 1
    when 'expiring_soon' then 2
    when 'valid' then 3
    else 4
  end,
  tr.expires_at;

-- Create function to get crew training summary
create or replace function get_crew_training_summary(p_crew_id uuid)
returns table (
  total_certifications bigint,
  valid_certifications bigint,
  expired_certifications bigint,
  expiring_soon bigint,
  compliance_percentage numeric
) as $$
begin
  return query
  select
    count(*)::bigint as total_certifications,
    count(case when status = 'valid' then 1 end)::bigint as valid_certifications,
    count(case when status = 'expired' then 1 end)::bigint as expired_certifications,
    count(case when status = 'expiring_soon' then 1 end)::bigint as expiring_soon,
    round(
      (count(case when status = 'valid' then 1 end)::numeric / nullif(count(*)::numeric, 0)) * 100,
      2
    ) as compliance_percentage
  from training_records
  where crew_id = p_crew_id;
end;
$$ language plpgsql;
