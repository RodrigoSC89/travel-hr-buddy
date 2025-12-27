-- ============================================
-- PATCH SECURITY-FINAL: Correções de Segurança P0
-- ============================================

-- 1. Criar schema seguro para extensões
CREATE SCHEMA IF NOT EXISTS extensions_secure;

-- 2. Mover extensão uuid-ossp para schema seguro (se existir no public)
-- Nota: Extensões não podem ser movidas diretamente, mas podemos garantir que novas instalações usem o schema correto

-- 3. Corrigir políticas RLS da tabela profiles - MAIS RESTRITIVAS
-- Primeiro, remover políticas antigas permissivas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Criar políticas RLS mais restritivas para profiles
-- Usuários só podem ver SEU PRÓPRIO perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuários só podem atualizar SEU PRÓPRIO perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usuários só podem inserir SEU PRÓPRIO perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Corrigir políticas RLS da tabela crew_payroll - ACESSO RESTRITO
DROP POLICY IF EXISTS "Crew members can view their own payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "Finance can view all payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "HR can manage payroll" ON public.crew_payroll;

-- Apenas o próprio tripulante pode ver seu salário (sem detalhes bancários sensíveis)
CREATE POLICY "crew_payroll_select_own" ON public.crew_payroll
  FOR SELECT USING (
    crew_member_id IN (
      SELECT id FROM public.crew_members WHERE user_id = auth.uid()
    )
  );

-- 5. Corrigir políticas RLS da tabela ai_audit_logs - APENAS ADMINS
DROP POLICY IF EXISTS "Organization members can view AI logs" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "Users can view their own AI logs" ON public.ai_audit_logs;

-- Usuários só podem ver SEUS PRÓPRIOS logs de IA
CREATE POLICY "ai_audit_logs_select_own" ON public.ai_audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Usuários podem inserir logs (para tracking)
CREATE POLICY "ai_audit_logs_insert" ON public.ai_audit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6. Criar função segura com search_path definido
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas retorna dados não-sensíveis
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.role
  FROM profiles p
  WHERE p.id = user_uuid
  AND (
    p.id = auth.uid() -- Próprio usuário
  );
END;
$$;

-- 7. Função para verificar role com search_path seguro
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role::TEXT = check_role
  );
END;
$$;

-- 8. Função para obter organização do usuário com search_path seguro
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN org_id;
END;
$$;