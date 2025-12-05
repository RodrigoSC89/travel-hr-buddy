-- SECURITY FIX: Add RLS policies to publicly exposed tables

-- 1. knowledge_base - Restrict to authenticated users
DROP POLICY IF EXISTS "Knowledge base is publicly readable" ON public.knowledge_base;
DROP POLICY IF EXISTS "Knowledge base readable by authenticated users" ON public.knowledge_base;
DROP POLICY IF EXISTS "Knowledge base manageable by admins" ON public.knowledge_base;

CREATE POLICY "Knowledge base readable by authenticated users" 
ON public.knowledge_base 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Knowledge base insertable by authenticated" 
ON public.knowledge_base 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

CREATE POLICY "Knowledge base updatable by author or admin" 
ON public.knowledge_base 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin', 'hr_manager')
  )
);

CREATE POLICY "Knowledge base deletable by admin" 
ON public.knowledge_base 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin')
  )
);

-- 2. help_system_settings - Restrict to authenticated users, admins for write
DROP POLICY IF EXISTS "Help settings publicly readable" ON public.help_system_settings;
DROP POLICY IF EXISTS "Help settings readable by authenticated" ON public.help_system_settings;
DROP POLICY IF EXISTS "Help settings readable by authenticated users" ON public.help_system_settings;
DROP POLICY IF EXISTS "Help settings manageable by admins" ON public.help_system_settings;

CREATE POLICY "Help settings readable by authenticated" 
ON public.help_system_settings 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Help settings manageable by admins only" 
ON public.help_system_settings 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin')
  )
);

-- 3. maritime_certification_types - Public read, admin write
DROP POLICY IF EXISTS "Maritime certifications publicly readable" ON public.maritime_certification_types;
DROP POLICY IF EXISTS "Maritime certifications readable by all" ON public.maritime_certification_types;
DROP POLICY IF EXISTS "Maritime certifications manageable by admins" ON public.maritime_certification_types;

CREATE POLICY "Maritime certifications public read" 
ON public.maritime_certification_types 
FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "Maritime certifications admin write" 
ON public.maritime_certification_types 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin')
  )
);

-- 4. ports - Public read, admin write
DROP POLICY IF EXISTS "Ports publicly readable" ON public.ports;
DROP POLICY IF EXISTS "Ports readable by all" ON public.ports;
DROP POLICY IF EXISTS "Ports manageable by admins" ON public.ports;

CREATE POLICY "Ports public read" 
ON public.ports 
FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "Ports admin write" 
ON public.ports 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role::text IN ('admin', 'super_admin')
  )
);