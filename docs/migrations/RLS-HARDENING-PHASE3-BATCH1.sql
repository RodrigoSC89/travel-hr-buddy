-- =============================================
-- RLS HARDENING PHASE 3 - BATCH 1 (50 POLICIES)
-- Execute: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- =============================================

-- ACTIVE_SESSIONS: Service role only (internal)
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.active_sessions;
CREATE POLICY "sessions_admin_only" ON public.active_sessions
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- AGENT_REGISTRY: Org isolation
DROP POLICY IF EXISTS "Authenticated users can read agent registry" ON public.agent_registry;
CREATE POLICY "agent_registry_org_select" ON public.agent_registry
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AGENT_SWARM_METRICS: Org isolation
DROP POLICY IF EXISTS "Authenticated users can read agent metrics" ON public.agent_swarm_metrics;
CREATE POLICY "swarm_metrics_org_select" ON public.agent_swarm_metrics
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AI_BEHAVIOR_SNAPSHOTS: Org isolation
DROP POLICY IF EXISTS "ai_behavior_snapshots_select" ON public.ai_behavior_snapshots;
DROP POLICY IF EXISTS "Users can view ai behavior snapshots" ON public.ai_behavior_snapshots;
CREATE POLICY "ai_behavior_org_select" ON public.ai_behavior_snapshots
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AI_CONFIGURATIONS: Admin only
DROP POLICY IF EXISTS "Users can view AI configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Admins can manage AI configurations" ON public.ai_configurations;
CREATE POLICY "ai_config_admin_manage" ON public.ai_configurations
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- AI_DECISIONS: Org isolation
DROP POLICY IF EXISTS "Users can view AI decisions" ON public.ai_decisions;
DROP POLICY IF EXISTS "Admins can manage AI decisions" ON public.ai_decisions;
CREATE POLICY "ai_decisions_org_select" ON public.ai_decisions
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "ai_decisions_admin_manage" ON public.ai_decisions
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- AI_DOCUMENT_INSIGHTS: User + Org isolation
DROP POLICY IF EXISTS "ai_document_insights_select" ON public.ai_document_insights;
DROP POLICY IF EXISTS "Users can view document insights" ON public.ai_document_insights;
CREATE POLICY "ai_doc_insights_user_select" ON public.ai_document_insights
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AI_FEEDBACK_SCORES: User isolation
DROP POLICY IF EXISTS "System can manage AI feedback" ON public.ai_feedback_scores;
CREATE POLICY "ai_feedback_user_manage" ON public.ai_feedback_scores
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- AI_GENERATED_DOCUMENTS: User + Org isolation
DROP POLICY IF EXISTS "ai_generated_documents_all" ON public.ai_generated_documents;
CREATE POLICY "ai_gen_docs_user_select" ON public.ai_generated_documents
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AI_INSPECTION_FEEDBACK: Org isolation
DROP POLICY IF EXISTS "Allow authenticated read ai_inspection_feedback" ON public.ai_inspection_feedback;
DROP POLICY IF EXISTS "auth_all_ai_inspection_feedback" ON public.ai_inspection_feedback;
CREATE POLICY "ai_inspection_org_select" ON public.ai_inspection_feedback
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AI_LEARNING_METRICS: Org isolation
DROP POLICY IF EXISTS "Anyone can view AI metrics" ON public.ai_learning_metrics;
CREATE POLICY "ai_learning_org_select" ON public.ai_learning_metrics
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AI_MEMORY_EVENTS: User isolation
DROP POLICY IF EXISTS "System can manage AI memory events" ON public.ai_memory_events;
CREATE POLICY "ai_memory_user_select" ON public.ai_memory_events
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- AI_SELF_HEALING_LOGS: Admin only
DROP POLICY IF EXISTS "Users can view self-healing logs" ON public.ai_self_healing_logs;
CREATE POLICY "ai_selfhealing_admin_select" ON public.ai_self_healing_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- AIS_EVENTS: Org isolation
DROP POLICY IF EXISTS "ais_events_policy" ON public.ais_events;
CREATE POLICY "ais_events_org_select" ON public.ais_events
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- ALERT_VOTES: User isolation
DROP POLICY IF EXISTS "Anyone can view alert votes" ON public.alert_votes;
CREATE POLICY "alert_votes_user_select" ON public.alert_votes
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- ANALYTICS_INSIGHTS: Org isolation
DROP POLICY IF EXISTS "System can manage insights" ON public.analytics_insights;
CREATE POLICY "analytics_insights_org_select" ON public.analytics_insights
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));
