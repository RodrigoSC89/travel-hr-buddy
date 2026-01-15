-- =============================================
-- RLS HARDENING BATCH 3B - Tabelas restantes
-- =============================================

-- VESSEL_AI_CONTEXTS - Apenas autenticados
DROP POLICY IF EXISTS "auth_all_vessel_ai_contexts" ON public.vessel_ai_contexts;
DROP POLICY IF EXISTS "Authenticated users can manage vessel_ai_contexts" ON public.vessel_ai_contexts;
DROP POLICY IF EXISTS "Allow authenticated all vessel_ai_contexts" ON public.vessel_ai_contexts;
CREATE POLICY "vessel_ai_contexts_auth_all" ON public.vessel_ai_contexts
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- VESSEL_ALERT_NOTIFICATIONS - Apenas Admin
DROP POLICY IF EXISTS "System can create notifications" ON public.vessel_alert_notifications;
CREATE POLICY "vessel_alert_notifications_admin_ins" ON public.vessel_alert_notifications
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- VESSEL_PERFORMANCE - Apenas autenticados
DROP POLICY IF EXISTS "authenticated_access" ON public.vessel_performance;
DROP POLICY IF EXISTS "auth_access" ON public.vessel_performance;
CREATE POLICY "vessel_performance_auth_all" ON public.vessel_performance
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- VESSEL_PERFORMANCE_METRICS - Apenas Admin
DROP POLICY IF EXISTS "System can insert metrics" ON public.vessel_performance_metrics;
CREATE POLICY "vessel_performance_metrics_admin_ins" ON public.vessel_performance_metrics
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- VESSEL_TRACKING - Apenas Admin
DROP POLICY IF EXISTS "System can insert vessel tracking" ON public.vessel_tracking;
CREATE POLICY "vessel_tracking_admin_ins" ON public.vessel_tracking
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- VOICE_METRICS - Apenas Admin
DROP POLICY IF EXISTS "System can create voice metrics" ON public.voice_metrics;
CREATE POLICY "voice_metrics_admin_ins" ON public.voice_metrics
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- VOICE_TRANSCRIPTS - Apenas autenticados
DROP POLICY IF EXISTS "voice_transcripts_policy" ON public.voice_transcripts;
CREATE POLICY "voice_transcripts_auth_all" ON public.voice_transcripts
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- VOYAGE_ROUTES - Apenas autenticados
DROP POLICY IF EXISTS "Users can delete voyage routes" ON public.voyage_routes;
DROP POLICY IF EXISTS "Users can create voyage routes" ON public.voyage_routes;
CREATE POLICY "voyage_routes_auth_ins" ON public.voyage_routes
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "voyage_routes_auth_del" ON public.voyage_routes
FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);

-- WATCHDOG_BEHAVIOR_ALERTS - Apenas Admin
DROP POLICY IF EXISTS "watchdog_behavior_alerts_policy" ON public.watchdog_behavior_alerts;
DROP POLICY IF EXISTS "System can create watchdog alerts" ON public.watchdog_behavior_alerts;
DROP POLICY IF EXISTS "System can update watchdog alerts" ON public.watchdog_behavior_alerts;
CREATE POLICY "watchdog_behavior_alerts_admin_all" ON public.watchdog_behavior_alerts
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- WATCHDOG_LOGS - Apenas Admin
DROP POLICY IF EXISTS "System can insert watchdog logs" ON public.watchdog_logs;
CREATE POLICY "watchdog_logs_admin_ins" ON public.watchdog_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- WEATHER_CACHE - Apenas Admin
DROP POLICY IF EXISTS "System can manage weather cache" ON public.weather_cache;
DROP POLICY IF EXISTS "System manage weather cache" ON public.weather_cache;
CREATE POLICY "weather_cache_admin_all" ON public.weather_cache
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- WEATHER_CONDITIONS - Apenas autenticados
DROP POLICY IF EXISTS "weather_conditions_policy" ON public.weather_conditions;
CREATE POLICY "weather_conditions_auth_all" ON public.weather_conditions
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- WEBHOOK_EVENTS - Apenas Admin
DROP POLICY IF EXISTS "System can insert webhook events" ON public.webhook_events;
CREATE POLICY "webhook_events_admin_ins" ON public.webhook_events
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- WEBHOOK_LOGS - Apenas Admin
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.webhook_logs;
CREATE POLICY "webhook_logs_admin_ins" ON public.webhook_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- WHISTLEBLOWER_REPORTS - Apenas autenticados (anônimo é importante)
DROP POLICY IF EXISTS "insert_whistleblower" ON public.whistleblower_reports;
CREATE POLICY "whistleblower_reports_auth_ins" ON public.whistleblower_reports
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- WORKFLOW_STEPS - Apenas autenticados
DROP POLICY IF EXISTS "Users can manage workflow steps" ON public.workflow_steps;
DROP POLICY IF EXISTS "workflow_steps_all" ON public.workflow_steps;
CREATE POLICY "workflow_steps_auth_all" ON public.workflow_steps
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- WORKFLOW_SUGGESTIONS - Apenas autenticados
DROP POLICY IF EXISTS "workflow_suggestions_all" ON public.workflow_suggestions;
DROP POLICY IF EXISTS "Users can manage workflow suggestions" ON public.workflow_suggestions;
CREATE POLICY "workflow_suggestions_auth_all" ON public.workflow_suggestions
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);