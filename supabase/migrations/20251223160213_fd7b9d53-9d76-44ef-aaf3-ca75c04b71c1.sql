-- ============================================================
-- SECURITY FIX: Strengthen RLS policies for sensitive tables
-- Fixes: PII exposure, token security, medical data protection
-- ============================================================

-- 1. PROFILES TABLE - Restrict access to own profile + HR/Admin
-- Note: profiles.id = auth.uid() (not user_id)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile or HR/Admin"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('admin', 'owner', 'hr_manager')
  )
);

-- 2. CREW_MEMBERS TABLE - Restrict passport and sensitive data access
DROP POLICY IF EXISTS "Anyone can read crew members" ON public.crew_members;
DROP POLICY IF EXISTS "crew_members_select_policy" ON public.crew_members;

CREATE POLICY "Crew members own data or HR/Admin access"
ON public.crew_members FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id = crew_members.organization_id
    AND om.role IN ('admin', 'owner', 'hr_manager', 'captain')
  )
);

-- 3. CREW_PAYROLL TABLE - Strict financial data access
DROP POLICY IF EXISTS "HR and admin can view payroll" ON public.crew_payroll;
DROP POLICY IF EXISTS "View payroll policy" ON public.crew_payroll;

CREATE POLICY "Payroll access for self or HR/Finance only"
ON public.crew_payroll FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM crew_members cm
    WHERE cm.id = crew_payroll.crew_member_id
    AND cm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('admin', 'owner', 'hr_manager', 'finance_manager')
  )
);

-- 4. ACTIVE_SESSIONS TABLE - Restrict to own sessions only
DROP POLICY IF EXISTS "Users can view own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can manage their sessions" ON public.active_sessions;

CREATE POLICY "Users can only access own sessions"
ON public.active_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete own sessions"
ON public.active_sessions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions"
ON public.active_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. CREW_HEALTH_METRICS TABLE - Strict medical data protection
DROP POLICY IF EXISTS "Medical staff and self can view health metrics" ON public.crew_health_metrics;
DROP POLICY IF EXISTS "View health metrics" ON public.crew_health_metrics;

CREATE POLICY "Health data for self or authorized medical staff"
ON public.crew_health_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM crew_members cm
    WHERE cm.id = crew_health_metrics.crew_member_id
    AND cm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('medical_officer', 'ship_doctor')
  )
);

-- 6. ACCESS_LOGS TABLE - Restrict to own logs + admin
DROP POLICY IF EXISTS "Users can insert access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.access_logs;

CREATE POLICY "Insert own access logs only"
ON public.access_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View own access logs or admin"
ON public.access_logs FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('admin', 'owner', 'security_officer')
  )
);

-- 7. API_KEYS TABLE - Only owner can view their keys
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "api_keys_select_policy" ON public.api_keys;

CREATE POLICY "API keys accessible only by owner"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "API keys updatable only by owner"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "API keys deletable only by owner"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

-- 8. EMPLOYEES TABLE - Restrict sensitive data access
DROP POLICY IF EXISTS "Anyone can view employees" ON public.employees;
DROP POLICY IF EXISTS "employees_select_policy" ON public.employees;

CREATE POLICY "Employees visible to self or HR/Admin"
ON public.employees FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.organization_id = employees.organization_id
    AND om.role IN ('admin', 'owner', 'hr_manager')
  )
);

-- 9. INTEGRATION_CREDENTIALS - Restrict token access
DROP POLICY IF EXISTS "Users can view own integration credentials" ON public.integration_credentials;

CREATE POLICY "Integration credentials only for owner"
ON public.integration_credentials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Integration credentials update only by owner"
ON public.integration_credentials FOR UPDATE
USING (auth.uid() = user_id);

-- 10. CONNECTED_INTEGRATIONS - Restrict OAuth token access
DROP POLICY IF EXISTS "Users can view own connected integrations" ON public.connected_integrations;

CREATE POLICY "Connected integrations only for owner"
ON public.connected_integrations FOR SELECT
USING (auth.uid() = user_id);

-- 11. CREW_DOSSIER_DOCUMENTS - Confidential docs need stricter access
DROP POLICY IF EXISTS "HR can view all dossier documents" ON public.crew_dossier_documents;

CREATE POLICY "Dossier documents for self or authorized HR"
ON public.crew_dossier_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM crew_members cm
    WHERE cm.id = crew_dossier_documents.crew_member_id
    AND cm.user_id = auth.uid()
  )
  OR (
    is_confidential = false
    AND EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner', 'hr_manager')
    )
  )
  OR (
    is_confidential = true
    AND EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  )
);