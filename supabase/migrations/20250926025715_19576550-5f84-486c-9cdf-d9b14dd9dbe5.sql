-- =====================================
-- SISTEMA MULTI-TENANT NAUTILUS ONE SaaS - CORRIGIDO
-- =====================================

-- 1. TABELA DE ORGANIZAÇÕES (TENANTS)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- para subdomínios (ex: empresa-x)
    domain TEXT UNIQUE, -- domínio personalizado opcional
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'expired')),
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'professional', 'enterprise')),
    
    -- Configurações do plano
    max_users INTEGER DEFAULT 5,
    max_vessels INTEGER DEFAULT 2,
    max_storage_gb INTEGER DEFAULT 1,
    features JSONB DEFAULT '{"basic": true}'::jsonb,
    
    -- Datas importantes
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Responsável/Admin principal
    owner_id UUID,
    
    -- Configurações comerciais
    billing_email TEXT,
    stripe_customer_id TEXT,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. CONFIGURAÇÕES WHITE LABEL
CREATE TABLE public.organization_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Visual
    company_name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1e40af',
    secondary_color TEXT DEFAULT '#3b82f6',
    accent_color TEXT DEFAULT '#06b6d4',
    theme_mode TEXT DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark', 'auto')),
    
    -- Localização
    default_language TEXT DEFAULT 'pt-BR',
    default_currency TEXT DEFAULT 'BRL',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    
    -- Personalizações
    custom_fields JSONB DEFAULT '{}'::jsonb,
    business_rules JSONB DEFAULT '{}'::jsonb,
    
    -- Configurações de módulos
    enabled_modules JSONB DEFAULT '["fleet", "crew", "certificates", "analytics"]'::jsonb,
    module_settings JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(organization_id)
);

-- 3. TABELA DE USUÁRIOS ORGANIZACIONAIS
CREATE TABLE public.organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Papel dentro da organização
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'operator', 'member', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    
    -- Permissões específicas
    permissions JSONB DEFAULT '{}'::jsonb,
    departments TEXT[],
    
    -- Metadados
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(organization_id, user_id)
);

-- 4. LOGS DE AUDITORIA POR TENANT
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Ação realizada
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    
    -- Detalhes
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. MÉTRICAS DE USO POR ORGANIZAÇÃO
CREATE TABLE public.organization_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Data da métrica
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Contadores
    active_users INTEGER DEFAULT 0,
    total_vessels INTEGER DEFAULT 0,
    storage_used_gb NUMERIC DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    
    -- Uso por módulo
    module_usage JSONB DEFAULT '{}'::jsonb,
    
    -- Métricas específicas
    logins_count INTEGER DEFAULT 0,
    documents_processed INTEGER DEFAULT 0,
    alerts_generated INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(organization_id, metric_date)
);

-- 6. COBRANÇA E FATURAS
CREATE TABLE public.organization_billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Período de cobrança
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    
    -- Valores
    base_amount NUMERIC NOT NULL DEFAULT 0,
    usage_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    
    -- Integração de pagamento
    stripe_invoice_id TEXT,
    payment_method TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Detalhes
    line_items JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================
-- FUNÇÕES DE SUPORTE MULTI-TENANT
-- =====================================

-- Função para obter a organização do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_organization_id()
RETURNS UUID AS $$
  SELECT organization_id 
  FROM public.organization_users 
  WHERE user_id = auth.uid() 
  AND status = 'active'
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Função para verificar se usuário pertence à organização
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(org_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.organization_users 
    WHERE organization_id = org_id 
    AND user_id = user_uuid 
    AND status = 'active'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Função para verificar papel do usuário na organização
CREATE OR REPLACE FUNCTION public.get_user_organization_role(org_id UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
  SELECT role 
  FROM public.organization_users 
  WHERE organization_id = org_id 
  AND user_id = user_uuid 
  AND status = 'active';
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Função para verificar limites do plano
CREATE OR REPLACE FUNCTION public.check_organization_limits(org_id UUID, limit_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  org_record public.organizations%ROWTYPE;
  current_count INTEGER;
BEGIN
  SELECT * INTO org_record FROM public.organizations WHERE id = org_id;
  
  CASE limit_type
    WHEN 'users' THEN
      SELECT COUNT(*) INTO current_count 
      FROM public.organization_users 
      WHERE organization_id = org_id AND status = 'active';
      RETURN current_count < org_record.max_users;
      
    WHEN 'vessels' THEN
      SELECT COUNT(*) INTO current_count 
      FROM public.vessels 
      WHERE organization_id = org_id;
      RETURN current_count < org_record.max_vessels;
      
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================
-- ATUALIZAÇÃO DAS TABELAS EXISTENTES
-- =====================================

-- Adicionar organization_id às tabelas principais
ALTER TABLE public.vessels ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.crew_members ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.price_alerts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- =====================================
-- TRIGGERS E AUTOMAÇÕES
-- =====================================

-- Trigger para criar branding padrão
CREATE OR REPLACE FUNCTION public.create_default_branding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_branding (organization_id, company_name)
  VALUES (NEW.id, NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_branding_trigger
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_default_branding();

-- =====================================
-- POLÍTICAS RLS MULTI-TENANT
-- =====================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_billing ENABLE ROW LEVEL SECURITY;

-- Políticas para organizations
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Organization owners can update" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Políticas para organization_branding
CREATE POLICY "Users can view their organization branding" ON public.organization_branding
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Admins can update organization branding" ON public.organization_branding
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Políticas para organization_users
CREATE POLICY "Users can view organization members" ON public.organization_users
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM public.organization_users WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "Admins can manage organization users" ON public.organization_users
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Políticas para audit_logs
CREATE POLICY "Users can view organization audit logs" ON public.audit_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- =====================================
-- DADOS INICIAIS DE EXEMPLO
-- =====================================

-- Inserir organização de exemplo
INSERT INTO public.organizations (id, name, slug, status, plan_type, max_users, max_vessels, owner_id)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Blue Shipping',
  'blue-shipping',
  'active',
  'professional',
  50,
  10,
  NULL
);

INSERT INTO public.organizations (id, name, slug, status, plan_type, max_users, max_vessels, owner_id)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'Porto Max',
  'porto-max',
  'trial',
  'enterprise',
  100,
  25,
  NULL
);