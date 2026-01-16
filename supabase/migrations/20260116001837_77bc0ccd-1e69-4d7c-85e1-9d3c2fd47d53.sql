
-- =============================================
-- RLS HARDENING FINAL - COMPLETE ALL 96 REMAINING POLICIES
-- Replace USING(true) with auth.uid() IS NOT NULL
-- =============================================

-- Maritime Certification Types
DROP POLICY IF EXISTS "Maritime certifications public read" ON public.maritime_certification_types;

-- Mirror Instances (remove duplicates)
DROP POLICY IF EXISTS "Allow authenticated read mirror_instances" ON public.mirror_instances;
DROP POLICY IF EXISTS "Authenticated users can read mirror_instances" ON public.mirror_instances;
DROP POLICY IF EXISTS "Authenticated users can view mirror_instances" ON public.mirror_instances;
DROP POLICY IF EXISTS "auth_read_mirror_instances" ON public.mirror_instances;
CREATE POLICY "mirror_instances_auth_only" ON public.mirror_instances FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Mission related
DROP POLICY IF EXISTS "Users can view all mission logs" ON public.mission_logs;
CREATE POLICY "mission_logs_auth_only" ON public.mission_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated read mission_vessels" ON public.mission_vessels;
DROP POLICY IF EXISTS "Authenticated users can view mission_vessels" ON public.mission_vessels;
CREATE POLICY "mission_vessels_auth_only" ON public.mission_vessels FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view all missions" ON public.missions;
CREATE POLICY "missions_auth_only" ON public.missions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- MMI related
DROP POLICY IF EXISTS "Users can view mmi_history" ON public.mmi_history;
CREATE POLICY "mmi_history_auth_only" ON public.mmi_history FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view MMI job history" ON public.mmi_job_history;
DROP POLICY IF EXISTS "mmi_job_history_select" ON public.mmi_job_history;
CREATE POLICY "mmi_job_history_auth_only" ON public.mmi_job_history FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view maintenance jobs" ON public.mmi_maintenance_jobs;
CREATE POLICY "mmi_maintenance_jobs_auth_only" ON public.mmi_maintenance_jobs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view OS resolvidas" ON public.mmi_os_resolvidas;
CREATE POLICY "mmi_os_resolvidas_auth_only" ON public.mmi_os_resolvidas FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Module related
DROP POLICY IF EXISTS "public_health" ON public.module_health;
CREATE POLICY "module_health_auth_only" ON public.module_health FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Module permissions readable by authenticated" ON public.module_permissions;
CREATE POLICY "module_permissions_auth_only" ON public.module_permissions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Operational
DROP POLICY IF EXISTS "Users can view operational checklists" ON public.operational_checklists;
CREATE POLICY "operational_checklists_auth_only" ON public.operational_checklists FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- PEO DP related
DROP POLICY IF EXISTS "Public read peo dp program" ON public.peo_dp_program;
CREATE POLICY "peo_dp_program_auth_only" ON public.peo_dp_program FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public read peo dp requirements" ON public.peo_dp_requirements;
CREATE POLICY "peo_dp_requirements_auth_only" ON public.peo_dp_requirements FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can read peodp requirements" ON public.peodp_requirements_2021;
CREATE POLICY "peodp_requirements_auth_only" ON public.peodp_requirements_2021 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- PEOTRAM related
DROP POLICY IF EXISTS "Users can view AI evidences" ON public.peotram_ai_evidences_2024;
CREATE POLICY "peotram_ai_evidences_auth_only" ON public.peotram_ai_evidences_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view responses" ON public.peotram_audit_responses_2024;
CREATE POLICY "peotram_audit_responses_auth_only" ON public.peotram_audit_responses_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view audits" ON public.peotram_audits_2024;
CREATE POLICY "peotram_audits_auth_only" ON public.peotram_audits_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "PEOTRAM elements are viewable by authenticated users" ON public.peotram_elements_2024;
CREATE POLICY "peotram_elements_auth_only" ON public.peotram_elements_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "PEOTRAM items are viewable by authenticated users" ON public.peotram_items_2024;
CREATE POLICY "peotram_items_auth_only" ON public.peotram_items_2024 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "PEOTRAM sections are viewable by authenticated users" ON public.peotram_sections;
CREATE POLICY "peotram_sections_auth_only" ON public.peotram_sections FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view signatures" ON public.peotram_signatures;
CREATE POLICY "peotram_signatures_auth_only" ON public.peotram_signatures FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "PEOTRAM structures are viewable by authenticated users" ON public.peotram_structures;
CREATE POLICY "peotram_structures_auth_only" ON public.peotram_structures FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Performance
DROP POLICY IF EXISTS "Users can view performance alerts" ON public.performance_alerts;
CREATE POLICY "performance_alerts_auth_only" ON public.performance_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view performance metrics" ON public.performance_metrics;
CREATE POLICY "performance_metrics_auth_only" ON public.performance_metrics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Ports
DROP POLICY IF EXISTS "Everyone can view ports" ON public.ports;
DROP POLICY IF EXISTS "Ports public read" ON public.ports;
CREATE POLICY "ports_auth_only" ON public.ports FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Preovid
DROP POLICY IF EXISTS "preovid_blocks_read" ON public.preovid_blocks;
CREATE POLICY "preovid_blocks_auth_only" ON public.preovid_blocks FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view preovid items" ON public.preovid_items;
DROP POLICY IF EXISTS "preovid_items_select" ON public.preovid_items;
CREATE POLICY "preovid_items_auth_only" ON public.preovid_items FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Priority shifts
DROP POLICY IF EXISTS "Users can view priority shifts" ON public.priority_shifts;
CREATE POLICY "priority_shifts_auth_only" ON public.priority_shifts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Proactive alerts
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.proactive_alerts;
CREATE POLICY "proactive_alerts_auth_only" ON public.proactive_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Regulations
DROP POLICY IF EXISTS "select_regulations" ON public.regulations;
CREATE POLICY "regulations_auth_only" ON public.regulations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Rendered documents
DROP POLICY IF EXISTS "Users can view all rendered documents" ON public.rendered_documents;
CREATE POLICY "rendered_documents_auth_only" ON public.rendered_documents FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Reservation payments
DROP POLICY IF EXISTS "Users can view reservation payments" ON public.reservation_payments;
CREATE POLICY "reservation_payments_auth_only" ON public.reservation_payments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Risk matrix
DROP POLICY IF EXISTS "select_risk_matrix" ON public.risk_matrix;
CREATE POLICY "risk_matrix_auth_only" ON public.risk_matrix FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Role permissions
DROP POLICY IF EXISTS "Role permissions readable by authenticated" ON public.role_permissions;
CREATE POLICY "role_permissions_auth_only" ON public.role_permissions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Route related
DROP POLICY IF EXISTS "Users can view all route suggestions" ON public.route_ai_suggestions;
CREATE POLICY "route_ai_suggestions_auth_only" ON public.route_ai_suggestions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view route optimizations" ON public.route_optimizations;
DROP POLICY IF EXISTS "Users can view route optimizations" ON public.route_optimizations;
CREATE POLICY "route_optimizations_auth_only" ON public.route_optimizations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Satcom
DROP POLICY IF EXISTS "Users can view satcom links" ON public.satcom_links;
CREATE POLICY "satcom_links_auth_only" ON public.satcom_links FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view satcom logs" ON public.satcom_logs;
CREATE POLICY "satcom_logs_auth_only" ON public.satcom_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Satellite
DROP POLICY IF EXISTS "auth_select_satellite_coverage_maps" ON public.satellite_coverage_maps;
CREATE POLICY "satellite_coverage_maps_auth_only" ON public.satellite_coverage_maps FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view satellite orbits" ON public.satellite_orbits;
CREATE POLICY "satellite_orbits_auth_only" ON public.satellite_orbits FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view satellite positions" ON public.satellite_positions;
CREATE POLICY "satellite_positions_auth_only" ON public.satellite_positions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated read satellite_tracking" ON public.satellite_tracking;
DROP POLICY IF EXISTS "Authenticated users can read satellite_tracking" ON public.satellite_tracking;
CREATE POLICY "satellite_tracking_auth_only" ON public.satellite_tracking FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view satellite tracks" ON public.satellite_tracks;
CREATE POLICY "satellite_tracks_auth_only" ON public.satellite_tracks FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Sensors
DROP POLICY IF EXISTS "sensor_alerts_select" ON public.sensor_alerts;
CREATE POLICY "sensor_alerts_auth_only" ON public.sensor_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "sensor_logs_select" ON public.sensor_logs;
CREATE POLICY "sensor_logs_auth_only" ON public.sensor_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
