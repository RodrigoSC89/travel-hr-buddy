-- =============================================
-- RLS HARDENING BATCH 1 - Correção com colunas verificadas
-- =============================================

-- EXTERNAL_API_LOGS - Apenas Admin (sem org_id)
DROP POLICY IF EXISTS "auth_external_api_logs" ON public.external_api_logs;
CREATE POLICY "external_api_logs_admin_all" ON public.external_api_logs
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- EXTERNAL_ENTITIES - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "Authenticated users can manage external entities" ON public.external_entities;
CREATE POLICY "external_entities_auth_all" ON public.external_entities
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- FEATURE_FLAGS - Apenas Admin
DROP POLICY IF EXISTS "auth_feature_flags" ON public.feature_flags;
CREATE POLICY "feature_flags_admin_all" ON public.feature_flags
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- GLOBAL_KNOWLEDGE - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Anyone can update global knowledge" ON public.global_knowledge;
CREATE POLICY "global_knowledge_admin_upd" ON public.global_knowledge
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- GNSS_AI_RECOMMENDATIONS - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "Users can manage AI recommendations" ON public.gnss_ai_recommendations;
CREATE POLICY "gnss_ai_recommendations_auth_all" ON public.gnss_ai_recommendations
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- GNSS_ALERTS - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "Users can manage GNSS alerts" ON public.gnss_alerts;
CREATE POLICY "gnss_alerts_auth_all" ON public.gnss_alerts
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- GNSS_CORRECTION_STATIONS - Apenas Admin
DROP POLICY IF EXISTS "Admins can manage correction stations" ON public.gnss_correction_stations;
CREATE POLICY "gnss_correction_stations_admin_all" ON public.gnss_correction_stations
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- GNSS_DEVICES - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "Users can manage GNSS devices" ON public.gnss_devices;
CREATE POLICY "gnss_devices_auth_all" ON public.gnss_devices
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- GNSS_WAYPOINTS - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "Users can manage waypoints" ON public.gnss_waypoints;
CREATE POLICY "gnss_waypoints_auth_all" ON public.gnss_waypoints
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- HEALTH_CHECKINS - Multi-tenant (tem org_id)
DROP POLICY IF EXISTS "health_checkins_policy" ON public.health_checkins;
CREATE POLICY "health_checkins_org_all" ON public.health_checkins
FOR ALL TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id))
WITH CHECK (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- IA_PERFORMANCE_LOG - Apenas Admin
DROP POLICY IF EXISTS "ia_performance_log_policy" ON public.ia_performance_log;
CREATE POLICY "ia_performance_log_admin_all" ON public.ia_performance_log
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- IA_SUGGESTIONS_LOG - Baseado em user_id
DROP POLICY IF EXISTS "Users can update IA suggestions" ON public.ia_suggestions_log;
CREATE POLICY "ia_suggestions_log_user_upd" ON public.ia_suggestions_log
FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- INCIDENT_REPORTS - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "incident_reports_policy" ON public.incident_reports;
CREATE POLICY "incident_reports_auth_all" ON public.incident_reports
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- INSPECTOR_PROFILES - Apenas Admin/HR
DROP POLICY IF EXISTS "Allow authenticated all inspector_profiles" ON public.inspector_profiles;
DROP POLICY IF EXISTS "auth_all_inspector_profiles" ON public.inspector_profiles;
CREATE POLICY "inspector_profiles_admin_all" ON public.inspector_profiles
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- INVENTORY_ITEMS - Multi-tenant (tem org_id)
DROP POLICY IF EXISTS "authenticated_access" ON public.inventory_items;
DROP POLICY IF EXISTS "auth_access" ON public.inventory_items;
CREATE POLICY "inventory_items_org_all" ON public.inventory_items
FOR ALL TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id))
WITH CHECK (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- IOT_SENSOR_DATA - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "iot_sensor_data_policy" ON public.iot_sensor_data;
DROP POLICY IF EXISTS "Authenticated users can update sensor data" ON public.iot_sensor_data;
CREATE POLICY "iot_sensor_data_auth_all" ON public.iot_sensor_data
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- JOINT_MISSION_TASKS - Apenas autenticados (sem org_id)
DROP POLICY IF EXISTS "Authenticated users can manage joint mission tasks" ON public.joint_mission_tasks;
CREATE POLICY "joint_mission_tasks_auth_all" ON public.joint_mission_tasks
FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- LOCAL_KNOWLEDGE - Apenas Admin para UPDATE
DROP POLICY IF EXISTS "Anyone can update local knowledge" ON public.local_knowledge;
CREATE POLICY "local_knowledge_admin_upd" ON public.local_knowledge
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr(auth.uid()));

-- LOGS_OBSERVABILITY - Apenas Admin
DROP POLICY IF EXISTS "auth_logs_observability" ON public.logs_observability;
CREATE POLICY "logs_observability_admin_all" ON public.logs_observability
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()))
WITH CHECK (public.is_admin_or_hr(auth.uid()));

-- MAINTENANCE_TASKS - Multi-tenant (tem org_id)
DROP POLICY IF EXISTS "authenticated_access" ON public.maintenance_tasks;
DROP POLICY IF EXISTS "auth_access" ON public.maintenance_tasks;
CREATE POLICY "maintenance_tasks_org_all" ON public.maintenance_tasks
FOR ALL TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id))
WITH CHECK (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));