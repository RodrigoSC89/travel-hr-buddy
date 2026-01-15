-- =====================================================
-- RLS HARDENING BATCH 2: Existing Tables Only
-- =====================================================

-- ai_behavior_snapshots
DROP POLICY IF EXISTS "ai_behavior_snapshots_select" ON public.ai_behavior_snapshots;
DROP POLICY IF EXISTS "Users can view ai behavior snapshots" ON public.ai_behavior_snapshots;
CREATE POLICY "ai_behavior_snapshots_auth_select" ON public.ai_behavior_snapshots FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_behavior_snapshots_admin_insert" ON public.ai_behavior_snapshots FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_behavior_snapshots_admin_update" ON public.ai_behavior_snapshots FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_behavior_snapshots_admin_delete" ON public.ai_behavior_snapshots FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_document_insights
DROP POLICY IF EXISTS "Users can view document insights" ON public.ai_document_insights;
DROP POLICY IF EXISTS "ai_document_insights_select" ON public.ai_document_insights;
CREATE POLICY "ai_document_insights_auth_select" ON public.ai_document_insights FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_document_insights_insert" ON public.ai_document_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_document_insights_update" ON public.ai_document_insights FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ai_document_insights_delete" ON public.ai_document_insights FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_learning_metrics
DROP POLICY IF EXISTS "Anyone can view AI metrics" ON public.ai_learning_metrics;
CREATE POLICY "ai_learning_metrics_auth_select" ON public.ai_learning_metrics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_learning_metrics_admin_insert" ON public.ai_learning_metrics FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_learning_metrics_admin_update" ON public.ai_learning_metrics FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_learning_metrics_admin_delete" ON public.ai_learning_metrics FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- ai_self_healing_logs
DROP POLICY IF EXISTS "Users can view self-healing logs" ON public.ai_self_healing_logs;
CREATE POLICY "ai_self_healing_logs_auth_select" ON public.ai_self_healing_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_self_healing_logs_admin_insert" ON public.ai_self_healing_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_self_healing_logs_admin_update" ON public.ai_self_healing_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "ai_self_healing_logs_admin_delete" ON public.ai_self_healing_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- alert_votes
DROP POLICY IF EXISTS "Anyone can view alert votes" ON public.alert_votes;
CREATE POLICY "alert_votes_auth_select" ON public.alert_votes FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "alert_votes_insert" ON public.alert_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "alert_votes_update" ON public.alert_votes FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "alert_votes_delete" ON public.alert_votes FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- autonomy_decision_logs
DROP POLICY IF EXISTS "auth_select_autonomy_decision_logs" ON public.autonomy_decision_logs;
CREATE POLICY "autonomy_decision_logs_auth_select" ON public.autonomy_decision_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "autonomy_decision_logs_insert" ON public.autonomy_decision_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "autonomy_decision_logs_admin_update" ON public.autonomy_decision_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "autonomy_decision_logs_admin_delete" ON public.autonomy_decision_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- blockchain_ledger
DROP POLICY IF EXISTS "Authenticated users can view blockchain records" ON public.blockchain_ledger;
CREATE POLICY "blockchain_ledger_auth_select" ON public.blockchain_ledger FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "blockchain_ledger_admin_insert" ON public.blockchain_ledger FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "blockchain_ledger_admin_update" ON public.blockchain_ledger FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "blockchain_ledger_admin_delete" ON public.blockchain_ledger FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- channel_status_log
DROP POLICY IF EXISTS "Users can view channel status logs" ON public.channel_status_log;
CREATE POLICY "channel_status_log_auth_select" ON public.channel_status_log FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "channel_status_log_insert" ON public.channel_status_log FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "channel_status_log_admin_update" ON public.channel_status_log FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "channel_status_log_admin_delete" ON public.channel_status_log FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- checklist_records
DROP POLICY IF EXISTS "Users can manage checklist records" ON public.checklist_records;
CREATE POLICY "checklist_records_auth_select" ON public.checklist_records FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "checklist_records_insert" ON public.checklist_records FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "checklist_records_update" ON public.checklist_records FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "checklist_records_delete" ON public.checklist_records FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- classification_societies
DROP POLICY IF EXISTS "Auth users can read classification_societies" ON public.classification_societies;
CREATE POLICY "classification_societies_auth_select" ON public.classification_societies FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "classification_societies_admin_insert" ON public.classification_societies FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "classification_societies_admin_update" ON public.classification_societies FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "classification_societies_admin_delete" ON public.classification_societies FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- clone_registry
DROP POLICY IF EXISTS "clone_registry_policy" ON public.clone_registry;
CREATE POLICY "clone_registry_auth_select" ON public.clone_registry FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "clone_registry_admin_insert" ON public.clone_registry FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "clone_registry_admin_update" ON public.clone_registry FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "clone_registry_admin_delete" ON public.clone_registry FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- clone_sync_log
DROP POLICY IF EXISTS "clone_sync_log_policy" ON public.clone_sync_log;
CREATE POLICY "clone_sync_log_auth_select" ON public.clone_sync_log FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "clone_sync_log_insert" ON public.clone_sync_log FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "clone_sync_log_admin_update" ON public.clone_sync_log FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "clone_sync_log_admin_delete" ON public.clone_sync_log FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- cognitive_feedback
DROP POLICY IF EXISTS "cognitive_feedback_policy" ON public.cognitive_feedback;
CREATE POLICY "cognitive_feedback_auth_select" ON public.cognitive_feedback FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "cognitive_feedback_insert" ON public.cognitive_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cognitive_feedback_update" ON public.cognitive_feedback FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cognitive_feedback_delete" ON public.cognitive_feedback FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- compliance_audit_logs
DROP POLICY IF EXISTS "compliance_audit_logs_policy" ON public.compliance_audit_logs;
CREATE POLICY "compliance_audit_logs_auth_select" ON public.compliance_audit_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "compliance_audit_logs_insert" ON public.compliance_audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "compliance_audit_logs_admin_update" ON public.compliance_audit_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "compliance_audit_logs_admin_delete" ON public.compliance_audit_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- compliance_items
DROP POLICY IF EXISTS "compliance_items_policy" ON public.compliance_items;
CREATE POLICY "compliance_items_auth_select" ON public.compliance_items FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "compliance_items_insert" ON public.compliance_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "compliance_items_update" ON public.compliance_items FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "compliance_items_delete" ON public.compliance_items FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- context_history
DROP POLICY IF EXISTS "context_history_policy" ON public.context_history;
CREATE POLICY "context_history_auth_select" ON public.context_history FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "context_history_insert" ON public.context_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "context_history_update" ON public.context_history FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "context_history_delete" ON public.context_history FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- coordination_agents
DROP POLICY IF EXISTS "coordination_agents_policy" ON public.coordination_agents;
CREATE POLICY "coordination_agents_auth_select" ON public.coordination_agents FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "coordination_agents_admin_insert" ON public.coordination_agents FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "coordination_agents_admin_update" ON public.coordination_agents FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "coordination_agents_admin_delete" ON public.coordination_agents FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- coordination_decisions
DROP POLICY IF EXISTS "coordination_decisions_policy" ON public.coordination_decisions;
CREATE POLICY "coordination_decisions_auth_select" ON public.coordination_decisions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "coordination_decisions_insert" ON public.coordination_decisions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "coordination_decisions_admin_update" ON public.coordination_decisions FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "coordination_decisions_admin_delete" ON public.coordination_decisions FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- coordination_tasks
DROP POLICY IF EXISTS "coordination_tasks_policy" ON public.coordination_tasks;
CREATE POLICY "coordination_tasks_auth_select" ON public.coordination_tasks FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "coordination_tasks_insert" ON public.coordination_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "coordination_tasks_update" ON public.coordination_tasks FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "coordination_tasks_delete" ON public.coordination_tasks FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- copilot_sessions
DROP POLICY IF EXISTS "copilot_sessions_policy" ON public.copilot_sessions;
CREATE POLICY "copilot_sessions_auth_select" ON public.copilot_sessions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "copilot_sessions_insert" ON public.copilot_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "copilot_sessions_update" ON public.copilot_sessions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "copilot_sessions_delete" ON public.copilot_sessions FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- crew_health_metrics (sensitive - admin only)
DROP POLICY IF EXISTS "auth_all_crew_health_metrics" ON public.crew_health_metrics;
DROP POLICY IF EXISTS "auth_select_crew_health_metrics" ON public.crew_health_metrics;
CREATE POLICY "crew_health_metrics_admin_select" ON public.crew_health_metrics FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "crew_health_metrics_admin_insert" ON public.crew_health_metrics FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "crew_health_metrics_admin_update" ON public.crew_health_metrics FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "crew_health_metrics_admin_delete" ON public.crew_health_metrics FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- crew_performance
DROP POLICY IF EXISTS "crew_performance_policy" ON public.crew_performance;
CREATE POLICY "crew_performance_auth_select" ON public.crew_performance FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "crew_performance_insert" ON public.crew_performance FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "crew_performance_update" ON public.crew_performance FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "crew_performance_delete" ON public.crew_performance FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- cron_execution_logs
DROP POLICY IF EXISTS "cron_execution_logs_policy" ON public.cron_execution_logs;
CREATE POLICY "cron_execution_logs_auth_select" ON public.cron_execution_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "cron_execution_logs_admin_insert" ON public.cron_execution_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "cron_execution_logs_admin_update" ON public.cron_execution_logs FOR UPDATE TO authenticated USING (public.is_admin_or_hr(auth.uid())) WITH CHECK (public.is_admin_or_hr(auth.uid()));
CREATE POLICY "cron_execution_logs_admin_delete" ON public.cron_execution_logs FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- dashboard_activities
DROP POLICY IF EXISTS "dashboard_activities_policy" ON public.dashboard_activities;
CREATE POLICY "dashboard_activities_auth_select" ON public.dashboard_activities FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "dashboard_activities_insert" ON public.dashboard_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "dashboard_activities_update" ON public.dashboard_activities FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "dashboard_activities_delete" ON public.dashboard_activities FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- dashboard_metrics
DROP POLICY IF EXISTS "dashboard_metrics_policy" ON public.dashboard_metrics;
CREATE POLICY "dashboard_metrics_auth_select" ON public.dashboard_metrics FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "dashboard_metrics_insert" ON public.dashboard_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "dashboard_metrics_update" ON public.dashboard_metrics FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "dashboard_metrics_delete" ON public.dashboard_metrics FOR DELETE TO authenticated USING (public.is_admin_or_hr(auth.uid()));