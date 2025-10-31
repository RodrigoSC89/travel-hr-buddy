-- PATCH 540: Correção de RLS Recursivo e Proteção de Tabelas (FIXED)
-- Fix para políticas RLS que causam recursão infinita

-- 1. Criar função SECURITY DEFINER para verificar roles (com cast correto)
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- 2. Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin', 'super_admin')
  )
$$;

-- 3. Criar função para verificar tenant do usuário
CREATE OR REPLACE FUNCTION public.user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.tenant_users
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 4. Habilitar RLS em tabelas sem proteção
ALTER TABLE IF EXISTS system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_logs ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas seguras para system_logs (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'system_logs') THEN
    DROP POLICY IF EXISTS "admin_only_logs" ON system_logs;
    CREATE POLICY "admin_only_logs" ON system_logs
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 6. Criar políticas seguras para audit_trail (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_trail') THEN
    DROP POLICY IF EXISTS "admin_only_audit" ON audit_trail;
    CREATE POLICY "admin_only_audit" ON audit_trail
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 7. Criar políticas seguras para performance_metrics (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'performance_metrics') THEN
    DROP POLICY IF EXISTS "admin_only_metrics" ON performance_metrics;
    CREATE POLICY "admin_only_metrics" ON performance_metrics
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 8. Criar políticas seguras para ai_logs (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_logs') THEN
    DROP POLICY IF EXISTS "admin_only_ai_logs" ON ai_logs;
    CREATE POLICY "admin_only_ai_logs" ON ai_logs
    FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 9. Comentários para documentação
COMMENT ON FUNCTION public.user_has_role IS 'PATCH 540: Security definer function to check user roles without RLS recursion';
COMMENT ON FUNCTION public.is_admin IS 'PATCH 540: Security definer function to check admin status';
COMMENT ON FUNCTION public.user_tenant_id IS 'PATCH 540: Security definer function to get user tenant without recursion';