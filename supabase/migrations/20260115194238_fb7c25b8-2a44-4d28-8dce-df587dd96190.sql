-- =============================================
-- RLS HARDENING PHASE 1 - FIXED
-- Corrigido: usar 'department_manager' ao invés de 'finance'
-- =============================================

-- Fix has_finance_access function with correct enum values
CREATE OR REPLACE FUNCTION public.has_finance_access(_user_id UUID)
RETURNS BOOLEAN
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

-- =============================================
-- Create remaining hardened RLS policies
-- =============================================

-- CREW_MEMBERS TABLE - Organization isolation
DROP POLICY IF EXISTS "crew_org_isolation_select" ON public.crew_members;
DROP POLICY IF EXISTS "crew_org_isolation_insert" ON public.crew_members;
DROP POLICY IF EXISTS "crew_org_isolation_update" ON public.crew_members;
DROP POLICY IF EXISTS "crew_org_isolation_delete" ON public.crew_members;

CREATE POLICY "crew_org_isolation_select" ON public.crew_members
FOR SELECT TO authenticated
USING (
  organization_id IS NULL 
  OR public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "crew_org_isolation_insert" ON public.crew_members
FOR INSERT TO authenticated
WITH CHECK (
  organization_id IS NULL 
  OR public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "crew_org_isolation_update" ON public.crew_members
FOR UPDATE TO authenticated
USING (
  organization_id IS NULL 
  OR public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "crew_org_isolation_delete" ON public.crew_members
FOR DELETE TO authenticated
USING (
  public.is_admin_or_hr(auth.uid()) 
  AND (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id))
);

-- VESSELS TABLE - Organization isolation
DROP POLICY IF EXISTS "vessels_org_isolation_select" ON public.vessels;
DROP POLICY IF EXISTS "vessels_org_isolation_insert" ON public.vessels;
DROP POLICY IF EXISTS "vessels_org_isolation_update" ON public.vessels;

CREATE POLICY "vessels_org_isolation_select" ON public.vessels
FOR SELECT TO authenticated
USING (
  organization_id IS NULL 
  OR public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "vessels_org_isolation_insert" ON public.vessels
FOR INSERT TO authenticated
WITH CHECK (
  organization_id IS NULL 
  OR public.user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "vessels_org_isolation_update" ON public.vessels
FOR UPDATE TO authenticated
USING (
  organization_id IS NULL 
  OR public.user_belongs_to_org(auth.uid(), organization_id)
);

-- CREW_PAYROLL TABLE - Finance/HR only + own records
DROP POLICY IF EXISTS "payroll_secure_select" ON public.crew_payroll;
DROP POLICY IF EXISTS "payroll_secure_insert" ON public.crew_payroll;
DROP POLICY IF EXISTS "payroll_secure_update" ON public.crew_payroll;

CREATE POLICY "payroll_secure_select" ON public.crew_payroll
FOR SELECT TO authenticated
USING (
  crew_member_id::text = auth.uid()::text
  OR public.has_finance_access(auth.uid())
);

CREATE POLICY "payroll_secure_insert" ON public.crew_payroll
FOR INSERT TO authenticated
WITH CHECK (public.has_finance_access(auth.uid()));

CREATE POLICY "payroll_secure_update" ON public.crew_payroll
FOR UPDATE TO authenticated
USING (public.has_finance_access(auth.uid()));

-- AI_AUDIT_LOGS TABLE - Admin/HR only
DROP POLICY IF EXISTS "ai_logs_admin_only_select" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_logs_authenticated_insert" ON public.ai_audit_logs;

CREATE POLICY "ai_logs_admin_only_select" ON public.ai_audit_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "ai_logs_authenticated_insert" ON public.ai_audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);