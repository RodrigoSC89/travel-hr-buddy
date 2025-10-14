-- Create mmi_jobs table for Intelligent Maintenance Module
-- This table stores maintenance jobs for maritime equipment

create table if not exists mmi_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  component text not null,
  usage_hours integer not null default 0,
  avg_usage integer not null default 0,
  stock boolean default true,
  mission_active boolean default false,
  history text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table mmi_jobs enable row level security;

-- Policy: Users can view all jobs
create policy "Users can view all mmi_jobs"
  on mmi_jobs for select
  using (true);

-- Policy: Authenticated users can insert jobs
create policy "Authenticated users can insert mmi_jobs"
  on mmi_jobs for insert
  to authenticated
  with check (true);

-- Policy: Users can update their own jobs
create policy "Users can update their own mmi_jobs"
  on mmi_jobs for update
  using (auth.uid() = created_by);

-- Create index for faster lookups
create index if not exists idx_mmi_jobs_created_by on mmi_jobs(created_by);
create index if not exists idx_mmi_jobs_created_at on mmi_jobs(created_at desc);

-- Create updated_at trigger
create or replace function update_mmi_jobs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_mmi_jobs_updated_at
  before update on mmi_jobs
  for each row
  execute function update_mmi_jobs_updated_at();
