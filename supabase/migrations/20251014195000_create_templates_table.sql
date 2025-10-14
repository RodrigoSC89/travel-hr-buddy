-- Create templates table for AI-powered template management
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  is_favorite boolean default false,
  is_private boolean default false,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.templates enable row level security;

-- Policy: Users can view public templates or their own templates
create policy "Users can view public templates or own templates"
  on public.templates for select
  using (
    is_private = false 
    or created_by = auth.uid()
  );

-- Policy: Users can insert their own templates
create policy "Users can insert own templates"
  on public.templates for insert
  with check (created_by = auth.uid());

-- Policy: Users can update their own templates
create policy "Users can update own templates"
  on public.templates for update
  using (created_by = auth.uid());

-- Policy: Users can delete their own templates
create policy "Users can delete own templates"
  on public.templates for delete
  using (created_by = auth.uid());

-- Create index for faster queries
create index if not exists templates_created_by_idx on public.templates(created_by);
create index if not exists templates_is_favorite_idx on public.templates(is_favorite);
create index if not exists templates_is_private_idx on public.templates(is_private);
create index if not exists templates_created_at_idx on public.templates(created_at desc);

-- Add trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger templates_updated_at
  before update on public.templates
  for each row
  execute function public.handle_updated_at();
