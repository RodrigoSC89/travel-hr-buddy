-- Create restore_report_logs table to track daily restore report executions
create table if not exists restore_report_logs (
  id uuid primary key default gen_random_uuid(),
  executed_at timestamptz default now(),
  status text not null check (status in ('success', 'error', 'pending')),
  message text,
  error_details text,
  triggered_by text default 'automated'
);

-- Add index for better query performance
create index if not exists idx_restore_report_logs_executed_at on restore_report_logs(executed_at desc);
create index if not exists idx_restore_report_logs_status on restore_report_logs(status);

-- Add RLS policies for security
alter table restore_report_logs enable row level security;

-- Allow service role to insert logs
create policy "Service role can insert logs" on restore_report_logs
  for insert
  with check (true);

-- Allow authenticated users with admin role to view logs
create policy "Admin users can view logs" on restore_report_logs
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
