-- ✅ Migration: Create MMI (Machinery Maintenance Intelligence) Tables
-- Tables for component hour tracking and simulation

-- Table: mmi_components
-- Stores component information and current hour metrics
create table if not exists mmi_components (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  component_type text,
  last_hours int default 0,
  expected_daily int default 8,
  status text default 'active' check (status in ('active', 'inactive', 'maintenance')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table: mmi_hours
-- Stores historical hour consumption logs for each component
create table if not exists mmi_hours (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references mmi_components(id) on delete cascade,
  added_hours int not null,
  total_hours int not null,
  timestamp timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists idx_mmi_components_status on mmi_components(status);
create index if not exists idx_mmi_hours_component_id on mmi_hours(component_id);
create index if not exists idx_mmi_hours_timestamp on mmi_hours(timestamp);

-- Enable Row Level Security
alter table mmi_components enable row level security;
alter table mmi_hours enable row level security;

-- RLS Policies for mmi_components
-- Allow service role full access
create policy "Service role can manage components"
  on mmi_components
  for all
  using (auth.role() = 'service_role');

-- Allow authenticated users to read
create policy "Authenticated users can read components"
  on mmi_components
  for select
  using (auth.role() = 'authenticated');

-- RLS Policies for mmi_hours
-- Allow service role full access
create policy "Service role can manage hours"
  on mmi_hours
  for all
  using (auth.role() = 'service_role');

-- Allow authenticated users to read
create policy "Authenticated users can read hours"
  on mmi_hours
  for select
  using (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
create or replace function update_mmi_components_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_mmi_components_updated_at
  before update on mmi_components
  for each row
  execute function update_mmi_components_updated_at();
