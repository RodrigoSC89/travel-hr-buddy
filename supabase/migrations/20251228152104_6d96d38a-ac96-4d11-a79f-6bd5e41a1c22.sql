-- NAUTILUS ONE - SECURITY TABLES & RLS
-- Criar tabelas de roles primeiro, depois funções

-- 1. Schema para extensões
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'super_admin', 'hr', 'finance', 'auditor', 'manager', 'user', 'viewer')),
  organization_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role, organization_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Tabela user_organizations
CREATE TABLE IF NOT EXISTS public.user_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);

-- 5. Políticas básicas user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- 6. Políticas básicas user_organizations  
CREATE POLICY "Users can view own organizations" ON public.user_organizations FOR SELECT USING (user_id = auth.uid());