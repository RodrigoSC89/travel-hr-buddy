-- =====================================================
-- RLS HARDENING BATCH 6: PEO, Performance Tables
-- =====================================================

-- peo_dp_ai_evidences
DROP POLICY IF EXISTS "peo_dp_ai_evidences_policy" ON public.peo_dp_ai_evidences;
CREATE POLICY "peo_dp_ai_evidences_sel" ON public.peo_dp_ai_evidences FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_ai_evidences_ins" ON public.peo_dp_ai_evidences FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_ai_evidences_upd" ON public.peo_dp_ai_evidences FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_ai_evidences_del" ON public.peo_dp_ai_evidences FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peo_dp_audits
DROP POLICY IF EXISTS "peo_dp_audits_policy" ON public.peo_dp_audits;
CREATE POLICY "peo_dp_audits_sel" ON public.peo_dp_audits FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_audits_ins" ON public.peo_dp_audits FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_audits_upd" ON public.peo_dp_audits FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_audits_del" ON public.peo_dp_audits FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peo_dp_program
DROP POLICY IF EXISTS "peo_dp_program_policy" ON public.peo_dp_program;
CREATE POLICY "peo_dp_program_sel" ON public.peo_dp_program FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_program_ins" ON public.peo_dp_program FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_program_upd" ON public.peo_dp_program FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_program_del" ON public.peo_dp_program FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peo_dp_requirements
DROP POLICY IF EXISTS "peo_dp_requirements_policy" ON public.peo_dp_requirements;
CREATE POLICY "peo_dp_requirements_sel" ON public.peo_dp_requirements FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_requirements_ins" ON public.peo_dp_requirements FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_requirements_upd" ON public.peo_dp_requirements FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_requirements_del" ON public.peo_dp_requirements FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peo_dp_responses
DROP POLICY IF EXISTS "peo_dp_responses_policy" ON public.peo_dp_responses;
CREATE POLICY "peo_dp_responses_sel" ON public.peo_dp_responses FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_responses_ins" ON public.peo_dp_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_responses_upd" ON public.peo_dp_responses FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peo_dp_responses_del" ON public.peo_dp_responses FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peodp_requirements_2021
DROP POLICY IF EXISTS "peodp_requirements_2021_policy" ON public.peodp_requirements_2021;
CREATE POLICY "peodp_requirements_2021_sel" ON public.peodp_requirements_2021 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peodp_requirements_2021_admin_ins" ON public.peodp_requirements_2021 FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peodp_requirements_2021_admin_upd" ON public.peodp_requirements_2021 FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peodp_requirements_2021_admin_del" ON public.peodp_requirements_2021 FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_ai_evidences_2024
DROP POLICY IF EXISTS "peotram_ai_evidences_2024_policy" ON public.peotram_ai_evidences_2024;
CREATE POLICY "peotram_ai_evidences_2024_sel" ON public.peotram_ai_evidences_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_ai_evidences_2024_ins" ON public.peotram_ai_evidences_2024 FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_ai_evidences_2024_upd" ON public.peotram_ai_evidences_2024 FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_ai_evidences_2024_del" ON public.peotram_ai_evidences_2024 FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_audit_responses_2024
DROP POLICY IF EXISTS "peotram_audit_responses_2024_policy" ON public.peotram_audit_responses_2024;
CREATE POLICY "peotram_audit_responses_2024_sel" ON public.peotram_audit_responses_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_audit_responses_2024_ins" ON public.peotram_audit_responses_2024 FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_audit_responses_2024_upd" ON public.peotram_audit_responses_2024 FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_audit_responses_2024_del" ON public.peotram_audit_responses_2024 FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_audits_2024
DROP POLICY IF EXISTS "peotram_audits_2024_policy" ON public.peotram_audits_2024;
CREATE POLICY "peotram_audits_2024_sel" ON public.peotram_audits_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_audits_2024_ins" ON public.peotram_audits_2024 FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_audits_2024_upd" ON public.peotram_audits_2024 FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_audits_2024_del" ON public.peotram_audits_2024 FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_elements_2024
DROP POLICY IF EXISTS "peotram_elements_2024_policy" ON public.peotram_elements_2024;
CREATE POLICY "peotram_elements_2024_sel" ON public.peotram_elements_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_elements_2024_admin_ins" ON public.peotram_elements_2024 FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_elements_2024_admin_upd" ON public.peotram_elements_2024 FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_elements_2024_admin_del" ON public.peotram_elements_2024 FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_items_2024
DROP POLICY IF EXISTS "peotram_items_2024_policy" ON public.peotram_items_2024;
CREATE POLICY "peotram_items_2024_sel" ON public.peotram_items_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_items_2024_admin_ins" ON public.peotram_items_2024 FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_items_2024_admin_upd" ON public.peotram_items_2024 FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_items_2024_admin_del" ON public.peotram_items_2024 FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_score_predictions
DROP POLICY IF EXISTS "peotram_score_predictions_policy" ON public.peotram_score_predictions;
CREATE POLICY "peotram_score_predictions_sel" ON public.peotram_score_predictions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_score_predictions_ins" ON public.peotram_score_predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_score_predictions_upd" ON public.peotram_score_predictions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_score_predictions_del" ON public.peotram_score_predictions FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_sections
DROP POLICY IF EXISTS "peotram_sections_policy" ON public.peotram_sections;
CREATE POLICY "peotram_sections_sel" ON public.peotram_sections FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_sections_admin_ins" ON public.peotram_sections FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_sections_admin_upd" ON public.peotram_sections FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_sections_admin_del" ON public.peotram_sections FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_signatures
DROP POLICY IF EXISTS "peotram_signatures_policy" ON public.peotram_signatures;
CREATE POLICY "peotram_signatures_sel" ON public.peotram_signatures FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_signatures_ins" ON public.peotram_signatures FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_signatures_upd" ON public.peotram_signatures FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_signatures_del" ON public.peotram_signatures FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- peotram_structures
DROP POLICY IF EXISTS "peotram_structures_policy" ON public.peotram_structures;
CREATE POLICY "peotram_structures_sel" ON public.peotram_structures FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "peotram_structures_admin_ins" ON public.peotram_structures FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_structures_admin_upd" ON public.peotram_structures FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "peotram_structures_admin_del" ON public.peotram_structures FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- performance_alerts
DROP POLICY IF EXISTS "performance_alerts_policy" ON public.performance_alerts;
CREATE POLICY "performance_alerts_sel" ON public.performance_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "performance_alerts_ins" ON public.performance_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "performance_alerts_upd" ON public.performance_alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "performance_alerts_del" ON public.performance_alerts FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- performance_metrics
DROP POLICY IF EXISTS "performance_metrics_policy" ON public.performance_metrics;
CREATE POLICY "performance_metrics_sel" ON public.performance_metrics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "performance_metrics_ins" ON public.performance_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "performance_metrics_upd" ON public.performance_metrics FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "performance_metrics_del" ON public.performance_metrics FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- performance_outliers
DROP POLICY IF EXISTS "performance_outliers_policy" ON public.performance_outliers;
CREATE POLICY "performance_outliers_sel" ON public.performance_outliers FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "performance_outliers_ins" ON public.performance_outliers FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "performance_outliers_upd" ON public.performance_outliers FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "performance_outliers_del" ON public.performance_outliers FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));