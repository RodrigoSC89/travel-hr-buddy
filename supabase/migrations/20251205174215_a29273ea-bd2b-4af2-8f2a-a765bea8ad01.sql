-- FIX: Restrict role_permissions and module_permissions to authenticated users

-- 1. role_permissions - Remove public access, restrict to authenticated
DROP POLICY IF EXISTS "Anyone can read role permissions" ON public.role_permissions;

CREATE POLICY "Role permissions readable by authenticated" 
ON public.role_permissions 
FOR SELECT 
TO authenticated
USING (true);

-- 2. module_permissions - Remove public access, restrict to authenticated
DROP POLICY IF EXISTS "Everyone can view module permissions" ON public.module_permissions;

CREATE POLICY "Module permissions readable by authenticated" 
ON public.module_permissions 
FOR SELECT 
TO authenticated
USING (true);