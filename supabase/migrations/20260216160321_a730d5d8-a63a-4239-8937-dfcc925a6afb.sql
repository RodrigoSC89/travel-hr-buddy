
-- =====================================================
-- FIX: Replace permissive RLS policies (USING true) 
-- with proper auth-based policies on 8 tables
-- =====================================================

-- 1. crew_change_tasks - Replace ALL policy with scoped policies
DROP POLICY IF EXISTS "crew_change_tasks_all" ON public.crew_change_tasks;
CREATE POLICY "crew_change_tasks_select" ON public.crew_change_tasks FOR SELECT USING (true);
CREATE POLICY "crew_change_tasks_insert" ON public.crew_change_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "crew_change_tasks_update" ON public.crew_change_tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "crew_change_tasks_delete" ON public.crew_change_tasks FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 2. crew_changes - Replace permissive INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "crew_changes_insert" ON public.crew_changes;
DROP POLICY IF EXISTS "crew_changes_update" ON public.crew_changes;
DROP POLICY IF EXISTS "crew_changes_delete" ON public.crew_changes;
CREATE POLICY "crew_changes_insert" ON public.crew_changes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "crew_changes_update" ON public.crew_changes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "crew_changes_delete" ON public.crew_changes FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 3. defect_work_requests - Replace ALL policy
DROP POLICY IF EXISTS "Users can manage defect work requests" ON public.defect_work_requests;
CREATE POLICY "defect_work_requests_select" ON public.defect_work_requests FOR SELECT USING (true);
CREATE POLICY "defect_work_requests_insert" ON public.defect_work_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "defect_work_requests_update" ON public.defect_work_requests FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "defect_work_requests_delete" ON public.defect_work_requests FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 4. mlc_dmlc - Replace ALL policy
DROP POLICY IF EXISTS "Auth users manage mlc_dmlc" ON public.mlc_dmlc;
CREATE POLICY "mlc_dmlc_select" ON public.mlc_dmlc FOR SELECT USING (true);
CREATE POLICY "mlc_dmlc_insert" ON public.mlc_dmlc FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "mlc_dmlc_update" ON public.mlc_dmlc FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "mlc_dmlc_delete" ON public.mlc_dmlc FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 5. noon_report_entries - Replace ALL policy
DROP POLICY IF EXISTS "noon_reports_all" ON public.noon_report_entries;
CREATE POLICY "noon_report_entries_select" ON public.noon_report_entries FOR SELECT USING (true);
CREATE POLICY "noon_report_entries_insert" ON public.noon_report_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "noon_report_entries_update" ON public.noon_report_entries FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "noon_report_entries_delete" ON public.noon_report_entries FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 6. noon_reports - Replace ALL policy
DROP POLICY IF EXISTS "Users can manage noon reports" ON public.noon_reports;
CREATE POLICY "noon_reports_select" ON public.noon_reports FOR SELECT USING (true);
CREATE POLICY "noon_reports_insert" ON public.noon_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "noon_reports_update" ON public.noon_reports FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "noon_reports_delete" ON public.noon_reports FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 7. permits_to_work - Replace permissive INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "ptw_insert" ON public.permits_to_work;
DROP POLICY IF EXISTS "ptw_update" ON public.permits_to_work;
DROP POLICY IF EXISTS "ptw_delete" ON public.permits_to_work;
CREATE POLICY "ptw_insert" ON public.permits_to_work FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ptw_update" ON public.permits_to_work FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "ptw_delete" ON public.permits_to_work FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 8. ship_vetting_records - Replace ALL policy
DROP POLICY IF EXISTS "vetting_all" ON public.ship_vetting_records;
CREATE POLICY "ship_vetting_select" ON public.ship_vetting_records FOR SELECT USING (true);
CREATE POLICY "ship_vetting_insert" ON public.ship_vetting_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ship_vetting_update" ON public.ship_vetting_records FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "ship_vetting_delete" ON public.ship_vetting_records FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));

-- 9. stowage_plans - Replace ALL policy
DROP POLICY IF EXISTS "stowage_all" ON public.stowage_plans;
CREATE POLICY "stowage_plans_select" ON public.stowage_plans FOR SELECT USING (true);
CREATE POLICY "stowage_plans_insert" ON public.stowage_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "stowage_plans_update" ON public.stowage_plans FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "stowage_plans_delete" ON public.stowage_plans FOR DELETE USING (auth.uid() IS NOT NULL AND public.is_admin_or_hr(auth.uid()));
