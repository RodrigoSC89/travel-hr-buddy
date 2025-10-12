-- Create assistant_logs table to track AI assistant interactions
create table if not exists assistant_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  origin text default 'assistant',
  created_at timestamptz default now()
);

-- Add indexes for better query performance
create index if not exists idx_assistant_logs_user_id on assistant_logs(user_id);
create index if not exists idx_assistant_logs_created_at on assistant_logs(created_at desc);
create index if not exists idx_assistant_logs_origin on assistant_logs(origin);

-- Add RLS policies for security
alter table assistant_logs enable row level security;

-- Allow authenticated users to insert their own logs
create policy "Users can insert their own logs" on assistant_logs
  for insert
  with check (auth.uid() = user_id);

-- Allow authenticated users to view their own logs
create policy "Users can view their own logs" on assistant_logs
  for select
  using (auth.uid() = user_id);

-- Allow admin users to view all logs
create policy "Admin users can view all logs" on assistant_logs
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
