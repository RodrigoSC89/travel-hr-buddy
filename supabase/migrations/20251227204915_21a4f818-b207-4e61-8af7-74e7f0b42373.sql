-- =====================================================
-- NAUTILUS ONE v3.1.0 - SECURITY HARDENING - ONLY RLS POLICIES
-- Using existing functions: has_role(uuid, text), is_admin(uuid)
-- =====================================================

-- 1. CREATE EXTENSIONS SCHEMA
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO public;

-- 2. USER_ROLES RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_admin_only" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_view_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "user_roles_view_own"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_manage"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 3. AI_CONFIGURATIONS - Admin only
DROP POLICY IF EXISTS "ai_configurations_select_policy" ON public.ai_configurations;
DROP POLICY IF EXISTS "ai_configurations_insert_policy" ON public.ai_configurations;
DROP POLICY IF EXISTS "ai_configurations_update_policy" ON public.ai_configurations;
DROP POLICY IF EXISTS "ai_configurations_delete_policy" ON public.ai_configurations;
DROP POLICY IF EXISTS "ai_configurations_admin_only" ON public.ai_configurations;
DROP POLICY IF EXISTS "Allow all access to ai_configurations" ON public.ai_configurations;

CREATE POLICY "ai_configurations_admin_only"
ON public.ai_configurations
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4. HELP_SYSTEM_SETTINGS
DROP POLICY IF EXISTS "help_system_settings_select_policy" ON public.help_system_settings;
DROP POLICY IF EXISTS "help_system_settings_authenticated" ON public.help_system_settings;
DROP POLICY IF EXISTS "help_system_settings_admin_modify" ON public.help_system_settings;
DROP POLICY IF EXISTS "help_system_settings_authenticated_read" ON public.help_system_settings;
DROP POLICY IF EXISTS "help_system_settings_admin_write" ON public.help_system_settings;
DROP POLICY IF EXISTS "help_system_settings_admin_update" ON public.help_system_settings;
DROP POLICY IF EXISTS "help_system_settings_admin_delete" ON public.help_system_settings;
DROP POLICY IF EXISTS "help_system_settings_read" ON public.help_system_settings;
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON public.help_system_settings;

CREATE POLICY "help_system_settings_read"
ON public.help_system_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "help_system_settings_admin_modify"
ON public.help_system_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 5. SYSTEM_STATUS - Authenticated read, admin write
DROP POLICY IF EXISTS "system_status_select_policy" ON public.system_status;
DROP POLICY IF EXISTS "system_status_authenticated_read" ON public.system_status;
DROP POLICY IF EXISTS "system_status_admin_modify" ON public.system_status;
DROP POLICY IF EXISTS "system_status_admin_write" ON public.system_status;
DROP POLICY IF EXISTS "system_status_admin_update" ON public.system_status;
DROP POLICY IF EXISTS "system_status_admin_delete" ON public.system_status;
DROP POLICY IF EXISTS "system_status_read" ON public.system_status;
DROP POLICY IF EXISTS "Allow public read access to system_status" ON public.system_status;

CREATE POLICY "system_status_read"
ON public.system_status
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "system_status_admin_modify"
ON public.system_status
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 6. PROFILES - Users see own, HR/Admin see all (uses 'id' as user reference)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow select for own profile" ON public.profiles;

CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() 
  OR public.is_admin(auth.uid())
  OR public.has_role(auth.uid(), 'hr_manager')
);

CREATE POLICY "profiles_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_manage"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 7. CREW_PAYROLL - HR and Admin only
DROP POLICY IF EXISTS "crew_payroll_hr_access" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_admin_access" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_hr_admin" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_sensitive_access" ON public.crew_payroll;
DROP POLICY IF EXISTS "crew_payroll_restricted" ON public.crew_payroll;
DROP POLICY IF EXISTS "Users can view own payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "HR can manage payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "Allow select for organization members" ON public.crew_payroll;

CREATE POLICY "crew_payroll_restricted"
ON public.crew_payroll
FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.has_role(auth.uid(), 'hr_manager')
);

-- 8. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 9. DOCUMENTATION
COMMENT ON TABLE public.user_roles IS 'User roles for RBAC - roles stored separately to prevent privilege escalation';
