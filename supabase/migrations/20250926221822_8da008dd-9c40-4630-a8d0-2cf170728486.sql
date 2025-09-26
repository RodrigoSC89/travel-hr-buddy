-- ===========================
-- NAUTILUS ONE - ARQUITETURA SAAS MULTI-TENANT
-- ===========================

-- 1. ESTRUTURA DE TENANTS/ORGANIZAÇÕES
create table if not exists public.saas_tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'suspended', 'cancelled')),
  plan_type text not null default 'trial' check (plan_type in ('trial', 'starter', 'professional', 'enterprise')),
  
  -- Limites por plano
  max_users integer not null default 5,
  max_vessels integer not null default 2,
  max_storage_gb integer not null default 1,
  max_api_calls_per_month integer not null default 1000,
  
  -- Configurações de faturamento
  billing_email text,
  billing_cycle text default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  stripe_customer_id text,
  
  -- Datas importantes
  trial_ends_at timestamp with time zone,
  subscription_starts_at timestamp with time zone,
  subscription_ends_at timestamp with time zone,
  
  -- Configurações de domínio
  custom_domain text,
  subdomain text unique, -- Ex: empresa.nautilus.app
  
  -- Metadata
  metadata jsonb default '{}',
  features jsonb default '{}',
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. PERSONALIZAÇÃO WHITE LABEL POR TENANT
create table if not exists public.tenant_branding (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete cascade,
  
  -- Identidade visual
  company_name text not null,
  logo_url text,
  favicon_url text,
  
  -- Cores e tema
  primary_color text not null default '#2563eb',
  secondary_color text not null default '#64748b',
  accent_color text not null default '#7c3aed',
  background_color text default '#ffffff',
  text_color text default '#000000',
  theme_mode text not null default 'light' check (theme_mode in ('light', 'dark', 'auto')),
  
  -- Configurações regionais
  default_language text not null default 'pt-BR',
  default_currency text not null default 'BRL',
  timezone text not null default 'America/Sao_Paulo',
  date_format text not null default 'DD/MM/YYYY',
  
  -- Personalizações de UI
  header_style jsonb default '{}',
  sidebar_style jsonb default '{}',
  button_style jsonb default '{}',
  
  -- Configurações de módulos
  enabled_modules jsonb default '{}',
  module_settings jsonb default '{}',
  
  -- Campos personalizados
  custom_fields jsonb default '{}',
  
  -- Regras de negócio específicas
  business_rules jsonb default '{}',
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. USUÁRIOS E PERMISSÕES POR TENANT
create table if not exists public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Informações específicas do tenant
  role text not null default 'member' check (role in ('owner', 'admin', 'manager', 'operator', 'member', 'viewer')),
  status text not null default 'active' check (status in ('active', 'suspended', 'invited')),
  
  -- Configurações do usuário no tenant
  display_name text,
  avatar_url text,
  job_title text,
  department text,
  permissions jsonb default '{}',
  
  -- Datas de acesso
  invited_at timestamp with time zone,
  joined_at timestamp with time zone default now(),
  last_active_at timestamp with time zone default now(),
  
  -- Metadata
  metadata jsonb default '{}',
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(tenant_id, user_id)
);

-- 4. PLANOS E FUNCIONALIDADES
create table if not exists public.saas_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  
  -- Preços
  price_monthly decimal(10,2) not null default 0,
  price_yearly decimal(10,2) not null default 0,
  
  -- Limites
  max_users integer not null default 5,
  max_vessels integer not null default 2,
  max_storage_gb integer not null default 1,
  max_api_calls_per_month integer not null default 1000,
  
  -- Funcionalidades
  features jsonb default '{}',
  
  -- Status
  is_active boolean default true,
  is_popular boolean default false,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. BILLING E COBRANÇA
create table if not exists public.tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete cascade,
  plan_id uuid not null references public.saas_plans(id),
  
  -- Configurações da assinatura
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due', 'unpaid')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  
  -- Preços
  amount decimal(10,2) not null,
  currency text not null default 'BRL',
  
  -- Integração com pagamentos
  stripe_subscription_id text,
  
  -- Datas
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. MÉTRICAS E USAGE POR TENANT
create table if not exists public.tenant_usage (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete cascade,
  
  -- Período da métrica
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  
  -- Métricas de uso
  active_users integer default 0,
  total_logins integer default 0,
  storage_used_gb decimal(10,2) default 0,
  api_calls_made integer default 0,
  
  -- Métricas por módulo
  peotram_audits_created integer default 0,
  vessels_managed integer default 0,
  documents_processed integer default 0,
  reports_generated integer default 0,
  
  -- Metadata
  metadata jsonb default '{}',
  
  created_at timestamp with time zone default now()
);

-- 7. LOGS DE AUDITORIA POR TENANT
create table if not exists public.tenant_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete cascade,
  user_id uuid references auth.users(id),
  
  -- Ação realizada
  action text not null,
  resource_type text not null,
  resource_id uuid,
  
  -- Detalhes
  old_values jsonb,
  new_values jsonb,
  metadata jsonb default '{}',
  
  -- Contexto
  ip_address inet,
  user_agent text,
  
  created_at timestamp with time zone default now()
);

-- 8. CONFIGURAÇÕES DE DOMÍNIO PERSONALIZADO
create table if not exists public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.saas_tenants(id) on delete cascade,
  
  domain text not null unique,
  is_verified boolean default false,
  verification_token text,
  ssl_status text default 'pending' check (ssl_status in ('pending', 'active', 'error')),
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ===========================
-- TRIGGERS E FUNÇÕES
-- ===========================

-- Trigger para updated_at em todas as tabelas
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Aplicar triggers
create trigger set_saas_tenants_updated_at before update on public.saas_tenants for each row execute function public.set_updated_at();
create trigger set_tenant_branding_updated_at before update on public.tenant_branding for each row execute function public.set_updated_at();
create trigger set_tenant_users_updated_at before update on public.tenant_users for each row execute function public.set_updated_at();
create trigger set_saas_plans_updated_at before update on public.saas_plans for each row execute function public.set_updated_at();
create trigger set_tenant_subscriptions_updated_at before update on public.tenant_subscriptions for each row execute function public.set_updated_at();
create trigger set_tenant_domains_updated_at before update on public.tenant_domains for each row execute function public.set_updated_at();

-- ===========================
-- FUNÇÕES DE UTILIDADE
-- ===========================

-- Função para obter tenant atual do usuário
create or replace function public.get_current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id 
  from public.tenant_users 
  where user_id = auth.uid() 
  and status = 'active'
  order by joined_at desc
  limit 1;
$$;

-- Função para verificar se usuário pertence ao tenant
create or replace function public.user_belongs_to_tenant(tenant_uuid uuid, user_uuid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.tenant_users 
    where tenant_id = tenant_uuid 
    and user_id = user_uuid 
    and status = 'active'
  );
$$;

-- Função para verificar role no tenant
create or replace function public.get_user_tenant_role(tenant_uuid uuid, user_uuid uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role 
  from public.tenant_users 
  where tenant_id = tenant_uuid 
  and user_id = user_uuid 
  and status = 'active';
$$;

-- Função para verificar limites do plano
create or replace function public.check_tenant_limits(tenant_uuid uuid, limit_type text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  tenant_record public.saas_tenants%rowtype;
  current_count integer;
begin
  select * into tenant_record from public.saas_tenants where id = tenant_uuid;
  
  case limit_type
    when 'users' then
      select count(*) into current_count 
      from public.tenant_users 
      where tenant_id = tenant_uuid and status = 'active';
      return current_count < tenant_record.max_users;
      
    when 'vessels' then
      select count(*) into current_count 
      from public.vessels 
      where tenant_id = tenant_uuid;
      return current_count < tenant_record.max_vessels;
      
    when 'storage' then
      select coalesce(sum(storage_used_gb), 0) into current_count 
      from public.tenant_usage 
      where tenant_id = tenant_uuid;
      return current_count < tenant_record.max_storage_gb;
      
    else
      return false;
  end case;
end;
$$;

-- ===========================
-- DADOS INICIAIS
-- ===========================

-- Inserir planos padrão
insert into public.saas_plans (name, slug, description, price_monthly, price_yearly, max_users, max_vessels, max_storage_gb, max_api_calls_per_month, features, is_popular) values
('Gratuito', 'free', 'Ideal para pequenas embarcações e testes', 0, 0, 3, 1, 1, 500, '{"peotram": true, "basic_analytics": true}', false),
('Starter', 'starter', 'Para pequenas empresas marítimas', 99, 999, 10, 5, 5, 2000, '{"peotram": true, "fleet_management": true, "basic_analytics": true, "document_scanner": true}', false),
('Professional', 'professional', 'Para empresas em crescimento', 299, 2999, 25, 15, 25, 10000, '{"peotram": true, "fleet_management": true, "advanced_analytics": true, "document_scanner": true, "ai_analysis": true, "custom_reports": true}', true),
('Enterprise', 'enterprise', 'Para grandes corporações marítimas', 999, 9999, 100, 50, 100, 50000, '{"peotram": true, "fleet_management": true, "advanced_analytics": true, "document_scanner": true, "ai_analysis": true, "custom_reports": true, "white_label": true, "sso": true, "api_access": true, "priority_support": true}', false);

-- Inserir tenant demo
insert into public.saas_tenants (id, slug, name, description, status, plan_type, max_users, max_vessels, max_storage_gb, subdomain, features) values
('550e8400-e29b-41d4-a716-446655440000', 'nautilus-demo', 'Nautilus Demo Corporation', 'Empresa demonstrativa do sistema Nautilus One', 'active', 'enterprise', 100, 50, 100, 'demo', '{"peotram": true, "fleet_management": true, "advanced_analytics": true, "ai_analysis": true, "white_label": true}');

-- Inserir branding demo
insert into public.tenant_branding (tenant_id, company_name, primary_color, secondary_color, accent_color, enabled_modules, module_settings, business_rules) values
('550e8400-e29b-41d4-a716-446655440000', 'Nautilus One Demo', '#2563eb', '#64748b', '#7c3aed', '{"peotram": true, "fleet_management": true, "analytics": true, "hr": true, "ai_analysis": true}', '{"peotram": {"templates_enabled": true, "ai_analysis": true, "permissions_matrix": true}, "fleet": {"real_time_tracking": true}, "analytics": {"advanced_reports": true}}', '{"max_reservations_per_user": 10, "alert_frequency": "daily", "auto_backup": true}');

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================

-- Habilitar RLS em todas as tabelas
alter table public.saas_tenants enable row level security;
alter table public.tenant_branding enable row level security;
alter table public.tenant_users enable row level security;
alter table public.saas_plans enable row level security;
alter table public.tenant_subscriptions enable row level security;
alter table public.tenant_usage enable row level security;
alter table public.tenant_audit_logs enable row level security;
alter table public.tenant_domains enable row level security;

-- Políticas para saas_tenants
create policy "Users can view their own tenants" on public.saas_tenants
  for select using (
    id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Tenant owners can update their tenants" on public.saas_tenants
  for update using (
    id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and role = 'owner' and status = 'active'
    )
  );

-- Políticas para tenant_branding
create policy "Users can view their tenant branding" on public.tenant_branding
  for select using (
    tenant_id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Admins can manage tenant branding" on public.tenant_branding
  for all using (
    tenant_id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and role in ('owner', 'admin') and status = 'active'
    )
  );

-- Políticas para tenant_users
create policy "Users can view users from their tenants" on public.tenant_users
  for select using (
    tenant_id in (
      select tenant_id from public.tenant_users as tu 
      where tu.user_id = auth.uid() and tu.status = 'active'
    )
  );

create policy "Admins can manage tenant users" on public.tenant_users
  for all using (
    tenant_id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and role in ('owner', 'admin') and status = 'active'
    )
  );

-- Políticas para saas_plans (público, mas só leitura)
create policy "Everyone can view plans" on public.saas_plans
  for select using (is_active = true);

-- Políticas para tenant_subscriptions
create policy "Users can view their tenant subscriptions" on public.tenant_subscriptions
  for select using (
    tenant_id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and role in ('owner', 'admin') and status = 'active'
    )
  );

-- Políticas para tenant_usage
create policy "Admins can view tenant usage" on public.tenant_usage
  for select using (
    tenant_id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and role in ('owner', 'admin') and status = 'active'
    )
  );

-- Políticas para tenant_audit_logs
create policy "Admins can view tenant audit logs" on public.tenant_audit_logs
  for select using (
    tenant_id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and role in ('owner', 'admin') and status = 'active'
    )
  );

-- Políticas para tenant_domains
create policy "Admins can manage tenant domains" on public.tenant_domains
  for all using (
    tenant_id in (
      select tenant_id from public.tenant_users 
      where user_id = auth.uid() and role in ('owner', 'admin') and status = 'active'
    )
  );