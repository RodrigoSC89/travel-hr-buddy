-- =============================================
-- RLS HARDENING BATCH 2 - Políticas restantes
-- =============================================

-- MIRROR_INSTANCES - Apenas Admin
DROP POLICY IF EXISTS "auth_write_mirror_instances" ON public.mirror_instances;
DROP POLICY IF EXISTS "auth_all_mirror_instances" ON public.mirror_instances;
DROP POLICY IF EXISTS "Authenticated users can manage mirror_instances" ON public.mirror_instances;
DROP POLICY IF EXISTS "Allow authenticated update mirror_instances" ON public.mirror_instances;
CREATE POLICY "mirror_instances_admin_all" ON public.mirror_instances
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- MISSION_VESSELS - Apenas autenticados
DROP POLICY IF EXISTS "Allow authenticated all mission_vessels" ON public.mission_vessels;
DROP POLICY IF EXISTS "Authenticated users can manage mission_vessels" ON public.mission_vessels;
DROP POLICY IF EXISTS "auth_all_mission_vessels" ON public.mission_vessels;
CREATE POLICY "mission_vessels_auth_all" ON public.mission_vessels
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- MMI_MAINTENANCE_JOBS - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Users can update maintenance jobs" ON public.mmi_maintenance_jobs;
CREATE POLICY "mmi_maintenance_jobs_admin_upd" ON public.mmi_maintenance_jobs
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- MMI_OS_RESOLVIDAS - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Users can update OS resolvidas" ON public.mmi_os_resolvidas;
CREATE POLICY "mmi_os_resolvidas_admin_upd" ON public.mmi_os_resolvidas
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- MODULES_REGISTRY - Apenas Admin
DROP POLICY IF EXISTS "auth_modules_registry" ON public.modules_registry;
CREATE POLICY "modules_registry_admin_all" ON public.modules_registry
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- ONNX_MODELS - Apenas Admin
DROP POLICY IF EXISTS "onnx_models_policy" ON public.onnx_models;
CREATE POLICY "onnx_models_admin_all" ON public.onnx_models
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- OPERATIONAL_CHECKLISTS - Apenas autenticados
DROP POLICY IF EXISTS "operational_checklists_all" ON public.operational_checklists;
DROP POLICY IF EXISTS "Users can manage operational checklists" ON public.operational_checklists;
CREATE POLICY "operational_checklists_auth_all" ON public.operational_checklists
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- PEO_DP_AI_EVIDENCES - Apenas Admin
DROP POLICY IF EXISTS "Auth manage peo dp ai evidences" ON public.peo_dp_ai_evidences;
CREATE POLICY "peo_dp_ai_evidences_admin_all" ON public.peo_dp_ai_evidences
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- PEO_DP_AUDITS - Apenas Admin
DROP POLICY IF EXISTS "Auth manage peo dp audits" ON public.peo_dp_audits;
CREATE POLICY "peo_dp_audits_admin_all" ON public.peo_dp_audits
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- PEO_DP_PROGRAM - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Auth update peo dp program" ON public.peo_dp_program;
CREATE POLICY "peo_dp_program_admin_upd" ON public.peo_dp_program
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- PEO_DP_REQUIREMENTS - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Auth update peo dp requirements" ON public.peo_dp_requirements;
CREATE POLICY "peo_dp_requirements_admin_upd" ON public.peo_dp_requirements
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- PEO_DP_RESPONSES - Apenas Admin
DROP POLICY IF EXISTS "Auth manage peo dp responses" ON public.peo_dp_responses;
CREATE POLICY "peo_dp_responses_admin_all" ON public.peo_dp_responses
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- PEOTRAM_AUDIT_RESPONSES_2024 - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Users can update responses" ON public.peotram_audit_responses_2024;
CREATE POLICY "peotram_audit_responses_2024_admin_upd" ON public.peotram_audit_responses_2024
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- PEOTRAM_SCORE_PREDICTIONS - Apenas Admin
DROP POLICY IF EXISTS "System can manage PEOTRAM predictions" ON public.peotram_score_predictions;
CREATE POLICY "peotram_score_predictions_admin_all" ON public.peotram_score_predictions
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- PERFORMANCE_OUTLIERS - Apenas Admin
DROP POLICY IF EXISTS "auth_access" ON public.performance_outliers;
DROP POLICY IF EXISTS "authenticated_access" ON public.performance_outliers;
CREATE POLICY "performance_outliers_admin_all" ON public.performance_outliers
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- PROACTIVE_ALERTS - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Authenticated users can update alerts" ON public.proactive_alerts;
CREATE POLICY "proactive_alerts_admin_upd" ON public.proactive_alerts
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- PROCUREMENT_ORDERS - Apenas autenticados
DROP POLICY IF EXISTS "authenticated_access" ON public.procurement_orders;
DROP POLICY IF EXISTS "auth_access" ON public.procurement_orders;
CREATE POLICY "procurement_orders_auth_all" ON public.procurement_orders
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- REPLICATED_LOGS - Apenas Admin
DROP POLICY IF EXISTS "System can manage replicated logs" ON public.replicated_logs;
CREATE POLICY "replicated_logs_admin_all" ON public.replicated_logs
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- RESERVATION_PAYMENTS - Apenas autenticados
DROP POLICY IF EXISTS "reservation_payments_all" ON public.reservation_payments;
DROP POLICY IF EXISTS "Users can manage reservation payments" ON public.reservation_payments;
CREATE POLICY "reservation_payments_auth_all" ON public.reservation_payments
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ROUTE_OPTIMIZATIONS - Apenas autenticados
DROP POLICY IF EXISTS "Authenticated users can manage route optimizations" ON public.route_optimizations;
CREATE POLICY "route_optimizations_auth_all" ON public.route_optimizations
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- SAFETY_INCIDENTS - Apenas autenticados
DROP POLICY IF EXISTS "authenticated_access" ON public.safety_incidents;
DROP POLICY IF EXISTS "auth_access" ON public.safety_incidents;
CREATE POLICY "safety_incidents_auth_all" ON public.safety_incidents
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- SATELLITE_COVERAGE_MAPS - Apenas autenticados
DROP POLICY IF EXISTS "auth_all_satellite_coverage_maps" ON public.satellite_coverage_maps;
CREATE POLICY "satellite_coverage_maps_auth_all" ON public.satellite_coverage_maps
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- SATELLITE_TRACKING - Apenas autenticados
DROP POLICY IF EXISTS "auth_all_satellite_tracking" ON public.satellite_tracking;
CREATE POLICY "satellite_tracking_auth_all" ON public.satellite_tracking
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- SECURITY_SCAN_RESULTS - Apenas Admin
DROP POLICY IF EXISTS "Service role can manage security scans" ON public.security_scan_results;
CREATE POLICY "security_scan_results_admin_all" ON public.security_scan_results
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- SENSOR_ALERTS - Apenas autenticados
DROP POLICY IF EXISTS "sensor_alerts_all" ON public.sensor_alerts;
CREATE POLICY "sensor_alerts_auth_all" ON public.sensor_alerts
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- SMART_WORKFLOW_STEPS - Apenas autenticados
DROP POLICY IF EXISTS "smart_workflow_steps_all" ON public.smart_workflow_steps;
CREATE POLICY "smart_workflow_steps_auth_all" ON public.smart_workflow_steps
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- SMART_WORKFLOWS - Apenas autenticados
DROP POLICY IF EXISTS "smart_workflows_all" ON public.smart_workflows;
CREATE POLICY "smart_workflows_auth_all" ON public.smart_workflows
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);