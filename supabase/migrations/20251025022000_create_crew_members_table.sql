-- PATCH 106.0: Crew Management System
-- Create crew_members table for crew tracking, certifications, and health management

create table if not exists crew_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  certifications text[] default '{}',
  health_status text default 'fit' check (health_status in ('fit', 'restricted', 'unfit', 'under_review')),
  onboard_status boolean default false,
  last_mission timestamptz,
  vessel_id uuid references vessels(id) on delete set null,
  email text,
  phone text,
  nationality text,
  date_of_birth date,
  hire_date date,
  cert_expiry_dates jsonb default '{}'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_crew_members_vessel_id on crew_members(vessel_id);
create index if not exists idx_crew_members_position on crew_members(position);
create index if not exists idx_crew_members_onboard_status on crew_members(onboard_status);
create index if not exists idx_crew_members_health_status on crew_members(health_status);

-- Enable Row Level Security
alter table crew_members enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read crew members"
  on crew_members for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert crew members"
  on crew_members for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update crew members"
  on crew_members for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete crew members"
  on crew_members for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_crew_members_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger crew_members_updated_at
  before update on crew_members
  for each row
  execute function update_crew_members_updated_at();

-- Insert sample data for testing
insert into crew_members (
  name, 
  position, 
  certifications, 
  health_status, 
  onboard_status, 
  last_mission, 
  vessel_id,
  email,
  nationality,
  date_of_birth,
  hire_date,
  cert_expiry_dates
)
select
  'Captain John Smith',
  'Master',
  array['STCW', 'Master Unlimited', 'GMDSS'],
  'fit',
  true,
  now() - interval '5 days',
  v.id,
  'john.smith@maritime.com',
  'USA',
  '1975-03-15',
  '2010-01-20',
  '{"STCW": "2026-03-15", "Master Unlimited": "2025-12-31", "GMDSS": "2025-06-30"}'::jsonb
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into crew_members (
  name, 
  position, 
  certifications, 
  health_status, 
  onboard_status, 
  last_mission, 
  vessel_id,
  email,
  nationality,
  date_of_birth,
  hire_date,
  cert_expiry_dates
)
select
  'Chief Engineer Maria Santos',
  'Chief Engineer',
  array['STCW', 'Chief Engineer Motor', 'ERS'],
  'fit',
  true,
  now() - interval '5 days',
  v.id,
  'maria.santos@maritime.com',
  'Brazil',
  '1980-07-22',
  '2012-05-15',
  '{"STCW": "2026-07-22", "Chief Engineer Motor": "2025-11-30", "ERS": "2025-08-15"}'::jsonb
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into crew_members (
  name, 
  position, 
  certifications, 
  health_status, 
  onboard_status, 
  vessel_id,
  email,
  nationality,
  date_of_birth,
  hire_date,
  cert_expiry_dates
)
values
  (
    'First Officer Robert Chen',
    'First Officer',
    array['STCW', 'OOW Unlimited', 'ARPA', 'ECDIS'],
    'fit',
    false,
    null,
    'robert.chen@maritime.com',
    'Singapore',
    '1985-11-08',
    '2015-03-10',
    '{"STCW": "2025-11-08", "OOW Unlimited": "2026-02-28", "ARPA": "2025-05-30", "ECDIS": "2025-09-15"}'::jsonb
  ),
  (
    'Second Engineer Ahmed Hassan',
    'Second Engineer',
    array['STCW', 'Second Engineer Motor'],
    'restricted',
    false,
    null,
    'ahmed.hassan@maritime.com',
    'Egypt',
    '1988-04-12',
    '2016-08-20',
    '{"STCW": "2026-04-12", "Second Engineer Motor": "2025-10-31"}'::jsonb
  ),
  (
    'Bosun Carlos Rodriguez',
    'Bosun',
    array['STCW', 'Able Seaman', 'PSC'],
    'fit',
    false,
    null,
    'carlos.rodriguez@maritime.com',
    'Panama',
    '1990-09-25',
    '2018-01-15',
    '{"STCW": "2026-09-25", "Able Seaman": "2026-01-15", "PSC": "2025-07-20"}'::jsonb
  )
on conflict do nothing;

-- Create view for crew readiness status
create or replace view crew_readiness_status as
select 
  cm.id,
  cm.name,
  cm.position,
  cm.health_status,
  cm.onboard_status,
  v.name as vessel_name,
  case 
    when cm.health_status != 'fit' then 'not_ready'
    when array_length(cm.certifications, 1) is null or array_length(cm.certifications, 1) = 0 then 'not_ready'
    when cm.cert_expiry_dates is null then 'unknown'
    else 'ready'
  end as readiness_status,
  cm.certifications,
  cm.cert_expiry_dates
from crew_members cm
left join vessels v on cm.vessel_id = v.id;
