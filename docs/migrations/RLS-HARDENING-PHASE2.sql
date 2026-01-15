-- =============================================
-- RLS HARDENING PHASE 2 - Execute Manually
-- https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/sql/new
-- =============================================

-- AI_INSIGHTS TABLE
DROP POLICY IF EXISTS "ai_insights_org_isolation_select" ON public.ai_insights;
CREATE POLICY "ai_insights_org_isolation_select" ON public.ai_insights
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- PEOTRAM_EVIDENCES TABLE  
DROP POLICY IF EXISTS "peotram_org_isolation_select" ON public.peotram_evidences;
CREATE POLICY "peotram_org_isolation_select" ON public.peotram_evidences
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- PEO_DP_AUDITS TABLE
DROP POLICY IF EXISTS "peodp_org_isolation_select" ON public.peo_dp_audits;
CREATE POLICY "peodp_org_isolation_select" ON public.peo_dp_audits
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- AI_COMMANDS TABLE
DROP POLICY IF EXISTS "ai_commands_user_select" ON public.ai_commands;
CREATE POLICY "ai_commands_user_select" ON public.ai_commands
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- MMI_MAINTENANCE_JOBS TABLE
DROP POLICY IF EXISTS "mmi_jobs_org_isolation_select" ON public.mmi_maintenance_jobs;
CREATE POLICY "mmi_jobs_org_isolation_select" ON public.mmi_maintenance_jobs
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- ACCESS_LOGS TABLE
DROP POLICY IF EXISTS "access_logs_admin_select" ON public.access_logs;
CREATE POLICY "access_logs_admin_select" ON public.access_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()));
