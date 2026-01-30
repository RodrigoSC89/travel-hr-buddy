-- ============================================
-- B4-B6: RLS Helper Functions + Database Functions
-- ============================================

-- Helper function para pegar organization_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_org()
RETURNS UUID AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() LIMIT 1
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- ============================================
-- FUNCTION: Calculate vessel operating cost
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_vessel_opex(
  p_vessel_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  total_cost DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_cost
  FROM public.expenses
  WHERE vessel_id = p_vessel_id
    AND expense_date BETWEEN p_start_date AND p_end_date;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================
-- FUNCTION: Get crew certificates expiring soon
-- ============================================
CREATE OR REPLACE FUNCTION public.get_expiring_certificates_v2(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  crew_member_id UUID,
  crew_member_name TEXT,
  certificate_type TEXT,
  expiry_date DATE,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    c.certificate_type::TEXT,
    c.expiry_date,
    (c.expiry_date - CURRENT_DATE)::INTEGER
  FROM public.maritime_certificates c
  JOIN public.crew_members cm ON c.crew_member_id = cm.id
  WHERE c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
    AND c.status = 'active'
  ORDER BY c.expiry_date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================
-- FUNCTION: Suggest maintenance date
-- ============================================
CREATE OR REPLACE FUNCTION public.suggest_maintenance_date(
  p_vessel_id UUID,
  p_component VARCHAR
)
RETURNS DATE AS $$
DECLARE
  last_maintenance DATE;
  avg_interval INTEGER;
BEGIN
  SELECT MAX(completed_date)
  INTO last_maintenance
  FROM public.maintenance_records
  WHERE vessel_id = p_vessel_id
    AND component = p_component
    AND status = 'completed';
  
  avg_interval := 90; -- Default 90 days
  
  RETURN COALESCE(
    (last_maintenance + (avg_interval || ' days')::INTERVAL)::DATE,
    CURRENT_DATE + INTERVAL '90 days'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================
-- FUNCTION: Get vessel dashboard stats
-- ============================================
CREATE OR REPLACE FUNCTION public.get_vessel_dashboard_stats(p_vessel_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'crew_count', (SELECT COUNT(*) FROM public.crew_members WHERE vessel_id = p_vessel_id),
    'pending_maintenance', (SELECT COUNT(*) FROM public.maintenance_records WHERE vessel_id = p_vessel_id AND status = 'pending'),
    'expiring_certs_30d', (
      SELECT COUNT(*) FROM public.maritime_certificates c
      JOIN public.crew_members cm ON c.crew_member_id = cm.id
      WHERE cm.vessel_id = p_vessel_id
      AND c.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================
-- FUNCTION: Calculate compliance score
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_compliance_score(p_vessel_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_certs INTEGER;
  valid_certs INTEGER;
  overdue_maintenance INTEGER;
  score NUMERIC;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE c.expiry_date > CURRENT_DATE)
  INTO total_certs, valid_certs
  FROM public.maritime_certificates c
  JOIN public.crew_members cm ON c.crew_member_id = cm.id
  WHERE cm.vessel_id = p_vessel_id;

  SELECT COUNT(*) FILTER (WHERE status = 'pending' AND scheduled_date < CURRENT_DATE)
  INTO overdue_maintenance
  FROM public.maintenance_records
  WHERE vessel_id = p_vessel_id;

  score := 100;
  IF total_certs > 0 THEN
    score := score - ((total_certs - valid_certs)::NUMERIC / total_certs * 30);
  END IF;
  score := score - (overdue_maintenance * 5);
  
  RETURN GREATEST(0, ROUND(score, 2));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;