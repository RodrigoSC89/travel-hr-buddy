
-- =============================================
-- RLS HARDENING FINAL BATCH - LAST 41 POLICIES
-- =============================================

-- Shared Alerts
DROP POLICY IF EXISTS "Anyone can view shared alerts" ON public.shared_alerts;
CREATE POLICY "shared_alerts_auth_only" ON public.shared_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Sonar related
DROP POLICY IF EXISTS "sonar_ai_analysis_select" ON public.sonar_ai_analysis;
DROP POLICY IF EXISTS "Users can view sonar AI analysis" ON public.sonar_ai_analysis;
CREATE POLICY "sonar_ai_analysis_auth_only" ON public.sonar_ai_analysis FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view sonar_analyses" ON public.sonar_analyses;
DROP POLICY IF EXISTS "sonar_analyses_select" ON public.sonar_analyses;
CREATE POLICY "sonar_analyses_auth_only" ON public.sonar_analyses FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view sonar_data" ON public.sonar_data;
DROP POLICY IF EXISTS "sonar_data_select" ON public.sonar_data;
CREATE POLICY "sonar_data_auth_only" ON public.sonar_data FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "sonar_detection_logs_select" ON public.sonar_detection_logs;
DROP POLICY IF EXISTS "Users can view sonar detection logs" ON public.sonar_detection_logs;
CREATE POLICY "sonar_detection_logs_auth_only" ON public.sonar_detection_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow authenticated read sonar_inputs" ON public.sonar_inputs;
DROP POLICY IF EXISTS "Authenticated users can read sonar_inputs" ON public.sonar_inputs;
CREATE POLICY "sonar_inputs_auth_only" ON public.sonar_inputs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Status related
DROP POLICY IF EXISTS "Public can view components" ON public.status_components;
CREATE POLICY "status_components_auth_only" ON public.status_components FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public can view incident updates" ON public.status_incident_updates;
CREATE POLICY "status_incident_updates_auth_only" ON public.status_incident_updates FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public can view incidents" ON public.status_incidents;
CREATE POLICY "status_incidents_auth_only" ON public.status_incidents FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public can view uptime" ON public.status_uptime_records;
CREATE POLICY "status_uptime_auth_only" ON public.status_uptime_records FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- STCW
DROP POLICY IF EXISTS "public_read_competencies" ON public.stcw_competencies;
CREATE POLICY "stcw_competencies_auth_only" ON public.stcw_competencies FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- System
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.system_alerts;
CREATE POLICY "system_alerts_auth_only" ON public.system_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Everyone can view system status" ON public.system_status;
DROP POLICY IF EXISTS "system_status_read" ON public.system_status;
CREATE POLICY "system_status_auth_only" ON public.system_status FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Telemetry
DROP POLICY IF EXISTS "Authenticated users can view telemetry alerts" ON public.telemetry_alerts;
CREATE POLICY "telemetry_alerts_auth_only" ON public.telemetry_alerts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view telemetry insights" ON public.telemetry_insights;
CREATE POLICY "telemetry_insights_auth_only" ON public.telemetry_insights FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view telemetry logs" ON public.telemetry_logs;
CREATE POLICY "telemetry_logs_auth_only" ON public.telemetry_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Template
DROP POLICY IF EXISTS "Users can view all template placeholders" ON public.template_placeholders;
CREATE POLICY "template_placeholders_auth_only" ON public.template_placeholders FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Tenant
DROP POLICY IF EXISTS "Users can view their tenant modules" ON public.tenant_modules;
CREATE POLICY "tenant_modules_auth_only" ON public.tenant_modules FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Tide
DROP POLICY IF EXISTS "Anyone can read tide cache" ON public.tide_cache;
CREATE POLICY "tide_cache_auth_only" ON public.tide_cache FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Tracking
DROP POLICY IF EXISTS "Users can view GNSS logs" ON public.tracking_gnss_logs;
CREATE POLICY "tracking_gnss_logs_auth_only" ON public.tracking_gnss_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Training
DROP POLICY IF EXISTS "training_completions_select" ON public.training_completions;
CREATE POLICY "training_completions_auth_only" ON public.training_completions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view training modules" ON public.training_modules;
CREATE POLICY "training_modules_auth_only" ON public.training_modules FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Travel
DROP POLICY IF EXISTS "Everyone can view travel predictions" ON public.travel_predictions;
CREATE POLICY "travel_predictions_auth_only" ON public.travel_predictions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Trust
DROP POLICY IF EXISTS "Users can view trust compliance logs" ON public.trust_compliance_logs;
CREATE POLICY "trust_compliance_logs_auth_only" ON public.trust_compliance_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can read trust events" ON public.trust_events;
CREATE POLICY "trust_events_auth_only" ON public.trust_events FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Vessel
DROP POLICY IF EXISTS "Allow authenticated read vessel_ai_contexts" ON public.vessel_ai_contexts;
DROP POLICY IF EXISTS "Authenticated users can view vessel_ai_contexts" ON public.vessel_ai_contexts;
CREATE POLICY "vessel_ai_contexts_auth_only" ON public.vessel_ai_contexts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view vessel status" ON public.vessel_status;
CREATE POLICY "vessel_status_auth_only" ON public.vessel_status FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view vessels" ON public.vessels;
CREATE POLICY "vessels_auth_only" ON public.vessels FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Voyage
DROP POLICY IF EXISTS "Users can view all voyage routes" ON public.voyage_routes;
CREATE POLICY "voyage_routes_auth_only" ON public.voyage_routes FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Weather
DROP POLICY IF EXISTS "Anyone can read weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "Public read weather cache" ON public.weather_cache;
CREATE POLICY "weather_cache_auth_only" ON public.weather_cache FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Whistleblower
DROP POLICY IF EXISTS "select_whistleblower" ON public.whistleblower_reports;
CREATE POLICY "whistleblower_auth_only" ON public.whistleblower_reports FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Workflow
DROP POLICY IF EXISTS "Users can view workflow steps" ON public.workflow_steps;
CREATE POLICY "workflow_steps_auth_only" ON public.workflow_steps FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view workflow suggestions" ON public.workflow_suggestions;
CREATE POLICY "workflow_suggestions_auth_only" ON public.workflow_suggestions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
