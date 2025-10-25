-- PATCH 103.0: Fleet Management Module
-- Create vessels table for fleet tracking and management

create table if not exists vessels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  imo_code text unique,
  status text default 'active' check (status in ('active', 'maintenance', 'inactive', 'critical')),
  last_known_position jsonb,
  vessel_type text,
  flag text,
  built_year integer,
  gross_tonnage numeric,
  maintenance_status text default 'ok' check (maintenance_status in ('ok', 'scheduled', 'urgent', 'critical')),
  maintenance_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_vessels_status on vessels(status);
create index if not exists idx_vessels_imo_code on vessels(imo_code);
create index if not exists idx_vessels_maintenance_status on vessels(maintenance_status);

-- Enable Row Level Security
alter table vessels enable row level security;

-- Create policy for authenticated users
create policy "Allow authenticated users to read vessels"
  on vessels for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert vessels"
  on vessels for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update vessels"
  on vessels for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete vessels"
  on vessels for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_vessels_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger vessels_updated_at
  before update on vessels
  for each row
  execute function update_vessels_updated_at();

-- Insert sample data for testing
insert into vessels (name, imo_code, status, vessel_type, flag, built_year, gross_tonnage, last_known_position, maintenance_status)
values
  ('MV Atlantic Explorer', 'IMO9234567', 'active', 'Cargo Ship', 'USA', 2015, 45000, '{"lat": -22.9068, "lng": -43.1729, "course": 180, "speed": 12.5}'::jsonb, 'ok'),
  ('SS Pacific Navigator', 'IMO9345678', 'active', 'Container Ship', 'Panama', 2018, 67000, '{"lat": 40.7128, "lng": -74.0060, "course": 90, "speed": 15.3}'::jsonb, 'scheduled'),
  ('RV Ocean Discovery', 'IMO9456789', 'maintenance', 'Research Vessel', 'Brazil', 2012, 12000, '{"lat": -23.5505, "lng": -46.6333, "course": 0, "speed": 0}'::jsonb, 'urgent')
on conflict (imo_code) do nothing;
