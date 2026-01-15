-- ============================================================
-- RLS HARDENING MIGRATION - Phase 1: Core Tables Only
-- Focus: Multi-tenant isolation for production deployment
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE - Restrict to own profile + Admin/HR access
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_hardened_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_hardened_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_hardened_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_secure_select" ON public.profiles;

-- Create hardened policies
CREATE POLICY "profiles_secure_select_v2" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "profiles_secure_update_v2" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_secure_insert_v2" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. USER_ROLES TABLE - Only admins can manage roles
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_hardened_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_hardened_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_hardened_update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_hardened_delete" ON public.user_roles;

CREATE POLICY "user_roles_secure_select_v2" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "user_roles_secure_insert_v2" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "user_roles_secure_update_v2" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "user_roles_secure_delete_v2" ON public.user_roles
FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- ============================================================
-- 3. CREW_PAYROLL TABLE - Finance/HR access only
-- ============================================================

DROP POLICY IF EXISTS "crew_payroll_select_policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_insert_policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_update_policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_delete_policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_hardened_select" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_hardened_insert" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_hardened_update" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_hardened_delete" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_secure_select" ON public.crew_payroll;

CREATE POLICY "crew_payroll_secure_select_v2" ON public.crew_payroll
FOR SELECT TO authenticated
USING (crew_member_id::text = auth.uid()::text OR public.has_finance_access(auth.uid()));

CREATE POLICY "crew_payroll_secure_insert_v2" ON public.crew_payroll
FOR INSERT TO authenticated
WITH CHECK (public.has_finance_access(auth.uid()));

CREATE POLICY "crew_payroll_secure_update_v2" ON public.crew_payroll
FOR UPDATE TO authenticated
USING (public.has_finance_access(auth.uid()))
WITH CHECK (public.has_finance_access(auth.uid()));

CREATE POLICY "crew_payroll_secure_delete_v2" ON public.crew_payroll
FOR DELETE TO authenticated
USING (public.has_finance_access(auth.uid()));

-- ============================================================
-- 4. AI_AUDIT_LOGS TABLE - Admin/HR only
-- ============================================================

DROP POLICY IF EXISTS "ai_audit_logs_select_policy" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_logs_insert_policy" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_logs_hardened_select" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_logs_hardened_insert" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_logs_admin_only" ON public.ai_audit_logs;

CREATE POLICY "ai_audit_logs_secure_select_v2" ON public.ai_audit_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "ai_audit_logs_secure_insert_v2" ON public.ai_audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================================
-- 5. ACCESS_LOGS TABLE - Admin only
-- ============================================================

DROP POLICY IF EXISTS "access_logs_select_policy" ON public.access_logs;
DROP POLICY IF EXISTS "access_logs_insert_policy" ON public.access_logs;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.access_logs;
DROP POLICY IF EXISTS "access_logs_hardened_select" ON public.access_logs;
DROP POLICY IF EXISTS "access_logs_hardened_insert" ON public.access_logs;

CREATE POLICY "access_logs_secure_select_v2" ON public.access_logs
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "access_logs_secure_insert_v2" ON public.access_logs
FOR INSERT TO authenticated
WITH CHECK (public.check_log_rate_limit());

-- ============================================================
-- 6. CREW_MEMBERS TABLE - Multi-tenant isolation
-- ============================================================

DROP POLICY IF EXISTS "crew_members_select_policy" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_insert_policy" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_update_policy" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_delete_policy" ON public.crew_members;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_hardened_select" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_hardened_insert" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_hardened_update" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_hardened_delete" ON public.crew_members;

CREATE POLICY "crew_members_secure_select_v2" ON public.crew_members
FOR SELECT TO authenticated
USING (organization_id = public.get_current_organization_id() OR public.is_admin(auth.uid()));

CREATE POLICY "crew_members_secure_insert_v2" ON public.crew_members
FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_current_organization_id() AND public.is_manager_or_above());

CREATE POLICY "crew_members_secure_update_v2" ON public.crew_members
FOR UPDATE TO authenticated
USING (organization_id = public.get_current_organization_id() AND public.is_manager_or_above())
WITH CHECK (organization_id = public.get_current_organization_id() AND public.is_manager_or_above());

CREATE POLICY "crew_members_secure_delete_v2" ON public.crew_members
FOR DELETE TO authenticated
USING (organization_id = public.get_current_organization_id() AND public.is_admin(auth.uid()));

-- ============================================================
-- 7. VESSELS TABLE - Multi-tenant isolation
-- ============================================================

DROP POLICY IF EXISTS "vessels_select_policy" ON public.vessels;
DROP POLICY IF EXISTS "vessels_insert_policy" ON public.vessels;
DROP POLICY IF EXISTS "vessels_update_policy" ON public.vessels;
DROP POLICY IF EXISTS "vessels_delete_policy" ON public.vessels;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.vessels;
DROP POLICY IF EXISTS "vessels_hardened_select" ON public.vessels;
DROP POLICY IF EXISTS "vessels_hardened_insert" ON public.vessels;
DROP POLICY IF EXISTS "vessels_hardened_update" ON public.vessels;
DROP POLICY IF EXISTS "vessels_hardened_delete" ON public.vessels;

CREATE POLICY "vessels_secure_select_v2" ON public.vessels
FOR SELECT TO authenticated
USING (organization_id = public.get_current_organization_id() OR public.is_admin(auth.uid()));

CREATE POLICY "vessels_secure_insert_v2" ON public.vessels
FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_current_organization_id() AND public.is_manager_or_above());

CREATE POLICY "vessels_secure_update_v2" ON public.vessels
FOR UPDATE TO authenticated
USING (organization_id = public.get_current_organization_id() AND public.is_manager_or_above())
WITH CHECK (organization_id = public.get_current_organization_id() AND public.is_manager_or_above());

CREATE POLICY "vessels_secure_delete_v2" ON public.vessels
FOR DELETE TO authenticated
USING (organization_id = public.get_current_organization_id() AND public.is_admin(auth.uid()));

-- ============================================================
-- 8. PEOTRAM_AUDITS TABLE - Multi-tenant + Role-based
-- ============================================================

DROP POLICY IF EXISTS "peotram_audits_select_policy" ON public.peotram_audits;
DROP POLICY IF EXISTS "peotram_audits_insert_policy" ON public.peotram_audits;
DROP POLICY IF EXISTS "peotram_audits_update_policy" ON public.peotram_audits;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.peotram_audits;
DROP POLICY IF EXISTS "peotram_audits_hardened_select" ON public.peotram_audits;
DROP POLICY IF EXISTS "peotram_audits_hardened_insert" ON public.peotram_audits;
DROP POLICY IF EXISTS "peotram_audits_hardened_update" ON public.peotram_audits;

CREATE POLICY "peotram_audits_secure_select_v2" ON public.peotram_audits
FOR SELECT TO authenticated
USING (organization_id = public.get_current_organization_id() OR public.is_admin(auth.uid()));

CREATE POLICY "peotram_audits_secure_insert_v2" ON public.peotram_audits
FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_current_organization_id());

CREATE POLICY "peotram_audits_secure_update_v2" ON public.peotram_audits
FOR UPDATE TO authenticated
USING ((organization_id = public.get_current_organization_id() AND created_by = auth.uid()) OR public.is_admin(auth.uid()))
WITH CHECK (organization_id = public.get_current_organization_id());

-- ============================================================
-- Summary: 8 critical tables hardened with proper RLS
-- ============================================================