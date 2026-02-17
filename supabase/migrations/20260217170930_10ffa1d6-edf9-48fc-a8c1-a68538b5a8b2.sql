
-- ============================================
-- ENHANCED DASHBOARD RPC: Aggregated KPIs
-- ============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  v_vessels_total int;
  v_vessels_active int;
  v_crew_total int;
  v_crew_onboard int;
  v_crew_on_leave int;
  v_maint_pending int;
  v_maint_overdue int;
  v_certs_expiring_30 int;
  v_certs_expiring_90 int;
  v_certs_expired int;
  v_incidents_open int;
  v_total_expenses numeric;
  v_compliance_score numeric;
  v_audits_total int;
  v_ncs_open int;
  v_docs_total int;
  v_voyages_active int;
BEGIN
  -- Vessels
  SELECT count(*), count(*) FILTER (WHERE status IN ('active', 'at_sea', 'in_port'))
  INTO v_vessels_total, v_vessels_active
  FROM vessels;

  -- Crew
  SELECT count(*),
    count(*) FILTER (WHERE status = 'on_board'),
    count(*) FILTER (WHERE status = 'on_leave')
  INTO v_crew_total, v_crew_onboard, v_crew_on_leave
  FROM crew_members;

  -- Maintenance
  SELECT count(*) FILTER (WHERE status = 'pending'),
    count(*) FILTER (WHERE status = 'pending' AND due_date < CURRENT_DATE)
  INTO v_maint_pending, v_maint_overdue
  FROM maintenance_tasks;

  -- Certificates
  SELECT 
    count(*) FILTER (WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30),
    count(*) FILTER (WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 90),
    count(*) FILTER (WHERE expiry_date < CURRENT_DATE AND status = 'active')
  INTO v_certs_expiring_30, v_certs_expiring_90, v_certs_expired
  FROM crew_certifications;

  -- Incidents
  SELECT count(*) INTO v_incidents_open
  FROM soc_alerts WHERE resolved_at IS NULL;

  -- Expenses (last 30 days)
  SELECT COALESCE(sum(amount), 0) INTO v_total_expenses
  FROM expenses WHERE expense_date >= CURRENT_DATE - 30;

  -- Audits
  SELECT count(*) INTO v_audits_total FROM internal_audits;

  -- Non-conformities open
  SELECT count(*) INTO v_ncs_open
  FROM non_conformities WHERE status NOT IN ('closed', 'cancelled');

  -- Documents
  SELECT count(*) INTO v_docs_total FROM ai_documents;

  -- Active voyages
  SELECT count(*) INTO v_voyages_active
  FROM voyage_plans WHERE status IN ('in_progress', 'active', 'underway');

  -- Compliance score calculation
  v_compliance_score := CASE
    WHEN (v_certs_expiring_90 + v_certs_expired + v_ncs_open + v_maint_overdue) = 0 THEN 100
    ELSE GREATEST(0, 100 - (v_certs_expired * 10) - (v_certs_expiring_30 * 3) - (v_ncs_open * 5) - (v_maint_overdue * 4))
  END;

  SELECT jsonb_build_object(
    'vessels_total', v_vessels_total,
    'vessels_active', v_vessels_active,
    'vessel_utilization', CASE WHEN v_vessels_total > 0 THEN round((v_vessels_active::numeric / v_vessels_total) * 100, 1) ELSE 0 END,
    'crew_total', v_crew_total,
    'crew_onboard', v_crew_onboard,
    'crew_on_leave', v_crew_on_leave,
    'maint_pending', v_maint_pending,
    'maint_overdue', v_maint_overdue,
    'certs_expiring_30', v_certs_expiring_30,
    'certs_expiring_90', v_certs_expiring_90,
    'certs_expired', v_certs_expired,
    'incidents_open', v_incidents_open,
    'expenses_30d', v_total_expenses,
    'compliance_score', v_compliance_score,
    'audits_total', v_audits_total,
    'ncs_open', v_ncs_open,
    'docs_total', v_docs_total,
    'voyages_active', v_voyages_active,
    'safety_score', CASE WHEN v_incidents_open = 0 THEN 100 ELSE GREATEST(70, 100 - v_incidents_open * 3) END,
    'generated_at', now()
  ) INTO result;

  RETURN result;
END;
$function$;
