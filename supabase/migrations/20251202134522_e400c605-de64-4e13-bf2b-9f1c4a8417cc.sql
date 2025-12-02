-- PATCH 660.3 - Fix remaining functions without search_path

-- Fix detect_reservation_conflicts (the function with parameters)
CREATE OR REPLACE FUNCTION public.detect_reservation_conflicts(p_user_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_exclude_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(conflicting_reservation_id uuid, conflicting_title text, conflicting_start_date timestamp with time zone, conflicting_end_date timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.start_date,
    r.end_date
  FROM public.reservations r
  WHERE r.user_id = p_user_id
    AND r.status != 'cancelled'
    AND (p_exclude_id IS NULL OR r.id != p_exclude_id)
    AND r.start_date < p_end_date
    AND r.end_date > p_start_date;
END;
$function$;

-- Fix get_reservation_stats
CREATE OR REPLACE FUNCTION public.get_reservation_stats(p_user_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(total_reservations bigint, confirmed_reservations bigint, pending_reservations bigint, cancelled_reservations bigint, completed_reservations bigint, total_amount numeric, conflicts_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    COUNT(*) as total_reservations,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_reservations,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reservations,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_reservations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_reservations,
    COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0::DECIMAL(10,2)) as total_amount,
    0::BIGINT as conflicts_count
  FROM public.reservations
  WHERE user_id = target_user_id;
END;
$function$;

-- Fix generate_next_checklist_date
CREATE OR REPLACE FUNCTION public.generate_next_checklist_date(frequency text, last_date timestamp with time zone DEFAULT now())
RETURNS timestamp with time zone
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      RETURN last_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN last_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      RETURN last_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN last_date + INTERVAL '3 months';
    WHEN 'annually' THEN
      RETURN last_date + INTERVAL '1 year';
    ELSE
      RETURN last_date + INTERVAL '1 day';
  END CASE;
END;
$function$;

-- Fix calculate_checklist_compliance_score
CREATE OR REPLACE FUNCTION public.calculate_checklist_compliance_score(checklist_items jsonb)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  total_required INTEGER := 0;
  completed_required INTEGER := 0;
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(checklist_items)
  LOOP
    IF (item->>'required')::BOOLEAN = true THEN
      total_required := total_required + 1;
      IF (item->>'status') = 'completed' THEN
        completed_required := completed_required + 1;
      END IF;
    END IF;
  END LOOP;
  
  IF total_required = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed_required::NUMERIC / total_required::NUMERIC) * 100, 2);
END;
$function$;