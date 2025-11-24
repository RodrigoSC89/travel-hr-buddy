-- Migration: ensure navigation, workflow, and feature tables exist for Lovable fixes
-- Date: 2025-02-07

-- MODULES -------------------------------------------------------------------
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null,
  status text not null check (status in ('functional', 'pending', 'disabled')),
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists modules_path_unique_idx on public.modules (path);
create index if not exists modules_status_idx on public.modules (status);
create index if not exists modules_name_idx on public.modules (name);

alter table public.modules enable row level security;
create policy if not exists "modules_read_all"
  on public.modules
  for select
  using (true);

create policy if not exists "modules_admin_insert"
  on public.modules
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hr_manager')
    )
  );

create policy if not exists "modules_admin_update"
  on public.modules
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hr_manager')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hr_manager')
    )
  );

create policy if not exists "modules_admin_delete"
  on public.modules
  for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hr_manager')
    )
  );

drop trigger if exists update_modules_updated_at on public.modules;
create trigger update_modules_updated_at
  before update on public.modules
  for each row
  execute function public.update_updated_at_column();

insert into public.modules (name, path, status, description)
values
  ('Dashboard', '/dashboard', 'functional', 'Painel principal de controle'),
  ('Sistema Marítimo', '/maritime', 'functional', 'Gestão de frotas e embarcações'),
  ('IA e Inovação', '/innovation', 'functional', 'Centro de IA e inovação'),
  ('Portal Funcionário', '/portal', 'functional', 'Portal de auto-atendimento'),
  ('Viagens', '/travel', 'functional', 'Gestão de viagens'),
  ('Alertas de Preços', '/price-alerts', 'functional', 'Monitoramento de preços'),
  ('Hub Integrações', '/intelligence', 'functional', 'Hub de integrações e APIs'),
  ('Reservas', '/reservations', 'functional', 'Sistema de reservas e booking'),
  ('Comunicação', '/communication', 'functional', 'Centro de comunicação'),
  ('Configurações', '/settings', 'functional', 'Configurações do sistema'),
  ('Otimização', '/optimization', 'functional', 'Otimização de performance'),
  ('Assistente de Voz', '/voice', 'functional', 'Assistente de voz'),
  ('Centro Notificações', '/notifications', 'pending', 'Centro de notificações'),
  ('Monitor Sistema', '/health-monitor', 'functional', 'Monitoramento do sistema'),
  ('Documentos', '/documents', 'pending', 'Gestão de documentos'),
  ('Colaboração', '/collaboration', 'functional', 'Ferramentas de colaboração'),
  ('Otimização Mobile', '/mobile', 'pending', 'Otimização mobile'),
  ('Checklists Inteligentes', '/checklists', 'functional', 'Checklists inteligentes'),
  ('PEOTRAM', '/peotram', 'functional', 'Excelência operacional'),
  ('PEO-DP', '/peo-dp', 'functional', 'Gestão de RH e pessoal'),
  ('SGSO', '/sgso', 'functional', 'Sistema de gestão de saúde e segurança'),
  ('Templates', '/templates', 'pending', 'Gestão de templates'),
  ('Analytics Avançado', '/analytics', 'functional', 'Analytics avançado'),
  ('Analytics Tempo Real', '/realtime', 'pending', 'Analytics em tempo real'),
  ('Monitor Avançado', '/system-monitor', 'pending', 'Monitoramento avançado'),
  ('Documentos IA', '/documents-ai', 'pending', 'Processamento de documentos com IA'),
  ('Assistente IA', '/ai-assistant', 'pending', 'Assistente inteligente'),
  ('Business Intelligence', '/bi', 'pending', 'Business Intelligence'),
  ('Smart Workflow', '/workflow', 'pending', 'Automação de workflows'),
  ('Centro de Ajuda', '/help', 'pending', 'Centro de ajuda'),
  ('Automação IA', '/automation', 'pending', 'Automação com IA'),
  ('Visão Geral', '/overview', 'pending', 'Visão geral executiva')
on conflict (path) do update set
  name = excluded.name,
  status = excluded.status,
  description = excluded.description,
  updated_at = now();

-- MODULE ACCESS LOG ---------------------------------------------------------
create table if not exists public.module_access_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  module_name text not null,
  accessed_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists module_access_log_user_id_idx on public.module_access_log (user_id);
create index if not exists module_access_log_accessed_at_idx on public.module_access_log (accessed_at);

alter table public.module_access_log enable row level security;
create policy if not exists "module_access_log_owner"
  on public.module_access_log
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- NAVIGATION HISTORY --------------------------------------------------------
create table if not exists public.navigation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  from_path text not null,
  to_path text not null,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists navigation_history_user_idx on public.navigation_history (user_id);
create index if not exists navigation_history_timestamp_idx on public.navigation_history (timestamp);

alter table public.navigation_history enable row level security;
create policy if not exists "navigation_history_owner"
  on public.navigation_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- FEATURE FLAGS -------------------------------------------------------------
create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  description text,
  enabled boolean not null default false,
  user_id uuid references auth.users (id) on delete cascade,
  tenant_id uuid references public.organizations (id) on delete cascade,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists feature_flags_scope_unique_idx
  on public.feature_flags (key, coalesce(user_id::text, ''), coalesce(tenant_id::text, ''));
create index if not exists feature_flags_key_idx on public.feature_flags (key);

alter table public.feature_flags enable row level security;
create policy if not exists "feature_flags_read"
  on public.feature_flags
  for select
  using (auth.uid() is not null);

create policy if not exists "feature_flags_service_write"
  on public.feature_flags
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- WORKFLOW AI SUGGESTIONS ---------------------------------------------------
create table if not exists public.workflow_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  workflow_id text,
  etapa text not null,
  tipo_sugestao text,
  conteudo text,
  criticidade text,
  responsavel_sugerido text,
  origem text default 'Copilot',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists workflow_ai_suggestions_workflow_idx on public.workflow_ai_suggestions (workflow_id);
create index if not exists workflow_ai_suggestions_created_by_idx on public.workflow_ai_suggestions (created_by);

alter table public.workflow_ai_suggestions enable row level security;
create policy if not exists "workflow_ai_suggestions_read"
  on public.workflow_ai_suggestions
  for select
  using (auth.uid() is not null);

create policy if not exists "workflow_ai_suggestions_insert"
  on public.workflow_ai_suggestions
  for insert
  with check (auth.uid() is not null);

-- SMART WORKFLOW STEPS ------------------------------------------------------
create table if not exists public.smart_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id text not null,
  title text not null,
  description text,
  status text default 'pendente',
  priority text,
  assigned_to uuid references auth.users (id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists smart_workflow_steps_workflow_idx on public.smart_workflow_steps (workflow_id);
create index if not exists smart_workflow_steps_assigned_idx on public.smart_workflow_steps (assigned_to);

alter table public.smart_workflow_steps enable row level security;
create policy if not exists "smart_workflow_steps_read"
  on public.smart_workflow_steps
  for select
  using (auth.uid() is not null);

create policy if not exists "smart_workflow_steps_insert"
  on public.smart_workflow_steps
  for insert
  with check (auth.uid() is not null);
