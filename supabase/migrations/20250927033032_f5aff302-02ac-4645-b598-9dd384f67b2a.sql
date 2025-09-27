-- Corrigir políticas RLS com recursão infinita usando funções de segurança

-- Criar função de segurança para verificar se o usuário pertence a uma organização
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.user_id = _user_id
    AND ou.organization_id = _org_id
    AND ou.status = 'active'
  );
$$;

-- Criar função de segurança para verificar se o usuário é admin de uma organização
CREATE OR REPLACE FUNCTION public.user_is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_users ou
    WHERE ou.user_id = _user_id
    AND ou.organization_id = _org_id
    AND ou.role IN ('admin', 'owner')
    AND ou.status = 'active'
  );
$$;

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organization_users;
DROP POLICY IF EXISTS "Users can update their organization membership" ON organization_users;
DROP POLICY IF EXISTS "Admins can manage organization memberships" ON organization_users;
DROP POLICY IF EXISTS "Organization admins can view all memberships" ON organization_users;
DROP POLICY IF EXISTS "Organization admins can manage memberships" ON organization_users;

-- Recriar políticas simples para organization_users
CREATE POLICY "Users can view their own organization memberships"
ON organization_users
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organization memberships"
ON organization_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Para tenant_users - usar abordagem similar
DROP POLICY IF EXISTS "Users can view their tenant associations" ON tenant_users;
DROP POLICY IF EXISTS "Users can update their tenant association" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can manage tenant users" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can view all tenant users" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can manage tenant users" ON tenant_users;

CREATE POLICY "Users can view their own tenant associations"
ON tenant_users
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tenant associations"
ON tenant_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);