-- Create maintenance_logs table for AI Maintenance Orchestrator
-- This table stores predictive maintenance alerts and risk classifications

create table if not exists maintenance_logs (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null default now(),
  level text not null check (level in ('Normal', 'Atenção', 'Crítico')),
  message text not null,
  created_at timestamptz not null default now()
);

-- Add index for faster queries by timestamp
create index if not exists idx_maintenance_logs_timestamp on maintenance_logs(timestamp desc);

-- Add index for filtering by level
create index if not exists idx_maintenance_logs_level on maintenance_logs(level);

-- Enable Row Level Security (RLS)
alter table maintenance_logs enable row level security;

-- Create policy to allow authenticated users to read maintenance logs
create policy "Allow authenticated users to read maintenance logs"
  on maintenance_logs
  for select
  to authenticated
  using (true);

-- Create policy to allow service role to insert maintenance logs
create policy "Allow service role to insert maintenance logs"
  on maintenance_logs
  for insert
  to authenticated
  with check (true);

-- Add comment to table
comment on table maintenance_logs is 'Stores AI-generated predictive maintenance alerts and risk classifications for the Nautilus One system. Compliant with IMCA M109, M140, M254, ISM Code, and NORMAM 101.';
