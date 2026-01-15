-- =====================================================
-- RLS HARDENING BATCH 8: Satellite, Sensor, Sonar Tables
-- =====================================================

-- satcom_links
DROP POLICY IF EXISTS "satcom_links_policy" ON public.satcom_links;
CREATE POLICY "satcom_links_sel" ON public.satcom_links FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satcom_links_ins" ON public.satcom_links FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satcom_links_upd" ON public.satcom_links FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satcom_links_del" ON public.satcom_links FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satcom_logs
DROP POLICY IF EXISTS "satcom_logs_policy" ON public.satcom_logs;
CREATE POLICY "satcom_logs_sel" ON public.satcom_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satcom_logs_ins" ON public.satcom_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satcom_logs_admin_upd" ON public.satcom_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "satcom_logs_admin_del" ON public.satcom_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_alerts
DROP POLICY IF EXISTS "satellite_alerts_policy" ON public.satellite_alerts;
CREATE POLICY "satellite_alerts_sel" ON public.satellite_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_alerts_ins" ON public.satellite_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_alerts_upd" ON public.satellite_alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_alerts_del" ON public.satellite_alerts FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_coverage_maps
DROP POLICY IF EXISTS "satellite_coverage_maps_policy" ON public.satellite_coverage_maps;
CREATE POLICY "satellite_coverage_maps_sel" ON public.satellite_coverage_maps FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_coverage_maps_admin_ins" ON public.satellite_coverage_maps FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "satellite_coverage_maps_admin_upd" ON public.satellite_coverage_maps FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "satellite_coverage_maps_admin_del" ON public.satellite_coverage_maps FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_mission_links
DROP POLICY IF EXISTS "satellite_mission_links_policy" ON public.satellite_mission_links;
CREATE POLICY "satellite_mission_links_sel" ON public.satellite_mission_links FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_mission_links_ins" ON public.satellite_mission_links FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_mission_links_upd" ON public.satellite_mission_links FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_mission_links_del" ON public.satellite_mission_links FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_orbits
DROP POLICY IF EXISTS "satellite_orbits_policy" ON public.satellite_orbits;
CREATE POLICY "satellite_orbits_sel" ON public.satellite_orbits FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_orbits_admin_ins" ON public.satellite_orbits FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "satellite_orbits_admin_upd" ON public.satellite_orbits FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "satellite_orbits_admin_del" ON public.satellite_orbits FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_passes
DROP POLICY IF EXISTS "satellite_passes_policy" ON public.satellite_passes;
CREATE POLICY "satellite_passes_sel" ON public.satellite_passes FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_passes_ins" ON public.satellite_passes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_passes_upd" ON public.satellite_passes FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_passes_del" ON public.satellite_passes FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_positions
DROP POLICY IF EXISTS "satellite_positions_policy" ON public.satellite_positions;
CREATE POLICY "satellite_positions_sel" ON public.satellite_positions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_positions_ins" ON public.satellite_positions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_positions_upd" ON public.satellite_positions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_positions_del" ON public.satellite_positions FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_telemetry
DROP POLICY IF EXISTS "satellite_telemetry_policy" ON public.satellite_telemetry;
CREATE POLICY "satellite_telemetry_sel" ON public.satellite_telemetry FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_telemetry_ins" ON public.satellite_telemetry FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_telemetry_upd" ON public.satellite_telemetry FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_telemetry_del" ON public.satellite_telemetry FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_tracking
DROP POLICY IF EXISTS "satellite_tracking_policy" ON public.satellite_tracking;
CREATE POLICY "satellite_tracking_sel" ON public.satellite_tracking FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_tracking_ins" ON public.satellite_tracking FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_tracking_upd" ON public.satellite_tracking FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_tracking_del" ON public.satellite_tracking FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellite_tracks
DROP POLICY IF EXISTS "satellite_tracks_policy" ON public.satellite_tracks;
CREATE POLICY "satellite_tracks_sel" ON public.satellite_tracks FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_tracks_ins" ON public.satellite_tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_tracks_upd" ON public.satellite_tracks FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "satellite_tracks_del" ON public.satellite_tracks FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- satellites
DROP POLICY IF EXISTS "satellites_policy" ON public.satellites;
CREATE POLICY "satellites_sel" ON public.satellites FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "satellites_admin_ins" ON public.satellites FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "satellites_admin_upd" ON public.satellites FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "satellites_admin_del" ON public.satellites FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- security_scan_results (admin only)
DROP POLICY IF EXISTS "security_scan_results_policy" ON public.security_scan_results;
CREATE POLICY "security_scan_results_sel" ON public.security_scan_results FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "security_scan_results_admin_ins" ON public.security_scan_results FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "security_scan_results_admin_upd" ON public.security_scan_results FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "security_scan_results_admin_del" ON public.security_scan_results FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- sensor_alerts
DROP POLICY IF EXISTS "sensor_alerts_policy" ON public.sensor_alerts;
CREATE POLICY "sensor_alerts_sel" ON public.sensor_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "sensor_alerts_ins" ON public.sensor_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sensor_alerts_upd" ON public.sensor_alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sensor_alerts_del" ON public.sensor_alerts FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- sensor_logs
DROP POLICY IF EXISTS "sensor_logs_policy" ON public.sensor_logs;
CREATE POLICY "sensor_logs_sel" ON public.sensor_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "sensor_logs_ins" ON public.sensor_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sensor_logs_admin_upd" ON public.sensor_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "sensor_logs_admin_del" ON public.sensor_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- shared_alerts
DROP POLICY IF EXISTS "shared_alerts_policy" ON public.shared_alerts;
CREATE POLICY "shared_alerts_sel" ON public.shared_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "shared_alerts_ins" ON public.shared_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "shared_alerts_upd" ON public.shared_alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "shared_alerts_del" ON public.shared_alerts FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- smart_workflow_steps
DROP POLICY IF EXISTS "smart_workflow_steps_policy" ON public.smart_workflow_steps;
CREATE POLICY "smart_workflow_steps_sel" ON public.smart_workflow_steps FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "smart_workflow_steps_ins" ON public.smart_workflow_steps FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "smart_workflow_steps_upd" ON public.smart_workflow_steps FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "smart_workflow_steps_del" ON public.smart_workflow_steps FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- smart_workflows
DROP POLICY IF EXISTS "smart_workflows_policy" ON public.smart_workflows;
CREATE POLICY "smart_workflows_sel" ON public.smart_workflows FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "smart_workflows_ins" ON public.smart_workflows FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "smart_workflows_upd" ON public.smart_workflows FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "smart_workflows_del" ON public.smart_workflows FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- sonar_ai_analysis
DROP POLICY IF EXISTS "sonar_ai_analysis_policy" ON public.sonar_ai_analysis;
CREATE POLICY "sonar_ai_analysis_sel" ON public.sonar_ai_analysis FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_ai_analysis_ins" ON public.sonar_ai_analysis FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_ai_analysis_upd" ON public.sonar_ai_analysis FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_ai_analysis_del" ON public.sonar_ai_analysis FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- sonar_analyses
DROP POLICY IF EXISTS "sonar_analyses_policy" ON public.sonar_analyses;
CREATE POLICY "sonar_analyses_sel" ON public.sonar_analyses FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_analyses_ins" ON public.sonar_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_analyses_upd" ON public.sonar_analyses FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_analyses_del" ON public.sonar_analyses FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- sonar_data
DROP POLICY IF EXISTS "sonar_data_policy" ON public.sonar_data;
CREATE POLICY "sonar_data_sel" ON public.sonar_data FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_data_ins" ON public.sonar_data FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_data_upd" ON public.sonar_data FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_data_del" ON public.sonar_data FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- sonar_detection_logs
DROP POLICY IF EXISTS "sonar_detection_logs_policy" ON public.sonar_detection_logs;
CREATE POLICY "sonar_detection_logs_sel" ON public.sonar_detection_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_detection_logs_ins" ON public.sonar_detection_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_detection_logs_admin_upd" ON public.sonar_detection_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "sonar_detection_logs_admin_del" ON public.sonar_detection_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- sonar_inputs
DROP POLICY IF EXISTS "sonar_inputs_policy" ON public.sonar_inputs;
CREATE POLICY "sonar_inputs_sel" ON public.sonar_inputs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_inputs_ins" ON public.sonar_inputs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_inputs_upd" ON public.sonar_inputs FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sonar_inputs_del" ON public.sonar_inputs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));