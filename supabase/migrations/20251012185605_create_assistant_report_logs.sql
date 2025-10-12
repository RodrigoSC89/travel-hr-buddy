-- Create assistant_report_logs table to track send-assistant-report email sending attempts
create table if not exists assistant_report_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_email text,
  status text not null check (status in ('success', 'error')),
  sent_at timestamptz default now(),
  message text
);

-- Add indexes for better query performance
create index if not exists idx_assistant_report_logs_user_id on assistant_report_logs(user_id);
create index if not exists idx_assistant_report_logs_sent_at on assistant_report_logs(sent_at desc);
create index if not exists idx_assistant_report_logs_status on assistant_report_logs(status);

-- Add RLS policies for security
alter table assistant_report_logs enable row level security;

-- Allow authenticated users to insert their own logs
create policy "Users can insert their own logs" on assistant_report_logs
  for insert
  with check (auth.uid() = user_id);

-- Allow users to view their own logs
create policy "Users can view their own logs" on assistant_report_logs
  for select
  using (auth.uid() = user_id);

-- Allow admin users to view all logs
create policy "Admin users can view all logs" on assistant_report_logs
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
