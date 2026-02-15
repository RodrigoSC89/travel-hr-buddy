
-- Fix permissive RLS policies on 4 tables

-- 1. mlc_food_inspections (uses inspector_id, not created_by)
DROP POLICY IF EXISTS "auth_update_mlc_food" ON public.mlc_food_inspections;
CREATE POLICY "auth_update_mlc_food" ON public.mlc_food_inspections
  FOR UPDATE TO authenticated
  USING (auth.uid() = inspector_id OR public.is_admin_or_hr(auth.uid()));

DROP POLICY IF EXISTS "auth_insert_mlc_food" ON public.mlc_food_inspections;
CREATE POLICY "auth_insert_mlc_food" ON public.mlc_food_inspections
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = inspector_id OR public.is_admin_or_hr(auth.uid()));

-- 2. peodp_simops
DROP POLICY IF EXISTS "auth_update_peodp_simops" ON public.peodp_simops;
CREATE POLICY "auth_update_peodp_simops" ON public.peodp_simops
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

DROP POLICY IF EXISTS "auth_insert_peodp_simops" ON public.peodp_simops;
CREATE POLICY "auth_insert_peodp_simops" ON public.peodp_simops
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

-- 3. peotram_audit_milestones
DROP POLICY IF EXISTS "auth_update_peotram_milestones" ON public.peotram_audit_milestones;
CREATE POLICY "auth_update_peotram_milestones" ON public.peotram_audit_milestones
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

DROP POLICY IF EXISTS "auth_insert_peotram_milestones" ON public.peotram_audit_milestones;
CREATE POLICY "auth_insert_peotram_milestones" ON public.peotram_audit_milestones
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

-- 4. peotram_lessons_learned
DROP POLICY IF EXISTS "auth_update_peotram_lessons" ON public.peotram_lessons_learned;
CREATE POLICY "auth_update_peotram_lessons" ON public.peotram_lessons_learned
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

DROP POLICY IF EXISTS "auth_insert_peotram_lessons" ON public.peotram_lessons_learned;
CREATE POLICY "auth_insert_peotram_lessons" ON public.peotram_lessons_learned
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));
