-- =====================================================
-- RLS HARDENING BATCH 1: Core Tables
-- Replace WITH CHECK (true) with auth.uid() IS NOT NULL
-- =====================================================

-- active_sessions: Admin only
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.active_sessions;
CREATE POLICY "active_sessions_authenticated_manage" ON public.active_sessions
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid())))
WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid())));

-- agent_registry: Admin only write
DROP POLICY IF EXISTS "Authenticated users can read agent registry" ON public.agent_registry;
CREATE POLICY "agent_registry_select" ON public.agent_registry FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "agent_registry_admin_manage" ON public.agent_registry FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- agent_swarm_metrics: Admin only write
DROP POLICY IF EXISTS "Authenticated users can read agent metrics" ON public.agent_swarm_metrics;
CREATE POLICY "agent_swarm_metrics_select" ON public.agent_swarm_metrics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "agent_swarm_metrics_admin_manage" ON public.agent_swarm_metrics FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- ai_configurations: Admin only
DROP POLICY IF EXISTS "Admins can manage AI configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Users can view AI configurations" ON public.ai_configurations;
CREATE POLICY "ai_configurations_select" ON public.ai_configurations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_configurations_admin_manage" ON public.ai_configurations FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_configurations_admin_update" ON public.ai_configurations FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_configurations_admin_delete" ON public.ai_configurations FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_decisions: Admin only
DROP POLICY IF EXISTS "Admins can manage AI decisions" ON public.ai_decisions;
DROP POLICY IF EXISTS "Users can view AI decisions" ON public.ai_decisions;
CREATE POLICY "ai_decisions_select" ON public.ai_decisions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_decisions_admin_manage" ON public.ai_decisions FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_decisions_admin_update" ON public.ai_decisions FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_decisions_admin_delete" ON public.ai_decisions FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_feedback_scores: Admin manage
DROP POLICY IF EXISTS "System can manage AI feedback" ON public.ai_feedback_scores;
CREATE POLICY "ai_feedback_scores_select" ON public.ai_feedback_scores FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_feedback_scores_insert" ON public.ai_feedback_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_feedback_scores_admin_manage" ON public.ai_feedback_scores FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_feedback_scores_admin_delete" ON public.ai_feedback_scores FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_generated_documents: org-based
DROP POLICY IF EXISTS "ai_generated_documents_all" ON public.ai_generated_documents;
CREATE POLICY "ai_generated_documents_select" ON public.ai_generated_documents FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_generated_documents_insert" ON public.ai_generated_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_generated_documents_update" ON public.ai_generated_documents FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_generated_documents_delete" ON public.ai_generated_documents FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_inspection_feedback: Admin manage
DROP POLICY IF EXISTS "auth_all_ai_inspection_feedback" ON public.ai_inspection_feedback;
DROP POLICY IF EXISTS "Allow authenticated read ai_inspection_feedback" ON public.ai_inspection_feedback;
CREATE POLICY "ai_inspection_feedback_select" ON public.ai_inspection_feedback FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_inspection_feedback_insert" ON public.ai_inspection_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_inspection_feedback_update" ON public.ai_inspection_feedback FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_inspection_feedback_delete" ON public.ai_inspection_feedback FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_memory_events: System/Admin
DROP POLICY IF EXISTS "System can manage AI memory events" ON public.ai_memory_events;
CREATE POLICY "ai_memory_events_select" ON public.ai_memory_events FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_memory_events_insert" ON public.ai_memory_events FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_memory_events_admin_manage" ON public.ai_memory_events FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_memory_events_admin_delete" ON public.ai_memory_events FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ais_events
DROP POLICY IF EXISTS "ais_events_policy" ON public.ais_events;
CREATE POLICY "ais_events_select" ON public.ais_events FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ais_events_insert" ON public.ais_events FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ais_events_update" ON public.ais_events FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ais_events_delete" ON public.ais_events FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- analytics_insights
DROP POLICY IF EXISTS "System can manage insights" ON public.analytics_insights;
CREATE POLICY "analytics_insights_select" ON public.analytics_insights FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "analytics_insights_insert" ON public.analytics_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "analytics_insights_admin_manage" ON public.analytics_insights FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "analytics_insights_admin_delete" ON public.analytics_insights FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- api_gateway_webhook_deliveries
DROP POLICY IF EXISTS "System can manage webhook deliveries" ON public.api_gateway_webhook_deliveries;
CREATE POLICY "api_gateway_webhook_deliveries_select" ON public.api_gateway_webhook_deliveries FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "api_gateway_webhook_deliveries_insert" ON public.api_gateway_webhook_deliveries FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "api_gateway_webhook_deliveries_admin" ON public.api_gateway_webhook_deliveries FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "api_gateway_webhook_deliveries_delete" ON public.api_gateway_webhook_deliveries FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- api_integrations
DROP POLICY IF EXISTS "auth_api_integrations" ON public.api_integrations;
CREATE POLICY "api_integrations_select" ON public.api_integrations FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "api_integrations_admin_insert" ON public.api_integrations FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "api_integrations_admin_update" ON public.api_integrations FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "api_integrations_admin_delete" ON public.api_integrations FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- api_quota_tracking
DROP POLICY IF EXISTS "auth_api_quota_tracking" ON public.api_quota_tracking;
CREATE POLICY "api_quota_tracking_select" ON public.api_quota_tracking FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "api_quota_tracking_insert" ON public.api_quota_tracking FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "api_quota_tracking_admin" ON public.api_quota_tracking FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "api_quota_tracking_delete" ON public.api_quota_tracking FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- api_rate_limits
DROP POLICY IF EXISTS "System can manage rate limits" ON public.api_rate_limits;
CREATE POLICY "api_rate_limits_select" ON public.api_rate_limits FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "api_rate_limits_admin_insert" ON public.api_rate_limits FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "api_rate_limits_admin_update" ON public.api_rate_limits FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "api_rate_limits_admin_delete" ON public.api_rate_limits FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- autonomous_tasks
DROP POLICY IF EXISTS "autonomous_tasks_policy" ON public.autonomous_tasks;
CREATE POLICY "autonomous_tasks_select" ON public.autonomous_tasks FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "autonomous_tasks_insert" ON public.autonomous_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "autonomous_tasks_update" ON public.autonomous_tasks FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "autonomous_tasks_delete" ON public.autonomous_tasks FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- autonomy_configs
DROP POLICY IF EXISTS "auth_all_autonomy_configs" ON public.autonomy_configs;
DROP POLICY IF EXISTS "auth_select_autonomy_configs" ON public.autonomy_configs;
CREATE POLICY "autonomy_configs_select" ON public.autonomy_configs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "autonomy_configs_admin_insert" ON public.autonomy_configs FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "autonomy_configs_admin_update" ON public.autonomy_configs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "autonomy_configs_admin_delete" ON public.autonomy_configs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- autonomy_metrics
DROP POLICY IF EXISTS "auth_all_autonomy_metrics" ON public.autonomy_metrics;
DROP POLICY IF EXISTS "auth_select_autonomy_metrics" ON public.autonomy_metrics;
CREATE POLICY "autonomy_metrics_select" ON public.autonomy_metrics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "autonomy_metrics_insert" ON public.autonomy_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "autonomy_metrics_admin_update" ON public.autonomy_metrics FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "autonomy_metrics_admin_delete" ON public.autonomy_metrics FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- autonomy_rules
DROP POLICY IF EXISTS "autonomy_rules_policy" ON public.autonomy_rules;
CREATE POLICY "autonomy_rules_select" ON public.autonomy_rules FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "autonomy_rules_admin_insert" ON public.autonomy_rules FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "autonomy_rules_admin_update" ON public.autonomy_rules FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "autonomy_rules_admin_delete" ON public.autonomy_rules FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));