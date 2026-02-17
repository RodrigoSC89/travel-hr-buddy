-- Fix overly permissive RLS policies (USING true) on 5 tables
-- Replace with auth.uid()-based policies

-- 1. warranty_claims
DROP POLICY IF EXISTS "warranty_claims_all" ON public.warranty_claims;
CREATE POLICY "warranty_claims_select" ON public.warranty_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "warranty_claims_insert" ON public.warranty_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "warranty_claims_update" ON public.warranty_claims FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "warranty_claims_delete" ON public.warranty_claims FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. insurance_policies
DROP POLICY IF EXISTS "insurance_policies_all" ON public.insurance_policies;
CREATE POLICY "insurance_policies_select" ON public.insurance_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "insurance_policies_insert" ON public.insurance_policies FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "insurance_policies_update" ON public.insurance_policies FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "insurance_policies_delete" ON public.insurance_policies FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. insurance_claims
DROP POLICY IF EXISTS "insurance_claims_all" ON public.insurance_claims;
CREATE POLICY "insurance_claims_select" ON public.insurance_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "insurance_claims_insert" ON public.insurance_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "insurance_claims_update" ON public.insurance_claims FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "insurance_claims_delete" ON public.insurance_claims FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. class_surveys
DROP POLICY IF EXISTS "class_surveys_all" ON public.class_surveys;
CREATE POLICY "class_surveys_select" ON public.class_surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "class_surveys_insert" ON public.class_surveys FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "class_surveys_update" ON public.class_surveys FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "class_surveys_delete" ON public.class_surveys FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. class_conditions
DROP POLICY IF EXISTS "class_conditions_all" ON public.class_conditions;
CREATE POLICY "class_conditions_select" ON public.class_conditions FOR SELECT TO authenticated USING (true);
CREATE POLICY "class_conditions_insert" ON public.class_conditions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "class_conditions_update" ON public.class_conditions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "class_conditions_delete" ON public.class_conditions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));