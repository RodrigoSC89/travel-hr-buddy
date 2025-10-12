-- Create report_email_logs table to track email report sendings
create table if not exists report_email_logs (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz default now(),
  status text not null,
  message text
);

-- Add index for better query performance
create index if not exists idx_report_email_logs_sent_at on report_email_logs(sent_at desc);
create index if not exists idx_report_email_logs_status on report_email_logs(status);

-- Add RLS policies for security
alter table report_email_logs enable row level security;

-- Allow service role to insert logs
create policy "Service role can insert email logs" on report_email_logs
  for insert
  with check (true);

-- Allow authenticated users with admin role to view logs
create policy "Admin users can view email logs" on report_email_logs
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
