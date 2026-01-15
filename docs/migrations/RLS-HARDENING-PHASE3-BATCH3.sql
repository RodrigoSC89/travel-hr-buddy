-- =============================================
-- RLS HARDENING PHASE 3 - BATCH 3 (50 POLICIES)
-- Critical operational tables
-- =============================================

-- DIGITAL_SIGNATURES: User isolation
DROP POLICY IF EXISTS "Users can view signatures" ON public.digital_signatures;
CREATE POLICY "signatures_user_select" ON public.digital_signatures
FOR SELECT TO authenticated
USING (signer_id = auth.uid() OR public.is_admin_or_hr(auth.uid()));

-- DRILLS: Org isolation
DROP POLICY IF EXISTS "Org members can view drills" ON public.drills;
CREATE POLICY "drills_org_select" ON public.drills
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- EMERGENCY_CONTACTS: Org + HR isolation
DROP POLICY IF EXISTS "Org members can view contacts" ON public.emergency_contacts;
CREATE POLICY "emergency_contacts_hr_select" ON public.emergency_contacts
FOR SELECT TO authenticated
USING (public.is_admin_or_hr(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- EQUIPMENT_CERTIFICATES: Org isolation
DROP POLICY IF EXISTS "Org members can view certificates" ON public.equipment_certificates;
CREATE POLICY "equipment_certs_org_select" ON public.equipment_certificates
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- EQUIPMENT_SENSORS: Org isolation
DROP POLICY IF EXISTS "Org members can view sensors" ON public.equipment_sensors;
CREATE POLICY "sensors_org_select" ON public.equipment_sensors
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- EXPENSE_REPORTS: Org + Finance isolation
DROP POLICY IF EXISTS "Org members can view expenses" ON public.expense_reports;
CREATE POLICY "expenses_finance_select" ON public.expense_reports
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_finance_access(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- FLEET_ANALYTICS: Org isolation
DROP POLICY IF EXISTS "Org members can view fleet analytics" ON public.fleet_analytics;
CREATE POLICY "fleet_analytics_org_select" ON public.fleet_analytics
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- FUEL_RECORDS: Org isolation
DROP POLICY IF EXISTS "Org members can view fuel records" ON public.fuel_records;
CREATE POLICY "fuel_records_org_select" ON public.fuel_records
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- GMUD_REQUESTS: Org isolation
DROP POLICY IF EXISTS "Org members can view GMUD requests" ON public.gmud_requests;
CREATE POLICY "gmud_requests_org_select" ON public.gmud_requests
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- GMUD_WORKFLOWS: Org isolation
DROP POLICY IF EXISTS "Org members can view workflows" ON public.gmud_workflows;
CREATE POLICY "gmud_workflows_org_select" ON public.gmud_workflows
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- INSPECTIONS: Org isolation
DROP POLICY IF EXISTS "Org members can view inspections" ON public.inspections;
CREATE POLICY "inspections_org_select" ON public.inspections
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- INVENTORY_ITEMS: Org isolation
DROP POLICY IF EXISTS "Org members can view inventory" ON public.inventory_items;
CREATE POLICY "inventory_org_select" ON public.inventory_items
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- LOGBOOK_ENTRIES: Org isolation
DROP POLICY IF EXISTS "Org members can view logbook" ON public.logbook_entries;
CREATE POLICY "logbook_org_select" ON public.logbook_entries
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- MAINTENANCE_SCHEDULES: Org isolation
DROP POLICY IF EXISTS "Org members can view maintenance" ON public.maintenance_schedules;
CREATE POLICY "maintenance_org_select" ON public.maintenance_schedules
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- MARITIME_INCIDENTS: Org isolation
DROP POLICY IF EXISTS "Org members can view incidents" ON public.maritime_incidents;
CREATE POLICY "maritime_incidents_org_select" ON public.maritime_incidents
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- NOTIFICATIONS: User isolation
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "notifications_user_select" ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ORGANIZATION_SETTINGS: Org admin only
DROP POLICY IF EXISTS "Org admins can manage settings" ON public.organization_settings;
CREATE POLICY "org_settings_admin_manage" ON public.organization_settings
FOR ALL TO authenticated
USING (public.is_admin_or_hr(auth.uid()) AND public.user_belongs_to_org(auth.uid(), organization_id));

-- PEOTRAM_AUDITS: Org isolation
DROP POLICY IF EXISTS "Org members can view audits" ON public.peotram_audits;
CREATE POLICY "peotram_audits_org_select" ON public.peotram_audits
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- PEOTRAM_AUDITS_2024: Org isolation
DROP POLICY IF EXISTS "Org members can view 2024 audits" ON public.peotram_audits_2024;
CREATE POLICY "peotram_2024_org_select" ON public.peotram_audits_2024
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- PORT_CALLS: Org isolation
DROP POLICY IF EXISTS "Org members can view port calls" ON public.port_calls;
CREATE POLICY "port_calls_org_select" ON public.port_calls
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- PURCHASE_ORDERS: Org + Finance isolation
DROP POLICY IF EXISTS "Org members can view POs" ON public.purchase_orders;
CREATE POLICY "purchase_orders_finance_select" ON public.purchase_orders
FOR SELECT TO authenticated
USING (public.has_finance_access(auth.uid()) OR public.user_belongs_to_org(auth.uid(), organization_id));

-- REST_HOURS: Org isolation
DROP POLICY IF EXISTS "Org members can view rest hours" ON public.rest_hours;
CREATE POLICY "rest_hours_org_select" ON public.rest_hours
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- RISK_ASSESSMENTS: Org isolation
DROP POLICY IF EXISTS "Org members can view risks" ON public.risk_assessments;
CREATE POLICY "risk_assessments_org_select" ON public.risk_assessments
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- SAFETY_OBSERVATIONS: Org isolation
DROP POLICY IF EXISTS "Org members can view observations" ON public.safety_observations;
CREATE POLICY "safety_obs_org_select" ON public.safety_observations
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- VESSEL_INSPECTIONS: Org isolation
DROP POLICY IF EXISTS "Org members can view vessel inspections" ON public.vessel_inspections;
CREATE POLICY "vessel_inspections_org_select" ON public.vessel_inspections
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- VESSEL_POSITIONS: Org isolation
DROP POLICY IF EXISTS "Org members can view positions" ON public.vessel_positions;
CREATE POLICY "vessel_positions_org_select" ON public.vessel_positions
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- VOYAGES: Org isolation
DROP POLICY IF EXISTS "Org members can view voyages" ON public.voyages;
CREATE POLICY "voyages_org_select" ON public.voyages
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- WEATHER_ALERTS: Org isolation
DROP POLICY IF EXISTS "Org members can view weather" ON public.weather_alerts;
CREATE POLICY "weather_alerts_org_select" ON public.weather_alerts
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));

-- WORK_PERMITS: Org isolation
DROP POLICY IF EXISTS "Org members can view permits" ON public.work_permits;
CREATE POLICY "work_permits_org_select" ON public.work_permits
FOR SELECT TO authenticated
USING (organization_id IS NULL OR public.user_belongs_to_org(auth.uid(), organization_id));
