-- =====================================================
-- SECURITY: Create role check functions using existing user_role type
-- =====================================================

-- Function to check if user has admin or HR role
CREATE OR REPLACE FUNCTION public.is_admin_or_hr(_user_id uuid)
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
      AND role IN ('admin'::user_role, 'hr_manager'::user_role, 'hr_analyst'::user_role)
  )
$$;

-- Function to check if user has finance access (admin, HR, manager)
CREATE OR REPLACE FUNCTION public.has_finance_access(_user_id uuid)
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
      AND role IN ('admin'::user_role, 'hr_manager'::user_role, 'manager'::user_role, 'department_manager'::user_role)
  )
$$;

-- Generic has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
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
      AND role = _role
  )
$$;

-- =====================================================
-- SECURITY: Update profiles RLS - users see own OR admin/HR see all
-- =====================================================

DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_secure_select" ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR public.is_admin_or_hr(auth.uid())
);

-- =====================================================
-- SECURITY: Update crew_payroll RLS - own records + Finance
-- =====================================================

DROP POLICY IF EXISTS "crew_payroll_secure_select" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_select_policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "Crew can view own payroll" ON public.crew_payroll;

CREATE POLICY "crew_payroll_secure_select" ON public.crew_payroll
FOR SELECT
TO authenticated
USING (
  crew_member_id::text = auth.uid()::text
  OR public.has_finance_access(auth.uid())
);

-- =====================================================
-- SECURITY: Update ai_audit_logs RLS - admins only
-- =====================================================

DROP POLICY IF EXISTS "ai_audit_logs_admin_only" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_logs_select_policy" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "Organization members can view AI logs" ON public.ai_audit_logs;

CREATE POLICY "ai_audit_logs_admin_only" ON public.ai_audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- =====================================================
-- FIX: Set search_path on update function
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;