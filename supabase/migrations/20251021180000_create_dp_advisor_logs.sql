-- Create table for DP Advisor logs
-- This table stores AI-powered recommendations for Dynamic Positioning optimization
create table if not exists dp_advisor_logs (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null default now(),
  level text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Add index for faster queries by timestamp
create index if not exists idx_dp_advisor_logs_timestamp on dp_advisor_logs(timestamp desc);

-- Add index for filtering by level
create index if not exists idx_dp_advisor_logs_level on dp_advisor_logs(level);

-- Enable Row Level Security
alter table dp_advisor_logs enable row level security;

-- Policy: Allow authenticated users to read all logs
create policy "Allow authenticated users to read dp_advisor_logs"
  on dp_advisor_logs
  for select
  using (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert logs
create policy "Allow authenticated users to insert dp_advisor_logs"
  on dp_advisor_logs
  for insert
  with check (auth.role() = 'authenticated');

-- Add comment to table
comment on table dp_advisor_logs is 'Logs of AI-powered DP optimization recommendations (Patch 20)';
