-- Nautilus One - Incidents / Observability
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  severity text not null check (severity in ('info','warning','critical')),
  message text not null,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.incidents is 'Nautilus One - incident log (AI Insight Reporter + Edge Functions)';
comment on column public.incidents.module is 'Origin module: DPIntelligence, ControlHub, Forecast, etc.';
comment on column public.incidents.severity is 'info|warning|critical';

-- performance indexes
create index if not exists incidents_created_at_idx on public.incidents (created_at desc);
create index if not exists incidents_severity_idx on public.incidents (severity);
create index if not exists incidents_module_idx on public.incidents (module);

-- RLS
alter table public.incidents enable row level security;

do $$ begin
  create policy incidents_insert_service on public.incidents
    for insert to service_role using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy incidents_select_auth on public.incidents
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;
