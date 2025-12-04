-- ============================================
-- SECURITY FIX: Restrict access to sensitive system tables
-- Using existing user_has_role and is_admin functions
-- ============================================

-- 1. Fix help_system_settings - Only authenticated users, admins can modify
DROP POLICY IF EXISTS "Help system settings are viewable by everyone" ON public.help_system_settings;
DROP POLICY IF EXISTS "Only admins can modify help system settings" ON public.help_system_settings;
DROP POLICY IF EXISTS "Only authenticated users can view help settings" ON public.help_system_settings;
DROP POLICY IF EXISTS "Only admins can modify help settings" ON public.help_system_settings;

CREATE POLICY "Authenticated users can view help settings"
ON public.help_system_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can modify help settings"
ON public.help_system_settings
FOR ALL
USING (public.is_admin(auth.uid()));

-- 2. Fix module_permissions - Only authenticated users can view
DROP POLICY IF EXISTS "Module permissions are viewable by everyone" ON public.module_permissions;
DROP POLICY IF EXISTS "Users can view permissions for their modules" ON public.module_permissions;

CREATE POLICY "Authenticated users can view module permissions"
ON public.module_permissions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Fix role_permissions - Only authenticated users can view
DROP POLICY IF EXISTS "Role permissions are viewable by everyone" ON public.role_permissions;
DROP POLICY IF EXISTS "Role permissions viewable by all" ON public.role_permissions;
DROP POLICY IF EXISTS "Users can view their own role permissions" ON public.role_permissions;

CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. Fix knowledge_base - Only authenticated users
DROP POLICY IF EXISTS "Knowledge base is viewable by everyone" ON public.knowledge_base;
DROP POLICY IF EXISTS "Only authenticated users can view knowledge base" ON public.knowledge_base;

CREATE POLICY "Authenticated users can view knowledge base"
ON public.knowledge_base
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 5. Fix system_status - Only authenticated users
DROP POLICY IF EXISTS "System status is viewable by everyone" ON public.system_status;
DROP POLICY IF EXISTS "Only authenticated users can view system status" ON public.system_status;

CREATE POLICY "Authenticated users can view system status"
ON public.system_status
FOR SELECT
USING (auth.uid() IS NOT NULL);