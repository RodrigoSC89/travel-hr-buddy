-- ===========================
-- Sample Data for SGSO Effectiveness Monitoring
-- Populates sgso_incidents with diverse scenarios for testing
-- ===========================

-- Update existing incidents with effectiveness tracking fields
UPDATE public.sgso_incidents 
SET 
  sgso_category = 'Falha técnica',
  action_plan_date = created_at + INTERVAL '1 day',
  resolved_at = created_at + INTERVAL '5 days',
  repeated = false
WHERE sgso_category IS NULL 
LIMIT 3;

-- Insert additional sample incidents for comprehensive testing
-- Insert incidents for different vessels to test vessel-based effectiveness
DO $$
DECLARE
  v_vessel_id UUID;
BEGIN
  -- Get first vessel
  SELECT id INTO v_vessel_id FROM public.vessels LIMIT 1;
  
  IF v_vessel_id IS NOT NULL THEN
    -- Erro humano incidents (good effectiveness - few repeats)
    INSERT INTO public.sgso_incidents (vessel_id, type, description, severity, status, sgso_category, action_plan_date, resolved_at, repeated, reported_at, created_at)
    VALUES 
      (v_vessel_id, 'Procedural Violation', 'Checklist step skipped during maintenance', 'medium', 'closed', 'Erro humano', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days', false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
      (v_vessel_id, 'Communication Error', 'Handover information incomplete', 'low', 'closed', 'Erro humano', NOW() - INTERVAL '18 days', NOW() - INTERVAL '14 days', false, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
      (v_vessel_id, 'Training Gap', 'Operator unfamiliar with new equipment', 'medium', 'closed', 'Erro humano', NOW() - INTERVAL '16 days', NOW() - INTERVAL '12 days', false, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),
      (v_vessel_id, 'Procedural Violation', 'Same checklist step skipped - repeated', 'medium', 'closed', 'Erro humano', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');
    
    -- Falha técnica incidents (moderate effectiveness - some repeats)
    INSERT INTO public.sgso_incidents (vessel_id, type, description, severity, status, sgso_category, action_plan_date, resolved_at, repeated, reported_at, created_at)
    VALUES 
      (v_vessel_id, 'Equipment Failure', 'Thruster bearing wear detected', 'high', 'closed', 'Falha técnica', NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days', false, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
      (v_vessel_id, 'System Malfunction', 'DP reference system intermittent failure', 'high', 'closed', 'Falha técnica', NOW() - INTERVAL '22 days', NOW() - INTERVAL '17 days', false, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
      (v_vessel_id, 'Equipment Failure', 'Recurring thruster bearing issue', 'high', 'closed', 'Falha técnica', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
      (v_vessel_id, 'System Malfunction', 'DP reference system failure again', 'critical', 'open', 'Falha técnica', NOW() - INTERVAL '3 days', NULL, true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');
    
    -- Comunicação incidents (poor effectiveness - many repeats)
    INSERT INTO public.sgso_incidents (vessel_id, type, description, severity, status, sgso_category, action_plan_date, resolved_at, repeated, reported_at, created_at)
    VALUES 
      (v_vessel_id, 'Radio Communication', 'Bridge-engine room communication breakdown', 'medium', 'closed', 'Comunicação', NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days', false, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
      (v_vessel_id, 'Shift Handover', 'Incomplete shift handover documentation', 'low', 'closed', 'Comunicação', NOW() - INTERVAL '28 days', NOW() - INTERVAL '23 days', false, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
      (v_vessel_id, 'Radio Communication', 'Bridge-engine communication issue recurs', 'medium', 'closed', 'Comunicação', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', true, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
      (v_vessel_id, 'Shift Handover', 'Handover documentation still incomplete', 'medium', 'closed', 'Comunicação', NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days', true, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
      (v_vessel_id, 'Inter-department', 'Deck-engine coordination failure', 'high', 'open', 'Comunicação', NOW() - INTERVAL '4 days', NULL, true, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');
    
    -- Falha organizacional incidents (mixed effectiveness)
    INSERT INTO public.sgso_incidents (vessel_id, type, description, severity, status, sgso_category, action_plan_date, resolved_at, repeated, reported_at, created_at)
    VALUES 
      (v_vessel_id, 'Resource Allocation', 'Insufficient spare parts inventory', 'medium', 'closed', 'Falha organizacional', NOW() - INTERVAL '35 days', NOW() - INTERVAL '20 days', false, NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
      (v_vessel_id, 'Policy Gap', 'Maintenance schedule not followed', 'medium', 'closed', 'Falha organizacional', NOW() - INTERVAL '32 days', NOW() - INTERVAL '22 days', false, NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days'),
      (v_vessel_id, 'Resource Allocation', 'Spare parts shortage continues', 'high', 'open', 'Falha organizacional', NOW() - INTERVAL '8 days', NULL, true, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days');
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.sgso_incidents.sgso_category IS 'Effectiveness tracking shows: Erro humano (75% eff), Falha técnica (50% eff), Comunicação (40% eff), Falha organizacional (67% eff)';
