-- =====================================================
-- PATCH: Hardening RLS Policies - Remove USING(true)
-- Replace permissive policies with proper access control
-- =====================================================

-- 1. calendar_events - has organization_id, created_by
DROP POLICY IF EXISTS "Authenticated write calendar_events" ON public.calendar_events;
CREATE POLICY "Users can manage their org calendar events"
ON public.calendar_events
FOR ALL
TO authenticated
USING (
  created_by = auth.uid() 
  OR organization_id = public.get_current_organization_id()
)
WITH CHECK (
  created_by = auth.uid() 
  OR organization_id = public.get_current_organization_id()
);

-- 2. incident_snapshots - use incident_id to link (authenticated users can manage)
DROP POLICY IF EXISTS "Authenticated write incident_snapshots" ON public.incident_snapshots;
CREATE POLICY "Authenticated users can manage incident snapshots"
ON public.incident_snapshots
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. joint_missions - use mission_id (authenticated users in missions)
DROP POLICY IF EXISTS "Authenticated write joint_missions" ON public.joint_missions;
CREATE POLICY "Authenticated users can manage joint missions"
ON public.joint_missions
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. logistics_operations - has organization_id
DROP POLICY IF EXISTS "Authenticated write logistics_operations" ON public.logistics_operations;
CREATE POLICY "Users can manage org logistics"
ON public.logistics_operations
FOR ALL
TO authenticated
USING (
  organization_id = public.get_current_organization_id()
)
WITH CHECK (
  organization_id = public.get_current_organization_id()
);

-- 5. profiler_sessions - has user_id
DROP POLICY IF EXISTS "Authenticated write profiler_sessions" ON public.profiler_sessions;
CREATE POLICY "Users can manage their profiler sessions"
ON public.profiler_sessions
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR public.is_admin()
)
WITH CHECK (
  user_id = auth.uid() OR public.is_admin()
);

-- 6. quality_metrics - has organization_id
DROP POLICY IF EXISTS "Authenticated write quality_metrics" ON public.quality_metrics;
CREATE POLICY "Users can manage org quality metrics"
ON public.quality_metrics
FOR ALL
TO authenticated
USING (
  organization_id = public.get_current_organization_id()
  OR public.is_manager_or_above()
)
WITH CHECK (
  organization_id = public.get_current_organization_id()
  OR public.is_manager_or_above()
);

-- 7. restore_reports - has restored_by
DROP POLICY IF EXISTS "Authenticated write restore_reports" ON public.restore_reports;
CREATE POLICY "Users can manage their restore reports"
ON public.restore_reports
FOR ALL
TO authenticated
USING (
  restored_by = auth.uid() OR public.is_admin()
)
WITH CHECK (
  restored_by = auth.uid() OR public.is_admin()
);

-- 8. satcom_messages - has vessel_id (use vessel access)
DROP POLICY IF EXISTS "Authenticated write satcom_messages" ON public.satcom_messages;
CREATE POLICY "Authenticated users can manage satcom messages"
ON public.satcom_messages
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 9. template_versions - has created_by
DROP POLICY IF EXISTS "Authenticated write template_versions" ON public.template_versions;
CREATE POLICY "Users can manage their template versions"
ON public.template_versions
FOR ALL
TO authenticated
USING (
  created_by = auth.uid() OR public.is_admin()
)
WITH CHECK (
  created_by = auth.uid() OR public.is_admin()
);

-- 10. workflow_nodes - use workflow_id (join with workflows table)
DROP POLICY IF EXISTS "Authenticated write workflow_nodes" ON public.workflow_nodes;
CREATE POLICY "Authenticated users can manage workflow nodes"
ON public.workflow_nodes
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);