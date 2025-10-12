-- Create cron_execution_logs table to track automated function executions
-- This table tracks when automated cron jobs execute and their success/failure status

create table if not exists cron_execution_logs (
  id uuid primary key default gen_random_uuid(),
  function_name text not null,
  status text not null check (status in ('success', 'error', 'warning')),
  message text,
  executed_at timestamptz default now()
);

-- Add indexes for better query performance
create index if not exists idx_cron_execution_logs_executed_at on cron_execution_logs(executed_at desc);
create index if not exists idx_cron_execution_logs_function_name on cron_execution_logs(function_name);
create index if not exists idx_cron_execution_logs_status on cron_execution_logs(status);

-- Add RLS policies for security
alter table cron_execution_logs enable row level security;

-- Allow service role to insert logs
create policy "Service role can insert cron logs" on cron_execution_logs
  for insert
  with check (true);

-- Allow authenticated users with admin role to view logs
create policy "Admin users can view cron logs" on cron_execution_logs
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
