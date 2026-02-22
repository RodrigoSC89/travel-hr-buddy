
-- Fix 13 overly permissive ALL policies: replace USING(true) WITH CHECK(true)
-- with proper auth checks

-- charter_parties
DROP POLICY IF EXISTS "Authenticated manage charter_parties" ON public.charter_parties;
CREATE POLICY "Auth manage charter_parties" ON public.charter_parties FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- eu_ets_tracking
DROP POLICY IF EXISTS "Authenticated manage eu_ets_tracking" ON public.eu_ets_tracking;
CREATE POLICY "Auth manage eu_ets_tracking" ON public.eu_ets_tracking FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ism_capa
DROP POLICY IF EXISTS "Authenticated manage ism_capa" ON public.ism_capa;
CREATE POLICY "Auth manage ism_capa" ON public.ism_capa FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ism_elements
DROP POLICY IF EXISTS "Authenticated manage ism_elements" ON public.ism_elements;
CREATE POLICY "Auth manage ism_elements" ON public.ism_elements FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ism_evidence
DROP POLICY IF EXISTS "Authenticated manage ism_evidence" ON public.ism_evidence;
CREATE POLICY "Auth manage ism_evidence" ON public.ism_evidence FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ism_gap_analysis
DROP POLICY IF EXISTS "Authenticated manage ism_gap_analysis" ON public.ism_gap_analysis;
CREATE POLICY "Auth manage ism_gap_analysis" ON public.ism_gap_analysis FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ism_requirements
DROP POLICY IF EXISTS "Authenticated manage ism_requirements" ON public.ism_requirements;
CREATE POLICY "Auth manage ism_requirements" ON public.ism_requirements FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- pms_components
DROP POLICY IF EXISTS "Authenticated users can manage pms_components" ON public.pms_components;
CREATE POLICY "Auth manage pms_components" ON public.pms_components FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- pms_jobs
DROP POLICY IF EXISTS "Authenticated users can manage pms_jobs" ON public.pms_jobs;
CREATE POLICY "Auth manage pms_jobs" ON public.pms_jobs FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- pms_running_hours_triggers
DROP POLICY IF EXISTS "Authenticated users can manage pms_rh_triggers" ON public.pms_running_hours_triggers;
CREATE POLICY "Auth manage pms_rh_triggers" ON public.pms_running_hours_triggers FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- pms_subsystems
DROP POLICY IF EXISTS "Authenticated users can manage pms_subsystems" ON public.pms_subsystems;
CREATE POLICY "Auth manage pms_subsystems" ON public.pms_subsystems FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- pms_systems
DROP POLICY IF EXISTS "Authenticated users can manage pms_systems" ON public.pms_systems;
CREATE POLICY "Auth manage pms_systems" ON public.pms_systems FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- pms_work_orders
DROP POLICY IF EXISTS "Authenticated users can manage pms_work_orders" ON public.pms_work_orders;
CREATE POLICY "Auth manage pms_work_orders" ON public.pms_work_orders FOR ALL
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
