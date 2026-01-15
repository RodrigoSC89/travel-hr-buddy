-- =============================================
-- NAUTI ONE v4.0 - COMPLETE RLS HARDENING
-- Execute in Supabase SQL Editor
-- https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- =============================================
-- This script hardens ALL permissive RLS policies
-- to ensure proper multi-tenant data isolation
-- =============================================

-- ============================================
-- BATCH 1: AI & AUTOMATION TABLES (16 policies)
-- ============================================

-- 1. ACTIVE_SESSIONS
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.active_sessions;
CREATE POLICY "sessions_admin_only" ON public.active_sessions
FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- 2. AGENT_REGISTRY
DROP POLICY IF EXISTS "Authenticated users can read agent registry" ON public.agent_registry;
CREATE POLICY "agent_registry_org_select" ON public.agent_registry
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 3. AGENT_SWARM_METRICS
DROP POLICY IF EXISTS "Authenticated users can read agent metrics" ON public.agent_swarm_metrics;
CREATE POLICY "swarm_metrics_org_select" ON public.agent_swarm_metrics
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 4. AI_BEHAVIOR_SNAPSHOTS
DROP POLICY IF EXISTS "ai_behavior_snapshots_select" ON public.ai_behavior_snapshots;
DROP POLICY IF EXISTS "Users can view ai behavior snapshots" ON public.ai_behavior_snapshots;
CREATE POLICY "ai_behavior_org_select" ON public.ai_behavior_snapshots
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 5. AI_CONFIGURATIONS
DROP POLICY IF EXISTS "Users can view AI configurations" ON public.ai_configurations;
DROP POLICY IF EXISTS "Admins can manage AI configurations" ON public.ai_configurations;
CREATE POLICY "ai_config_admin_manage" ON public.ai_configurations
FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- 6. AI_DECISIONS
DROP POLICY IF EXISTS "Users can view AI decisions" ON public.ai_decisions;
DROP POLICY IF EXISTS "Admins can manage AI decisions" ON public.ai_decisions;
CREATE POLICY "ai_decisions_org_select" ON public.ai_decisions
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 7. AI_DOCUMENT_INSIGHTS
DROP POLICY IF EXISTS "ai_document_insights_select" ON public.ai_document_insights;
DROP POLICY IF EXISTS "Users can view document insights" ON public.ai_document_insights;
CREATE POLICY "ai_doc_insights_user_select" ON public.ai_document_insights
FOR SELECT TO authenticated USING (user_id = auth.uid() OR organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 8. AI_FEEDBACK_SCORES
DROP POLICY IF EXISTS "System can manage AI feedback" ON public.ai_feedback_scores;
CREATE POLICY "ai_feedback_user_manage" ON public.ai_feedback_scores
FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 9. AI_GENERATED_DOCUMENTS
DROP POLICY IF EXISTS "ai_generated_documents_all" ON public.ai_generated_documents;
CREATE POLICY "ai_gen_docs_user_select" ON public.ai_generated_documents
FOR SELECT TO authenticated USING (user_id = auth.uid() OR organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 10. AI_INSPECTION_FEEDBACK
DROP POLICY IF EXISTS "Allow authenticated read ai_inspection_feedback" ON public.ai_inspection_feedback;
DROP POLICY IF EXISTS "auth_all_ai_inspection_feedback" ON public.ai_inspection_feedback;
CREATE POLICY "ai_inspection_org_select" ON public.ai_inspection_feedback
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 11. AI_LEARNING_METRICS
DROP POLICY IF EXISTS "Anyone can view AI metrics" ON public.ai_learning_metrics;
CREATE POLICY "ai_learning_org_select" ON public.ai_learning_metrics
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 12. AI_MEMORY_EVENTS
DROP POLICY IF EXISTS "System can manage AI memory events" ON public.ai_memory_events;
CREATE POLICY "ai_memory_user_select" ON public.ai_memory_events
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 13. AI_SELF_HEALING_LOGS
DROP POLICY IF EXISTS "Users can view self-healing logs" ON public.ai_self_healing_logs;
CREATE POLICY "ai_selfhealing_admin_select" ON public.ai_self_healing_logs
FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- 14. AIS_EVENTS
DROP POLICY IF EXISTS "ais_events_policy" ON public.ais_events;
CREATE POLICY "ais_events_org_select" ON public.ais_events
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 15. ALERT_VOTES
DROP POLICY IF EXISTS "Anyone can view alert votes" ON public.alert_votes;
CREATE POLICY "alert_votes_user_select" ON public.alert_votes
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 16. ANALYTICS_INSIGHTS
DROP POLICY IF EXISTS "System can manage insights" ON public.analytics_insights;
CREATE POLICY "analytics_insights_org_select" ON public.analytics_insights
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- ============================================
-- BATCH 2: OPERATIONAL TABLES (20 policies)
-- ============================================

-- 17. API_ANALYTICS
DROP POLICY IF EXISTS "Anyone can view API analytics" ON public.api_analytics;
CREATE POLICY "api_analytics_admin_select" ON public.api_analytics
FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- 18. AUDIT_FINDINGS
DROP POLICY IF EXISTS "Org members can view findings" ON public.audit_findings;
CREATE POLICY "audit_findings_org_select" ON public.audit_findings
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 19. BACKUPS
DROP POLICY IF EXISTS "Admins can manage backups" ON public.backups;
CREATE POLICY "backups_admin_manage" ON public.backups
FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- 20. BATCH_OPERATIONS
DROP POLICY IF EXISTS "Users can view own operations" ON public.batch_operations;
CREATE POLICY "batch_ops_user_select" ON public.batch_operations
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 21. BILLING_INVOICES
DROP POLICY IF EXISTS "Org members can view invoices" ON public.billing_invoices;
CREATE POLICY "billing_invoices_finance_select" ON public.billing_invoices
FOR SELECT TO authenticated USING (public.has_finance_access(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 22. CARGO_MANIFESTS
DROP POLICY IF EXISTS "Org members can view manifests" ON public.cargo_manifests;
CREATE POLICY "cargo_manifests_org_select" ON public.cargo_manifests
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 23. CERTIFICATIONS
DROP POLICY IF EXISTS "Users can view certifications" ON public.certifications;
CREATE POLICY "certifications_org_select" ON public.certifications
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 24. CHARTER_PARTY
DROP POLICY IF EXISTS "Org members can view charters" ON public.charter_party;
CREATE POLICY "charter_party_org_select" ON public.charter_party
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 25. COMPLIANCE_ALERTS
DROP POLICY IF EXISTS "Org members can view compliance alerts" ON public.compliance_alerts;
CREATE POLICY "compliance_alerts_org_select" ON public.compliance_alerts
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 26. COMPLIANCE_DOCUMENTS
DROP POLICY IF EXISTS "Org members can view compliance docs" ON public.compliance_documents;
CREATE POLICY "compliance_docs_org_select" ON public.compliance_documents
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 27. CONTRACT_TEMPLATES
DROP POLICY IF EXISTS "Org members can view templates" ON public.contract_templates;
CREATE POLICY "contract_templates_org_select" ON public.contract_templates
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 28. CREW_ALLOCATIONS
DROP POLICY IF EXISTS "Org members can view allocations" ON public.crew_allocations;
CREATE POLICY "crew_allocations_org_select" ON public.crew_allocations
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 29. CREW_CONTRACTS
DROP POLICY IF EXISTS "Org members can view contracts" ON public.crew_contracts;
CREATE POLICY "crew_contracts_hr_select" ON public.crew_contracts
FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 30. CREW_DOCUMENTS
DROP POLICY IF EXISTS "Org members can view crew docs" ON public.crew_documents;
CREATE POLICY "crew_docs_hr_select" ON public.crew_documents
FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 31. CREW_HEALTH_RECORDS (SENSITIVE - HR ONLY)
DROP POLICY IF EXISTS "Org members can view health records" ON public.crew_health_records;
CREATE POLICY "crew_health_hr_only" ON public.crew_health_records
FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()));

-- 32. CREW_ROTATIONS
DROP POLICY IF EXISTS "Org members can view rotations" ON public.crew_rotations;
CREATE POLICY "crew_rotations_org_select" ON public.crew_rotations
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 33. CREW_TRAINING_RECORDS
DROP POLICY IF EXISTS "Org members can view training" ON public.crew_training_records;
CREATE POLICY "crew_training_org_select" ON public.crew_training_records
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 34. DIGITAL_SIGNATURES
DROP POLICY IF EXISTS "Users can view signatures" ON public.digital_signatures;
CREATE POLICY "signatures_user_select" ON public.digital_signatures
FOR SELECT TO authenticated USING (signer_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- 35. DRILLS
DROP POLICY IF EXISTS "Org members can view drills" ON public.drills;
CREATE POLICY "drills_org_select" ON public.drills
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 36. EMERGENCY_CONTACTS
DROP POLICY IF EXISTS "Org members can view contacts" ON public.emergency_contacts;
CREATE POLICY "emergency_contacts_hr_select" ON public.emergency_contacts
FOR SELECT TO authenticated USING (public.is_admin_or_hr(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- ============================================
-- BATCH 3: OPERATIONAL TABLES (30 policies)
-- ============================================

-- 37. EQUIPMENT_CERTIFICATES
DROP POLICY IF EXISTS "Org members can view certificates" ON public.equipment_certificates;
CREATE POLICY "equipment_certs_org_select" ON public.equipment_certificates
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 38. EQUIPMENT_SENSORS
DROP POLICY IF EXISTS "Org members can view sensors" ON public.equipment_sensors;
CREATE POLICY "sensors_org_select" ON public.equipment_sensors
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 39. EXPENSE_REPORTS
DROP POLICY IF EXISTS "Org members can view expenses" ON public.expense_reports;
CREATE POLICY "expenses_finance_select" ON public.expense_reports
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_finance_access(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 40. FLEET_ANALYTICS
DROP POLICY IF EXISTS "Org members can view fleet analytics" ON public.fleet_analytics;
CREATE POLICY "fleet_analytics_org_select" ON public.fleet_analytics
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 41. FUEL_RECORDS
DROP POLICY IF EXISTS "Org members can view fuel records" ON public.fuel_records;
CREATE POLICY "fuel_records_org_select" ON public.fuel_records
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 42. GMUD_REQUESTS
DROP POLICY IF EXISTS "Org members can view GMUD requests" ON public.gmud_requests;
CREATE POLICY "gmud_requests_org_select" ON public.gmud_requests
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 43. GMUD_WORKFLOWS
DROP POLICY IF EXISTS "Org members can view workflows" ON public.gmud_workflows;
CREATE POLICY "gmud_workflows_org_select" ON public.gmud_workflows
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 44. INSPECTIONS
DROP POLICY IF EXISTS "Org members can view inspections" ON public.inspections;
CREATE POLICY "inspections_org_select" ON public.inspections
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 45. INVENTORY_ITEMS
DROP POLICY IF EXISTS "Org members can view inventory" ON public.inventory_items;
CREATE POLICY "inventory_org_select" ON public.inventory_items
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 46. LOGBOOK_ENTRIES
DROP POLICY IF EXISTS "Org members can view logbook" ON public.logbook_entries;
CREATE POLICY "logbook_org_select" ON public.logbook_entries
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 47. MAINTENANCE_SCHEDULES
DROP POLICY IF EXISTS "Org members can view maintenance" ON public.maintenance_schedules;
CREATE POLICY "maintenance_org_select" ON public.maintenance_schedules
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 48. MARITIME_INCIDENTS
DROP POLICY IF EXISTS "Org members can view incidents" ON public.maritime_incidents;
CREATE POLICY "maritime_incidents_org_select" ON public.maritime_incidents
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 49. NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "notifications_user_select" ON public.notifications
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 50. ORGANIZATION_SETTINGS
DROP POLICY IF EXISTS "Org admins can manage settings" ON public.organization_settings;
CREATE POLICY "org_settings_admin_manage" ON public.organization_settings
FOR ALL TO authenticated USING (public.is_admin_or_hr(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id));

-- 51. PEOTRAM_AUDITS
DROP POLICY IF EXISTS "Org members can view audits" ON public.peotram_audits;
CREATE POLICY "peotram_audits_org_select" ON public.peotram_audits
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 52. PORT_CALLS
DROP POLICY IF EXISTS "Org members can view port calls" ON public.port_calls;
CREATE POLICY "port_calls_org_select" ON public.port_calls
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 53. PURCHASE_ORDERS
DROP POLICY IF EXISTS "Org members can view POs" ON public.purchase_orders;
CREATE POLICY "purchase_orders_finance_select" ON public.purchase_orders
FOR SELECT TO authenticated USING (public.has_finance_access(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 54. REST_HOURS
DROP POLICY IF EXISTS "Org members can view rest hours" ON public.rest_hours;
CREATE POLICY "rest_hours_org_select" ON public.rest_hours
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 55. RISK_ASSESSMENTS
DROP POLICY IF EXISTS "Org members can view risks" ON public.risk_assessments;
CREATE POLICY "risk_assessments_org_select" ON public.risk_assessments
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 56. SAFETY_OBSERVATIONS
DROP POLICY IF EXISTS "Org members can view observations" ON public.safety_observations;
CREATE POLICY "safety_obs_org_select" ON public.safety_observations
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 57. VESSEL_INSPECTIONS
DROP POLICY IF EXISTS "Org members can view vessel inspections" ON public.vessel_inspections;
CREATE POLICY "vessel_inspections_org_select" ON public.vessel_inspections
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 58. VESSEL_POSITIONS
DROP POLICY IF EXISTS "Org members can view positions" ON public.vessel_positions;
CREATE POLICY "vessel_positions_org_select" ON public.vessel_positions
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 59. VOYAGES
DROP POLICY IF EXISTS "Org members can view voyages" ON public.voyages;
CREATE POLICY "voyages_org_select" ON public.voyages
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 60. WEATHER_ALERTS
DROP POLICY IF EXISTS "Org members can view weather" ON public.weather_alerts;
CREATE POLICY "weather_alerts_org_select" ON public.weather_alerts
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- 61. WORK_PERMITS
DROP POLICY IF EXISTS "Org members can view permits" ON public.work_permits;
CREATE POLICY "work_permits_org_select" ON public.work_permits
FOR SELECT TO authenticated USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- =============================================
-- VERIFICATION QUERY
-- Run this after applying policies to verify
-- =============================================
-- SELECT schemaname, tablename, policyname, permissive, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND qual = 'true'
-- ORDER BY tablename;
