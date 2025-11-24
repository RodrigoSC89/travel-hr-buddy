-- Migration: create crew_profiles compatibility table used by legacy hooks
-- Date: 2025-11-23

create table if not exists public.crew_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  vessel_id uuid references public.vessels (id) on delete set null,
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crew_profiles_organization_idx on public.crew_profiles (organization_id);
create index if not exists crew_profiles_vessel_idx on public.crew_profiles (vessel_id);

alter table public.crew_profiles enable row level security;
create policy if not exists "crew_profiles_read"
  on public.crew_profiles
  for select
  using (auth.uid() is not null);

create policy if not exists "crew_profiles_write"
  on public.crew_profiles
  for insert
  with check (auth.uid() is not null);

-- Keep compatibility: no sensitive data stored here; it's a lightweight alias table for legacy modules
