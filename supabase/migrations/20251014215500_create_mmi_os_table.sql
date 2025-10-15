-- Create mmi_os table for Maintenance Work Orders
-- This table stores work orders (OS - Ordem de Serviço) linked to maintenance jobs

create table if not exists mmi_os (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references mmi_jobs(id) on delete cascade,
  opened_by uuid references auth.users(id),
  status text default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  notes text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table mmi_os enable row level security;

-- Policy: Users can view all work orders
create policy "Users can view all mmi_os"
  on mmi_os for select
  using (true);

-- Policy: Authenticated users can insert work orders
create policy "Authenticated users can insert mmi_os"
  on mmi_os for insert
  to authenticated
  with check (true);

-- Policy: Users can update their own work orders
create policy "Users can update their own mmi_os"
  on mmi_os for update
  using (auth.uid() = opened_by);

-- Create indexes for faster lookups
create index if not exists idx_mmi_os_job_id on mmi_os(job_id);
create index if not exists idx_mmi_os_opened_by on mmi_os(opened_by);
create index if not exists idx_mmi_os_status on mmi_os(status);
create index if not exists idx_mmi_os_created_at on mmi_os(created_at desc);

-- Create updated_at trigger
create or replace function update_mmi_os_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_mmi_os_updated_at
  before update on mmi_os
  for each row
  execute function update_mmi_os_updated_at();
