-- =============================================
-- RLS HARDENING BATCH 1 - CORRIGIR POLÍTICAS PERMISSIVAS
-- Simplificado: apenas validar auth.uid() IS NOT NULL
-- =============================================

-- 1. ACCESS_LOGS
DROP POLICY IF EXISTS "access_logs_authenticated_insert" ON public.access_logs;
DROP POLICY IF EXISTS "Service role can insert access logs" ON public.access_logs;
DROP POLICY IF EXISTS "System can insert access_logs" ON public.access_logs;
DROP POLICY IF EXISTS "System can insert access logs" ON public.access_logs;

CREATE POLICY "access_logs_secure_insert" ON public.access_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. AI_AUDIT_LOGS
DROP POLICY IF EXISTS "System can insert audit logs" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_logs_authenticated_insert" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "System can insert ai_audit_logs" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_logs_secure_insert_v2" ON public.ai_audit_logs;

CREATE POLICY "ai_audit_logs_auth_insert" ON public.ai_audit_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. AI_DOCUMENT_INSIGHTS
DROP POLICY IF EXISTS "Users can insert document insights" ON public.ai_document_insights;
DROP POLICY IF EXISTS "ai_document_insights_insert" ON public.ai_document_insights;

CREATE POLICY "ai_document_insights_auth_insert" ON public.ai_document_insights
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. AI_INSPECTION_FEEDBACK
DROP POLICY IF EXISTS "Allow authenticated insert ai_inspection_feedback" ON public.ai_inspection_feedback;

CREATE POLICY "ai_inspection_feedback_auth_insert" ON public.ai_inspection_feedback
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. AI_LEARNING_METRICS
DROP POLICY IF EXISTS "System can insert AI metrics" ON public.ai_learning_metrics;

CREATE POLICY "ai_learning_metrics_auth_insert" ON public.ai_learning_metrics
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. AI_LOGS
DROP POLICY IF EXISTS "System can insert AI logs" ON public.ai_logs;

CREATE POLICY "ai_logs_auth_insert" ON public.ai_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 7. AI_SELF_HEALING_LOGS
DROP POLICY IF EXISTS "System can insert self healing logs" ON public.ai_self_healing_logs;
DROP POLICY IF EXISTS "System can insert ai_self_healing_logs" ON public.ai_self_healing_logs;
DROP POLICY IF EXISTS "System can insert self-healing logs" ON public.ai_self_healing_logs;

CREATE POLICY "ai_self_healing_logs_auth_insert" ON public.ai_self_healing_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 8. ANALYTICS_EVENTS
DROP POLICY IF EXISTS "System can insert analytics" ON public.analytics_events;

CREATE POLICY "analytics_events_auth_insert" ON public.analytics_events
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 9. ANALYTICS_METRICS
DROP POLICY IF EXISTS "System can insert metrics" ON public.analytics_metrics;

CREATE POLICY "analytics_metrics_auth_insert" ON public.analytics_metrics
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 10. API_ANALYTICS
DROP POLICY IF EXISTS "System can insert analytics" ON public.api_analytics;

CREATE POLICY "api_analytics_auth_insert" ON public.api_analytics
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 11. API_GATEWAY_REQUESTS
DROP POLICY IF EXISTS "System can insert requests" ON public.api_gateway_requests;

CREATE POLICY "api_gateway_requests_auth_insert" ON public.api_gateway_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 12. API_REQUEST_LOGS
DROP POLICY IF EXISTS "System can insert API logs" ON public.api_request_logs;
DROP POLICY IF EXISTS "System insert api logs" ON public.api_request_logs;

CREATE POLICY "api_request_logs_auth_insert" ON public.api_request_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 13. AUDIT_LOGS
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_auth_insert" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 14. AUTONOMY_DECISION_LOGS
DROP POLICY IF EXISTS "auth_insert_autonomy_decision_logs" ON public.autonomy_decision_logs;

CREATE POLICY "autonomy_decision_logs_auth_insert" ON public.autonomy_decision_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 15. BACKUP_LOGS
DROP POLICY IF EXISTS "System can insert backup logs" ON public.backup_logs;
DROP POLICY IF EXISTS "Service role can insert backup logs" ON public.backup_logs;

CREATE POLICY "backup_logs_admin_insert" ON public.backup_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- 16. BLOCKCHAIN_LEDGER
DROP POLICY IF EXISTS "Authenticated users can insert blockchain records" ON public.blockchain_ledger;

CREATE POLICY "blockchain_ledger_auth_insert" ON public.blockchain_ledger
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 17. CERTIFICATE_ALERTS
DROP POLICY IF EXISTS "System can insert certificate alerts" ON public.certificate_alerts;

CREATE POLICY "certificate_alerts_auth_insert" ON public.certificate_alerts
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 18. CERTIFICATE_BLOCKCHAIN
DROP POLICY IF EXISTS "Allow authenticated users to insert certificates" ON public.certificate_blockchain;

CREATE POLICY "certificate_blockchain_auth_insert" ON public.certificate_blockchain
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 19. CHANNEL_STATUS_LOG
DROP POLICY IF EXISTS "System can insert channel status logs" ON public.channel_status_log;

CREATE POLICY "channel_status_log_auth_insert" ON public.channel_status_log
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 20. CHECKLIST_AI_ANALYSIS
DROP POLICY IF EXISTS "System can create AI analysis" ON public.checklist_ai_analysis;

CREATE POLICY "checklist_ai_analysis_auth_insert" ON public.checklist_ai_analysis
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 21. CLONE_CONTEXT_STORAGE
DROP POLICY IF EXISTS "Users can insert clone context" ON public.clone_context_storage;

CREATE POLICY "clone_context_storage_auth_insert" ON public.clone_context_storage
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 22. CLONE_SNAPSHOTS
DROP POLICY IF EXISTS "Users can insert snapshots" ON public.clone_snapshots;

CREATE POLICY "clone_snapshots_auth_insert" ON public.clone_snapshots
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 23. CLONE_SYNC_LOG
DROP POLICY IF EXISTS "Allow authenticated insert clone_sync_log" ON public.clone_sync_log;
DROP POLICY IF EXISTS "Authenticated users can insert clone_sync_log" ON public.clone_sync_log;

CREATE POLICY "clone_sync_log_auth_insert" ON public.clone_sync_log
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 24. COMPLIANCE_AUDIT_TRAIL
DROP POLICY IF EXISTS "System can insert audit trail" ON public.compliance_audit_trail;

CREATE POLICY "compliance_audit_trail_auth_insert" ON public.compliance_audit_trail
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 25. CONTEXT_HISTORY
DROP POLICY IF EXISTS "context_history_insert" ON public.context_history;
DROP POLICY IF EXISTS "Users can insert context history" ON public.context_history;

CREATE POLICY "context_history_auth_insert" ON public.context_history
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);