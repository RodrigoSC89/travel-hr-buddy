-- PATCH 660 - Critical Security Fix: RLS Policies for Exposed Tables
-- Priority: CRITICAL - Must fix before launch (CORRECTED VERSION)

-- =====================================================
-- 1. oauth_connections (CRITICAL - Has organization_id)
-- =====================================================
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view oauth connections"
ON public.oauth_connections FOR SELECT
USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Org admins can manage oauth connections"
ON public.oauth_connections FOR ALL
USING (
  public.user_belongs_to_organization(organization_id) AND
  public.get_user_organization_role(organization_id) IN ('owner', 'admin')
);

-- =====================================================
-- 2. organization_billing (CRITICAL - Financial data)
-- =====================================================
ALTER TABLE public.organization_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view billing"
ON public.organization_billing FOR SELECT
USING (
  public.user_belongs_to_organization(organization_id) AND
  public.get_user_organization_role(organization_id) IN ('owner', 'admin')
);

CREATE POLICY "Org owners can manage billing"
ON public.organization_billing FOR ALL
USING (
  public.user_belongs_to_organization(organization_id) AND
  public.get_user_organization_role(organization_id) = 'owner'
);

-- =====================================================
-- 3. integration_plugins (No org_id - make admin only)
-- =====================================================
ALTER TABLE public.integration_plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view plugins"
ON public.integration_plugins FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage plugins"
ON public.integration_plugins FOR ALL
USING (public.is_admin(auth.uid()));

-- =====================================================
-- 4. automated_reports (Has organization_id, created_by)
-- =====================================================
ALTER TABLE public.automated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view reports"
ON public.automated_reports FOR SELECT
USING (public.user_belongs_to_organization(organization_id));

CREATE POLICY "Report creators can manage own reports"
ON public.automated_reports FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Report creators can delete own reports"
ON public.automated_reports FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Org members can create reports"
ON public.automated_reports FOR INSERT
WITH CHECK (
  public.user_belongs_to_organization(organization_id) AND
  auth.uid() = created_by
);

-- =====================================================
-- 5. automation_executions (triggered_by is text)
-- =====================================================
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view executions"
ON public.automation_executions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert executions"
ON public.automation_executions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 6. mission_agents (Mission-based access)
-- =====================================================
ALTER TABLE public.mission_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view mission agents"
ON public.mission_agents FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage mission agents"
ON public.mission_agents FOR ALL
USING (public.is_admin(auth.uid()));