-- =============================================
-- RLS HARDENING BATCH 3A - Sonar + System tables
-- =============================================

-- SONAR_AI_ANALYSIS - Apenas autenticados
DROP POLICY IF EXISTS "sonar_ai_analysis_insert" ON public.sonar_ai_analysis;
DROP POLICY IF EXISTS "Users can insert sonar AI analysis" ON public.sonar_ai_analysis;
CREATE POLICY "sonar_ai_analysis_auth_ins" ON public.sonar_ai_analysis
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- SONAR_DETECTION_LOGS - Apenas autenticados
DROP POLICY IF EXISTS "sonar_detection_logs_insert" ON public.sonar_detection_logs;
DROP POLICY IF EXISTS "Users can insert sonar detection logs" ON public.sonar_detection_logs;
CREATE POLICY "sonar_detection_logs_auth_ins" ON public.sonar_detection_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- SONAR_INPUTS - Apenas autenticados
DROP POLICY IF EXISTS "auth_all_sonar_inputs" ON public.sonar_inputs;
DROP POLICY IF EXISTS "Authenticated users can insert sonar_inputs" ON public.sonar_inputs;
DROP POLICY IF EXISTS "Allow authenticated insert sonar_inputs" ON public.sonar_inputs;
CREATE POLICY "sonar_inputs_auth_all" ON public.sonar_inputs
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- SYSTEM_ALERTS - Apenas Admin
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.system_alerts;
DROP POLICY IF EXISTS "Authenticated users can acknowledge alerts" ON public.system_alerts;
CREATE POLICY "system_alerts_admin_ins" ON public.system_alerts
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "system_alerts_admin_upd" ON public.system_alerts
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- SYSTEM_BACKUPS - Apenas Admin
DROP POLICY IF EXISTS "System can manage backups" ON public.system_backups;
CREATE POLICY "system_backups_admin_all" ON public.system_backups
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- SYSTEM_HEALTH - Apenas Admin
DROP POLICY IF EXISTS "System can manage system health" ON public.system_health;
CREATE POLICY "system_health_admin_all" ON public.system_health
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- SYSTEM_HEALTH_CHECKS - Apenas Admin
DROP POLICY IF EXISTS "Service role can insert health checks" ON public.system_health_checks;
CREATE POLICY "system_health_checks_admin_ins" ON public.system_health_checks
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- SYSTEM_LOGS - Apenas Admin
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;
CREATE POLICY "system_logs_admin_ins" ON public.system_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- SYSTEM_STATUS - Apenas Admin
DROP POLICY IF EXISTS "System can manage status" ON public.system_status;
CREATE POLICY "system_status_admin_all" ON public.system_status
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- TELEMETRY_ALERTS - Apenas autenticados
DROP POLICY IF EXISTS "Authenticated users can manage telemetry alerts" ON public.telemetry_alerts;
DROP POLICY IF EXISTS "telemetry_alerts_policy" ON public.telemetry_alerts;
CREATE POLICY "telemetry_alerts_auth_all" ON public.telemetry_alerts
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- TELEMETRY_INSIGHTS - Apenas autenticados
DROP POLICY IF EXISTS "Authenticated users can manage telemetry insights" ON public.telemetry_insights;
DROP POLICY IF EXISTS "telemetry_insights_policy" ON public.telemetry_insights;
CREATE POLICY "telemetry_insights_auth_all" ON public.telemetry_insights
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- TELEMETRY_LOGS - Apenas autenticados
DROP POLICY IF EXISTS "Authenticated users can insert telemetry logs" ON public.telemetry_logs;
CREATE POLICY "telemetry_logs_auth_ins" ON public.telemetry_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- TEMPLATES - Apenas autenticados
DROP POLICY IF EXISTS "templates_policy" ON public.templates;
CREATE POLICY "templates_auth_all" ON public.templates
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- TIDE_ALERTS - Apenas Admin
DROP POLICY IF EXISTS "System can insert tide alerts" ON public.tide_alerts;
DROP POLICY IF EXISTS "System insert tide alerts" ON public.tide_alerts;
CREATE POLICY "tide_alerts_admin_ins" ON public.tide_alerts
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- TIDE_CACHE - Apenas Admin
DROP POLICY IF EXISTS "System can manage tide cache" ON public.tide_cache;
CREATE POLICY "tide_cache_admin_all" ON public.tide_cache
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- TRACKING_GNSS_LOGS - Apenas autenticados
DROP POLICY IF EXISTS "Users can insert GNSS logs" ON public.tracking_gnss_logs;
CREATE POLICY "tracking_gnss_logs_auth_ins" ON public.tracking_gnss_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- TRAINING_RECORDS - Apenas autenticados
DROP POLICY IF EXISTS "auth_access" ON public.training_records;
DROP POLICY IF EXISTS "authenticated_access" ON public.training_records;
CREATE POLICY "training_records_auth_all" ON public.training_records
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- TRAVEL_LOGS - Apenas Admin
DROP POLICY IF EXISTS "System can insert travel logs" ON public.travel_logs;
CREATE POLICY "travel_logs_admin_ins" ON public.travel_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- TRAVEL_PREDICTIONS - Apenas Admin
DROP POLICY IF EXISTS "System can manage travel predictions" ON public.travel_predictions;
CREATE POLICY "travel_predictions_admin_all" ON public.travel_predictions
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- TRUST_EVENTS - Apenas autenticados
DROP POLICY IF EXISTS "Authenticated users can insert trust events" ON public.trust_events;
CREATE POLICY "trust_events_auth_ins" ON public.trust_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);