-- =====================================================
-- STEP 1: Remover políticas existentes que dependem da função has_role
-- =====================================================

-- Remover políticas do crew_payroll
DROP POLICY IF EXISTS "crew_payroll_restricted" ON public.crew_payroll;
DROP POLICY IF EXISTS "payroll_select_own" ON public.crew_payroll;
DROP POLICY IF EXISTS "payroll_select_admin" ON public.crew_payroll;
DROP POLICY IF EXISTS "payroll_manage_admin" ON public.crew_payroll;
DROP POLICY IF EXISTS "Users can view their own payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "HR can view all payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "Finance can manage payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "Crew payroll select policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "Crew payroll insert policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "Crew payroll update policy" ON public.crew_payroll;
DROP POLICY IF EXISTS "Crew payroll delete policy" ON public.crew_payroll;

-- Remover políticas do profiles que dependem de has_role
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_org" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_basic_org" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be viewed by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Remover políticas do ai_audit_logs
DROP POLICY IF EXISTS "ai_audit_select_admin" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_insert_all" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "Admins can view AI audit logs" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "Users can create audit logs" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "AI audit logs are viewable by org members" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "Users can insert AI audit logs" ON public.ai_audit_logs;

-- Remover políticas do user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;