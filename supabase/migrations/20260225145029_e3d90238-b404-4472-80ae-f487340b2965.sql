
-- ============================================================
-- 1) get_dashboard_kpis RPC - Single call for all dashboard metrics
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'vessels_total', (SELECT count(*) FROM vessels),
    'vessels_active', (SELECT count(*) FROM vessels WHERE status = 'active'),
    'crew_total', (SELECT count(*) FROM crew_members),
    'crew_onboard', (SELECT count(*) FROM crew_members WHERE status = 'onboard'),
    'maint_pending', (SELECT count(*) FROM maintenance_tasks WHERE status IN ('pending', 'in_progress', 'overdue')),
    'incidents_open', (SELECT count(*) FROM soc_alerts WHERE resolved_at IS NULL),
    'certs_expiring_30', (SELECT count(*) FROM crew_certifications WHERE expiry_date BETWEEN now() AND now() + interval '30 days'),
    'certs_expiring_90', (SELECT count(*) FROM crew_certifications WHERE expiry_date BETWEEN now() AND now() + interval '90 days'),
    'certs_expired', (SELECT count(*) FROM crew_certifications WHERE expiry_date < now()),
    'compliance_score', COALESCE((SELECT round(avg(CASE WHEN expiry_date > now() THEN 100 ELSE 0 END)) FROM crew_certifications), 100),
    'safety_score', COALESCE(100 - (SELECT count(*) FROM soc_alerts WHERE resolved_at IS NULL AND severity = 'critical') * 15, 100),
    'voyages_active', (SELECT count(*) FROM voyage_plans WHERE status = 'in_progress'),
    'expenses_30d', COALESCE((SELECT sum(amount) FROM expenses WHERE date >= now() - interval '30 days'), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis() TO anon;
