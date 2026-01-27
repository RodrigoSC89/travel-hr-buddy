-- =====================================================
-- PATCH: Add performance indexes (verified columns)
-- =====================================================

-- certificates
CREATE INDEX IF NOT EXISTS idx_certificates_employee ON certificates(employee_id);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry ON certificates(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);

-- ai_documents
CREATE INDEX IF NOT EXISTS idx_ai_documents_org ON ai_documents(organization_id);

-- ai_generated_documents  
CREATE INDEX IF NOT EXISTS idx_ai_generated_documents_org ON ai_generated_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_documents_status ON ai_generated_documents(status);

-- automation_executions
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- checklist_items
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);

-- copilot_messages
CREATE INDEX IF NOT EXISTS idx_copilot_messages_conversation ON copilot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_created ON copilot_messages(created_at DESC);

-- ais_events
CREATE INDEX IF NOT EXISTS idx_ais_events_vessel ON ais_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_ais_events_created ON ais_events(created_at DESC);

-- certificate_alerts
CREATE INDEX IF NOT EXISTS idx_certificate_alerts_created ON certificate_alerts(created_at DESC);

-- crew_ai_insights
CREATE INDEX IF NOT EXISTS idx_crew_ai_insights_crew ON crew_ai_insights(crew_member_id);