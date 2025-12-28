-- =====================================================
-- SECURITY FIX FINAL: Funções e Políticas RLS
-- =====================================================

-- 1. Criar função has_role compatível com enum user_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Criar função is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::user_role, 'hr_manager'::user_role)
  )
$$;

-- 3. Criar função is_hr
CREATE OR REPLACE FUNCTION public.is_hr(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::user_role, 'hr_manager'::user_role, 'hr_analyst'::user_role)
  )
$$;

-- 4. Corrigir update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- =====================================================
-- POLÍTICAS RLS SEGURAS
-- =====================================================

-- user_roles policies
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- profiles policies (seguras)
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- crew_payroll policies (seguras)
CREATE POLICY "payroll_select_own" ON public.crew_payroll
  FOR SELECT USING (auth.uid()::text = crew_member_id::text);

CREATE POLICY "payroll_admin_all" ON public.crew_payroll
  FOR ALL USING (public.is_hr(auth.uid()));

-- ai_audit_logs policies (apenas admin pode ver)
CREATE POLICY "ai_audit_select_admin" ON public.ai_audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "ai_audit_insert_authenticated" ON public.ai_audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);