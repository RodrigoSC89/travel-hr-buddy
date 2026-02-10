
-- =============================================
-- RLS HARDENING: Replace USING(true)/WITH CHECK(true) 
-- on INSERT/UPDATE/DELETE/ALL policies
-- =============================================

-- 1. ai_strategies (has created_by)
DROP POLICY IF EXISTS "Auth delete ai_strategies" ON public.ai_strategies;
DROP POLICY IF EXISTS "Auth insert ai_strategies" ON public.ai_strategies;
DROP POLICY IF EXISTS "Auth update ai_strategies" ON public.ai_strategies;

CREATE POLICY "ai_strategies_insert" ON public.ai_strategies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "ai_strategies_update" ON public.ai_strategies
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "ai_strategies_delete" ON public.ai_strategies
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- 2. crew_wellbeing_scores (has organization_id, no user_id — restrict to admin/hr)
DROP POLICY IF EXISTS "Authenticated users can insert wellbeing scores" ON public.crew_wellbeing_scores;
DROP POLICY IF EXISTS "Authenticated users can update wellbeing scores" ON public.crew_wellbeing_scores;

CREATE POLICY "crew_wellbeing_scores_insert" ON public.crew_wellbeing_scores
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "crew_wellbeing_scores_update" ON public.crew_wellbeing_scores
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 3. sensor_readings (has organization_id, vessel_id — restrict to admin)
DROP POLICY IF EXISTS "Service role can insert sensor readings" ON public.sensor_readings;

CREATE POLICY "sensor_readings_insert" ON public.sensor_readings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- 4. compliance_predictions (has organization_id, vessel_id)
DROP POLICY IF EXISTS "auth_cp" ON public.compliance_predictions;

CREATE POLICY "compliance_predictions_select" ON public.compliance_predictions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "compliance_predictions_insert" ON public.compliance_predictions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "compliance_predictions_update" ON public.compliance_predictions
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "compliance_predictions_delete" ON public.compliance_predictions
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 5. contract_ai_analyses (has created_by, organization_id)
DROP POLICY IF EXISTS "auth_caa" ON public.contract_ai_analyses;

CREATE POLICY "contract_ai_analyses_select" ON public.contract_ai_analyses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "contract_ai_analyses_insert" ON public.contract_ai_analyses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "contract_ai_analyses_update" ON public.contract_ai_analyses
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "contract_ai_analyses_delete" ON public.contract_ai_analyses
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

-- 6. crew_fatigue_records (has organization_id, vessel_id)
DROP POLICY IF EXISTS "auth_cfr" ON public.crew_fatigue_records;

CREATE POLICY "crew_fatigue_records_select" ON public.crew_fatigue_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "crew_fatigue_records_insert" ON public.crew_fatigue_records
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "crew_fatigue_records_update" ON public.crew_fatigue_records
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "crew_fatigue_records_delete" ON public.crew_fatigue_records
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 7. crew_matching_analyses (has created_by, organization_id)
DROP POLICY IF EXISTS "auth_cma" ON public.crew_matching_analyses;

CREATE POLICY "crew_matching_analyses_select" ON public.crew_matching_analyses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "crew_matching_analyses_insert" ON public.crew_matching_analyses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crew_matching_analyses_update" ON public.crew_matching_analyses
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "crew_matching_analyses_delete" ON public.crew_matching_analyses
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

-- 8. document_entities (has organization_id)
DROP POLICY IF EXISTS "Document entities for authenticated" ON public.document_entities;

CREATE POLICY "document_entities_select" ON public.document_entities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "document_entities_insert" ON public.document_entities
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "document_entities_update" ON public.document_entities
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "document_entities_delete" ON public.document_entities
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 9. enterprise_document_chunks (no user_id — admin only writes)
DROP POLICY IF EXISTS "auth_edc" ON public.enterprise_document_chunks;

CREATE POLICY "enterprise_document_chunks_select" ON public.enterprise_document_chunks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "enterprise_document_chunks_write" ON public.enterprise_document_chunks
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "enterprise_document_chunks_update" ON public.enterprise_document_chunks
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "enterprise_document_chunks_delete" ON public.enterprise_document_chunks
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 10. enterprise_form_submissions (has organization_id)
DROP POLICY IF EXISTS "auth_efs" ON public.enterprise_form_submissions;

CREATE POLICY "enterprise_form_submissions_select" ON public.enterprise_form_submissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "enterprise_form_submissions_insert" ON public.enterprise_form_submissions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "enterprise_form_submissions_update" ON public.enterprise_form_submissions
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "enterprise_form_submissions_delete" ON public.enterprise_form_submissions
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 11. enterprise_form_templates (has created_by, organization_id)
DROP POLICY IF EXISTS "auth_eft" ON public.enterprise_form_templates;

CREATE POLICY "enterprise_form_templates_select" ON public.enterprise_form_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "enterprise_form_templates_insert" ON public.enterprise_form_templates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "enterprise_form_templates_update" ON public.enterprise_form_templates
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "enterprise_form_templates_delete" ON public.enterprise_form_templates
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

-- 12. enterprise_knowledge_documents (has created_by, organization_id)
DROP POLICY IF EXISTS "auth_ekd" ON public.enterprise_knowledge_documents;

CREATE POLICY "enterprise_knowledge_documents_select" ON public.enterprise_knowledge_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "enterprise_knowledge_documents_insert" ON public.enterprise_knowledge_documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "enterprise_knowledge_documents_update" ON public.enterprise_knowledge_documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "enterprise_knowledge_documents_delete" ON public.enterprise_knowledge_documents
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

-- 13. fleet_health_scores (has vessel_id only — admin/manager writes)
DROP POLICY IF EXISTS "Authenticated users can manage fleet health" ON public.fleet_health_scores;

CREATE POLICY "fleet_health_scores_select" ON public.fleet_health_scores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "fleet_health_scores_insert" ON public.fleet_health_scores
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "fleet_health_scores_update" ON public.fleet_health_scores
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "fleet_health_scores_delete" ON public.fleet_health_scores
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 14. ocimf_self_assessments (has created_by, organization_id, vessel_id)
DROP POLICY IF EXISTS "auth_ocimf" ON public.ocimf_self_assessments;

CREATE POLICY "ocimf_self_assessments_select" ON public.ocimf_self_assessments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ocimf_self_assessments_insert" ON public.ocimf_self_assessments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "ocimf_self_assessments_update" ON public.ocimf_self_assessments
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "ocimf_self_assessments_delete" ON public.ocimf_self_assessments
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

-- 15. psc_inspections (has organization_id, vessel_id)
DROP POLICY IF EXISTS "Authenticated users can manage PSC inspections" ON public.psc_inspections;

CREATE POLICY "psc_inspections_select" ON public.psc_inspections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "psc_inspections_insert" ON public.psc_inspections
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "psc_inspections_update" ON public.psc_inspections
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "psc_inspections_delete" ON public.psc_inspections
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 16. vendors (has organization_id)
DROP POLICY IF EXISTS "Users can manage their org vendors" ON public.vendors;

CREATE POLICY "vendors_select" ON public.vendors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "vendors_insert" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "vendors_update" ON public.vendors
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

CREATE POLICY "vendors_delete" ON public.vendors
  FOR DELETE TO authenticated
  USING (public.is_admin_or_hr(auth.uid()));

-- 17. voyage_simulations (has created_by, vessel_id)
DROP POLICY IF EXISTS "Authenticated users can manage voyage simulations" ON public.voyage_simulations;

CREATE POLICY "voyage_simulations_select" ON public.voyage_simulations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "voyage_simulations_insert" ON public.voyage_simulations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "voyage_simulations_update" ON public.voyage_simulations
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));

CREATE POLICY "voyage_simulations_delete" ON public.voyage_simulations
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.is_admin_or_hr(auth.uid()));
