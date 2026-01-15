-- =============================================
-- RLS HARDENING PHASE 3 - BATCH 2 (50 POLICIES)
-- Execute after BATCH 1
-- =============================================

-- API_ANALYTICS: Admin only
DROP POLICY IF EXISTS "Anyone can view API analytics" ON public.api_analytics;
CREATE POLICY "api_analytics_admin_select" ON public.api_analytics
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- API_CONFIGURATIONS: Admin only
DROP POLICY IF EXISTS "Admins can manage API configurations" ON public.api_configurations;
CREATE POLICY "api_config_admin_manage" ON public.api_configurations
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- API_GATEWAY_REQUESTS: Admin only
DROP POLICY IF EXISTS "Authenticated users can view API requests" ON public.api_gateway_requests;
CREATE POLICY "api_requests_admin_select" ON public.api_gateway_requests
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- API_INTEGRATIONS: Org isolation
DROP POLICY IF EXISTS "Org members can view integrations" ON public.api_integrations;
CREATE POLICY "api_integrations_org_select" ON public.api_integrations
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- API_KEYS: User + Admin isolation
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
CREATE POLICY "api_keys_user_select" ON public.api_keys
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- AUDIT_FINDINGS: Org isolation
DROP POLICY IF EXISTS "Org members can view findings" ON public.audit_findings;
CREATE POLICY "audit_findings_org_select" ON public.audit_findings
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AUDIT_SCHEDULES: Org isolation  
DROP POLICY IF EXISTS "Org members can view schedules" ON public.audit_schedules;
CREATE POLICY "audit_schedules_org_select" ON public.audit_schedules
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- BACKUPS: Admin only
DROP POLICY IF EXISTS "Admins can manage backups" ON public.backups;
CREATE POLICY "backups_admin_manage" ON public.backups
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- BATCH_OPERATIONS: User isolation
DROP POLICY IF EXISTS "Users can view own operations" ON public.batch_operations;
CREATE POLICY "batch_ops_user_select" ON public.batch_operations
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- BILLING_INVOICES: Org isolation + Finance
DROP POLICY IF EXISTS "Org members can view invoices" ON public.billing_invoices;
CREATE POLICY "billing_invoices_finance_select" ON public.billing_invoices
FOR SELECT TO authenticated
USING (public.has_finance_access(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CARGO_MANIFESTS: Org isolation
DROP POLICY IF EXISTS "Org members can view manifests" ON public.cargo_manifests;
CREATE POLICY "cargo_manifests_org_select" ON public.cargo_manifests
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CERTIFICATIONS: User + Org isolation
DROP POLICY IF EXISTS "Users can view certifications" ON public.certifications;
CREATE POLICY "certifications_org_select" ON public.certifications
FOR SELECT TO authenticated
USING (crew_member_id IS NOT NULL OR organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CHARTER_PARTY: Org isolation
DROP POLICY IF EXISTS "Org members can view charters" ON public.charter_party;
CREATE POLICY "charter_party_org_select" ON public.charter_party
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- COMPLIANCE_ALERTS: Org isolation
DROP POLICY IF EXISTS "Org members can view compliance alerts" ON public.compliance_alerts;
CREATE POLICY "compliance_alerts_org_select" ON public.compliance_alerts
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- COMPLIANCE_DOCUMENTS: Org isolation
DROP POLICY IF EXISTS "Org members can view compliance docs" ON public.compliance_documents;
CREATE POLICY "compliance_docs_org_select" ON public.compliance_documents
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CONTRACT_TEMPLATES: Org isolation
DROP POLICY IF EXISTS "Org members can view templates" ON public.contract_templates;
CREATE POLICY "contract_templates_org_select" ON public.contract_templates
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CREW_ALLOCATIONS: Org isolation
DROP POLICY IF EXISTS "Org members can view allocations" ON public.crew_allocations;
CREATE POLICY "crew_allocations_org_select" ON public.crew_allocations
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CREW_CONTRACTS: Org + HR isolation
DROP POLICY IF EXISTS "Org members can view contracts" ON public.crew_contracts;
CREATE POLICY "crew_contracts_hr_select" ON public.crew_contracts
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CREW_DOCUMENTS: Org + HR isolation
DROP POLICY IF EXISTS "Org members can view crew docs" ON public.crew_documents;
CREATE POLICY "crew_docs_hr_select" ON public.crew_documents
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CREW_HEALTH_RECORDS: HR only (sensitive)
DROP POLICY IF EXISTS "Org members can view health records" ON public.crew_health_records;
CREATE POLICY "crew_health_hr_only" ON public.crew_health_records
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- CREW_ROTATIONS: Org isolation
DROP POLICY IF EXISTS "Org members can view rotations" ON public.crew_rotations;
CREATE POLICY "crew_rotations_org_select" ON public.crew_rotations
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- CREW_TRAINING_RECORDS: Org isolation
DROP POLICY IF EXISTS "Org members can view training" ON public.crew_training_records;
CREATE POLICY "crew_training_org_select" ON public.crew_training_records
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));
