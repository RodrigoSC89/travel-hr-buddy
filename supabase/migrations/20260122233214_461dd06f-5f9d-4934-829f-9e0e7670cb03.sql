-- Fix remaining permissive RLS policies

-- 1. Drop old permissive policies
DROP POLICY IF EXISTS "Medical records access" ON public.medical_records;
DROP POLICY IF EXISTS "Authenticated can view logs" ON public.system_logs;

-- 2. Create restrictive policy for medical_records (organization-based)
CREATE POLICY "Medical records org access" ON public.medical_records
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 3. system_logs already has "Auth users view own logs" policy, no need for another

-- 4. api_endpoints is an internal table, keeping SELECT as true is acceptable for public API docs