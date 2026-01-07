-- =====================================================
-- RLS HARDENING MIGRATION v3.2.1
-- Security functions + Policies for sensitive tables
-- =====================================================

-- 1. Drop existing permissive policies on sensitive tables
DROP POLICY IF EXISTS "ai_audit_logs_admin_only" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_self_healing_logs_admin_only" ON public.ai_self_healing_logs;
DROP POLICY IF EXISTS "access_logs_admin_only" ON public.access_logs;
DROP POLICY IF EXISTS "backup_logs_admin_only" ON public.backup_logs;
DROP POLICY IF EXISTS "crew_payroll_secure_select" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_secure_insert" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_secure_update" ON public.crew_payroll;

-- 2. Create/Replace security definer functions
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_hr(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin', 'hr_manager', 'hr_analyst')
  )
$$;

CREATE OR REPLACE FUNCTION public.has_finance_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin', 'hr_manager', 'manager', 'department_manager')
  )
$$;

-- 3. AI Audit Logs - Admin/HR only
CREATE POLICY "ai_audit_logs_admin_only" ON public.ai_audit_logs
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- 4. AI Self Healing Logs - Admin only
CREATE POLICY "ai_self_healing_logs_admin_only" ON public.ai_self_healing_logs
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

-- 5. Access Logs - Admin only
CREATE POLICY "access_logs_admin_only" ON public.access_logs
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

-- 6. Crew Payroll - Own records + Finance access
CREATE POLICY "crew_payroll_secure_select" ON public.crew_payroll
FOR SELECT TO authenticated
USING (
  crew_member_id::text = auth.uid()::text
  OR public.has_finance_access(auth.uid())
);

CREATE POLICY "crew_payroll_secure_insert" ON public.crew_payroll
FOR INSERT TO authenticated
WITH CHECK (public.has_finance_access(auth.uid()));

CREATE POLICY "crew_payroll_secure_update" ON public.crew_payroll
FOR UPDATE TO authenticated
USING (public.has_finance_access(auth.uid()));

-- 7. Grant execute on functions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_hr(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_finance_access(uuid) TO authenticated;